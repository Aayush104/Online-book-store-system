import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[var(--surface)] text-[var(--text-primary)] py-16 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <CompanyInfo />
          <QuickLinks />
          <CategoryLinks />
          <ContactInfo />
        </div>

        <Copyright />
      </div>
    </footer>
  );
};

const CompanyInfo = () => {
  return (
    <div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-2 mb-4"
      >
        <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <span className="text-xl font-bold font-display">BookHaven</span>
      </motion.div>
      <p className="text-[var(--text-secondary)] mb-4">
        Your gateway to literary adventures. Discover, read, and share amazing
        books.
      </p>
      <SocialLinks />
    </div>
  );
};

const SocialLinks = () => {
  const socialNetworks = [
    { name: "facebook", icon: <Facebook size={20} /> },
    { name: "twitter", icon: <Twitter size={20} /> },
    { name: "instagram", icon: <Instagram size={20} /> },
  ];

  return (
    <div className="flex space-x-4">
      {socialNetworks.map((social) => (
        <SocialIcon key={social.name} name={social.name} icon={social.icon} />
      ))}
    </div>
  );
};

const SocialIcon = ({ name, icon }) => {
  return (
    <motion.a
      href="#"
      whileHover={{ y: -3 }}
      className="text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-full hover:bg-[var(--background)]"
    >
      {icon}
    </motion.a>
  );
};

const QuickLinks = () => {
  const links = ["Home", "Benefits", "Books", "About"];

  return (
    <div>
      <h3 className="text-lg font-semibold font-display mb-4">Quick Links</h3>
      <ul className="space-y-2">
        {links.map((item) => (
          <motion.li key={item} whileHover={{ x: 5 }}>
            <a
              href={`#${item.toLowerCase()}`}
              className="text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {item}
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const CategoryLinks = () => {
  const categories = ["Fiction", "Non-Fiction", "Science Fiction", "Romance"];

  return (
    <div>
      <h3 className="text-lg font-semibold font-display mb-4">Categories</h3>
      <ul className="space-y-2">
        {categories.map((category) => (
          <motion.li key={category} whileHover={{ x: 5 }}>
            <a
              href="#"
              className="text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {category}
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const ContactInfo = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold font-display mb-4">Contact</h3>
      <ul className="space-y-2 text-[var(--text-secondary)]">
        <li>123 Book Street</li>
        <li>Reading City, RC 12345</li>
        <li>Phone: (555) 123-4567</li>
        <li>Email: info@bookhaven.com</li>
      </ul>
    </div>
  );
};

const Copyright = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-[var(--border)] mt-12 pt-8 text-center text-[var(--text-secondary)]"
    >
      <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
    </motion.div>
  );
};

export default Footer;
