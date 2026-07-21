"use client";

import Image from "next/image";
import Link from "next/link";

export default function About() {
  const galleryImages = [
    { src: "/one.jpeg", alt: "Jaybliz tailored setup", label: "Our Studio" },
    { src: "/two.jpeg", alt: "Precision grooming cuts", label: "Sharp Fades" },
    { src: "/one.jpeg", alt: "Premium oils and tools", label: "Premium Products" },
    { src: "/two.jpeg", alt: "Spa facial treatment setup", label: "Spa Lounge" },
  ];

  const guestReviews = [
    {
      name: "Marcus V.",
      role: "Verified Guest",
      text: "Jaybliz Cut completely changes what it means to go to a barbershop. The haircut is pristine and sharp, but going into the private back spa room for a hot towel facial treatment is pure luxury.",
    },
    {
      name: "Tunde A.",
      role: "Club Member",
      text: "The precision of the fades is unreal. But the house call feature is the real game-changer for my schedule. They brought the entire premium studio experience right to my office.",
    },
    {
      name: "Chidi O.",
      role: "Regular Guest",
      text: "The best place for men's grooming. From the moment you walk in, you just relax. No rush, no noise—just clean cuts and premium treatment.",
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 text-center border-b border-stone-900">
        <span className="mb-4 text-xs md:text-sm font-medium tracking-[0.35em] text-amber-400 uppercase bg-stone-900/60 backdrop-blur-md px-4 py-1.5 border border-stone-800/50">
          Our Heritage & Philosophy
        </span>
        
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide mb-6 uppercase text-transparent bg-clip-text bg-gradient-to-b from-stone-50 via-stone-100 to-stone-400">
          Our Story
        </h1>
        
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"></div>
        
        <p className="max-w-2xl text-sm md:text-base text-stone-400 font-light leading-relaxed px-2">
          Jaybliz Cut was built to give you the perfect blend of premium haircuts and total relaxation. We don't do rushed appointments or basic styles—we take our time to deliver the exact look you want.
        </p>
      </section>

      {/* ================= STATIC MEDIA GALLERY ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3">Visual Showcase</span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight">Inside the Lounge</h2>
          <div className="w-12 h-[1px] bg-stone-800 mx-auto mt-4"></div>
        </div>

        {/* Clean, Non-Floating Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((img, index) => (
            <div key={index} className="relative h-80 w-full overflow-hidden border border-stone-900 shadow-xl group bg-stone-900">
              <Image 
                src={img.src} 
                alt={img.alt}
                fill
                className="object-cover transition duration-700 filter brightness-75 group-hover:brightness-100 scale-100 group-hover:scale-105"
                sizes="(max-w-640px) 100vw, (max-w-1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
              <p className="absolute bottom-4 left-4 z-20 font-serif text-xs tracking-widest uppercase text-amber-400 bg-stone-950/80 backdrop-blur-sm px-3 py-1.5 border border-stone-800">
                {img.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CUSTOMER REVIEWS GRID ================= */}
      <section className="bg-stone-900/40 border-y border-stone-900/60 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3">Guest Experience</span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight">Verified Testimonials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guestReviews.map((review, index) => (
              <div key={index} className="bg-stone-950/40 border border-stone-900/80 p-8 relative flex flex-col justify-between shadow-lg">
                <div>
                  <span className="text-4xl text-amber-400/20 font-serif absolute top-2 left-4 pointer-events-none">“</span>
                  <p className="text-sm font-light italic text-stone-300 leading-relaxed mb-6 relative z-10">
                    {review.text}
                  </p>
                </div>
                <div>
                  <div className="w-6 h-[1px] bg-stone-800 mb-3"></div>
                  <h4 className="text-xs font-bold tracking-widest uppercase text-amber-400">{review.name}</h4>
                  <span className="text-[10px] tracking-wide text-stone-500 uppercase">{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CALL TO ACTION ================= */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-4 uppercase">Experience the Shift</h2>
          <p className="text-xs text-stone-400 font-light tracking-wide mb-8 uppercase">
            Walk-ins are classic. Bookings are elite.
          </p>
          
          <Link 
            href="/book" 
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-12 py-4 rounded-none transition duration-300 uppercase tracking-widest text-xs flex items-center justify-center shadow-lg w-full max-w-xs"
          >
            Book Appointment
          </Link>
        </div>
      </section>

    </main>
  );
}