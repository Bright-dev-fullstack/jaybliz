"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiStar, FiAward, FiMapPin, FiChevronRight, FiUpload, FiX, FiCheckCircle, FiInfo, FiCreditCard } from "react-icons/fi";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/config/firebase"; 

export default function MembershipDashboard({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
  const [historyServices, setHistoryServices] = useState<any[]>([]);
  
  // States for modals
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedPaymentService, setSelectedPaymentService] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Computed User Stats
  const totalVisits = historyServices.length;
  
  // Updated Tier Logic: Premium unlocked at 15 bookings, Elite at 30 bookings
  const currentTier = totalVisits >= 30 ? "Elite" : totalVisits >= 15 ? "Premium" : "Member";
  
  // Calculate Points: 
  // ₦1,000 to ₦15,000 = 2 points per transaction
  // ₦15,000 and above = 5 points per transaction
  const points = historyServices.reduce((sum, record) => {
    const price = Number(record.totalPrice) || 0;
    if (price >= 15000) return sum + 5;
    if (price >= 1000) return sum + 2;
    return sum;
  }, 0);

  // Real-time Fetch from Firestore
  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "services"),
      where("userEmail", "==", session.user.email)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const upcoming: any[] = [];
      const history: any[] = [];

      querySnapshot.forEach((document) => {
        const data: any = { id: document.id, ...document.data() };
        const status = data.status?.toLowerCase() || "pending";
        
        if (status === "completed") {
          history.push(data);
        } else {
          upcoming.push(data);
        }
      });

      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      upcoming.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setUpcomingServices(upcoming);
      setHistoryServices(history);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time services:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session]);

  // Handle Marking as Complete & Uploading Image
  const handleMarkCompleted = async () => {
    if (!selectedService) return;
    setIsUploading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const fileRef = ref(storage, `completed_services/${selectedService.id}_${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const serviceDocRef = doc(db, "services", selectedService.id);
      await updateDoc(serviceDocRef, {
        status: "Completed",
        completionImage: imageUrl,
        completedAt: new Date().toISOString(),
      });

      setSelectedService(null);
      setImageFile(null);
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to complete service. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Payment Confirmation
  const handleConfirmPayment = async () => {
    if (!selectedPaymentService) return;
    setIsUploading(true);

    try {
      const serviceDocRef = doc(db, "services", selectedPaymentService.id);
      await updateDoc(serviceDocRef, {
        isPaid: true,
        paidAt: new Date().toISOString(),
      });

      setSelectedPaymentService(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment confirmation failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'accepted' || s === 'confirmed' || s === 'paid') return 'text-green-400 border-green-400/30 bg-green-400/10';
    if (s === 'rejected') return 'text-red-400 border-red-400/30 bg-red-400/10';
    return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-widest text-stone-400">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT COLUMN: PROFILE & QUICK ACTIONS --- */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-stone-900 border border-stone-800 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-stone-800 flex items-center justify-center border border-stone-700">
                <span className="font-serif text-2xl text-amber-500">
                  {session?.user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-stone-100">{session?.user?.name || "Guest User"}</h2>
                <p className="text-xs text-stone-400 tracking-widest uppercase mt-1">{session?.user?.email}</p>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="bg-stone-950 border border-amber-500/30 p-4 flex justify-between items-center mb-8">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Current Tier</p>
                <p className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <FiAward /> {currentTier}
                </p>
              </div>
              <span className="text-[9px] text-stone-500 uppercase tracking-widest pb-0.5">
                {totalVisits}/15 to Premium
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link href="/book" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-center font-bold py-3 text-xs uppercase tracking-widest transition">
                Book New Session
              </Link>
              <Link href="/profile" className="w-full bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-center font-medium py-3 text-xs uppercase tracking-widest transition">
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
              <span className="text-3xl font-serif text-stone-100 mb-1">{points.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Loyalty Points</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-6 flex flex-col justify-center">
              <FiCalendar className="text-amber-500 text-xl mb-3" />
              <span className="text-3xl font-serif text-stone-100 mb-1">{totalVisits}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Total Cuts</span>
            </div>
          </div>

          {/* Active Appointments */}
          <div className="bg-stone-900 border border-stone-800 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Active Appointments
            </h3>
            
            {upcomingServices.length === 0 ? (
              <p className="text-sm text-stone-500 font-light italic">No active appointments.</p>
            ) : (
              <div className="space-y-6">
                {upcomingServices.map((service) => {
                  const s = service.status?.toLowerCase();
                  const isApproved = s === "accepted" || s === "confirmed" || s === "paid";
                  const isRejected = s === "rejected";
                  
                  // Hide "Pay Now" if already confirmed/approved by admin
                  const needsPayment = !service.isPaid && !isApproved && s !== "rejected";

                  return (
                    <div key={service.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-800/50 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-serif text-2xl text-stone-100">{service.serviceName || "Service"}</h4>
                          <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${getStatusStyle(service.status)}`}>
                            {service.status || "Pending"}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-stone-400">
                          <span className="flex items-center gap-2"><FiCalendar className="text-amber-500" /> {service.date}</span>
                          <span className="flex items-center gap-2"><FiClock className="text-amber-500" /> {service.time}</span>
                          <span className="flex items-center gap-2 uppercase text-[10px]">
                            <FiMapPin className="text-amber-500" /> 
                            {service.bookingLocation === "home" ? "House Call" : "Studio"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {needsPayment && (
                          <button 
                            onClick={() => setSelectedPaymentService(service)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] uppercase tracking-widest transition flex items-center gap-2 shadow-lg shadow-amber-500/10"
                          >
                            <FiCreditCard size={14} /> Pay Now
                          </button>
                        )}

                        {isRejected ? (
                           <div className="px-4 py-2 bg-red-950/30 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                             <FiInfo size={14} /> Contact Admin
                           </div>
                        ) : isApproved ? (
                          <button 
                            onClick={() => setSelectedService(service)}
                            className="px-4 py-2 bg-stone-950 border border-amber-500/50 text-amber-500 text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-stone-950 transition flex items-center gap-2"
                          >
                            <FiCheckCircle size={14} /> Mark Completed
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-stone-900/50 border border-stone-700/50 text-stone-500 text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-not-allowed">
                            <FiClock size={14} /> Pending Approval
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking History */}
          <div className="bg-stone-900 border border-stone-800">
            <div className="p-6 border-b border-stone-800 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest text-stone-100">Booking History</h3>
            </div>
            
            <div className="divide-y divide-stone-800/50">
              {historyServices.length === 0 ? (
                <div className="p-6 text-sm text-stone-500 font-light italic">No past appointments found.</div>
              ) : (
                historyServices.map((record) => (
                  <div key={record.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-950/50 transition">
                    <div>
                      <h4 className="text-sm font-medium text-stone-200 mb-1">{record.serviceName || "Service"}</h4>
                      <p className="text-xs text-stone-500 flex items-center gap-2">
                        <FiCalendar size={12} /> {record.date} at {record.time}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className="text-sm font-serif text-stone-300">₦{(record.totalPrice || 0).toLocaleString()}</span>
                      <span className="px-3 py-1 bg-stone-950 border border-stone-800 text-[10px] uppercase tracking-widest text-stone-400">
                        Completed
                      </span>
                      {record.completionImage && (
                         <a href={record.completionImage} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400 text-[10px] uppercase tracking-widest underline">
                           View Look
                         </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {selectedPaymentService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md p-6 relative animate-fadeIn shadow-2xl">
            
            <button 
              onClick={() => setSelectedPaymentService(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-100"
            >
              <FiX size={20} />
            </button>

            <h3 className="font-serif text-xl text-stone-100 mb-2">Complete Payment</h3>
            <p className="text-xs text-stone-400 tracking-widest uppercase mb-6 border-b border-stone-800 pb-4">
              {selectedPaymentService.serviceName}
            </p>

            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 p-4 flex justify-between items-center">
                <span className="text-xs text-stone-400 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-serif text-amber-500">₦{(selectedPaymentService.totalPrice || 0).toLocaleString()}</span>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold py-3 text-xs uppercase tracking-widest transition"
              >
                {isUploading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-stone-600 border-t-amber-500 rounded-full animate-spin" /> 
                     Processing Payment...
                   </>
                ) : (
                  "Simulate Successful Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- COMPLETION MODAL --- */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md p-6 relative animate-fadeIn shadow-2xl">
            
            <button 
              onClick={() => { setSelectedService(null); setImageFile(null); }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-100"
            >
              <FiX size={20} />
            </button>

            <h3 className="font-serif text-xl text-stone-100 mb-2">Complete Session</h3>
            <p className="text-xs text-stone-400 tracking-widest uppercase mb-6 border-b border-stone-800 pb-4">
              {selectedService.serviceName}
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
                  Upload Finished Look (Optional)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-700 bg-stone-950/50 hover:border-amber-500/50 hover:bg-stone-950 transition cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-6 h-6 text-stone-400 mb-2" />
                    <p className="text-xs text-stone-400">
                      {imageFile ? <span className="text-amber-500 font-medium">{imageFile.name}</span> : "Click to upload picture"}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <button
                onClick={handleMarkCompleted}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold py-3 text-xs uppercase tracking-widest transition"
              >
                {isUploading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-stone-600 border-t-amber-500 rounded-full animate-spin" /> 
                     Processing...
                   </>
                ) : (
                  "Confirm Completion"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}