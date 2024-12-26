import Image from "next/image";

// A beautiful single testimonial with a user name and and company logo logo
const Testimonial = () => {
  return (
    <section
      className="relative isolate overflow-hidden bg-base-100 px-8 lg:py-24 py-4"
      id="testimonials"
    >
      {/* <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.base-300),theme(colors.base-100))] opacity-20" /> */}
      {/* <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-base-100 shadow-lg ring-1 ring-base-content/10 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" /> */}
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <figure className="lg:mt-10">
          <div className="flex flex-col lg:flex-row items-center lg:gap-12">
            <div className="relative lg:w-full w-3/4">
              <Image
                width={460}
                height={600}
                className="max-w-[420px] md:max-w-[380px] lg:max-w-[420px] w-full object-center"
                // Ideally, load from a statically generated image for better SEO performance (import userImage from "@/public/userImage.png")
                // If you're using a static image, add placeholder="blur"
                src="/img/person1.jpg"
                alt="A testimonial from a happy customer"
              />
            </div>

            <div>
              <blockquote className="text-xl font-light tracking-tight leading-snug text-base-content sm:text-2xl sm:leading-10">
              &quot;I was worried about seeming difficult to my enterprise client, but Contract Guardian helped me professionally negotiate better terms. The suggested responses made me sound knowledgeable and reasonable. The client actually appreciated my thoroughness!&quot;
              </blockquote>
              <figcaption className="mt-10 flex items-center justify-start gap-5">
                <div className="text-base">
                  <div className="font-semibold text-base-content mb-0.5">
                  — Sarah K.
                  </div>
                  <div className="text-base-content/60">
                    UX/UI Designer
                  </div>
                </div>

                <Image
                  width={40}
                  height={40}
                  className="w-10 md:w-12"
                  // Ideally, load from a statically generated image for better SEO performance (import userImage from "@/public/userImage.png")
                  src="/img/g2.svg"
                  alt="G2 logo"
                />
              </figcaption>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
};

export default Testimonial;
