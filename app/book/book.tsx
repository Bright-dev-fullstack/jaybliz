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

  // Services list with Home Service specifically assigned to Haircut
  const services = [
    { id: "s1", name: "Haircut (In-Studio)", price: 5000, type: "Hair", isHomeService: false },
    { id: "s1_home", name: "Haircut (Home Service)", price: 10000, type: "Hair", startingAt: true, isHomeService: true },
    { id: "s2", name: "Washing and Haircut", price: 7000, type: "Hair", isHomeService: false },
    { id: "s3", name: "Hair Tint", price: 15000, type: "Hair", startingAt: true, isHomeService: false },
    { id: "s4", name: "Braids", price: 10000, type: "Hair", startingAt: true, isHomeService: false },
    { id: "s5", name: "Tattoos", price: 20000, type: "Body Art", startingAt: true, isHomeService: false },
    { id: "s6", name: "Regular Pedicure", price: 12000, type: "Nail Care", isHomeService: false },
    { id: "s7", name: "Deluxe Pedicure", price: 15000, type: "Nail Care", isHomeService: false },
    { id: "s8", name: "Manicure", price: 7000, type: "Nail Care", isHomeService: false },
    { id: "s9", name: "Facial Treatment", price: 15000, type: "Skincare", isHomeService: false },
    { id: "s10", name: "Dermaplaning Facial Treatment", price: 20000, type: "Skincare", isHomeService: false },
  ];

  const timeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"];

  // Yup Validation Schema
  const bookingSchema = Yup.object().shape({
    selectedService: Yup.string().required("Please select a service"),
    selectedDate: Yup.string().required("Please select a date"),
    selectedTime: Yup.string().required("Please select a time slot"),
    address: Yup.string().when("selectedService", {
      is: (val: string) => {
        const selected = services.find((s) => s.id === val);
        return selected?.isHomeService === true;
      },
      then: (schema) => schema.required("Address is required for home service haircut"),
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
              {submittedData.address && (
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
              selectedService: "",
              selectedDate: "",
              selectedTime: "",
              address: "",
            }}
            validationSchema={bookingSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const activeServiceObj = services.find((s) => s.id === values.selectedService);
                const basePrice = activeServiceObj ? activeServiceObj.price : 0;

                // 1. Submit to Firestore inside 'services' collection
                await addDoc(collection(db, "services"), {
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
                  status: "Pending",
                  createdAt: new Date().toISOString(),
                });

                // 2. Setup success state data before resetting form
                setSubmittedData({
                  serviceName: activeServiceObj?.name,
                  date: values.selectedDate,
                  time: values.selectedTime,
                  address: activeServiceObj?.isHomeService ? values.address : null,
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
                            onClick={() => setFieldValue("selectedService", service.id)}
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

                    {/* ADDRESS FIELD - Appears only for Home Service Haircut */}
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

                    {/* DATE & TIME SYSTEM */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                          2. Select Date
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
                          3. Select Time
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
                      </div>

                      <div className="border-t border-stone-800 mt-6 pt-4 flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Price</span>
                        <span className="font-mono text-xl text-amber-400 font-semibold">
                          ₦{totalPrice.toLocaleString()}{activeServiceObj?.startingAt ? "+" : ""}
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