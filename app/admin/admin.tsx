"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";

interface JobRecord {
  id: string;
  bookingLocation?: string;
  createdAt?: any;
  date?: any;
  serviceId?: string;
  serviceName?: string;
  serviceType?: string;
  status?: string;
  time?: string;
  totalPrice?: number;
  transportFee?: number;
  userEmail?: string;
  userName?: string;
  address?: string;
  bookingRef?: string;
  senderName?: string;
  paymentNote?: string;
  submittedAt?: string;
}

interface DayAvailability {
  isOpen: boolean;
  timeSlots: string;
}

type WeeklySchedule = {
  [key: string]: DayAvailability;
};

interface AdminDashboardProps {
  session: any; // Receiving the session directly from the Server Component
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: { isOpen: true, timeSlots: "09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM" },
  tuesday: { isOpen: true, timeSlots: "09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM" },
  wednesday: { isOpen: true, timeSlots: "09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM" },
  thursday: { isOpen: true, timeSlots: "09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM" },
  friday: { isOpen: true, timeSlots: "09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM" },
  saturday: { isOpen: true, timeSlots: "10:00 AM, 01:00 PM" },
  sunday: { isOpen: false, timeSlots: "" },
};

const parseJobDate = (dateVal: any): Date | null => {
  if (!dateVal) return null;
  if (typeof dateVal === "object" && typeof dateVal.toDate === "function") {
    return dateVal.toDate();
  }
  if (typeof dateVal === "object" && typeof dateVal.seconds === "number") {
    return new Date(dateVal.seconds * 1000);
  }
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const userEmail = session?.user?.email;

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(DEFAULT_WEEKLY_SCHEDULE);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilitySavedMessage, setAvailabilitySavedMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Real-time listener for Services/Bookings
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "services"),
      (querySnapshot) => {
        const jobsList: JobRecord[] = [];
        querySnapshot.forEach((docSnap) => {
          jobsList.push({ id: docSnap.id, ...docSnap.data() } as JobRecord);
        });

        jobsList.sort((a, b) => {
          const dateA = parseJobDate(a.createdAt) || parseJobDate(a.date);
          const dateB = parseJobDate(b.createdAt) || parseJobDate(b.date);
          const timeA = dateA ? dateA.getTime() : 0;
          const timeB = dateB ? dateB.getTime() : 0;
          return timeB - timeA;
        });

        setJobs(jobsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching services: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch Weekly Schedule Settings from Firestore
  useEffect(() => {
    const fetchWeeklyAvailability = async () => {
      try {
        const docRef = doc(db, "settings", "weekly_schedule");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.schedule) {
            const loadedSchedule: WeeklySchedule = { ...DEFAULT_WEEKLY_SCHEDULE };
            DAYS_OF_WEEK.forEach((day) => {
              if (data.schedule[day]) {
                const dayObj = data.schedule[day];
                loadedSchedule[day] = {
                  isOpen: Boolean(dayObj.isOpen),
                  timeSlots: Array.isArray(dayObj.timeSlots)
                    ? dayObj.timeSlots.join(", ")
                    : dayObj.timeSlots || "",
                };
              }
            });
            setWeeklySchedule(loadedSchedule);
          }
        }
      } catch (error) {
        console.error("Error fetching weekly availability settings:", error);
      }
    };
    fetchWeeklyAvailability();
  }, []);

  const handleDayChange = (day: string, field: keyof DayAvailability, value: any) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveWeeklySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAvailability(true);
    setAvailabilitySavedMessage("");

    try {
      const formattedSchedule: Record<string, any> = {};
      DAYS_OF_WEEK.forEach((day) => {
        const dayData = weeklySchedule[day] || { isOpen: false, timeSlots: "" };
        const rawSlots = dayData.timeSlots;
        formattedSchedule[day] = {
          isOpen: dayData.isOpen,
          timeSlots:
            typeof rawSlots === "string"
              ? rawSlots.split(",").map((s) => s.trim()).filter(Boolean)
              : Array.isArray(rawSlots)
              ? rawSlots
              : [],
        };
      });

      const docRef = doc(db, "settings", "weekly_schedule");
      await setDoc(
        docRef,
        {
          schedule: formattedSchedule,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setAvailabilitySavedMessage("Schedule saved successfully!");
      setTimeout(() => setAvailabilitySavedMessage(""), 4000);
    } catch (error: any) {
      console.error("Error saving weekly schedule:", error);
      alert("Failed to save schedule: " + error.message);
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    try {
      const jobRef = doc(db, "services", id);
      await updateDoc(jobRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record entirely?")) return;
    setActionLoadingId(id);
    try {
      await deleteDoc(doc(db, "services", id));
    } catch (error) {
      console.error("Error deleting job: ", error);
      alert("Failed to delete record.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getJobMonthKey = (job: JobRecord) => {
    const d = parseJobDate(job.createdAt) || parseJobDate(job.date);
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const availableMonths = Array.from(
    new Set(jobs.map((j) => getJobMonthKey(j)).filter(Boolean))
  )
    .sort()
    .reverse() as string[];

  const earningsFilteredJobs = jobs.filter((j) => {
    const s = j.status?.toLowerCase();
    const isValidStatus =
      s === "accepted" || s === "confirmed" || s === "paid" || s === "completed";
    if (!isValidStatus) return false;

    if (selectedMonth === "all") return true;
    return getJobMonthKey(j) === selectedMonth;
  });

  const totalEarnings = earningsFilteredJobs.reduce(
    (acc, curr) => acc + (curr.totalPrice || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="uppercase tracking-widest text-amber-500 text-sm animate-pulse">
          Loading Management Desk...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[90rem] mx-auto space-y-10">
        
        {/* Header & Metrics */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-800 pb-6 gap-4">
          <div>
            <Link
              href="/"
              className="text-[10px] font-bold tracking-widest text-amber-400 uppercase hover:text-amber-300 transition block mb-2"
            >
              ← Back to Site
            </Link>
            <h1 className="font-serif text-3xl font-bold uppercase tracking-wide">
              Management Desk
            </h1>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">
              Admin: {userEmail}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-stone-400">
            <span className="bg-stone-900 px-4 py-2 border border-stone-800">
              Total Services: {jobs.length}
            </span>
            <span className="bg-stone-900 px-4 py-2 border border-stone-800 text-amber-400">
              Needs Verification:{" "}
              {jobs.filter((j) => j.status?.toLowerCase() === "payment_submitted").length}
            </span>
            <span className="bg-stone-900 px-4 py-2 border border-stone-800">
              Pending:{" "}
              {jobs.filter((j) => j.status?.toLowerCase() === "pending" || !j.status).length}
            </span>

            <div className="flex items-center bg-stone-900 border border-green-900/50">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-stone-950 text-stone-300 px-3 py-2 border-r border-stone-800 outline-none text-[11px] cursor-pointer"
              >
                <option value="all">All-Time Earnings</option>
                {availableMonths.map((m) => {
                  const [y, mo] = m.split("-");
                  const monthName = new Date(
                    Number(y),
                    Number(mo) - 1
                  ).toLocaleString("default", { month: "long", year: "numeric" });
                  return (
                    <option key={m} value={m}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
              <span className="px-4 py-2 text-green-400 font-bold whitespace-nowrap">
                ₦{totalEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Control Panel */}
        <div className="bg-stone-900 border border-stone-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-stone-800 pb-4 gap-4">
            <div>
              <h2 className="font-serif text-xl uppercase tracking-wider text-stone-100">
                Weekly Availability Setup
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Configure active days and specific time slots for incoming weekly bookings in Firestore.
              </p>
            </div>
            {availabilitySavedMessage && (
              <span className="text-xs font-mono text-green-400 bg-green-950/40 border border-green-800/50 px-3 py-1.5 uppercase tracking-widest animate-pulse">
                {availabilitySavedMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWeeklySchedule} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayData = weeklySchedule[day] || { isOpen: true, timeSlots: "" };

                return (
                  <div
                    key={day}
                    className="bg-stone-950 border border-stone-800 p-4 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                          {day}
                        </span>
                        <input
                          type="checkbox"
                          checked={dayData.isOpen}
                          onChange={(e) =>
                            handleDayChange(day, "isOpen", e.target.checked)
                          }
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <span
                        className={`inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 mb-3 border ${
                          dayData.isOpen
                            ? "bg-green-950/30 text-green-400 border-green-800/40"
                            : "bg-red-950/30 text-red-400 border-red-800/40"
                        }`}
                      >
                        {dayData.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">
                        Time Slots (Comma Separated)
                      </label>
                      <textarea
                        value={dayData.timeSlots}
                        onChange={(e) =>
                          handleDayChange(day, "timeSlots", e.target.value)
                        }
                        disabled={!dayData.isOpen}
                        placeholder="09:00 AM, 02:00 PM"
                        className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 p-2 text-xs text-stone-200 outline-none font-mono resize-none h-24 disabled:opacity-40"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingAvailability}
                className="px-8 h-[46px] bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs font-bold uppercase tracking-widest transition"
              >
                {isSavingAvailability ? "Saving Schedule..." : "Save Weekly Schedule"}
              </button>
            </div>
          </form>
        </div>

        {/* Services / Bookings Data Table */}
        <div className="overflow-x-auto bg-stone-900 border border-stone-800">
          <table className="w-full text-left text-sm min-w-[1000px]">
            <thead className="bg-stone-950 text-xs uppercase tracking-widest text-stone-500 border-b border-stone-800">
              <tr>
                <th className="p-4">Ref Code</th>
                <th className="p-4">Client</th>
                <th className="p-4">Service Details</th>
                <th className="p-4">Payment Info</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {jobs.map((job) => {
                const s = job.status?.toLowerCase();
                let statusClass = "text-stone-400 border-stone-400/30 bg-stone-400/10";
                let displayStatus = job.status || "Pending";

                if (
                  s === "accepted" ||
                  s === "confirmed" ||
                  s === "paid" ||
                  s === "completed"
                ) {
                  statusClass = "text-green-400 border-green-400/30 bg-green-400/10";
                  displayStatus = "Confirmed";
                } else if (s === "rejected") {
                  statusClass = "text-red-400 border-red-400/30 bg-red-400/10";
                  displayStatus = "Rejected";
                } else if (s === "payment_submitted") {
                  statusClass = "text-amber-400 border-amber-400/30 bg-amber-400/10";
                  displayStatus = "Needs Verification";
                }

                const isRowBusy = actionLoadingId === job.id;

                return (
                  <tr key={job.id} className="hover:bg-stone-950/50 transition">
                    <td className="p-4 font-mono text-amber-500 text-xs font-bold">
                      {job.bookingRef || "N/A"}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-stone-200">{job.userName || "Guest"}</p>
                      <p className="text-[10px] font-mono text-stone-500">
                        {job.userEmail || "No Email"}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-stone-200 truncate max-w-[180px]">
                        {job.serviceName || "Unknown Service"}
                      </p>
                      <p className="text-xs text-amber-500 font-mono">
                        ₦{(job.totalPrice || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="p-4">
                      {job.senderName ? (
                        <div>
                          <p className="text-xs text-stone-300">
                            <span className="text-stone-500">Sender:</span> {job.senderName}
                          </p>
                          {job.paymentNote && (
                            <p className="text-[10px] text-stone-500 italic max-w-[150px] truncate">
                              "{job.paymentNote}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-600">-</p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-stone-300 text-xs">{job.date || "No Date"}</p>
                      <p className="text-stone-500 text-[10px]">{job.time || "No Time"}</p>
                    </td>
                    <td className="p-4">
                      <span className="uppercase tracking-widest text-[10px] font-bold text-stone-400 bg-stone-950 px-2 py-1 border border-stone-800">
                        {job.bookingLocation || "Studio"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${statusClass} whitespace-nowrap`}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.status?.toLowerCase() === "payment_submitted" && (
                          <button
                            disabled={isRowBusy}
                            onClick={() => handleStatusUpdate(job.id, "Confirmed")}
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 text-[9px] uppercase tracking-widest transition disabled:opacity-50"
                          >
                            Verify & Confirm
                          </button>
                        )}
                        {(job.status?.toLowerCase() === "pending" || !job.status) && (
                          <>
                            <button
                              disabled={isRowBusy}
                              onClick={() => handleStatusUpdate(job.id, "Accepted")}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 text-[9px] uppercase tracking-widest transition disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              disabled={isRowBusy}
                              onClick={() => handleStatusUpdate(job.id, "Rejected")}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-[9px] uppercase tracking-widest transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          disabled={isRowBusy}
                          onClick={() => handleDelete(job.id)}
                          className="px-3 py-1.5 text-stone-500 hover:text-red-400 text-[9px] uppercase tracking-widest transition disabled:opacity-50"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-stone-500 uppercase tracking-widest text-xs"
                  >
                    No services found in Firestore database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}