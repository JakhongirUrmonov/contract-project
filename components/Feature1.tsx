"use client";

import Image from "next/image";
import config from "@/config";
import Modal from "./Modal";
import React, { useState } from "react";

const Feature1 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center py-8 lg:py-20 lg:gap-20">
      <div className="w-full md:w-96 flex flex-col gap-4 md:gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start ml-0 md:ml-20">
        <h5 className="text-2xl sm:text-3xl lg:text-6xl tracking-tight md:-mb-4">
          Employment and gig contracts.
        </h5>
        <p className="text-lg opacity-80 leading-relaxed w-full px-8 lg:px-0 break-words">
        Upload any contract and get instant analysis of potential red flags.
        </p>
        <a href="/#pricing" className="text-blue-500">
          Check my contract ›
        </a>
        {/* <button onClick={() => setIsModalOpen(true)} className="text-blue-500">
            Pricing
        </button>
        <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} /> */}
      </div>
      <div className="w-full lg:w-1/2">
        <Image
          src="/img/feature1.jpg"
          alt="Feature Image"
          layout="responsive"
          width={600}
          height={400}
          className="object-cover w-full h-auto"
        />
      </div>
    </section>
  );
};

export default Feature1;
