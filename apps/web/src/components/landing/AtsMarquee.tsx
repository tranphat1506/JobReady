"use client";

import { motion } from "framer-motion";

const atsList = [
  "Workday",
  "Taleo",
  "Greenhouse",
  "Lever",
  "BambooHR",
  "SAP SuccessFactors",
  "iCIMS",
  "Jobvite",
];

export default function AtsMarquee() {
  return (
    <section className="py-12 bg-zinc-50 border-b border-zinc-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">
          Tương thích hoàn hảo với các hệ thống ATS hàng đầu
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Left fade gradient */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10"></div>
        
        {/* Right fade gradient */}
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10"></div>

        <motion.div
          className="py-4 whitespace-nowrap flex gap-16 pr-16 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
        >
          {/* We duplicate the list twice to create a seamless loop */}
          {[...atsList, ...atsList, ...atsList, ...atsList].map((ats, idx) => (
            <span
              key={idx}
              className="text-2xl md:text-3xl font-extrabold tracking-tighter text-zinc-300 uppercase opacity-70"
            >
              {ats}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
