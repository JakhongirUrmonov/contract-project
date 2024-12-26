import Image from "next/image";
import config from "@/config";

const CTA = () => {
  return (
    <section className="bg-base-100 relative hero overflow-hidden">
      <div className="hidden lg:block lg:w-full w-[160%]">
      <Image
        src="/img/cta.svg"
        alt="Background"
        width={1440}
        height={560}
        className="w-full"
      />
      </div>
      <div className="relative hero-content text-center p-8 pb-0 lg:pt-40">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="text-3xl md:text-5xl tracking-tight mb-6 md:mb-8">
            Get peace of mind.
          </h2>
          <p className="text-lg mb-12 md:mb-16">
            Check your contract in seconds.
          </p>
          <a href="/review-contract" className="btn btn-primary btn-wide">
            Try {config.appName}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
