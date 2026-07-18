"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const studioServices = [
    {
      name: "Signature Haircut",
      desc: "Consultation, precision cut, hot towel finish",
      price: "₦5,000",
    },
    {
      name: "Beard Grooming & Shape",
      desc: "Razor lineup, premium oils, condition treatment",
      price: "₦5,000",
    },
    {
      name: "Royal Hot Towel Shave",
      desc: "Straight razor cut, pre-shave essential oils",
      price: "₦5,000",
    },
  ];

  const spaServices = [
    {
      name: "Detoxifying Facial",
      desc: "Deep cleansing charcoal mask, steam, hydration",
      price: "₦5,000",
    },
    {
      name: "Scalp Therapy Ritual",
      desc: "Exfoliating wash, massage, essential oil therapy",
      price: "₦5,000",
    },
    {
      name: "Stress Relief Massage",
      desc: "Focused neck, shoulder, and upper back release",
      price: "₦5,000",
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      
      {/* ================= HERO SECTION ================= */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Background Video Container */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <video
            loop
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover opacity-30 filter brightness-75"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-4 text-xs md:text-sm font-medium tracking-[0.35em] text-amber-400 uppercase bg-stone-900/60 backdrop-blur-md px-4 py-1.5 border border-stone-800/50">
            Premium Grooming & Relaxation
          </span>
          
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-wide mb-2 uppercase text-transparent bg-clip-text bg-gradient-to-b from-stone-50 via-stone-100 to-stone-400">
            Jaybliz Cut
          </h1>
          <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-light tracking-[0.25em] text-stone-300 mb-8 uppercase">
            Hair Studio & Spa
          </h2>
          
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-8"></div>
          
          <p className="max-w-xl text-sm md:text-lg text-stone-400 mb-12 font-light leading-relaxed px-2">
            Where precision barbering meets luxury spa therapy. Experience world-class cuts, traditional hot towel shaves, or summon our house call specialists to your private residence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm sm:max-w-none">
            <Link href="/book" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-10 py-4 rounded-none transition duration-300 uppercase tracking-widest text-xs flex items-center justify-center shadow-lg">
              Book Appointment
            </Link>
            <Link href="/book" className="border border-stone-700 hover:border-amber-400 hover:bg-amber-400/5 text-stone-300 font-medium px-10 py-4 rounded-none transition duration-300 uppercase tracking-widest text-xs flex items-center justify-center backdrop-blur-sm">
              Explore Services
            </Link>
          </div>
        </div>
      </div>

      {/* ================= HOME SERVICE HOUSE CALL FEATURE BAR ================= */}
      <section className="relative z-10 mx-4 my-4 max-w-6xl lg:mx-auto bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 py-6 px-6 font-sans border border-amber-400/20 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left flex-col sm:flex-row">
            <span className="text-2xl bg-stone-950/10 p-2.5 backdrop-blur-sm">🏠</span>
            <div>
              <span className="text-xs font-black tracking-widest uppercase block mb-0.5 text-stone-950">
                Premium House Calls & Mobile Grooming
              </span>
              <p className="text-xs font-medium max-w-xl text-stone-900/90 leading-relaxed">
                Can&apos;t clear your schedule to visit our lounge? Toggle private mobile grooming at dispatch to bring our master tailored chairs to your office suite or residence.
              </p>
            </div>
          </div>
          <Link href="/book" className="bg-stone-950 hover:bg-stone-900 text-white font-bold px-6 py-3 text-[10px] uppercase tracking-widest transition duration-300 whitespace-nowrap shadow-md">
            Request House Call
          </Link>
        </div>
      </section>

      {/* ================= THE EXPERIENCE / ABOUT SECTION ================= */}
      <section className="relative z-10 bg-stone-900/40 backdrop-blur-sm py-28 px-4 sm:px-6 lg:px-8 border-y border-stone-900/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6 lg:max-w-lg">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block">The Experience</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-stone-100">Redefining Modern Grooming & Wellness</h2>
            <div className="w-12 h-[2px] bg-amber-400"></div>
            <p className="text-stone-400 leading-relaxed font-light">
              At Jaybliz Cut, we believe that grooming is more than a routine—it’s a physical ritual. Our master barbers bring pristine technical expertise in classical tailoring and contemporary contours, ensuring every fade and trim is a masterpiece.
            </p>
            <p className="text-stone-400 leading-relaxed font-light">
              Step past the active studio chairs into our isolated spa sanctuary, built specifically for physical decompression from high-stress routines. From custom charcoal facial therapies to essential oil washes, realigned luxury awaits.
            </p>
          </div>

          {/* Picture Grid Layout */}
          <div className="grid grid-cols-2 gap-4 relative">
            <div className="relative h-72 md:h-96 w-full overflow-hidden border border-stone-800/80 shadow-2xl group">
              <Image 
                src="/two.jpeg"
                alt="Jaybliz Hair Studio sharp fade cuts"
                fill
                sizes="(max-w-768px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-stone-950/30 z-10 transition group-hover:opacity-10" />
              <p className="absolute bottom-4 left-4 z-20 font-serif text-xs tracking-widest uppercase text-amber-400 bg-stone-950/80 backdrop-blur-sm px-3 py-1.5 border border-stone-800">
                Sharp Styles
              </p>
            </div>
            
            <div className="relative h-72 md:h-96 w-full overflow-hidden border border-stone-800/80 shadow-2xl mt-10 group">
              <Image 
                src="/one.jpeg"
                alt="Jaybliz premium grooming setup"
                fill
                sizes="(max-w-768px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-stone-950/30 z-10 transition group-hover:opacity-10" />
              <p className="absolute bottom-4 left-4 z-20 font-serif text-xs tracking-widest uppercase text-amber-400 bg-stone-950/80 backdrop-blur-sm px-3 py-1.5 border border-stone-800">
                Premium Cuts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIGNATURE MENU SECTION ================= */}
      <section className="relative z-10 bg-stone-950 py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3">Our Menu</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">Signature Offerings</h2>
            <div className="w-12 h-[1px] bg-stone-800 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {/* Hair Studio Menu mapping */}
            <div className="bg-stone-900/20 p-6 rounded-none border border-stone-900/50 backdrop-blur-sm">
              <h3 className="text-lg font-medium tracking-[0.2em] uppercase text-stone-200 border-b border-stone-800/80 pb-4 mb-8 flex justify-between items-center">
                <span>Hair Studio</span>
                <span className="text-[10px] text-amber-400/60 font-sans tracking-widest">BARBERING</span>
              </h3>
              <div className="space-y-8">
                {studioServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-start gap-4 group">
                    <div className="space-y-1">
                      <h4 className="font-medium text-stone-200 group-hover:text-amber-400 transition-colors duration-200">{service.name}</h4>
                      <p className="text-xs text-stone-400 font-light leading-relaxed">{service.desc}</p>
                    </div>
                    <span className="font-mono text-xs text-amber-400 bg-stone-900 px-2.5 py-1 border border-stone-800 whitespace-nowrap mt-0.5">{service.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spa Menu mapping */}
            <div className="bg-stone-900/20 p-6 rounded-none border border-stone-900/50 backdrop-blur-sm">
              <h3 className="text-lg font-medium tracking-[0.2em] uppercase text-stone-200 border-b border-stone-800/80 pb-4 mb-8 flex justify-between items-center">
                <span>Spa Therapy</span>
                <span className="text-[10px] text-amber-400/60 font-sans tracking-widest">WELLNESS</span>
              </h3>
              <div className="space-y-8">
                {spaServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-start gap-4 group">
                    <div className="space-y-1">
                      <h4 className="font-medium text-stone-200 group-hover:text-amber-400 transition-colors duration-200">{service.name}</h4>
                      <p className="text-xs text-stone-400 font-light leading-relaxed">{service.desc}</p>
                    </div>
                    <span className="font-mono text-xs text-amber-400 bg-stone-900 px-2.5 py-1 border border-stone-800 whitespace-nowrap mt-0.5">{service.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link href="/services" className="inline-block border-b border-amber-400/40 text-amber-400 hover:text-amber-300 hover:border-amber-300 pb-1 text-sm tracking-widest uppercase transition duration-200 font-medium">
              View Full Menu & Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL MODAL CARD ================= */}
      <section className="relative z-10 bg-gradient-to-b from-stone-900/60 to-stone-950 py-24 px-4 text-center border-t border-stone-900">
        <div className="max-w-3xl mx-auto bg-stone-900/40 border border-stone-800/60 p-10 md:p-14 backdrop-blur-md shadow-2xl relative">
          <span className="text-5xl text-amber-400/30 font-serif absolute top-4 left-6 pointer-events-none">“</span>
          <p className="text-base md:text-lg font-light italic text-stone-300 leading-relaxed mb-8 relative z-10 px-4">
            &ldquo;Jaybliz Cut completely changes what it means to go to a barbershop. The haircut is pristine and sharp, but slipping away into the private back spa room for a hot towel facial ritual is an absolute luxury.&rdquo;
          </p>
          <div className="w-6 h-[1px] bg-amber-400/30 mx-auto mb-4"></div>
          <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-stone-400 block">Marcus V. — Verified Guest</span>
        </div>
      </section>

    </main>
  );
}