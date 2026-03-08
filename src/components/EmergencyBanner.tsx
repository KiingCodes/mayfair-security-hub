import { AlertTriangle, Phone } from "lucide-react";
import { motion } from "framer-motion";

const EmergencyBanner = () => {
  return (
    <motion.div
      className="gradient-emergency text-white py-2 px-4"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm md:text-base">
        <AlertTriangle className="w-5 h-5 animate-pulse" />
        <span className="font-semibold">24/7 Emergency Hotline:</span>
        <a
          href="#"
          className="flex items-center gap-2 font-bold underline hover:no-underline"
        >
          <Phone className="w-4 h-4" />
          Your Number Here
        </a>
        <span className="hidden md:inline">— Immediate Response Guaranteed</span>
      </div>
    </motion.div>
  );
};

export default EmergencyBanner;
