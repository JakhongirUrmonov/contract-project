// app/review-contract/page.tsx

import { Suspense } from "react";
import Stepper from "@/components/Stepper";
import Footer from "@/components/Footer";
import ContractReviewContent from "@/components/ContractReviewContent";

const ContractReview = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const fileUrl = (searchParams.fileUrl as string) || '';
  const status = searchParams.status as string;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Stepper />
      <ContractReviewContent fileUrl={fileUrl} status={status} />
      <Footer />
    </Suspense>
  );
};

export default ContractReview;