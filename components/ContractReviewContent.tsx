// components/ContractReviewContent.tsx

'use client';

import React, { useEffect, useState } from "react";
import PDFPreview from "@/components/PDFPreview";
import Problem from "@/components/Problem";

interface ContractReviewContentProps {
  fileUrl: string;
  status: string;
}

const ContractReviewContent = ({
  fileUrl,
  status,
}: ContractReviewContentProps) => {
  const [annotatedPdfUrl, setAnnotatedPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeContract = async () => {
      if (status !== 'success' || !fileUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/analyze-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileUrl }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze contract');
        }

        const data = await response.json();
        setAnnotatedPdfUrl(data.annotatedPdfUrl);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeContract();
  }, [status, fileUrl]);

  return (
    <div className="flex flex-row gap-8 border-b border-gray-200 h-[750px]">
      <div className="flex-1">
        {status === 'success' && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full mx-auto">
              <div className="flex flex-col gap-10 lg:gap-14">
                <h2 className="text-3xl lg:text-5xl tracking-tight md:-mb-4">
                  Payment was successful!
                </h2>
                {isLoading && (
                  <p>
                    Preparing the downloadable report link...
                    <br /> Please don&apos;t close this window.
                  </p>
                )}
                {error && <p className="text-red-500">{error}</p>}
                {annotatedPdfUrl && (
                  <button className="btn btn-primary btn-wide">
                    <a
                      href={annotatedPdfUrl}
                      download
                      className="text-white"
                    >
                      Download Annotated Contract
                    </a>
                  </button>
                )}
                {!isLoading && !error && !annotatedPdfUrl && (
                  <p>Your annotated contract will be available shortly.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {status !== 'success' && <Problem />}
      </div>
      <div className="flex-1">
        <PDFPreview fileUrl={fileUrl} />
      </div>
    </div>
  );
};

export default ContractReviewContent;