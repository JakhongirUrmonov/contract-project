'use client';

import { useState, useEffect } from "react";
import ButtonCheckout from "@/components/ButtonCheckoutDownload";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";

const items = [
  "Removing personal data",
  "Analyzing payment terms",
  "Scope protection",
  "IP rights review",
  "Non-compete detection",
  "Liability term review",
];

const Problem = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [includeEmailTemplate, setIncludeEmailTemplate] = useState(false);

  useEffect(() => {
    if (currentIndex < items.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 2000); // Adjust delay as needed

      return () => clearTimeout(timer);
    } else {
      setCompleted(true);
    }
  }, [currentIndex]);

  return (
<div className="flex items-center justify-center min-h-screen">
          {/* Your logo/name on large screens */}
          {/* <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-semibold text-lg">{config.appName}</span>
          </Link>
        </div> */}
  <div className="max-w-md w-full mx-auto">
    <div className="flex flex-col gap-10 lg:gap-14">
      <h1 className="text-3xl lg:text-5xl tracking-tight md:-mb-4">Processing Your PDF</h1>
      <ul className="list-none space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index < currentIndex ? (
              <svg
                className={`text-primary w-5 h-5 transition-opacity duration-500 ${
                  index < currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : index === currentIndex ? (
              <span className="loading loading-spinner loading-xs text-primary fast-spinner"></span>
            ) : (
              <span className="w-5 h-5"></span>
            )}

            <span
              className={
                index < currentIndex
                  ? 'text-primary' // Completed steps - primary blue
                  : index === currentIndex
                  ? 'text-black'   // Current loading step - black
                  : 'text-gray-300' // Not yet reached steps - grey
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
      {completed && (
        <div className="flex flex-col gap-2 lg:gap-4">
          {/* <h2 className="text-xl font-semibold">We found few issues with your contract:</h2> */}
          {/* <p>We highlighted all problematic clouases and add explenation.</p> */}
          <ButtonCheckout priceId={'price_1QLohnK7rQiC7r4nerYMqpWa'} />
          <div>
            <label className="flex">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary [--chkfg:white]"
                checked={includeEmailTemplate}
                onChange={(e) => setIncludeEmailTemplate(e.target.checked)}
              />
              <span className="ml-2">Include negotiation email.</span>
            </label>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default Problem;