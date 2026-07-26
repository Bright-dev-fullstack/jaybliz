"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

interface Review {
  id?: string;
  name: string;
  role: string;
  text: string;
  createdAt?: any;
}

const MASTER_REVIEW_POOL: Review[] = [
  // { name: "Marcus V.", role: "Verified Guest", text: "Jaybliz Cut completely changes what it means to go to a barbershop. The haircut is pristine and sharp, but going into the private back spa room for a hot towel facial treatment is pure luxury." },
  // { name: "Tunde A.", role: "Club Member", text: "The precision of the fades is unreal. But the house call feature is the real game-changer for my schedule. They brought the entire premium studio experience right to my office." },
  // { name: "Chidi O.", role: "Regular Guest", text: "The best place for men's grooming. From the moment you walk in, you just relax. No rush, no noise—just clean cuts and premium treatment." },
  // { name: "David S.", role: "Verified Guest", text: "Unmatched attention to detail. Babalola and his team take their time to ensure every single line is crisp and symmetrical." },
  // { name: "Emeka K.", role: "Club Member", text: "The spa facial treatment left my skin feeling completely rejuvenated. Absolute professional excellence from start to finish." },
  // { name: "Samuel O.", role: "Regular Guest", text: "Top-tier hygiene standards and premium products used. You can truly feel the passion behind every cut." },
  // { name: "Femi L.", role: "Verified Guest", text: "From mobile barbering back in the day to this stunning studio today, the growth is well deserved. Best grooming lounge in town." },
  // { name: "Michael B.", role: "Club Member", text: "A sanctuary of style and comfort. The ambiance is elite, and the grooming service is second to none." },
  // { name: "Kainose P.", role: "Regular Guest", text: "Cleanest fades, most relaxing pedicures, and a welcoming atmosphere. Highly recommend to anyone who values self-care." },
  // { name: "Victor E.", role: "Verified Guest", text: "The braiding and styling are incredible. Truly a complete grooming destination where luxury meets precision." },
  // { name: "Daniel N.", role: "Club Member", text: "Booking is seamless, the service is prompt, and the results speak for themselves. Jaybliz is the gold standard." },
  // { name: "Adebayo J.", role: "Regular Guest", text: "Every visit feels personal and exclusive. You walk out looking sharp and feeling fully recharged." },
];

