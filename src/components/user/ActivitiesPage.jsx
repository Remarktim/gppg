import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import headerBg from "../../assets/img/header_bg.jpg";
import pango3 from "../../assets/img/pango3.jpg";
import pango4 from "../../assets/img/pango4.jpg";
import pango6 from "../../assets/img/pango6.jpg";

const activities = [
  {
    id: 1,
    date: "2024-07-15",
    title: "Community Pangolin Awareness Drive",
    location: "Puerto Princesa City Baywalk",
    description: "Hosted an educational drive to raise awareness about the Palawan pangolin among locals and tourists. Distributed flyers and held a mini-exhibit.",
    imageUrl: headerBg,
  },
  {
    id: 2,
    date: "2024-06-22",
    title: "Tree Planting for Habitat Restoration",
    location: "Cleopatra's Needle Forest Reserve",
    description: "In partnership with local environmental groups, we planted over 500 native trees to help restore the pangolins' natural habitat.",
    imageUrl: pango3,
  },
  {
    id: 3,
    date: "2024-05-30",
    title: "Fundraising Gala: 'A Night for Pangolins'",
    location: "City Coliseum, Puerto Princesa",
    description: "A successful fundraising event featuring local artists and speakers, with all proceeds going towards our conservation efforts.",
    imageUrl: pango4,
  },
  {
    id: 4,
    date: "2024-04-10",
    title: "School Symposium on Wildlife Conservation",
    location: "Palawan State University",
    description: "Engaged with students and faculty on the importance of protecting endangered species like the Palawan pangolin.",
    imageUrl: pango6,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const ActivitiesPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div
        className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight shadow-sm">
            Our Activities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg text-white/90 max-w-2xl">
            Following our journey and efforts in pangolin conservation.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-14">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="relative">
            {/* Vertical line for the timeline */}
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-slate-300 hidden md:block"></div>

            <div className="space-y-12">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Image */}
                  <div className="w-full md:w-5/12">
                    <img
                      src={activity.imageUrl}
                      alt={activity.title}
                      className="rounded-2xl shadow-lg object-cover w-full h-64"
                    />
                  </div>

                  {/* Content */}
                  <div className="w-full md:w-7/12 relative">
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 hidden md:block w-4 h-4 bg-red-800 rounded-full border-4 border-slate-50 ${
                        index % 2 === 0 ? "-left-8 -translate-x-1/2" : "-right-8 translate-x-1/2"
                      }`}></div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{activity.title}</h3>
                      <div className="flex flex-col sm:flex-row gap-4 text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-red-800" />
                          <span>{new Date(activity.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-red-800" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{activity.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
