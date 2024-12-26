"use client";

import config from "@/config";
import ButtonCheckout from "./ButtonCheckoutPricing";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId


const Pricing = () => {
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // **Added this line**

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const coupon = urlParams.get("coupon");
    if (status === "success" && coupon) {
      setCouponCode(coupon);
      setIsModalOpen(true);
    }
  }, []);

  return (
    <section className="bg-base-100 overflow-hidden" id="pricing">
      <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} couponCode={couponCode} />
      <div className="py-24 px-8 max-w-5xl mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <p className="font-medium text-primary mb-8">Pricing</p>
          <h5 className="text-3xl lg:text-5xl tracking-tight md:-mb-4">
            Get your contract review ready in 2 minutes.
          </h5>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-12">
          {config.stripe.plans.map((plan) => (
            <div key={plan.priceId} className="relative w-full max-w-lg">
                
              {plan.isLifetime && (
                  <div className="absolute -inset-24 w-110% h-110%">
                    <Image
                        src="/img/lifetime.svg"
                        className="w-full h-full"
                        priority={true}
                        width={400}
                        height={600}
                        alt="Lifetime"
                        />
                  </div>
              )}

              {plan.isFeatured && (
                <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge rounded-[20px] text-xs text-neutral-content font-semibold border-0 bg-primary`}
                  >
                    Popular
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              {plan.isLifetime && (
                <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge rounded-[20px] text-xs font-normal border-0 bg-gradient-to-tr from-emerald-200 via-cyan-200 via-purple-200 via-blue-200 to-pink-300`}
                  >
                    🦄 Only 12 left
                  </span>
                </div>
              )}  

              {plan.isLifetime && (
                <div
                  className={`absolute -inset-[2px] rounded-[9px] bg-gradient-to-tr from-emerald-200 via-cyan-200 via-purple-200 via-blue-200 to-pink-300`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-lg lg:text-xl font-normal">{plan.name}</p>
                    {plan.description && (
                      <p className="text-base-content/80 mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="relative">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span className="text-base-content/80">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className={`text-5xl tracking-tight font-semibold`}>
                    ${plan.price}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-xs text-base-content/60 uppercase font-semibold">
                      USD
                    </p>
                  </div>
                </div>
                {plan.features && (
                  <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-[18px] h-[18px] opacity-80 shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <span>{feature.name} </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  <ButtonCheckout priceId={plan.priceId} couponCode={couponCode || ""}/>
                  <p className="flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium relative">
                    Pay once.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
