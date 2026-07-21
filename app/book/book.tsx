"use client";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { collection, addDoc } from "firebase/firestore"; 
import { db } from '@/config/firebase';
import { useState } from 'react';
import { FiLoader } from 'react-icons/fi';

export default function BookService({ session }: { session: any }) {
  const [submittedData, setSubmittedData] = useState<any>(null);

  const services = [
    { id: "s1", name: "Signature Haircut", price: 5000, type: "Studio" },
    { id: "s2", name: "Beard Grooming & Shape", price: 5000, type: "Studio" },
    { id: "s3", name: "Royal Hot Towel Shave", price: 5000, type: "Studio" },
    { id: "sp2", name: "Scalp Therapy", price: 5000, type: "Spa" },
    { id: "h1", name: "VIP House Call", price: 7000, type: "Home Service" },
    { id: "h2", name: "Full Home Service Package", price: 10000, type: "Home Service" },
  ];

  const timeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"];

  // Yup Validation Schema
  const bookingSchema = Yup.object().shape({
    bookingLocation: Yup.string().oneOf(["studio", "home"]).required(),
    selectedService: Yup.string().required("Please select a service"),
    selectedDate: Yup.string().required("Please select a date"),
    selectedTime: Yup.string().required("Please select a time slot"),
    address: Yup.string().when("bookingLocation", {
      is: "home",
      then: (schema) => schema.required("Address is required for house calls"),
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
            Select a service below. You can visit our studio or book a house call to your home or office.
          </p>
        </div>

        {submittedData ? (
          /* SUCCESS STATE */
          <div className="bg-stone-900 border border-stone-800 p-8 text-center max-w-md mx-auto space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 flex items-center justify-center rounded-full mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-wide uppercase">Appointment Confirmed</h2>
            <p className="text-sm text-stone-400 font-light leading-relaxed">
              Your booking for <span className="text-stone-200 font-medium">{submittedData.serviceName}</span> is set for <span className="text-stone-200 font-medium">{submittedData.date}</span> at <span className="text-stone-200 font-medium">{submittedData.time}</span>.
              {submittedData.bookingLocation === "home" && (
                <span className="block mt-3 p-3 bg-stone-950 border border-stone-800 rounded-sm text-amber-400 font-normal">
                  📍 {submittedData.address}
                </span>
              )}
            </p>
            <button
              onClick={() => setSubmittedData(null)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 uppercase tracking-widest text-xs"
            >
              Book Another Appointment
            </button>
          </div>
        ) : (
          /* FORMIK FORM FLOW */
          <Formik
            initialValues={{
              bookingLocation: "studio" as "studio" | "home",
              selectedService: "",
              selectedDate: "",
              selectedTime: "",
              address: "",
            }}
            validationSchema={bookingSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                // Find service details to calculate pricing correctly
                const activeServiceObj = services.find((s) => s.id === values.selectedService);
                const basePrice = activeServiceObj ? activeServiceObj.price : 0;
                const transportFee = values.bookingLocation === "home" ? 2000 : 0;
                const totalPrice = basePrice + transportFee;

                // 1. Submit to Firestore inside 'services' collection
                await addDoc(collection(db, "services"), {
                  userEmail: session?.user?.email || "guest",
                  userName: session?.user?.name || "Guest",
                  bookingLocation: values.bookingLocation,
                  serviceId: values.selectedService,
                  serviceName: activeServiceObj?.name,
                  serviceType: activeServiceObj?.type,
                  date: values.selectedDate,
                  time: values.selectedTime,
                  address: values.bookingLocation === "home" ? values.address : null,
                  basePrice: basePrice,
                  transportFee: transportFee,
                  totalPrice: totalPrice,
                  status: "Pending", // Default status
                  createdAt: new Date().toISOString(),
                });

                // 2. Setup success state data before wiping form
                setSubmittedData({
                  serviceName: activeServiceObj?.name,
                  date: values.selectedDate,
                  time: values.selectedTime,
                  bookingLocation: values.bookingLocation,
                  address: values.address,
                });

                // 3. Reset form
                resetForm();
              } catch (error) {
                console.error("Error booking service:", error);
                alert("There was an error processing your booking. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => {
              // Derived values for the UI
              const filteredServices = services.filter((s) => 
                values.bookingLocation === "home" ? s.type === "Home Service" : s.type !== "Home Service"
              );
              const activeServiceObj = services.find((s) => s.id === values.selectedService);
              const basePrice = activeServiceObj ? activeServiceObj.price : 0;
              const transportFee = values.bookingLocation === "home" ? 2000 : 0;
              const totalPrice = basePrice + transportFee;

              return (
                <Form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8 bg-stone-900/40 border border-stone-900 p-6 md:p-8">
                    
                    {/* LOCATION TOGGLE */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
                        1. Select Location
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => { 
                            setFieldValue("bookingLocation", "studio"); 
                            setFieldValue("selectedService", ""); 
                          }}
                          className={`py-4 text-center text-xs tracking-widest uppercase font-semibold border transition ${
                            values.bookingLocation === "studio" ? "border-amber-400 bg-amber-500/5 text-white" : "border-stone-800 bg-stone-950/50 text-stone-400"
                          }`}
                        >
                          🏠 In-Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => { 
                            setFieldValue("bookingLocation", "home"); 
                            setFieldValue("selectedService", ""); 
                          }}
                          className={`py-4 text-center text-xs tracking-widest uppercase font-semibold border transition ${
                            values.bookingLocation === "home" ? "border-amber-400 bg-amber-500/5 text-white" : "border-stone-800 bg-stone-950/50 text-stone-400"
                          }`}
                        >
                          🚗 House Call
                        </button>
                      </div>
                    </div>

                    {/* SERVICES LIST */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
                        2. Select Service
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredServices.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setFieldValue("selectedService", service.id)}
                            className={`text-left p-4 border transition flex flex-col justify-between h-24 ${
                              values.selectedService === service.id ? "border-amber-400 bg-amber-500/5 text-white" : "border-stone-800 bg-stone-950/50 hover:border-stone-700 text-stone-300"
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">{service.type}</span>
                            <span className="font-medium text-sm block truncate w-full">{service.name}</span>
                            <span className="font-mono text-xs text-amber-400 mt-1">₦{service.price.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                      <ErrorMessage name="selectedService" component="div" className="text-red-500 text-xs mt-2 font-medium" />
                    </div>

                    {/* ADDRESS FIELD */}
                    {values.bookingLocation === "home" && (
                      <div className="animate-fadeIn">
                        <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                          Your Address
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

                    {/* DATE & TIME SYSTEM */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                          3. Select Date
                        </label>
                        <Field
                          type="date"
                          name="selectedDate"
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 text-sm focus:outline-none transition"
                        />
                        <ErrorMessage name="selectedDate" component="div" className="text-red-500 text-xs mt-2 font-medium" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                          4. Select Time
                        </label>
                        <Field
                          as="select"
                          name="selectedTime"
                          disabled={!values.selectedDate}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 text-sm focus:outline-none transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <option value="">Choose a slot</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </Field>
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
                        <div className="flex justify-between">
                          <span className="text-stone-500">Location:</span>
                          <span className="text-amber-400 font-medium uppercase tracking-wider text-[11px]">
                            {values.bookingLocation === "home" ? "🏠 House Call" : "🏛️ Studio"}
                          </span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-stone-500">Service:</span>
                          <span className="text-stone-200 font-normal text-right max-w-[150px] truncate">
                            {activeServiceObj?.name || "None Selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Service Price:</span>
                          <span className="text-stone-300 font-mono">₦{basePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Transport Fee:</span>
                          <span className="text-stone-300 font-mono">₦{transportFee.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-stone-800 mt-6 pt-4 flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Price</span>
                        <span className="font-mono text-xl text-amber-400 font-semibold">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 disabled:cursor-not-allowed text-stone-950 font-bold py-3.5 px-4 transition duration-300 uppercase tracking-widest text-xs mt-8"
                    >
                      {isSubmitting ? <FiLoader className="animate-spin text-lg" /> : "Confirm Booking"}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        )}
      </div>
    </main>
  );
}