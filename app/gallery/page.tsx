"use client";

import Link from "next/link";

export default function AnimatedGallery() {
  const galleryItems = [
    { id: "cut-1", title: "Precision Skin Fade", category: "Haircut", image: "/hair.jpeg" },
    { id: "cut-2", title: "Textured Crop & Taper", category: "Haircut", image: "/hair2.jpeg" },
    { id: "cut-3", title: "Executive Modern Classic", category: "Haircut", image: "/hair3.jpeg" },
    { id: "cut-4", title: "Sharp Edge-Up & Line", category: "Haircut", image: "/hair4.jpeg" },
    { id: "cut-5", title: "Natural Waves & Fade", category: "Haircut", image: "/hair5.jpeg" },
    { id: "cut-6", title: "", category: "Haircut", image: "/hair6.jpeg" },
    { id: "cut-7", title: "High & Tight Fade", category: "Haircut", image: "/hair7.jpeg" },
    { id: "cut-8", title: "Textured Quiff Styling", category: "Haircut", image: "/hair8.jpeg" },
    { id: "cut-9", title: "Signature Fade & Finish", category: "Haircut", image: "/hair9.jpeg" },
    { id: "cut-10", title: "Classic Gentleman Cut", category: "Haircut", image: "/hair10.jpeg" },
    { id: "cut-11", title: "Modern Taper Fade", category: "Haircut", image: "/hair11.jpeg" },
    { id: "cut-12", title: "Clean Line-Up & Style", category: "Haircut", image: "/hair12.jpeg" },
    { id: "cut-13", title: "Elite Master Barber Cut", category: "Haircut", image: "/hair13.jpeg" },
    { id: "cut-14", title: "Royal Crown Cut", category: "Haircut", image: "/hair14.jpeg" },
    { id: "shop-1", title: "Master Barber Stations", category: "Studio View", image: "/shopthree.jpeg" },
    { id: "shop-2", title: "Private Spa & Facial Sanctuary", category: "Studio View", image: "/shopfour.jpeg" },
    { id: "shop-3", title: "Grooming & Detailing Zone", category: "Studio View", image: "/shopfive.jpeg" },
  ];

  // Duplicate the array to create a seamless infinite loop effect for the marquee
  const duplicatedItems = [...galleryItems, ...galleryItems];

  return (
    <section className="min-h-screen bg-stone-950 py-24 px-4 sm:px-6 lg:px-8 text-stone-100 overflow-hidden">
      
      {/* Custom CSS Keyframes for continuous right-to-left floating motion */}
      <style jsx global>{`
        @keyframes floatLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-float-left {
          display: flex;
          width: max-content;
          animation: floatLeft 50s linear infinite;
        }
        .animate-float-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto mb-16 text-center">
        <Link href="/" className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3 hover:text-amber-300 transition">
          ← Back to Home
        </Link>
        <span className="text-xs uppercase font-bold tracking-[0.35em] text-amber-400/80 block mb-2">
          Visual Portfolio
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide uppercase text-stone-100">
          Gallery Showcase
        </h1>
        <div className="w-16 h-[1px] bg-amber-400/40 mx-auto mt-4 mb-4"></div>
        <p className="text-sm text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
          Watch our signature cuts glide across the screen. Hover over any card to pause and inspect the details.
        </p>
      </div>

      {/* Floating Right-to-Left Marquee Track Container */}
      <div className="relative w-full overflow-hidden py-10">
        
        {/* Left & Right Fade Gradients for smooth clipping */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-950 to-transparent z-30 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-950 to-transparent z-30 pointer-events-none" />

        {/* Continuous Floating Track */}
        <div className="animate-float-left gap-6 px-3">
          {duplicatedItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="group relative h-[420px] w-[320px] sm:w-[360px] flex-shrink-0 overflow-hidden bg-stone-900 border border-stone-800 shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-amber-500/20 cursor-pointer"
            >
              {/* Image with zoom and brightness effect on hover */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

              {/* Floating Category Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-stone-950/80 backdrop-blur-md text-amber-400 border border-stone-800">
                  {item.category}
                </span>
              </div>

              {/* Text content that slides up smoothly */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                {/* <h3 className="font-serif text-2xl font-semibold text-stone-100 tracking-wide transform transition-transform duration-500 group-hover:-translate-y-1">
                  {item.title}
                </h3> */}
                
                {/* Expanding Amber Accent Line */}
                <div className="w-10 h-[2px] bg-amber-400 mt-3 transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}