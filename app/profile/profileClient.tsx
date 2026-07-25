"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FiUser, 
  FiSave, 
  FiLoader, 
  FiCheck,
  FiMail,
  FiSmartphone,
  FiCalendar,
  FiClock,
  FiMapPin
} from "react-icons/fi";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function ProfileClient({ session: initialSession }: { session?: any }) {
  const { data: clientSession, update } = useSession();
  const session = clientSession || initialSession;

  // Loading & Feedback States
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState("");
  const [preferredStylist, setPreferredStylist] = useState("No Preference");

  // Database Bookings State
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // -------------------------------------------------------------
  // FETCH USER PROFILE & BOOKINGS FROM FIRESTORE
  // -------------------------------------------------------------
  useEffect(() => {
    async function fetchUserData() {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        setLoadingData(false);
        setLoadingBookings(false);
        return;
      }

      setLoadingData(true);
      setLoadingBookings(true);

      try {
        // 1. Fetch User Profile Doc
        const userDocRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || session?.user?.name || "");
          setPhone(data.phone || "");
          setPreferences(data.preferences || "");
          setPreferredStylist(data.preferredStylist || "No Preference");
        } else {
          setName(session?.user?.name || "");
        }

        // 2. Fetch User Bookings from DB
        const bookingsQuery = query(
          collection(db, "services"), 
          where("userEmail", "==", userEmail)
        );
        const bookingSnapshots = await getDocs(bookingsQuery);
        const fetchedBookings: any[] = [];
        
        bookingSnapshots.forEach((docSnap) => {
          fetchedBookings.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });

        // Sort bookings by date descending
        fetchedBookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setUserBookings(fetchedBookings);

      } catch (error) {
        console.error("Error fetching user data from DB:", error);
      } finally {
        setLoadingData(false);
        setLoadingBookings(false);
      }
    }

    fetchUserData();
  }, [session?.user?.email]);

  // -------------------------------------------------------------
  // SAVE PROFILE TO FIRESTORE
  // -------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const userDocRef = doc(db, "users", userEmail);

      await setDoc(
        userDocRef,
        {
          name,
          phone,
          preferences,
          preferredStylist,
          email: userEmail,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Refresh local NextAuth session if display name changed
      if (update) {
        await update({ ...session, user: { ...session?.user, name } });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("An error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400 gap-3">
        <FiLoader className="text-3xl animate-spin text-amber-500" />
        <p className="text-xs uppercase tracking-widest font-mono">Loading profile data from database...</p>
      </div>
    );
  }

  const userInitial = name?.charAt(0) || session?.user?.name?.charAt(0) || "U";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-stone-900 border border-stone-800 p-6 sm:p-8 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-amber-500/40 bg-stone-800 flex items-center justify-center shrink-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={name || "User Avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-serif font-bold text-amber-400 uppercase">
                {userInitial}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-100 tracking-wide">
              My Profile & Reservations
            </h1>
            <p className="text-xs text-stone-400 font-mono mt-1">
              {session?.user?.email}
            </p>
            {/* <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
              
            </span> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PROFILE FORM (2 Cols) */}
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 p-6 sm:p-8">
            
            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <FiCheck className="text-base" /> Profile updated successfully in database!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h2 className="text-lg font-serif font-semibold text-amber-400 tracking-wider uppercase mb-1">
                  Personal & Salon Details
                </h2>
                <p className="text-xs text-stone-400">Update your contact information and appointment preferences.</p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">
                    Email Address <span className="text-[10px] text-stone-600">(Read-only)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="w-full bg-stone-950/50 border border-stone-900 text-stone-500 px-4 py-3 text-sm cursor-not-allowed pl-10"
                    />
                    <FiMail className="absolute left-3.5 top-3.5 text-stone-600" />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234810 000-0000"
                      className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition pl-10"
                    />
                    <FiSmartphone className="absolute left-3.5 top-3.5 text-stone-500" />
                  </div>
                </div>

                {/* Custom Notes */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">
                    Hair & Skin Notes
                  </label>
                  <textarea
                    rows={3}
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="Specify sensitive skin, preferred products, or favorite styles..."
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition resize-none"
                  />
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 border-t border-stone-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 text-stone-950 font-bold px-6 py-3 uppercase tracking-widest text-xs transition duration-200 flex items-center justify-center gap-2"
                >
                  {isSaving ? <FiLoader className="animate-spin text-base" /> : <FiSave className="text-base" />}
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* BOOKING HISTORY SIDE PANEL (1 Col) */}
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 p-6">
              <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-amber-400 mb-4 pb-3 border-b border-stone-800 flex items-center justify-between">
                <span>My Bookings</span>
                <span className="text-[10px] font-mono bg-stone-800 px-2 py-0.5 text-stone-300">
                  {userBookings.length}
                </span>
              </h2>

              {loadingBookings ? (
                <div className="flex items-center justify-center py-8 text-stone-500 text-xs gap-2 font-mono">
                  <FiLoader className="animate-spin text-base" /> Fetching bookings...
                </div>
              ) : userBookings.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6 font-light">
                  No appointments found in the database.
                </p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {userBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="bg-stone-950 border border-stone-800 p-4 text-xs space-y-2 hover:border-stone-700 transition"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-stone-200 truncate max-w-[140px]">
                          {booking.serviceName || "Service"}
                        </span>
                        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold ${
                          booking.status === "completed" 
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : booking.status === "rejected"
                            ? "bg-red-950/80 text-red-400 border border-red-800"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {booking.status || "Pending"}
                        </span>
                      </div>

                      <div className="text-stone-400 space-y-1 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="text-amber-500 shrink-0" />
                          <span>{booking.date || "Date not set"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiClock className="text-amber-500 shrink-0" />
                          <span>{booking.time || "Time not set"}</span>
                        </div>
                        {booking.isHomeService && booking.address && (
                          <div className="flex items-start gap-1.5 pt-1">
                            <FiMapPin className="text-amber-500 shrink-0 mt-0.5" />
                            <span className="truncate text-stone-400">{booking.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-900 flex justify-between items-center text-[11px]">
                        <span className="text-stone-500 font-mono">{booking.bookingRef}</span>
                        <span className="font-mono text-amber-400 font-medium">
                          ₦{(booking.totalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}