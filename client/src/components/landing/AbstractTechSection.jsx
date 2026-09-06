import React from 'react';

export const AbstractTechSection = () => {
  const stack = ['Python', 'Playwright', 'Scrapy', 'PostgreSQL', 'React', 'Three.js'];

  return (
    <section className="py-20 sm:py-24 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
          ENGINEERING FOUNDATION
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          Built for the speed of modern airfare data.
        </h2>

        <p className="text-base sm:text-lg text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
          Combining headless browser clusters, distributed pipelines, and econometric indexing algorithms into one dependable national infrastructure.
        </p>

        {/* Minimal Typographic Tech Stack Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          {stack.map((tech) => (
            <span 
              key={tech}
              className="px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm font-mono font-bold text-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
};
