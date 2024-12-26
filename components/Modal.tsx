"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import React, { useState } from "react";
import { ClipboardIcon } from '@heroicons/react/24/outline';


interface ModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  couponCode?: string | null; // Added couponCode as an optional prop
}

// A simple modal component which can be shown/hidden with a boolean and a function
// Because of the setIsModalOpen function, you can't use it in a server component.
const Modal = ({ isModalOpen, setIsModalOpen, couponCode }: ModalProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [allowClose, setAllowClose] = useState<boolean>(false);

    // Modify the onClose handler
  const handleClose = () => {
    if (allowClose) {
      setIsModalOpen(false);
      setAllowClose(false);
    }
  };

  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-16 text-center align-middle shadow-xl transition-all">
                <button
                    className="absolute top-4 right-4 btn btn-square btn-ghost btn-sm"
                    onClick={() => {
                      setAllowClose(true);
                      setIsModalOpen(false);
                    }}
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-medium leading-6 text-gray-900 pb-4"
                >
                  Payment Successful!
                </Dialog.Title>
                <div className="mt-2 gap-6">
                  <p className="text-sm text-gray-500">
                    Here is your coupon code:
                  </p>
                  <div className="p-4 border-2 border-primary bg-blue-100 rounded-md mt-4">
                  {couponCode && (
                    <p className="text-4xl font-normal align-middle">
                      {couponCode}
                    </p>
                  )}
                  </div>
                  {isCopied ? (
                    <div className="text-green-600 text-sm pt-4">
                      Coupon code copied to clipboard!
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 pt-4">
                      Please save it!
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-primary inline-flex justify-center rounded-md"
                    onClick={() => {
                      if (couponCode) {
                        navigator.clipboard.writeText(couponCode)
                          .then(() => {
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          })
                          .catch((err) => {
                            console.error('Failed to copy coupon code:', err);
                          });
                      }
                    }}
                  >
                    <ClipboardIcon className="h-5 w-5" /> 
                    Copy Coupon Code
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;