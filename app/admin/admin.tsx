"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

interface JobRecord {
  id: string;
  bookingLocation?: string;
  createdAt?: string;
  date?: string;
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
}

export default function AdminDashboard({ session }: { session: any }) {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "services"));
      const jobsList: JobRecord[] = [];
      
      querySnapshot.forEach((docSnap) => {
        jobsList.push({ id: docSnap.id, ...docSnap.data() } as JobRecord);
      });

      jobsList.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setJobs(jobsList);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const jobRef = doc(db, "services", id);
      await updateDoc(jobRef, { status: newStatus });
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, status: newStatus } : job))
      );
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record entirely?")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Error deleting job: ", error);
      alert("Failed to delete record.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setIsUpdating(true);
    
    try {
      const jobRef = doc(db, "services", editingJob.id);
      await updateDoc(jobRef, {
        serviceName: editingJob.serviceName || "",
        totalPrice: Number(editingJob.totalPrice || 0),
        date: editingJob.date || "",
        time: editingJob.time || "",
        bookingLocation: editingJob.bookingLocation || "studio",
        address: editingJob.address || "",
      });
      
      setJobs((prev) => prev.map((job) => (job.id === editingJob.id ? editingJob : job)));
      setEditingJob(null);
    } catch (error) {
      console.error("Error saving edits: ", error);
      alert("Failed to save changes.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="uppercase tracking-widest text-amber-500 text-sm animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-stone-800 pb-6 gap-4">
          <div>
            <Link href="/" className="text-[10px] font-bold tracking-widest text-amber-400 uppercase hover:text-amber-300 transition block mb-2">
              ← Back to Site
            </Link>
            <h1 className="font-serif text-3xl font-bold uppercase tracking-wide">
              Management Desk
            </h1>
          </div>
          <div className="flex gap-4 text-xs font-mono uppercase tracking-widest text-stone-400">
            <span className="bg-stone-900 px-4 py-2 border border-stone-800">Total: {jobs.length}</span>
            <span className="bg-stone-900 px-4 py-2 border border-stone-800">Pending: {jobs.filter(j => j.status?.toLowerCase() === "pending").length}</span>
          </div>
        </div>

        {/* Jobs Data Table */}
        <div className="overflow-x-auto bg-stone-900 border border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950 text-xs uppercase tracking-widest text-stone-500 border-b border-stone-800">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Service Details</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-stone-950/50 transition">
                  <td className="p-4">
                    <p className="font-medium text-stone-200">{job.userName || "Guest"}</p>
                    <p className="text-[10px] font-mono text-stone-500">{job.userEmail || "No Email"}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-stone-200">{job.serviceName || "Unknown Service"}</p>
                    <p className="text-xs text-amber-500 font-mono">₦{(job.totalPrice || 0).toLocaleString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-stone-300">{job.date || "No Date"}</p>
                    <p className="text-stone-500 text-xs">{job.time || "No Time"}</p>
                  </td>
                  <td className="p-4">
                    <span className="uppercase tracking-widest text-[10px] font-bold text-stone-400 bg-stone-950 px-2 py-1 border border-stone-800">
                      {job.bookingLocation || "Studio"}
                    </span>
                    {job.bookingLocation === "home" && job.address && (
                      <p className="text-xs text-stone-500 mt-2 truncate max-w-[150px]">{job.address}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold border ${
                      job.status?.toLowerCase() === 'accepted' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                      job.status?.toLowerCase() === 'rejected' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                      'text-amber-400 border-amber-400/30 bg-amber-400/10'
                    }`}>
                      {job.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {(job.status?.toLowerCase() === "pending" || !job.status) && (
                        <>
                          <button onClick={() => handleStatusUpdate(job.id, "Accepted")} className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 text-[10px] uppercase tracking-widest transition">
                            Accept
                          </button>
                          <button onClick={() => handleStatusUpdate(job.id, "Rejected")} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] uppercase tracking-widest transition">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setEditingJob(job)} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[10px] uppercase tracking-widest transition">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="px-3 py-1.5 text-stone-500 hover:text-red-400 text-[10px] uppercase tracking-widest transition">
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500 uppercase tracking-widest text-xs">
                    No records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Full Edit Modal Overlay */}
        {editingJob && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-4">
                <h3 className="font-serif text-xl uppercase tracking-wider">Edit Record</h3>
                <button onClick={() => setEditingJob(null)} className="text-stone-500 hover:text-stone-300">✕</button>
              </div>

              <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Service Name</label>
                  <input 
                    type="text" 
                    value={editingJob.serviceName || ""} 
                    onChange={(e) => setEditingJob({...editingJob, serviceName: e.target.value})}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 p-3 text-sm text-stone-200 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Total Price (₦)</label>
                  <input 
                    type="number" 
                    value={editingJob.totalPrice || 0} 
                    onChange={(e) => setEditingJob({...editingJob, totalPrice: Number(e.target.value)})}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 p-3 text-sm text-stone-200 outline-none font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Location Type</label>
                  <select 
                    value={editingJob.bookingLocation || "studio"} 
                    onChange={(e) => setEditingJob({...editingJob, bookingLocation: e.target.value})}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 p-3 text-sm text-stone-200 outline-none"
                  >
                    <option value="studio">In-Studio</option>
                    <option value="home">House Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={editingJob.date || ""} 
                    onChange={(e) => setEditingJob({...editingJob, date: e.target.value})}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 p-3 text-sm text-stone-200 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Time</label>
                  <input 
                    type="text" 
                    value={editingJob.time || ""} 
                    onChange={(e) => setEditingJob({...editingJob, time: e.target.value})}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 p-3 text-sm text-stone-200 outline-none" 
                  />
                </div>

                {editingJob.bookingLocation === "home" && (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Full Address</label>
                    <textarea 
                      value={editingJob.address || ""} 
                      onChange={(e) => setEditingJob({...editingJob, address: e.target.value})}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 p-3 text-sm text-stone-200 outline-none min-h-[100px]" 
                    />
                  </div>
                )}

                <div className="sm:col-span-2 pt-4 border-t border-stone-800 flex justify-end gap-4">
                  <button type="button" onClick={() => setEditingJob(null)} className="px-6 py-3 text-xs uppercase tracking-widest text-stone-400 hover:text-stone-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdating} className="px-8 py-3 text-xs uppercase tracking-widest font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 disabled:bg-stone-800 disabled:text-stone-500">
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}