"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What do I get exactly?",
    answer: <div className="space-y-2 leading-relaxed">When you use PDF Alert, you receive an instant AI-powered analysis of your contract that includes:

    Detection of potentially unfair clauses and red flags
    Analysis of payment terms and scope definitions
    Review of IP rights and non-compete clauses
    Suggested responses for negotiating better terms
    Industry-specific term checks
    Comprehensive liability term review</div>,
  },
  {
    question: "Is my contract data secure?",
    answer: (
      <div className="space-y-2 leading-relaxed">Absolutely. We take data protection seriously. All uploaded contracts are encrypted, processed securely, and automatically deleted after analysis. We never store or share your sensitive contract information.</div>
    ),
  },
  {
    question: "Which types of contracts do you support?",
    answer: (
      <div className="space-y-2 leading-relaxed">PDF Alert works with all types of freelance and professional service agreements, including:

      Consulting contracts
      Design agreements
      Development contracts
      Marketing service agreements
      Content creation contracts
      General service agreements</div>
    ),
  },
  {
    question: "What file formats do you support?",
    answer: (
      <div className="space-y-2 leading-relaxed">We support PDF, Word (.doc, .docx), and plain text (.txt) file formats. All documents are processed securely and automatically converted for analysis.</div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-100" id="faq">
      <div className="lg:py-24 py-8 px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="max-w-2xl text-3xl lg:text-5xl tracking-tight md:-mb-4">
            All you need to know about ContractAlert.
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
