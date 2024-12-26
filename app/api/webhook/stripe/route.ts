import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const couponConfig: { 
  [priceId: string]: { 
    percent_off: number; 
    duration: Stripe.Coupon.Duration; 
    redeem_by: number; 
    duration_in_months?: number;
    max_redemptions: number; 
  } 
} = {
  'price_1QQueEK7rQiC7r4nVYvSUEcr': {
    percent_off: 10,
    duration: 'once',
    redeem_by: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    max_redemptions: 100, // Example limit
  },
  'price_1QMvDEK7rQiC7r4nBPbWb572': {
    percent_off: 20,
    duration: 'repeating',
    duration_in_months: 3, // 3 months
    redeem_by: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days from now
    max_redemptions: 500,
  },
  'price_1QMvDiK7rQiC7r4nNgbIa1Gr': {
    percent_off: 50,
    duration: 'repeating',
    duration_in_months: 3, // 3 months
    redeem_by: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days from now
    max_redemptions: 1000,
  },
  // Add more price IDs and their configurations as needed
};

// This function attempts to retrieve a Stripe coupon by ID.
// If it doesn't exist, it creates a new coupon with predefined properties.
// Add detailed logging and create promotion codes after coupon creation
const retrieveOrCreateStripeCoupon = async (couponCode: string, priceId: string): Promise<Stripe.PromotionCode | null> => {
  try {
    // Attempt to retrieve the promotion code
    const existingPromotionCode = await stripe.promotionCodes.list({
      code: couponCode,
      limit: 1,
    });

    if (existingPromotionCode.data.length > 0) {
      console.log(`Stripe promotion code "${couponCode}" already exists.`);
      return existingPromotionCode.data[0];
    }
  } catch (error: any) {
    console.error(`Error retrieving promotion code "${couponCode}": ${error.message}`);
    return null;
  }

  const config = couponConfig[priceId];

  if (!config) {
    console.error(`No coupon configuration found for price ID: ${priceId}`);
    return null;
  }

  // Validate redeem_by is a valid timestamp
  if (config.redeem_by && config.redeem_by <= Math.floor(Date.now() / 1000)) {
    console.error(`Invalid redeem_by timestamp for promotion code: ${couponCode}`);
    return null;
  }

  try {
    // Create the coupon
    const newCoupon = await stripe.coupons.create({
      percent_off: config.percent_off,
      duration: config.duration,
      redeem_by: config.redeem_by,
      max_redemptions: config.max_redemptions,
      ...(config.duration === 'repeating' && { duration_in_months: config.duration_in_months }),
    });

    console.log(`Created new Stripe coupon "${newCoupon.id}".`);

    // Create the promotion code using the desired couponCode
    const promotionCode = await stripe.promotionCodes.create({
      code: couponCode, // The desired promotion code
      coupon: newCoupon.id,
      max_redemptions: config.max_redemptions,
      expires_at: config.redeem_by,
    });

    console.log(`Created new Stripe promotion code "${promotionCode.code}".`);
    return promotionCode;
  } catch (creationError: any) {
    console.error(`Error creating coupon or promotion code: ${creationError.message}`);
    console.error('Stripe Error Details:', creationError);
    return null;
  }
};

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = headers().get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        // Retrieve the coupon code from session metadata
        const couponCode = stripeObject.metadata?.coupon_code;

        if (!couponCode) {
          console.error("No coupon_code found in session metadata.");
          // Handle the absence of coupon code as per your business logic
          break;
        }

        console.log(`✅ Received Coupon Code from Metadata: "${couponCode}"`);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        // Retrieve or create the Stripe coupon
        const stripeCoupon = await retrieveOrCreateStripeCoupon(couponCode, priceId);

        if (!stripeCoupon) {
          console.error(`❌ Failed to retrieve or create Stripe coupon for code: "${couponCode}"`);
          // Optionally, handle the failure (e.g., notify admin, retry logic)
          break;
        }

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) break;

        let user;
        if (!userId) {
          // check if user already exists
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", customer.email)
            .single();
          if (profile) {
            user = profile;
          } else {
            // create a new user using supabase auth admin
            const { data } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            user = data?.user;
          }
        } else {
          // find user by ID
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          user = profile;
        }

        await supabase
          .from("profiles")
          .update({
            customer_id: customerId,
            price_id: priceId,
            has_access: true,
          })
          .eq("id", user?.id);

        // Extra: send email with user link, product page, etc...
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        await supabase
          .from("profiles")
          .update({ has_access: false })
          .eq("customer_id", subscription.customer);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find profile where customer_id equals the customerId (in table called 'profiles')
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (profile.price_id !== priceId) break;

        // Grant the profile access to your product. It's a boolean in the database, but could be a number of credits, etc...
        await supabase
          .from("profiles")
          .update({ has_access: true })
          .eq("customer_id", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
