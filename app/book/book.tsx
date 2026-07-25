"use client";

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { collection, addDoc, getDoc, getDocs, doc, query, where } from "firebase/firestore"; 
import { db } from '@/config/firebase';
import { useState, useEffect } from 'react';
import { FiLoader, FiCreditCard, FiArrowRight, FiClock, FiCalendar } from 'react-icons/fi';

export default function BookService({ session }: { session: any }) {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Dynamic slot management states
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isDayOpen, setIsDayOpen] = useState<boolean>(true);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const services = [
    { id: "s1", name: "Haircut (In-Studio)", price: 5000, type: "Hair", isHomeService: false },
    { id: "s1_home", name: "Haircut (Home Service)", price: 10000, type: "Hair", startingAt: true, isHomeService: true },
    { id: "s2", name: "Washing and Haircut", price: 7000, type: "Hair", isHomeService: false },
    { id: "s3", name: "Hair Tint", price: 20000, type: "Hair", startingAt: true, isHomeService: false },
    { id: "s4", name: "Braids", price: 10000, type: "Hair", startingAt: true, isHomeService: false },
    { id: "s5", name: "Tattoos", price: 20000, type: "Body Art", startingAt: true, isHomeService: false },
    { id: "s6", name: "Regular Pedicure", price: 12000, type: "Nail Care", isHomeService: false },
    { id: "s7", name: "Deluxe Pedicure", price: 15000, type: "Nail Care", isHomeService: false },
    { id: "s8", name: "Manicure", price: 7000, type: "Nail Care", isHomeService: false },
    { id: "s9", name: "Facial Treatment", price: 15000, type: "Skincare", isHomeService: false },
    { id: "s10", name: "Dermaplaning Facial Treatment", price: 20000, type: "Skincare", isHomeService: false },
  ];

  const bookingSchema = Yup.object().shape({
    selectedService: Yup.string().required("Please select a service"),
    selectedDate: Yup.string().required("Please select a date"),
    selectedTime: Yup.string().required("Please select an available time slot"),
    address: Yup.string().when("selectedService", {
      is: (val: string) => {
        const selected = services.find((s) => s.id === val);
        return selected?.isHomeService === true;
      },
      then: (schema) => schema.required("Address is required for house call service"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  return (
    <main className="relative min-h-screen w-full bg-stone-950 text-stone-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-3 hover:text-amber-300 transition">
            ← Back to Home
          </Link>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-wide uppercase">
            Book An Appointment
          </h1>
          <p className="text-sm text-stone-400 font-light mt-2">
            Select a service below to reserve your slot at Jaybliz Studio & Spa.
          </p>
        </div>

        <Formik
          initialValues={{
            selectedService: "",
            selectedDate: "",
            selectedTime: "",
            address: "",
          }}
          validationSchema={bookingSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const activeServiceObj = services.find((s) => s.id === values.selectedService);
              const basePrice = activeServiceObj ? activeServiceObj.price : 0;
              const bookingRef = `JAY-${Math.floor(1000 + Math.random() * 9000)}`;

              // 1. Save to Firestore
              const docRef = await addDoc(collection(db, "services"), {
                userEmail: session?.user?.email || "guest",
                userName: session?.user?.name || "Guest",
                serviceId: values.selectedService,
                serviceName: activeServiceObj?.name,
                serviceType: activeServiceObj?.type,
                isHomeService: !!activeServiceObj?.isHomeService,
                date: values.selectedDate,
                time: values.selectedTime,
                address: activeServiceObj?.isHomeService ? values.address : null,
                totalPrice: basePrice,
                bookingRef: bookingRef,
                status: "pending_payment",
                createdAt: new Date().toISOString(),
              });

              // 2. Set payment URL so the <Link> tag renders
              setPaymentUrl(`/book/payment?id=${docRef.id}&ref=${bookingRef}&amount=${basePrice}`);
            } catch (error) {
              console.error("Error booking service:", error);
              alert("There was an error processing your booking. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            // Fetch schedule & existing bookings whenever selectedDate changes
            useEffect(() => {
              if (!values.selectedDate) {
                setAvailableSlots([]);
                setBookedSlots([]);
                return;
              }

              const fetchDateAvailability = async () => {
                setLoadingSlots(true);
                try {
                  // Get day of week in lowercase
                  const dateObj = new Date(values.selectedDate);
                  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                  const dayName = dayNames[dateObj.getDay()];

                  // 1. Fetch weekly schedule from settings
                  const scheduleDocRef = doc(db, "settings", "weekly_schedule");
                  const scheduleSnap = await getDoc(scheduleDocRef);
                  
                  let daySlots: string[] = [];
                  let open = true;

                  if (scheduleSnap.exists()) {
                    const data = scheduleSnap.data();
                    if (data.schedule && data.schedule[dayName]) {
                      open = data.schedule[dayName].isOpen;
                      daySlots = data.schedule[dayName].timeSlots || [];
                    }
                  }

                  setIsDayOpen(open);
                  setAvailableSlots(daySlots);

                  // 2. Fetch existing bookings for this specific date
                  const q = query(collection(db, "services"), where("date", "==", values.selectedDate));
                  const querySnapshot = await getDocs(q);
                  
                  const taken: string[] = [];
                  querySnapshot.forEach((docSnap) => {
                    const job = docSnap.data();
                    const status = job.status?.toLowerCase();
                    // Consider slot taken if status is active (not rejected)
                    if (status !== "rejected" && job.time) {
                      taken.push(job.time.trim());
                    }
                  });

                  setBookedSlots(taken);
                } catch (error) {
                  console.error("Error checking date availability:", error);
                } finally {
                  setLoadingSlots(false);
                }
              };

              fetchDateAvailability();
            }, [values.selectedDate]);

            const activeServiceObj = services.find((s) => s.id === values.selectedService);
            const totalPrice = activeServiceObj ? activeServiceObj.price : 0;

            return (
              <Form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8 bg-stone-900/40 border border-stone-900 p-6 md:p-8">
                  
                  {/* SERVICES LIST */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
                      1. Select Service
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setFieldValue("selectedService", service.id);
                            setPaymentUrl(null);
                          }}
                          className={`text-left p-4 border transition flex flex-col justify-between h-24 ${
                            values.selectedService === service.id ? "border-amber-400 bg-amber-500/5 text-white" : "border-stone-800 bg-stone-950/50 hover:border-stone-700 text-stone-300"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">{service.type}</span>
                          <span className="font-medium text-sm block truncate w-full">{service.name}</span>
                          <span className="font-mono text-xs text-amber-400 mt-1">
                            ₦{service.price.toLocaleString()}{service.startingAt ? "+" : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                    <ErrorMessage name="selectedService" component="div" className="text-red-500 text-xs mt-2 font-medium" />
                  </div>

                  {/* ADDRESS FIELD */}
                  {activeServiceObj?.isHomeService && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                        Home Address for House Call
                      </label>
                      <Field
                        type="text"
                        name="address"
                        placeholder="Enter house number, street name, and estate details"
                        className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 text-sm focus:outline-none transition"
                      />
                      <ErrorMessage name="address" component="div" className="text-red-500 text-xs mt-2 font-medium" />
                    </div>
                  )}

                  {/* DATE & TIME SELECTION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                        2. Select Date
                      </label>
                      <Field
                        type="date"
                        name="selectedDate"
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e: any) => {
                          setFieldValue("selectedDate", e.target.value);
                          setFieldValue("selectedTime", ""); // Reset time on date change
                        }}
                        className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 text-sm focus:outline-none transition"
                      />
                      <ErrorMessage name="selectedDate" component="div" className="text-red-500 text-xs mt-2 font-medium" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                        3. Select Time Slot
                      </label>
                      {loadingSlots ? (
                        <div className="w-full bg-stone-950 border border-stone-800 px-4 py-3 text-stone-500 text-xs flex items-center gap-2">
                          <FiLoader className="animate-spin" /> Checking available slots...
                        </div>
                      ) : !values.selectedDate ? (
                        <div className="w-full bg-stone-950 border border-stone-800 px-4 py-3 text-stone-600 text-xs">
                          Select a date first
                        </div>
                      ) : !isDayOpen ? (
                        <div className="w-full bg-red-950/20 border border-red-900/50 px-4 py-3 text-red-400 text-xs font-mono uppercase">
                          Studio is closed on this day
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="w-full bg-stone-950 border border-stone-800 px-4 py-3 text-stone-500 text-xs">
                          No time slots configured for this day
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {availableSlots.map((slot) => {
                            const isBooked = bookedSlots.includes(slot.trim());
                            const isSelected = values.selectedTime === slot;

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setFieldValue("selectedTime", slot)}
                                className={`p-2.5 text-xs font-mono border text-center transition flex flex-col items-center justify-center ${
                                  isBooked 
                                    ? "bg-stone-950/30 border-stone-900 text-stone-600 line-through cursor-not-allowed" 
                                    : isSelected 
                                    ? "bg-amber-500 text-stone-950 border-amber-400 font-bold" 
                                    : "bg-stone-950 border-stone-800 hover:border-amber-500/50 text-stone-300"
                                }`}
                              >
                                <span>{slot}</span>
                                <span className={`text-[9px] uppercase tracking-widest mt-0.5 ${isBooked ? "text-red-500" : isSelected ? "text-stone-950" : "text-stone-500"}`}>
                                  {isBooked ? "Already Booked" : "Available"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <ErrorMessage name="selectedTime" component="div" className="text-red-500 text-xs mt-2 font-medium" />
                    </div>
                  </div>

                </div>

                {/* SUMMARY PANEL */}
                <div className="bg-stone-900 border border-stone-800 p-6 flex flex-col justify-between h-fit lg:sticky lg:top-8">
                  <div>
                    <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-stone-200 border-b border-stone-800 pb-3 mb-4">
                      Summary
                    </h3>
                    
                    <div className="space-y-4 text-xs font-light">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-stone-500">Service:</span>
                        <span className="text-stone-200 font-normal text-right max-w-[150px] truncate">
                          {activeServiceObj?.name || "None Selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Location Type:</span>
                        <span className="text-amber-400 font-medium uppercase tracking-wider text-[11px]">
                          {activeServiceObj?.isHomeService ? "🚗 House Call" : "🏛️ In-Studio"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Schedule:</span>
                        <span className="text-stone-200 font-mono text-[11px]">
                          {values.selectedDate ? `${values.selectedDate} @ ${values.selectedTime || "..."}` : "Not scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-stone-800 mt-6 pt-4 flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Price</span>
                      <span className="font-mono text-xl text-amber-400 font-semibold">
                        ₦{totalPrice.toLocaleString()}{activeServiceObj?.startingAt ? "+" : ""}
                      </span>
                    </div>
                  </div>

                  {/* LINK TAG ACTION */}
                  {paymentUrl ? (
                    <Link
                      href={paymentUrl}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3.5 px-4 transition duration-300 uppercase tracking-widest text-xs mt-8"
                    >
                      Proceed to Payment Page <FiArrowRight className="text-base" />
                    </Link>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 disabled:cursor-not-allowed text-stone-950 font-bold py-3.5 px-4 transition duration-300 uppercase tracking-widest text-xs mt-8"
                    >
                      {isSubmitting ? (
                        <FiLoader className="animate-spin text-lg" />
                      ) : (
                        <>
                          <FiCreditCard className="text-base" />
                          Confirm & Generate Payment Link
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </main>
  );
}