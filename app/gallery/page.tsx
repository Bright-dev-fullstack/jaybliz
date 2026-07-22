"use client";

import { useState } from "react";
import Link from "next/link";

export default function AnimatedGallery() {
  const [activeFilter, setActiveFilter] = useState("all");

  const galleryItems = [
    // --- SHOP VIEW IMAGES ---
    // {
    //   id: "shop-1",
    //   title: "Main Lounge & Waiting Area",
    //   category: "Shop View",
    //   filterCategory: "shop",
    //   image: "/shopone.jpeg",
    // },
    // {
    //   id: "shop-2",
    //   title: "Master Barber Stations",
    //   category: "Shop View",
    //   filterCategory: "shop",
    //   image: "/shoptwo.jpeg",
    // },
    {
      id: "shop-3",
      title: "Master Barber Stations",
      category: "Shop View",
      filterCategory: "shop",
      image: "/shopthree.jpeg",
    },
    {
      id: "shop-4",
      title: "Spa & Facial Sanctuary",
      category: "Shop View",
      filterCategory: "shop",
      image: "/shopfour.jpeg",
    },
    {
      id: "shop-5",
      title: "Grooming & Detailing Zone",
      category: "Shop View",
      filterCategory: "shop",
      image: "/shopfive.jpeg",
    },
    // {
    //   id: "shop-6",
    //   title: "Luxury Wash & Therapy Bar",
    //   category: "Shop View",
    //   filterCategory: "shop",
    //   image: "/shopsix.png",
    // },

    // --- OUR WORK IMAGES ---
    {
      id: "work-1",
      title: "Signature Fade",
      category: "Haircut",
      filterCategory: "work",
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "work-2",
      title: "Executive Grooming",
      category: "Beard & Hot Towel",
      filterCategory: "work",
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "work-3",
      title: "Modern Classic",
      category: "Styling",
      filterCategory: "work",
      image: "https://images.unsplash.com/photo-1512496015851-a1cbfc38d011?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "work-4",
      title: "VIP House Call",
      category: "Home Service",
      filterCategory: "work",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "work-5",
      title: "Precision Line-up",
      category: "Detailing",
      filterCategory: "work",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "work-6",
      title: "The Royal Treatment",
      category: "Full Package",
      filterCategory: "work",
      image: "https://images.unsplash.com/photo-1532710093739-9470acff878b?q=80&w=800&auto=format&fit=crop",
    },
  ];

  // Filter items based on active tab
  const filteredItems = activeFilter === "all" 
    ? galleryItems 
    : galleryItems.filter((item) => item.filterCategory === activeFilter);

  return (
    <section className="min-h-screen bg-stone-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <Link href="/" className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3 hover:text-amber-300 transition">
            ← Back to Home
          </Link>
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-wide uppercase text-stone-100">
            Gallery & Studio View
          </h2>
          <p className="text-sm text-stone-400 font-light mt-4 max-w-xl mx-auto">
            Explore our state-of-the-art studio lounge atmosphere alongside a showcase of our finest cuts and spa treatments.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex justify-center items-center gap-3 mb-12 flex-wrap">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              activeFilter === "all"
                ? "border-amber-400 bg-amber-500 text-stone-950 font-bold"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700 hover:text-stone-200"
            }`}
          >
            All Showcase
          </button>
          <button
            onClick={() => setActiveFilter("shop")}
            className={`px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              activeFilter === "shop"
                ? "border-amber-400 bg-amber-500 text-stone-950 font-bold"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700 hover:text-stone-200"
            }`}
          >
            Shop View & Atmosphere
          </button>
          <button
            onClick={() => setActiveFilter("work")}
            className={`px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              activeFilter === "work"
                ? "border-amber-400 bg-amber-500 text-stone-950 font-bold"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700 hover:text-stone-200"
            }`}
          >
            Haircut & Grooming
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative h-[400px] w-full overflow-hidden bg-stone-900 border border-stone-800/80 cursor-pointer"
            >
              {/* Image with scaling effect on hover */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-40"
              />

              {/* Gradient overlay that fades in */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Text content that slides up smoothly */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 transition-all duration-500 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2 block">
                  {item.category}
                </span>
                <h3 className="font-serif text-2xl font-semibold text-stone-100 tracking-wide">
                  {item.title}
                </h3>
                
                {/* Decorative Line */}
                <div className="w-0 h-[1px] bg-amber-500 mt-4 transition-all duration-700 delay-100 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}