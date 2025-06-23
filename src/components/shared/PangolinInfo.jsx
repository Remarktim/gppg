import React from "react";
import { useInView } from "react-intersection-observer";
import OtherPangolinsCarousel from "./OtherPangolinsCarousel";
import pango3 from "../../assets/img/pango3.jpg";
import pango4 from "../../assets/img/pango4.jpg";
import pango6 from "../../assets/img/pango6.jpg";

const AnimatedSection = ({ children, className }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className={`${className} transition-all duration-1000 ease-in-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
      {children}
    </section>
  );
};

const StatCard = ({ value, label }) => (
  <div className="bg-stone-100 rounded-2xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <span className="text-4xl md:text-5xl font-bold text-stone-800 block">{value}</span>
    <span className="text-lg md:text-xl text-stone-600 mt-2 block">{label}</span>
  </div>
);

const InfoSection = ({ id, title, children, imageUrl, imageAlt, reverse = false }) => (
  <AnimatedSection
    id={id}
    className="container mx-auto py-12 px-4">
    <div className={`flex flex-col md:flex-row items-center gap-12 ${reverse ? "md:flex-row-reverse" : ""}`}>
      <div className="md:w-1/2">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-stone-800">{title}</h2>
        <div className="space-y-4 text-lg text-stone-700 leading-relaxed">{children}</div>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="rounded-2xl shadow-2xl w-full max-w-md object-cover"
        />
      </div>
    </div>
  </AnimatedSection>
);

const PangolinInfo = () => {
  return (
    <div className="bg-stone-50">
      <AnimatedSection
        id="what-is-pangolin"
        className="container mx-auto py-16 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight">What is a Palawan Pangolin?</h2>
          <p className="mt-6 text-lg text-stone-700 leading-relaxed">
            The Philippine pangolin or Palawan pangolin (<i>Manis culionensis</i>), also locally known as balintong, is a pangolin species endemic to the Palawan province of the Philippines. Its
            habitat includes primary and secondary forests, as well as surrounding grasslands. This species is moderately common within its limited range, but is at risk due to heavy hunting because
            of its valued scales and meat. It is listed as Critically Endangered by the IUCN, and Critically Endangered by the Palawan Council for Sustainable Development (PCSD).
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-6xl mx-auto">
          <StatCard
            value="34-kg"
            label="Weight"
          />
          <StatCard
            value="10-35 in"
            label="Length"
          />
          <StatCard
            value="70m"
            label="Insects Eaten Yearly"
          />
          <StatCard
            value="20 yrs"
            label="Life Span"
          />
        </div>
      </AnimatedSection>

      <div className="bg-white">
        <InfoSection
          id="appearance"
          title="Appearance"
          imageUrl={pango3}
          imageAlt="Pangolin Appearance">
          <p>
            The Philippine pangolin is a medium-sized mammal covered in small triangular scales made of keratin everywhere except the underbelly and face. It regrows new scales when they are lost and
            always has the same number of scales throughout its lifespan. The scales come in shades of brown, yellow, and olive, making for adequate camouflage at night. Areas of the body without
            scales are covered in a layer of hair.
          </p>
        </InfoSection>
      </div>

      <InfoSection
        id="habits"
        title="Habits and Lifestyle"
        imageUrl={pango4}
        imageAlt="Pangolin Habits"
        reverse>
        <p>
          Philippine pangolins are nocturnal and reclusive and are usually seen singly or in pairs. Because they are mainly active at night, their eyesight is below average. While their hearing is
          still only about average, they make up for their lack of vision with their extraordinary sense of smell. They can move in a short burst towards safety when startled, and even have a limited
          ability to swim.
        </p>
      </InfoSection>

      <div className="bg-white">
        <InfoSection
          id="diet"
          title="Diet and Nutrition"
          imageUrl={pango6}
          imageAlt="Pangolin Diet">
          <p>Philippine pangolins are carnivores (insectivores), more specifically myrmecophages. They feed mainly on termites and ants and will also consume other insects.</p>
        </InfoSection>
      </div>

      <AnimatedSection
        id="mating-habits"
        className="container mx-auto py-16 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-8">Mating Habits</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center mb-10">
            <div>
              <span className="text-lg font-semibold text-stone-500 block uppercase tracking-wider">Reproduction Season</span>
              <span className="text-2xl font-bold text-stone-800">Spring</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-stone-500 block uppercase tracking-wider">Baby Name</span>
              <span className="text-2xl font-bold text-stone-800">Pangopup</span>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <span className="text-lg font-semibold text-stone-500 block uppercase tracking-wider">Pregnancy Duration</span>
              <span className="text-2xl font-bold text-stone-800">18 weeks</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center mb-10 max-w-2xl mx-auto">
            <div>
              <span className="text-lg font-semibold text-stone-500 block uppercase tracking-wider">Baby Carrying</span>
              <span className="text-2xl font-bold text-stone-800">1 pangopup</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-stone-500 block uppercase tracking-wider">Independent Age</span>
              <span className="text-2xl font-bold text-stone-800">5 months</span>
            </div>
          </div>

          <p className="text-left text-lg text-stone-700 leading-relaxed">
            While little is known about their reproduction, their mating habits are thought to be similar to those of the Sunda pangolin. The same odorous secretion used as a self-defense mechanism is
            also used to attract a mate. Baby pangolins, called pangopups, are born after a gestation period of around 18 weeks and are suckled by their mothers for about 4 months. Usually, only one
            offspring is born at once, and they are carried around on the mother's back.
          </p>
        </div>
      </AnimatedSection>

      <div className="bg-white">
        <AnimatedSection
          id="other-pangolins"
          className="container mx-auto py-16 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-12">Other Pangolins</h2>
          </div>
          <OtherPangolinsCarousel />
        </AnimatedSection>
      </div>
    </div>
  );
};

export default PangolinInfo;
