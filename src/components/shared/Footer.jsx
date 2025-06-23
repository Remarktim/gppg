import React from "react";
import { useInView } from "react-intersection-observer";
import logo from "../../assets/img/logo.jpg";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const AnimatedItem = ({ children, className }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
      {children}
    </div>
  );
};

const FooterLinkColumn = ({ title, links }) => (
  <div>
    <h3 className="text-sm font-semibold text-stone-300 tracking-wider uppercase">{title}</h3>
    <ul className="mt-4 space-y-3">
      {links.map((link) => (
        <li key={link.name}>
          <a
            href={link.href}
            className="text-base text-stone-400 hover:text-white transition-colors duration-300">
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Home",
      links: [
        { name: "What is a pangolin?", href: "#" },
        { name: "Appearance", href: "#" },
        { name: "Habits and Lifestyle", href: "#" },
        { name: "Diet and Nutrition", href: "#" },
        { name: "Mating Habits", href: "#" },
        { name: "Others Pangolins", href: "#" },
      ],
    },
    {
      title: "About Us",
      links: [
        { name: "History", href: "#" },
        { name: "Mission & Vision", href: "#" },
        { name: "Our Goals", href: "#" },
        { name: "Developers", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Gallery", href: "#" },
        { name: "Videos", href: "#" },
        { name: "Officers", href: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { name: "Smart: 0912312414", href: "#" },
        { name: "Globe: 0912312414", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-[#2c1b1a] text-white">
      <div className="max-w-7xl mx-auto py-16  px-4">
        <AnimatedItem className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and Org Name Section */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-4 flex-col">
              <img
                className="w-16 h-16 rounded-full"
                src={logo}
                alt="GPPG Logo"
              />
              <p className="text-xl font-semibold">Guardians of the Palawan Pangolin</p>
            </div>
          </div>

          {/* Links Section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 xl:mt-0 xl:col-span-2 text-left">
            <FooterLinkColumn
              title={sections[0].title}
              links={sections[0].links}
            />
            <FooterLinkColumn
              title={sections[1].title}
              links={sections[1].links}
            />
            <FooterLinkColumn
              title={sections[2].title}
              links={sections[2].links}
            />
            <FooterLinkColumn
              title={sections[3].title}
              links={sections[3].links}
            />
          </div>
        </AnimatedItem>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#241615]">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-base text-stone-500 text-center md:text-left">&copy; {currentYear} GPPG. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-stone-500 hover:text-white transition-colors duration-300">
              <span className="sr-only">Facebook</span>
              <FaFacebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-stone-500 hover:text-white transition-colors duration-300">
              <span className="sr-only">Twitter</span>
              <FaTwitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-stone-500 hover:text-white transition-colors duration-300">
              <span className="sr-only">Instagram</span>
              <FaInstagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
