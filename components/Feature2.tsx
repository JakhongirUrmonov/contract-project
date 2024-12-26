import Image from "next/image";
import config from "@/config";

const Feature2 = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col-reverse lg:flex-row items-center justify-center py-8 lg:py-20 gap-8 lg:gap-40">
      <div className="w-full lg:w-1/2">
        <Image
          src="/img/feature2.jpg"
          alt="Feature Image"
          layout="responsive"
          width={600}
          height={400}
          className="object-cover w-full h-auto"
        />
      </div>
      <div className="w-full md:w-96 flex flex-col gap-4 md:gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start ml-0 md:ml-20">
        <h5 className="text-2xl sm:text-3xl lg:text-6xl tracking-tight md:-mb-4">
            Industry specific terms check.
        </h5>
        <p className="text-lg opacity-80 leading-relaxed">
          Understand the specific risks and terms in your industry.
        </p>
        <a href="/#pricing" className="text-blue-500">
          Get insights ›
        </a>
      </div>
    </section>
  );
};

export default Feature2;
