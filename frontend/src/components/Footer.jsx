import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaCommentAlt,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";
import { href, Link } from "react-router-dom";

function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.footer
      className="bg-gradient-to-br from-[#4f7cac] to-[#7c3aed] text-white p-10 rounded-t-3xl shadow-lg"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
    >
      <div className="flex flex-col md:flex-row justify-around gap-6">
        {/* MYCONSULTANT Section */}
        <motion.div className=" w-full md:w-1/4 px-3" variants={itemVariants}>
          <h4 className="text-xl font-bold mb-4 relative pb-2">
            <span className="relative">
              MYCONSULTANT
              <span className="absolute top-6 left-0 w-12 h-1 bg-[#a78bfa] rounded-full"></span>
            </span>
          </h4>
          <p className="text-white/80 leading-relaxed">
            Your trusted partner for expert consultations across healthcare,
            wellness, and more.
          </p>
        </motion.div>

        {/* QUICK LINKS Section */}
        <motion.div
          className=" w-full md:w-1/6  px-3  "
          variants={itemVariants}
        >
          <h4 className="text-xl  font-bold mb-4 relative pb-2">
            <span className="relative">
              QUICK LINKS
              <span className="absolute top-6 left-0 w-12 h-1 bg-[#a78bfa] rounded-full"></span>
            </span>
          </h4>
          <ul className="-space-y-0.5 ">
            {[
              "24/7Support",
              "AboutUs",
              "Services",
              "Doctors",
              "Blog",
              "Careers",
              "Advertisement",
            ].map((link) => (
              <motion.li key={link} whileHover={{ x: 5 }}>
                <Link
                  to={`/direct/${link.toLowerCase()}`}
                  className="text-white/80 hover:text-white transition-colors flex "
                >
                  {link}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* NEWSLETTER Section */}
        <motion.div className=" w-full md:w-1/4 px-3" variants={itemVariants}>
          <h4 className="text-xl font-bold mb-4 relative pb-2">
            <span className="relative">
              NEWSLETTER
              <span className="absolute top-6 left-0 w-12 h-1 bg-[#a78bfa] rounded-full"></span>
            </span>
          </h4>
          <p className="text-white/80 mb-4">
            Subscribe to get the latest updates.
          </p>
          <div className="space-y-3">
            <motion.input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-white placeholder-white/60"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              className="w-full bg-white text-[#4f7cac] py-2 rounded-lg font-semibold hover:bg-[#f0f9ff] transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>

        {/* SUPPORT Section */}
        <motion.div className="w-full md:w-1/4 px-3" variants={itemVariants}>
          <h4 className="text-xl font-bold mb-4 relative pb-2">
            <span className="relative">
              Social Media
              <span className="absolute top-6 left-0 w-12 h-1 bg-[#a78bfa] rounded-full"></span>
            </span>
          </h4>
          <div className="flex gap-4 flex-wrap mb-4">
            {[
              { icon: <FaFacebookF />, color: "#3b5998" },
              {
                icon: <FaTwitter />,
                color: "#1da1f2",
                href: "https://x.com/Wecure_wellness",
              },
              {
                icon: <FaLinkedinIn />,
                color: "#0077b5",
                href: "http://www.linkedin.com/in/wecure-wellness-33842128a",
              },
              { icon: <FaInstagram />, color: "#e1306c" },
              {
                icon: <FaYoutube />,
                color: "#FF0000",
                href: "https://www.youtube.com/@wecurewellness",
              },
              { icon: <FaGithub />, color: "#171515" },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href || "#"}
                target="_blank"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:text-white/90 transition-colors"
                whileHover={{ y: -5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
          <h4 className="text-xl font-bold mb-4 relative pb-2">
            <span className="relative">
              SUPPORT
              <span className="absolute top-6 left-0 w-12 h-1 bg-[#a78bfa] rounded-full"></span>
            </span>
          </h4>
          <motion.button
            className="flex items-center justify-center gap-2 bg-white text-[#4f7cac] px-6 py-2 rounded-full font-semibold mb-6 w-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaCommentAlt /> Live Chat
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="mt-12 pt-6 border-t border-white/10 text-center text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        © {new Date().getFullYear()} WeCure. All rights reserved.
      </motion.div>
    </motion.footer>
  );
}

export default Footer;
