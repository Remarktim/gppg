import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronLeft, FiChevronRight, FiPlayCircle } from "react-icons/fi";
import headerBg from "../../assets/img/header_bg.jpg";
import pango3 from "../../assets/img/pango3.jpg";
import pango4 from "../../assets/img/pango4.jpg";
import pango6 from "../../assets/img/pango6.jpg";

const galleryItems = [
  { id: 1, type: "image", src: headerBg, title: "Pangolin by the Shore", credit: "Alex Doe" },
  { id: 2, type: "image", src: pango3, title: "Curled Pangolin", credit: "Jane Smith" },
  {
    id: 7,
    type: "video",
    thumbnail: pango6,
    src: "https://videos.pexels.com/video-files/3782471/3782471-sd_640_360_30fps.mp4",
    credit: "Samuel Green",
  },
  { id: 3, type: "image", src: pango4, title: "Pangolin in the Forest", credit: "Alex Doe" },
  { id: 4, type: "image", src: pango6, title: "Pangolin on a Branch", credit: "Jane Smith" },
  {
    id: 8,
    type: "video",
    thumbnail: pango3,
    src: "https://videos.pexels.com/video-files/5361494/5361494-sd_640_360_25fps.mp4",
    credit: "Samuel Green",
  },
  { id: 5, type: "image", src: pango3, title: "Resting Pangolin", credit: "Alex Doe" },
  { id: 6, type: "image", src: pango4, title: "Close-up of a Pangolin", credit: "Jane Smith" },
];

const GalleryPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const openLightbox = (item) => setSelectedItem(item);
  const closeLightbox = () => setSelectedItem(null);

  const nextItem = () => {
    const currentIndex = galleryItems.findIndex((item) => item.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    setSelectedItem(galleryItems[nextIndex]);
  };

  const prevItem = () => {
    const currentIndex = galleryItems.findIndex((item) => item.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedItem(galleryItems[prevIndex]);
  };

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
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg text-white/90 max-w-2xl">
            A collection of beautiful moments by our community.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-14">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <motion.div
                key={item.id}
                className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg"
                onClick={() => openLightbox(item)}
                layoutId={`card-${item.id}`}>
                <img
                  src={item.type === "image" ? item.src : item.thumbnail}
                  alt={item.title}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-center p-2">
                  {item.type === "video" && <FiPlayCircle className="text-white/80 w-16 h-16 absolute" />}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}>
            <div
              className="relative max-w-4xl max-h-[90vh] w-full p-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}>
              <motion.div
                className="w-full"
                layoutId={`card-${selectedItem.id}`}>
                {selectedItem.type === "image" ? (
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={selectedItem.src}
                    className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                    controls
                    autoPlay
                  />
                )}
              </motion.div>
              <div className="mt-2 text-center text-white">
                <p className="text-sm text-gray-300">Photo by: {selectedItem.credit}</p>
              </div>
              <button
                onClick={closeLightbox}
                className="absolute top-0 right-0 m-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
                <FiX size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevItem();
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 m-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextItem();
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 m-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
                <FiChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
