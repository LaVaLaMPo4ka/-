import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function Background(){
  const params = useMemo(()=> ({
    d1: 10 + Math.random()*6,
    d2: 12 + Math.random()*8,
    d3: 14 + Math.random()*10,
    delay1: Math.random()*2,
    delay2: Math.random()*4,
    delay3: Math.random()*6,
    min1: 0.5,
    min2: 0.56,
    min3: 0.62
  }), []);

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute -left-[20%] -top-[10%] w-[70vmax] h-[70vmax] rounded-full"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,215,0,0.18), transparent 40%)", filter: "blur(80px)" }}
        animate={{ scale: [1, params.min1, 1] }}
        transition={{ duration: params.d1, repeat: Infinity, ease: "easeInOut", delay: params.delay1 }} />
      <motion.div className="absolute right-[-10%] top-[5%] w-[50vmax] h-[50vmax] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 30%, rgba(0,207,255,0.16), transparent 40%)", filter: "blur(72px)" }}
        animate={{ scale: [1, params.min2, 1] }}
        transition={{ duration: params.d2, repeat: Infinity, ease: "easeInOut", delay: params.delay2 }} />
      <motion.div className="absolute left-[-5%] bottom-[-10%] w-[80vmax] h-[80vmax] rounded-full"
        style={{ background: "radial-gradient(circle at 20% 80%, rgba(168,85,247,0.12), transparent 40%)", filter: "blur(100px)" }}
        animate={{ scale: [1, params.min3, 1] }}
        transition={{ duration: params.d3, repeat: Infinity, ease: "easeInOut", delay: params.delay3 }} />
    </div>
  );
}
