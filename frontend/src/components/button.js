import { motion } from "framer-motion";

const Button = () => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotate: 1 }} 
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center group"
    >
      {/* Glowing Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-2xl blur-lg opacity-40 transition-all duration-300 group-hover:opacity-80"></div>

      {/* Main Button */}
      <button 
        className="relative z-10 px-8 py-3 text-lg font-bold text-white bg-gray-900 bg-opacity-80 rounded-2xl shadow-lg backdrop-blur-md transition-all duration-300 group-hover:bg-opacity-100 group-hover:shadow-xl"
      >
        🚀 Get Started
      </button>

      {/* Animated Border */}
      <motion.div 
        className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-white"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
      ></motion.div>
    </motion.div>
  );
};

export default Button;
