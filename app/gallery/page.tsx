"use client";

import Link from "next/link";

export default function AnimatedGallery() {
  // Mock data with high-quality placeholder images
  const galleryItems = [
    {
      id: 1,
      title: "Signature Fade",
      category: "Haircut",
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Executive Grooming",
      category: "Beard & Hot Towel",
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Modern Classic",
      category: "Styling",
      image: "https://images.unsplash.com/photo-1512496015851-a1cbfc38d011?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "VIP House Call",
      category: "Home Service",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Precision Line-up",
      category: "Detailing",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 6,
      title: "The Royal Treatment",
      category: "Full Package",
      image: "https://images.unsplash.com/photo-1532710093739-9470acff878b?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <section className="min-h-screen bg-stone-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <Link href="/" className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3 hover:text-amber-300 transition">
            ← Back to Home
          </Link>
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-wide uppercase text-stone-100">
            Our Work
          </h2>
          <p className="text-sm text-stone-400 font-light mt-4 max-w-xl mx-auto">
            A showcase of premium cuts, detailed styling, and executive grooming sessions.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
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