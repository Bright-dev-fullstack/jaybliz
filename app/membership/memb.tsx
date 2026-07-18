"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiStar, FiAward, FiMapPin, FiChevronRight } from "react-icons/fi";

// Mock data: In production, you will fetch this from Firebase Firestore
const mockUserData = {
  name: "Alexander",
  tier: "Elite",
  points: 1250,
  totalVisits: 14,
  memberSince: "Jan 2026",
};

const mockUpcoming = {
  id: "bk_987",
  service: "VIP House Call",
  date: "July 18, 2026",
  time: "2:00 PM",
  location: "Home Service",
  status: "confirmed",
};

const mockHistory = [
  { id: "bk_101", date: "Jun 28, 2026", service: "Executive Grooming", price: "₦15,000" },
  { id: "bk_102", date: "Jun 10, 2026", service: "Signature Fade", price: "₦5,000" },
  { id: "bk_103", date: "May 22, 2026", service: "Signature Fade", price: "₦5,000" },
];

export default function MembershipDashboard({session}:{session:any}) {
  const [loading, setLoading] = useState(true);

  // Simulate Firebase data fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-widest text-stone-400">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT COLUMN: PROFILE & QUICK ACTIONS --- */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="bg-stone-900 border border-stone-800 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-stone-800 flex items-center justify-center border border-stone-700">
                <span className="font-serif text-2xl text-amber-500">{mockUserData.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-stone-100">{mockUserData.name}</h2>
                <p className="text-xs text-stone-400 tracking-widest uppercase mt-1">Member since {mockUserData.memberSince}</p>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="bg-stone-950 border border-amber-500/30 p-4 flex justify-between items-center mb-8">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Current Tier</p>
                <p className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <FiAward /> {mockUserData.tier}
                </p>
              </div>
              <Link href="/membership/upgrade" className="text-[10px] text-stone-100 border-b border-stone-100 hover:text-amber-400 hover:border-amber-400 transition-colors uppercase tracking-widest pb-0.5">
                Upgrade
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link href="/book" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-center font-bold py-3 text-xs uppercase tracking-widest transition">
                Book New Session
              </Link>
              <Link href="/settings" className="w-full bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-center font-medium py-3 text-xs uppercase tracking-widest transition">
                Manage Profile
              </Link>
            </div>
          </div>
        </aside>

        {/* --- RIGHT COLUMN: TRACKING & RECORDS --- */}
        <main className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 p-6 flex flex-col justify-center">
              <FiStar className="text-amber-500 text-xl mb-3" />
              <span className="text-3xl font-serif text-stone-100 mb-1">{mockUserData.points}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Loyalty Points</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-6 flex flex-col justify-center">
              <FiCalendar className="text-amber-500 text-xl mb-3" />
              <span className="text-3xl font-serif text-stone-100 mb-1">{mockUserData.totalVisits}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Total Cuts</span>
            </div>
            <div className="hidden md:flex bg-stone-900 border border-stone-800 p-6 flex-col justify-center">
              <FiAward className="text-amber-500 text-xl mb-3" />
              <span className="text-xl font-serif text-stone-100 mb-1">2 Left</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Spa Treatments</span>
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-stone-900 border border-stone-800 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Next Appointment
            </h3>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h4 className="font-serif text-2xl text-stone-100 mb-2">{mockUpcoming.service}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-stone-400">
                  <span className="flex items-center gap-2"><FiCalendar className="text-amber-500" /> {mockUpcoming.date}</span>
                  <span className="flex items-center gap-2"><FiClock className="text-amber-500" /> {mockUpcoming.time}</span>
                  <span className="flex items-center gap-2"><FiMapPin className="text-amber-500" /> {mockUpcoming.location}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 text-[10px] uppercase tracking-widest text-stone-400 border border-stone-700 hover:text-stone-100 hover:border-stone-500 transition">
                  Reschedule
                </button>
              </div>
            </div>
          </div>

          {/* Booking History / Tracking Record */}
          <div className="bg-stone-900 border border-stone-800">
            <div className="p-6 border-b border-stone-800 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest text-stone-100">Booking History</h3>
              <Link href="/dashboard/history" className="text-[10px] text-amber-500 uppercase tracking-widest flex items-center hover:text-amber-400 transition">
                View All <FiChevronRight />
              </Link>
            </div>
            
            <div className="divide-y divide-stone-800/50">
              {mockHistory.map((record) => (
                <div key={record.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-950/50 transition">
                  <div>
                    <h4 className="text-sm font-medium text-stone-200 mb-1">{record.service}</h4>
                    <p className="text-xs text-stone-500 flex items-center gap-2">
                      <FiCalendar size={12} /> {record.date}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span className="text-sm font-serif text-stone-300">{record.price}</span>
                    <span className="px-3 py-1 bg-stone-950 border border-stone-800 text-[10px] uppercase tracking-widest text-stone-400">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}