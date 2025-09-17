import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  // 1) Fake Certificate Detection
  {
    title: 'Fake Certificate Detection',
    description: 'Learn how to detect and avoid fake certificates in your career journey.',
    image: '/images/fake-certificate-detection.jpg'
  },
  // 2) AI Internship Recommendation
  {
    title: 'AI Internship Recommendation',
    description: 'Get personalized internship recommendations based on your skills and preferences.',
    image: '/images/ai-internship-recommendation.jpg'
  },
  // 3) Freelancing Opportunities
  {
    title: 'Freelancing Opportunities',
    description: 'Find freelance gigs that match your expertise and availability.',
    image: '/images/freelancing-opportunities.jpg'
  },
  // 4) Internships for Blue-Collar Workers
  {
    title: 'Internships for Blue-Collar Workers',
    description: 'Explore internship options specifically designed for blue-collar laborers.',
    image: '/images/blue-collar-internships.jpg'
  }
];

export default function AuthSlider({ onBlue = false }){
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(timerRef.current);
  }, []);

  function go(n){
    clearInterval(timerRef.current);
    setIndex(n);
  }

  function prev(){ go((index - 1 + slides.length) % slides.length); }
  function next(){ go((index + 1) % slides.length); }

  return (
    <div className={onBlue ? "w-full max-w-4xl mx-auto px-6 py-10" : "w-full max-w-5xl mx-auto mt-8 px-4"}>
      <div className={onBlue ? "relative overflow-hidden" : "relative rounded-lg border border-[#E0E0E0] bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08)]"}>
        <button aria-label="Previous" onClick={prev} className={onBlue ? "absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 grid place-items-center rounded-full bg-white/80 text-[#0078D4] shadow" : "absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 grid place-items-center rounded-full bg-white/90 border border-[#E0E0E0] shadow"}>‹</button>
        <button aria-label="Next" onClick={next} className={onBlue ? "absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 grid place-items-center rounded-full bg-white/80 text-[#0078D4] shadow" : "absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 grid place-items-center rounded-full bg-white/90 border border-[#E0E0E0] shadow"}>›</button>
        <div className={onBlue ? "grid grid-cols-1" : "h-[320px] sm:h-[380px] grid grid-cols-1 sm:grid-cols-2"}>
          <div className={onBlue ? "h-full w-full grid place-items-center" : "hidden sm:block h-full w-full bg-[#F1F9FF] grid place-items-center"}>
            <AnimatePresence mode="popLayout">
              <motion.img key={index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} src={slides[index].image} alt="slide" className={onBlue ? "h-[22rem] w-[22rem] sm:h-[24rem] sm:w-[24rem] object-contain drop-shadow-xl" : "h-56 w-56 sm:h-72 sm:w-72 object-contain"} />
            </AnimatePresence>
          </div>
          <div className={onBlue ? "px-6 pt-2 pb-8 text-center" : "p-8 flex items-center"}>
            <AnimatePresence mode="wait">
              <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div className={onBlue ? "text-3xl font-semibold text-white leading-tight break-words max-w-3xl mx-auto" : "text-2xl font-semibold text-[#333333]"}>{slides[index].title}</div>
                <div className={onBlue ? "text-base text-white/90 mt-3 max-w-3xl mx-auto" : "text-base text-[#666666] mt-2 max-w-xl"}>{slides[index].description}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 pt-4 pb-10">
          {slides.map((_, i)=> (
            <button key={i} aria-label={`Go to slide ${i+1}`} onClick={()=>go(i)} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: onBlue ? (i===index ? '#FFFFFF' : 'rgba(255,255,255,0.5)') : (i===index ? '#0078D4' : '#E0E0E0') }} />
          ))}
        </div>
      </div>
    </div>
  );
}


