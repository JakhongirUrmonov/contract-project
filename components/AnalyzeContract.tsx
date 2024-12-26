'use client';

import React from 'react';
import { useEffect, useState } from 'react';

interface AnalyzeContractProps {
  fileUrl: string;
  onAnalysisComplete: (annotatedPdfUrl: string) => void;
}

const AnalyzeContract: React.FC<AnalyzeContractProps> = ({ fileUrl, onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [annotatedPdfUrl, setAnnotatedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const analyzeContract = async () => {
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

        if (response.ok) {
          const data = await response.json();
          console.log('Analysis successful', data);
          const { annotatedPdfUrl } = data;
          setAnnotatedPdfUrl(annotatedPdfUrl);
          onAnalysisComplete(annotatedPdfUrl);
        } else {
          const errorData = await response.json();
          console.error('Analysis error:', errorData.error);
          setError('Failed to analyze the contract. Please try again later.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to analyze the contract. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeContract();
  }, [fileUrl, onAnalysisComplete]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contract Analysis</h2>
      {isLoading && <p>Analyzing your contract...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {annotatedPdfUrl && (
        <a
          href={annotatedPdfUrl}
          download
          className="text-blue-500 underline"
        >
          Download Annotated Contract
        </a>
      )}
      {!isLoading && !error && !annotatedPdfUrl && (
        <p>Your annotated contract will be available shortly.</p>
      )}
    </div>
  );
};

export default AnalyzeContract;