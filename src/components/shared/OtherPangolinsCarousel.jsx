import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const pangolinSpecies = [
  {
    name: "Ground Pangolin",
    scientific: "Smutsia temminckii",
    location: "Southern and Eastern Africa",
    feature: "Tough, overlapping scales provide armor-like protection.",
    diet: "Ants and termites",
    behavior: "Solitary, nocturnal, and excellent burrowers.",
    status: "Vulnerable",
    image: "https://placehold.co/600x400/c27c7d/FFFFFF?text=Ground+Pangolin",
  },
  {
    name: "Chinese Pangolin",
    scientific: "Manis pentadactyla",
    location: "Southeast Asia and Southern China",
    feature: "Covered in protective keratin scales.",
    diet: "Ants and termites",
    behavior: "Solitary, nocturnal, and spends most of its time on the ground.",
    status: "Critically Endangered",
    image: "https://placehold.co/600x400/c27c7d/FFFFFF?text=Chinese+Pangolin",
  },
  {
    name: "Black-Bellied Pangolin",
    scientific: "Phataginus tetradactyla",
    location: "Southern and Eastern Africa",
    feature: "Has the most vertebrae (46-47) in its tail of any mammal!",
    diet: "Primarily ants instead of termites.",
    behavior: "Diurnal (active during the day) and spends most of its time in trees.",
    status: "Vulnerable",
    image: "https://placehold.co/600x400/c27c7d/FFFFFF?text=Black-Bellied",
  },
  {
    name: "Sunda Pangolin",
    scientific: "Manis javanica",
    location: "Throughout Southeast Asia",
    feature: "Can be more arboreal than other pangolins, spending time in trees.",
    diet: "Ants and termites",
    behavior: "Can walk on all fours or bipedally, using their tail for balance.",
    status: "Critically Endangered",
    image: "https://placehold.co/600x400/c27c7d/FFFFFF?text=Sunda+Pangolin",
  },
  {
    name: "Giant Pangolin",
    scientific: "Smutsia gigantea",
    location: "Central and West Africa",
    feature: "Largest of all pangolin species, reaching up to 1.8 meters.",
    diet: "Ants and termites",
    behavior: "Solitary, nocturnal, and strong diggers that build their own burrows.",
    status: "Endangered",
    image: "https://placehold.co/600x400/c27c7d/FFFFFF?text=Giant+Pangolin",
  },
];

const PangolinCarouselCard = ({ species }) => (
  <div className="flex-[0_0_100%] md:flex-[0_0_90%] lg:flex-[0_0_80%] p-4">
    <div className="bg-stone-50 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden md:flex md:h-auto lg:h-[380px] transition-all duration-300 hover:-translate-y-1">
      <img
        src={species.image}
        alt={species.name}
        className="w-full md:w-2/5 h-64 md:h-full object-cover"
      />
      <div className="p-6 flex flex-col justify-center  w-full text-left">
        <h3 className="text-2xl font-bold text-stone-800">{species.name}</h3>
        <p className="text-sm text-stone-500 italic mb-4">{species.scientific}</p>
        <div className="space-y-2 text-stone-700 ">
          <p>
            <span className="font-semibold">Location:</span> {species.location}
          </p>
          <p>
            <span className="font-semibold">Feature:</span> {species.feature}
          </p>
          <p>
            <span className="font-semibold">Diet:</span> {species.diet}
          </p>
          <p>
            <span className="font-semibold">Behavior:</span> {species.behavior}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {species.status}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const OtherPangolinsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [Autoplay()]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div
        className="overflow-hidden"
        ref={emblaRef}>
        <div className="flex">
          {pangolinSpecies.map((species) => (
            <PangolinCarouselCard
              key={species.name}
              species={species}
            />
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute top-1/2 left-2 md:left-8 -translate-y-1/2 bg-white/60 hover:bg-white rounded-full p-3 shadow-md transition-all duration-300">
        <FaChevronLeft className="text-stone-800" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute top-1/2 right-2 md:right-8 -translate-y-1/2 bg-white/60 hover:bg-white rounded-full p-3 shadow-md transition-all duration-300">
        <FaChevronRight className="text-stone-800" />
      </button>
    </div>
  );
};

export default OtherPangolinsCarousel;
