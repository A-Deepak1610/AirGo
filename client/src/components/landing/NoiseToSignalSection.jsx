import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

const RAW_QUOTES = [
  { fare: '₹4,950', route: 'DEL-BOM', left: '12%', top: '22%', delay: 0.05, alignedX: '7%' },
  { fare: '₹5,240', route: 'BOM-BLR', left: '26%', top: '74%', delay: 0.12, alignedX: '16%' },
  { fare: '₹5,890', route: 'DEL-HYD', left: '18%', top: '48%', delay: 0.18, alignedX: '25%' },
  { fare: '₹6,400', route: 'BLR-DEL', left: '42%', top: '18%', delay: 0.22, alignedX: '34%' },
  { fare: '₹6,810', route: 'DEL-CCU', left: '55%', top: '80%', delay: 0.15, alignedX: '43%' },
  { fare: '₹7,120', route: 'MAA-DEL', left: '38%', top: '56%', delay: 0.28, alignedX: '53%' },
  { fare: '₹7,350', route: 'BOM-GOI', left: '68%', top: '25%', delay: 0.10, alignedX: '62%' },
  { fare: '₹7,940', route: 'BLR-CCU', left: '78%', top: '68%', delay: 0.25, alignedX: '71%' },
  { fare: '₹8,420', route: 'DEL-SXR', left: '88%', top: '30%', delay: 0.20, alignedX: '80%' },
  { fare: '₹9,150', route: 'COK-DEL', left: '92%', top: '72%', delay: 0.30, alignedX: '89%' }
];

export const NoiseToSignalSection = () => {
  const [isAligned, setIsAligned] = useState(false);

  // Auto-cycle convergence animation every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAligned((prev) => !prev);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="signal" className="py-24 sm:py-32 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
            <span>TRANSFORMATION METAPHOR</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            From noise to signal.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
            Raw flight searches are noisy, disparate, and inconsistent. Our econometric engine converts chaotic fare quotes into one trusted macroeconomic pulse.
          </p>

          {/* Interactive Trigger Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsAligned(!isAligned)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAligned ? 'text-emerald-400 rotate-180 transition-transform duration-500' : 'text-blue-400'}`} />
              <span>State: <strong>{isAligned ? 'Harmonized Signal' : 'Dispersed Quotes'}</strong> (Click to Toggle)</span>
            </button>
          </div>
        </div>

        {/* Visual Stage Container */}
        <div className="mt-16 h-[340px] sm:h-[380px] w-full relative bg-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Central Horizontal Harmonization Axis */}
          <div 
            className={`absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-700 ${
              isAligned 
                ? 'bg-gradient-to-r from-blue-500/20 via-blue-400 to-blue-500/20 opacity-100 shadow-[0_0_16px_#38bdf8]' 
                : 'bg-slate-800/40 opacity-30'
            }`} 
          />

          {/* Floating Fare Quotes Transitioning */}
          {RAW_QUOTES.map((q, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                left: isAligned ? q.alignedX : q.left,
                top: isAligned ? '50%' : q.top,
                opacity: isAligned ? 0.95 : 0.65,
                scale: isAligned ? 1.0 : 0.92
              }}
              transition={{
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
                delay: q.delay
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all select-none ${
                isAligned 
                  ? 'bg-blue-950/90 text-blue-200 border-blue-400/80 shadow-[0_0_14px_rgba(56,189,248,0.35)]' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{q.fare}</span>
                {isAligned && (
                  <span className="text-[10px] text-blue-400/70 hidden sm:inline font-normal">
                    {q.route}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Golden Target Badge Revealed when Aligned */}
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-center transition-all duration-700 ${
            isAligned ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'
          }`}>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 block font-bold">
              ONE TRUSTED PRICE SIGNAL
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Raw data → Clean data → Intelligence
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