export default function About() {
  const galleryImages = [
    { src: "/shopthree.jpeg", alt: "Jaybliz tailored setup", label: "Our Studio" },
    { src: "/shopfour.jpeg", alt: "Precision grooming cuts", label: "Spa Treatment" },
    { src: "/shopfive.jpeg", alt: "Premium oils and tools", label: "Cut Section" },
    { src: "/shopsix.jpeg", alt: "Spa facial treatment setup", label: "Spa Lounge" },
  ];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Regular Guest");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Shuffle & sync 6 reviews to DB every 10 days + fetch reviews
  useEffect(() => {
    const syncAndFetchReviews = async () => {
      try {
        const now = Date.now();
        const lastSync = localStorage.getItem("jaybliz_last_review_sync");
        const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;

        if (!lastSync || now - Number(lastSync) > tenDaysInMs) {
          const shuffled = [...MASTER_REVIEW_POOL].sort(() => 0.5 - Math.random());
          const selectedSix = shuffled.slice(0, 6);

          for (const rev of selectedSix) {
            await addDoc(collection(db, "reviews"), {
              name: rev.name,
              role: rev.role,
              text: rev.text,
              createdAt: serverTimestamp(),
            });
          }

          localStorage.setItem("jaybliz_last_review_sync", now.toString());
        }

        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedReviews: Review[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReviews.push({ id: doc.id, ...(doc.data() as Review) });
        });

        if (fetchedReviews.length > 0) {
          setReviews(fetchedReviews);
        } else {
          setReviews(MASTER_REVIEW_POOL.slice(0, 6));
        }
      } catch (error) {
        console.error("Error managing reviews:", error);
        setReviews(MASTER_REVIEW_POOL.slice(0, 6));
      }
    };

    syncAndFetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);
    setSuccessMsg("");

    try {
      const newReview = {
        name,
        role,
        text,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reviews"), newReview);
      
      setReviews([{ id: docRef.id, name, role, text }, ...reviews]);
      
      setName("");
      setText("");
      setSuccessMsg("Thank you! Your review has been published.");
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center border-b border-stone-900">
        <span className="mb-4 text-xs md:text-sm font-medium tracking-[0.35em] text-amber-400 uppercase bg-stone-900/65 backdrop-blur-md px-4 py-1.5 border border-stone-800/50">
          Our Heritage & Philosophy
        </span>
        
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide mb-6 uppercase text-transparent bg-clip-text bg-gradient-to-b from-stone-50 via-stone-100 to-stone-400">
          Our Story
        </h1>
        
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"></div>
        
        <p className="max-w-3xl text-sm md:text-base text-stone-400 font-light leading-relaxed px-2">
          Every great brand begins with a dream, and JAYBLIZ Hair Studio & Spa is no different. Welcome to my space.
        </p>
      </section>

      {/* ================= MEET THE OWNER SECTION ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Owner Image Container */}
          <div className="relative h-[400px] sm:h-[500px] w-full overflow-hidden border border-stone-800 shadow-2xl bg-stone-900 group">
            <Image 
              src="/jaybliz.jpeg"
              alt="Founder & Master Stylist"
              fill
              className="object-cover transition duration-700 filter brightness-90 group-hover:brightness-100 scale-100 group-hover:scale-105"
              sizes="(max-w-1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-stone-950/90 backdrop-blur-md p-4 border border-stone-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">Founder & Principal Stylist</span>
              <p className="font-serif text-lg text-stone-100">Babalola Joshua Femi</p>
            </div>
          </div>

          {/* Owner Bio / Message & Full Story */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3">Visionary Leadership</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight uppercase">Crafted with Purpose</h2>
              <div className="w-12 h-[1px] bg-amber-400/50 mt-4"></div>
            </div>

            <p className="text-sm md:text-base text-stone-400 font-light leading-relaxed">
              My name is Babalola Joshua Femi, the founder of Jaybliz Cut Hair Studio & Spa. Our journey started with a simple passion: helping people feel confident through quality grooming. What began as a personal love for barbering quickly became a calling. With dedication, countless hours of practice, and a commitment to continuous improvement, we set out to master the craft—not just to cut hair, but to create experiences that leave people feeling their very best.
            </p>

            <p className="text-sm md:text-base text-stone-400 font-light leading-relaxed">
              In the early days, we offered mobile barbering services, travelling to clients and building relationships one haircut at a time. Every appointment taught us something valuable about excellence, consistency, and the importance of treating every client with care and respect. Those experiences laid the foundation for what JAYBLIZ represents today.
            </p>

            <div className="pt-2">
              <span className="font-serif italic text-amber-400 text-lg block">Babalola Joshua Femi</span>
              <span className="text-xs text-stone-500 uppercase tracking-widest font-mono">Master Barber & Founder</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= EXPANDED NARRATIVE SECTION ================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-900 text-stone-300 font-light space-y-6 text-sm md:text-base leading-relaxed">
        <h3 className="font-serif text-2xl font-bold uppercase tracking-wide text-stone-100 text-center mb-8">
          Where Passion Meets Precision
        </h3>
        
        <p>
          As our reputation grew, so did our vision. We dreamed of creating more than a barbershop—we wanted a complete grooming destination where style, comfort, professionalism, and luxury come together. That dream became JAYBLIZ Hair Studio & Spa.
        </p>

        <p>
          Today, we proudly offer premium barbering, hairstyling, braiding, facials, manicures, pedicures, and other grooming services in an environment designed to make every visit memorable. Whether you’re coming in for a fresh haircut, a relaxing spa treatment, or a complete transformation, our goal remains the same: to help you look your best and feel even better.
        </p>

        <p>
          At JAYBLIZ, we believe confidence begins with self-care. That’s why we pay attention to every detail, use quality products, maintain the highest standards of hygiene, and stay updated with modern grooming trends. Every client who walks through our doors is treated with professionalism, respect, and genuine appreciation.
        </p>

        <p className="text-amber-400/90 italic text-center pt-4">
          Our story is still being written, and every client who chooses JAYBLIZ becomes a part of it. Thank you for trusting us with your style and allowing us to do what we love every single day. Welcome to JAYBLIZ Hair Studio & Spa.
        </p>
      </section>

      {/* ================= STATIC MEDIA GALLERY ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-stone-900">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3">Visual Showcase</span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight">Inside the Lounge</h2>
          <div className="w-12 h-[1px] bg-stone-800 mx-auto mt-4"></div>
        </div>

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

      {/* ================= CUSTOMER REVIEWS & SUBMISSION SECTION ================= */}
      <section className="bg-stone-900/40 border-y border-stone-900/60 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3">Guest Experience</span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight uppercase">Verified Testimonials</h2>
            <div className="w-12 h-[1px] bg-amber-400/40 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left 2 Columns: Reviews Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, index) => (
                <div key={index} className="bg-stone-950/60 border border-stone-900 p-6 relative flex flex-col justify-between shadow-xl">
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

            {/* Right Column: Review Submission Form */}
            <div className="bg-stone-950 border border-stone-800 p-8 shadow-2xl">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block mb-2">Share Your Experience</span>
              <h3 className="font-serif text-xl font-bold uppercase tracking-wide mb-6 text-stone-100">Leave a Review</h3>
              
              {successMsg && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 text-center tracking-wide uppercase">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-1 font-semibold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David S."
                    className="w-full bg-stone-900 border border-stone-800 px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-1 font-semibold">Role / Status</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-amber-400 transition"
                  >
                    <option value="Verified Guest">Verified Guest</option>
                    <option value="Club Member">Club Member</option>
                    <option value="Regular Guest">Regular Guest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-1 font-semibold">Your Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us about your haircut or spa experience..."
                    className="w-full bg-stone-900 border border-stone-800 px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-amber-400 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold py-3.5 transition duration-300 uppercase tracking-widest text-xs shadow-lg"
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </button>
              </form>
            </div>

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