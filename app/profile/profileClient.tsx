"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FiUser, 
  FiSliders, 
  FiBell, 
  FiSave, 
  FiLoader, 
  FiCheck,
  FiMail,
  FiSmartphone
} from "react-icons/fi";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function ProfileClient({ session: initialSession }: { session?: any }) {
  // Renamed client session to prevent naming collision with the server-passed prop
  const { data: clientSession, update } = useSession();
  const session = clientSession || initialSession;

  const [activeTab, setActiveTab] = useState<"general" | "preferences" | "notifications">("general");

  // Loading & Feedback States
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form States - General Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Form States - Styling Preferences
  const [preferences, setPreferences] = useState("");
  const [preferredStylist, setPreferredStylist] = useState("No Preference");

  // Form States - Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  // -------------------------------------------------------------
  // FETCH USER SETTINGS FROM FIRESTORE
  // -------------------------------------------------------------
  useEffect(() => {
    async function fetchUserSettings() {
      const userEmail = session?.user?.email;
      if (!userEmail) return;

      setLoadingData(true);

      try {
        const userDocRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || session?.user?.name || "");
          setPhone(data.phone || "");
          setPreferences(data.preferences || "");
          setPreferredStylist(data.preferredStylist || "No Preference");
          setEmailNotifications(data.emailNotifications ?? true);
          setSmsNotifications(data.smsNotifications ?? true);
          setPromotionalEmails(data.promotionalEmails ?? false);
        } else {
          setName(session?.user?.name || "");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      } finally {
        setLoadingData(false);
      }
    }

    if (session?.user?.email) {
      fetchUserSettings();
    } else {
      setLoadingData(false);
    }
  }, [session?.user?.email]);

  // -------------------------------------------------------------
  // SAVE ALL SETTINGS TO FIRESTORE
  // -------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
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
          emailNotifications,
          smsNotifications,
          promotionalEmails,
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
      console.error("Failed to save settings:", error);
      alert("An error occurred while saving your settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400 gap-3">
        <FiLoader className="text-3xl animate-spin text-amber-500" />
        <p className="text-xs uppercase tracking-widest font-mono">Loading settings...</p>
      </div>
    );
  }

  const userInitial = name?.charAt(0) || session?.user?.name?.charAt(0) || "U";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-stone-900 border border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
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
                Account Settings
              </h1>
              <p className="text-xs text-stone-400 font-mono mt-1">
                {session?.user?.email}
              </p>
              <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                VIP Member
              </span>
            </div>
          </div>
        </div>

        {/* SETTINGS CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="md:col-span-1 bg-stone-900 border border-stone-800 p-2 h-fit flex md:flex-col gap-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "general"
                  ? "bg-amber-500 text-stone-950"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
              }`}
            >
              <FiUser className="text-base" /> General
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "preferences"
                  ? "bg-amber-500 text-stone-950"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
              }`}
            >
              <FiSliders className="text-base" /> Preferences
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "notifications"
                  ? "bg-amber-500 text-stone-950"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
              }`}
            >
              <FiBell className="text-base" /> Notifications
            </button>
          </div>

          {/* MAIN SETTINGS CONTENT AREA */}
          <div className="md:col-span-3 bg-stone-900 border border-stone-800 p-6 sm:p-8">
            
            {/* SUCCESS BANNER */}
            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <FiCheck className="text-base" /> Settings updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* TAB 1: GENERAL PROFILE */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-amber-400 tracking-wider uppercase mb-1">
                      General Information
                    </h2>
                    <p className="text-xs text-stone-400">Update your personal details used for reservations.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Display Name */}
                    <div className="sm:col-span-2">
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
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition pl-10"
                        />
                        <FiSmartphone className="absolute left-3.5 top-3.5 text-stone-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STYLING PREFERENCES */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-amber-400 tracking-wider uppercase mb-1">
                      Salon Preferences
                    </h2>
                    <p className="text-xs text-stone-400">Help our team customize your appointment experience.</p>
                  </div>

                  <div className="space-y-6 pt-2">
                    {/* Preferred Stylist */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">
                        Preferred Stylist
                      </label>
                      <select
                        value={preferredStylist}
                        onChange={(e) => setPreferredStylist(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition"
                      >
                        <option value="No Preference">No Preference (First Available)</option>
                        <option value="Marcus">Marcus - Executive Cuts Specialist</option>
                        <option value="Elena">Elena - Color & Scalp Specialist</option>
                        <option value="David">David - Master Barber</option>
                      </select>
                    </div>

                    {/* Styling Preferences & Notes */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">
                        Custom Hair/Skin Notes
                      </label>
                      <textarea
                        rows={4}
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="Specify sensitive skin, preferred hair products, beverage choices during service, or favorite styles..."
                        className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-amber-400 tracking-wider uppercase mb-1">
                      Notification Rules
                    </h2>
                    <p className="text-xs text-stone-400">Choose how and when Jaybliz Studio communicates with you.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    
                    {/* Email Reminders Toggle */}
                    <label className="flex items-center justify-between p-4 bg-stone-950 border border-stone-800 cursor-pointer hover:border-stone-700 transition">
                      <div>
                        <span className="block text-sm font-semibold text-stone-200">Email Reminders</span>
                        <span className="block text-xs text-stone-500">Receive booking confirmations and 24h reminders via email.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-5 w-5 accent-amber-500 bg-stone-900 border-stone-800 rounded-none cursor-pointer"
                      />
                    </label>

                    {/* SMS Reminders Toggle */}
                    <label className="flex items-center justify-between p-4 bg-stone-950 border border-stone-800 cursor-pointer hover:border-stone-700 transition">
                      <div>
                        <span className="block text-sm font-semibold text-stone-200">SMS Alerts</span>
                        <span className="block text-xs text-stone-500">Get text message updates if a slot opens up or schedule changes.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-5 w-5 accent-amber-500 bg-stone-900 border-stone-800 rounded-none cursor-pointer"
                      />
                    </label>

                    {/* Promotional Offers Toggle */}
                    <label className="flex items-center justify-between p-4 bg-stone-950 border border-stone-800 cursor-pointer hover:border-stone-700 transition">
                      <div>
                        <span className="block text-sm font-semibold text-stone-200">VIP Offers & Events</span>
                        <span className="block text-xs text-stone-500">Be notified about exclusive spa package deals and salon events.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={promotionalEmails}
                        onChange={(e) => setPromotionalEmails(e.target.checked)}
                        className="h-5 w-5 accent-amber-500 bg-stone-900 border-stone-800 rounded-none cursor-pointer"
                      />
                    </label>

                  </div>
                </div>
              )}

              {/* SAVE BUTTON FOOTER */}
              <div className="pt-6 border-t border-stone-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 text-stone-950 font-bold px-6 py-3 uppercase tracking-widest text-xs transition duration-200 flex items-center gap-2"
                >
                  {isSaving ? <FiLoader className="animate-spin text-base" /> : <FiSave className="text-base" />}
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}