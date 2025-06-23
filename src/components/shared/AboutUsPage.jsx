import React from "react";
import { useInView } from "react-intersection-observer";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaBullseye, FaFlask, FaShieldAlt } from "react-icons/fa";
import logo from "../../assets/img/logo.jpg";
import headerBg from "../../assets/img/header_bg.jpg";

const AnimatedSection = ({ children, className = "" }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 10 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`${className}`}>
      {children}
    </motion.div>
  );
};

const AboutUsPage = () => {
  return (
    <div className="bg-stone-100 font-sans text-stone-800">
      <header
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <motion.h1
            className="text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}>
            About Us
          </motion.h1>
          <motion.p
            className="mt-4 max-w-2xl text-lg text-stone-200 drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}>
            Discover the story, mission, and people behind the Guardians of the Palawan Pangolin Guild.
          </motion.p>
        </div>
      </header>

      <main>
        <AnimatedSection className="container mx-auto my-20 px-6 lg:my-28">
          <div className="flex flex-col items-center justify-center gap-12 text-center md:flex-row md:gap-20 md:text-left">
            <motion.img
              src={logo}
              alt="GPPG Logo"
              className="h-60 w-60 rounded-full object-cover shadow-2xl md:h-80 md:w-80"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-stone-900 md:text-5xl">Guardians of the Palawan Pangolin Guild</h2>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                The GPPG is a pioneering, university-wide student organization dedicated to the conservation of the Palawan pangolin through research, education, and community empowerment.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="bg-white py-20 lg:py-28">
          <div className="container mx-auto ">
            <div className="text-center">
              <h2 className="mb-6 text-3xl font-bold text-stone-900 md:text-4xl">Our History</h2>
              <p className="font-sans leading-relaxed max-w-7xl mx-auto text-left text-stone-700">
                The Guardians of the Palawan Pangolin Guild was conceptualized last February 15, 2023 (Wednesday), timely the celebration of 2nd World Pangolin Day here in Palawan State University.
                This student organization is the first student organization here in the university as species-specific. It aims to promote and support the conservation of the Palawan pangolin (Manis
                culionensis), and integrating advance researches in the protection and conservation efforts through empowering the community in the development and promotion of critical research
                studies and innovation with attainable projects and programs, hosting environmentally-activities incorporating various fields of expertise. Also, the community will be enlightened on
                the importance of existence, biology and ecology of Palawan pangolin as well as other endemic fauna species of the province of Palawan. Through this organization, it will bridge gaps
                between different sectors of the community through student collaboration in promoting intensive Information, Education, and Communication endeavors.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="container mx-auto my-20 px-6 lg:my-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 md:text-4xl">Our Vision & Mission</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-stone-600">We are committed to a future where education and collaboration ensure the survival of Palawan's unique wildlife.</p>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-10 md:flex-row">
            <motion.div
              className="flex flex-col rounded-4xl border border-stone-200 bg-white p-10 text-center shadow-lg transition-shadow duration-300 hover:shadow-2xl md:w-2/5"
              whileHover={{ y: -8 }}>
              <h3 className="mb-5 text-2xl font-bold text-stone-800">Our Vision</h3>
              <p className="flex-grow text-stone-600">
                The Guardians of the Palawan Pangolin Guild (GPPG) is a university wide organization that bolster collaboration between different sectors of the community in promoting intensive
                information, education, and communication endeavors.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col rounded-4xl border border-stone-200 bg-white p-10 text-center shadow-lg transition-shadow duration-300 hover:shadow-2xl md:w-2/5"
              whileHover={{ y: -8 }}>
              <h3 className="mb-5 text-2xl font-bold text-stone-800">Our Mission</h3>
              <p className="flex-grow text-stone-600">
                The Guardians of the Palawan Pangolin Guild (GPPG) promotes and support the conservation of the Palawan pangolin (Manis culionensis), integrating advance researches in the protection
                and conservation efforts of Palawan as well as other endemic fauna species of the province.
              </p>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="bg-[#3f0703] py-20 text-white shadow-inner lg:py-28">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-12 text-3xl font-bold md:text-4xl">Our Core Objectives</h2>
              <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
                <div className="flex flex-col items-center">
                  <motion.div
                    className="mb-4 rounded-full bg-white/10 p-5 text-3xl"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                    <FaBullseye />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-semibold">Raise Awareness</h3>
                  <p className="font-light text-stone-300">To raise awareness on the existence, biology and ecology of this endemic mammal and other endemic fauna of Palawan province.</p>
                </div>
                <div className="flex flex-col items-center">
                  <motion.div
                    className="mb-4 rounded-full bg-white/10 p-5 text-3xl"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                    <FaFlask />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-semibold">Collaborate & Research</h3>
                  <p className="font-light text-stone-300">
                    To conduct collaborative researches and other environmental related activities on Palawan pangolin and other endemic fauna of the province.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <motion.div
                    className="mb-4 rounded-full bg-white/10 p-5 text-3xl"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                    <FaShieldAlt />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-semibold">Be Guardians</h3>
                  <p className="font-light text-stone-300">To be guardians of Palawan pangolin.</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default AboutUsPage;
