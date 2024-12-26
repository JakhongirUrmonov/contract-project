"use client";

import { useState } from "react";
import apiClient from "@/libs/api";

// This component is used to create Stripe Checkout Sessions
const ButtonCheckout = ({
    priceId,
    mode = "payment",
    couponCode,
  }: {
    priceId: string;
    mode?: "payment" | "subscription";
    couponCode: string;
  }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Create a URL object from the current URL
      const successUrl = new URL(window.location.href);
      successUrl.searchParams.append('status', 'success');

      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId,
          successUrl: successUrl.toString(), // Updated success URL with status parameter
          cancelUrl: window.location.href,
          mode,
          couponCode,
          // Remove clientReferenceId as it's not used for redirection
        }
      );

      window.location.href = url;
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={isLoading} 
      className="btn btn-primary btn-wide"
    >
      {isLoading ? "Processing..." : "Download improved contract"}
    </button>
  );
};

export default ButtonCheckout;