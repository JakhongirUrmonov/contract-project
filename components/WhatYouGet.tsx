import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";

const WhatYouGet = () => {
  return (
    <section className="max-w-8xl w-full mx-auto bg-base-100 flex flex-col items-center justify-center gap-16 lg:gap-20 py-8 lg:py-20 pb-0 lg:pb-0">
      <div className="flex flex-col items-center justify-center text-center ">
        <div className="flex flex-col gap-10 lg:gap-14 lg:pb-20 pb-8 items-center justify-center text-center ">
          <h1 className="max-w-2xl text-4xl lg:text-6xl tracking-tight md:-mb-4">
            {/* Check Contracts Before Sign in a Few Seconds. */}
              Negotiate contract on your terms.
          </h1>
          <p className="max-w-4xl text-lg leading-relaxed">
            Get everything you need.
          </p>
          {/* <a href="/review-contract" className="btn btn-primary btn-wide">
              Try {config.appName}
          </a> */}
        </div>
        <div className="flex flex-col lg:flex-row w-full px-8 lg:px-20 items-center">
        <div className="flex-1 p-8 flex flex-col text-center items-center justify-center gap-4 lg:mx-20">
          <div className="flex items-center justify-center">
                <Image
                src="/img/mail.svg"
                alt="Product Demo"
                priority={true}
                width={50}
                height={50}
                />
            </div>
          <h2 className="text-xl text-black mb-2">
            Negotiation guides
          </h2>
          <p className="text-gray-600 mb-4">
            Get an email example on how to communicate contract changes to the
            client layers.
          </p>
          <a href="/pricing" className="text-blue-500">
            Pricing
          </a>
        </div>
        <div className="flex-1 p-8 flex flex-col text-center items-center justify-center gap-4 lg:mx-20">
          <div className="flex items-center justify-center">
              <Image
              src="/img/shield.svg"
              alt="Product Demo"
              priority={true}
              width={50}
              height={50}
              />
          </div>
          <h2 className="text-xl text-black mb-2">
            Contract highlights
          </h2>
          <p className="text-gray-600 mb-4">
            Get a highlights of articles and comments
            on what and why can be negotiated.
          </p>
          <a href="/pricing" className="text-blue-500">
            Pricing
          </a>
        </div>
      </div>
      <div className="lg:w-full w-[120%]">
        <Image
          src="/img/whatyouget.jpg"
          alt="Product Demo"
          className="w-full"
          priority={true}
          width={1200}
          height={440}
        />
      </div>
      </div>
    </section>
  );
};

export default WhatYouGet;
