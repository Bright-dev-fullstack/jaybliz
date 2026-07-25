"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/config/firebase";
import { FiLoader, FiCheckCircle, FiSend } from "react-icons/fi";
import Link from "next/link";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("id");
  const bookingRef = searchParams.get("ref");
  const urlAmount = searchParams.get("amount");

  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Payment Form Fields
  const [senderName, setSenderName] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (bookingId) {
        try {
          const docRef = doc(db, "services", bookingId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setBookingData(data);
            if (data.status === "payment_submitted" || data.status === "paid" || data.status === "confirmed") {
              setIsSubmitted(true);
            }
          }
        } catch (error) {
          console.error("Error fetching booking details:", error);
        }
      }
      setLoading(false);
    };

    fetchBookingDetails();
  }, [bookingId]);

  const finalPrice = bookingData?.totalPrice ?? (urlAmount ? Number(urlAmount) : 0);

  // Submit payment to Firestore for Admin approval
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
      alert("Booking ID missing. Please try booking again.");
      return;
    }

    if (!senderName.trim()) {
      alert("Please enter the account name used for the transfer.");
      return;
    }

    setSubmitting(true);

    try {
      const paymentDate = new Date().toISOString();

      // 1. Update the booking status in 'services' collection
      const bookingDocRef = doc(db, "services", bookingId);
      await updateDoc(bookingDocRef, {
        status: "payment_submitted",
        senderName: senderName.trim(),
        paymentNote: paymentNote.trim(),
        submittedAt: paymentDate,
      });

      // 2. Create an explicit record in 'payments' collection for easy tracking
      await addDoc(collection(db, "payments"), {
        bookingId: bookingId,
        bookingRef: bookingRef || bookingData?.bookingRef || "N/A",
        userEmail: bookingData?.userEmail || "guest",
        userName: bookingData?.userName || "Guest",
        serviceName: bookingData?.serviceName || "Service",
        amountPaid: finalPrice,
        senderName: senderName.trim(),
        paymentNote: paymentNote.trim(),
        status: "pending_verification",
        createdAt: paymentDate,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-amber-400">
        <FiLoader className="animate-spin text-3xl mb-3" />
        <p className="text-xs uppercase tracking-widest text-stone-400">Loading Payment Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-stone-900 border border-stone-800 p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-stone-800 pb-4">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide text-stone-100">
          Payment & Verification
        </h1>
        <p className="text-xs text-amber-400 mt-1 font-mono">
          Ref Code: {bookingRef || bookingData?.bookingRef || "N/A"}
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-3 text-xs font-light bg-stone-950/60 p-4 border border-stone-800/80">
        <div className="flex justify-between items-center border-b border-stone-800/60 pb-2">
          <span className="text-stone-400">Service:</span>
          <span className="text-stone-200 font-medium">{bookingData?.serviceName || "Selected Service"}</span>
        </div>
        <div className="flex justify-between items-center border-b border-stone-800/60 pb-2">
          <span className="text-stone-400">Date & Time:</span>
          <span className="text-stone-200">{bookingData?.date} @ {bookingData?.time}</span>
        </div>
        <div className="flex justify-between items-end pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Amount Due</span>
          <span className="font-mono text-2xl text-amber-400 font-bold">
            ₦{finalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-amber-500/5 border border-amber-500/20 p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Bank Details For Transfer</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-stone-500 block text-[10px]">BANK NAME</span>
            <span className="text-stone-200 font-medium">Moniepoint MFB</span>
          </div>
          <div>
            <span className="text-stone-500 block text-[10px]">ACCOUNT NO.</span>
            <span className="text-amber-400 font-mono font-bold">6607927196</span>
          </div>
          <div className="col-span-2">
            <span className="text-stone-500 block text-[10px]">ACCOUNT NAME</span>
            <span className="text-stone-200 font-medium">Babalola Joshua Femi</span>
          </div>
        </div>
      </div>

      {/* Success Notification if Payment is Already Submitted */}
      {isSubmitted ? (
        <div className="bg-stone-950 border border-green-500/30 p-6 text-center space-y-3">
          <FiCheckCircle className="text-green-500 text-4xl mx-auto" />
          <h3 className="text-stone-200 font-bold text-sm uppercase tracking-wide">
            Payment Notification Received
          </h3>
          <p className="text-xs text-stone-400 font-light">
            Your transfer details have been sent to our admin team for verification. Once confirmed, your appointment status will be updated.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs uppercase tracking-widest px-6 py-2.5 font-bold transition"
          >
            Return to Home
          </Link>
        </div>
      ) : (
        /* Form for User to Submit Transfer Details */
        <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Submit Payment Details
          </h3>

          <div>
            <label className="block text-[11px] text-stone-400 mb-1">
              Sender's Bank Account Name *
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-2.5 text-stone-200 text-xs focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] text-stone-400 mb-1">
              Payment Note / Bank Ref (Optional)
            </label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Optional transfer reference or bank name"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-2.5 text-stone-200 text-xs focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 text-stone-950 font-bold py-3.5 px-4 transition uppercase tracking-widest text-xs mt-4"
          >
            {submitting ? (
              <FiLoader className="animate-spin text-lg" />
            ) : (
              <>
                <FiSend className="text-base" />
                I Have Made This Transfer
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-16 px-4">
      <Suspense fallback={
        <div className="flex justify-center text-amber-400 py-12">
          <FiLoader className="animate-spin text-2xl" />
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </main>
  );
}