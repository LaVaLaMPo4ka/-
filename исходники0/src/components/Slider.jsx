import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Slider({ items = [] }){
  const [i, setI] = useState(0);
  if(!items.length) return <div className="glass p-6">Возможность не задана.</div>;
  const prev = ()=> setI((i-1+items.length)%items.length);
  const next = ()=> setI((i+1)%items.length);
  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it, idx)=>(
          <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} whileHover={{ scale: 1.02, y: -6 }} className={`glass relative rounded-2xl p-4 transition-transform ${idx===i? 'scale-100 opacity-100':'scale-95 opacity-50 pointer-events-none'}`}>
            {it.img && <img src={it.img} alt="" className="w-full h-36 object-contain rounded-lg mb-3" />}
            <h4 className="font-semibold">{it.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{it.text}</p>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-3 mt-4 justify-center">
        <button className="btn btn-neon p-3 rounded-full" onClick={prev}>‹</button>
        <button className="btn btn-accent p-3 rounded-full" onClick={next}>›</button>
      </div>
    </div>
  );
}
