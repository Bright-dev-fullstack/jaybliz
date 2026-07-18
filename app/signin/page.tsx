import { auth, signIn } from "@/auth"
import Link from "next/link";
import { redirect } from "next/navigation";


export default async function SignUp() {
    const session = await auth()
  console.log(session);
  if(session){
    redirect("/book")
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-stone-950 text-stone-100 px-4 py-12">
      
      {/* Background Decorative Subtle Light Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Sign Up Card */}
      <div className="relative z-10 w-full max-w-md bg-stone-900/60 backdrop-blur-md border border-stone-800/80 p-8 md:p-10 shadow-2xl">
        
        {/* Branding Headers */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-stone-100 uppercase hover:text-amber-400 transition">
            Jaybliz Cut
          </Link>
          <h2 className="text-lg text-stone-400 font-light mt-2">
            Create your profile to book appointments
          </h2>
        </div>

        {/* --- GOOGLE SIGN UP BUTTON --- */}
            <form
            action={async () => {
              "use server"
              await signIn("google")
            }}
          >
              <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-100 text-stone-900 font-medium py-3 px-4 transition duration-300 tracking-wide text-sm mb-6"
        >
          {/* SVG Google Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>
          </form>
      

        {/* Divider line OR */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-stone-800"></div>
          <span className="px-3 text-xs uppercase tracking-widest text-stone-500 font-light">Or via Email</span>
          <div className="flex-grow border-t border-stone-800"></div>
        </div>

        {/* --- TRADITIONAL SIGN UP FORM --- */}
        <form  className="space-y-5">
          
          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="John Doe"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 placeholder-stone-600 text-sm rounded-none focus:outline-none transition duration-200"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 placeholder-stone-600 text-sm rounded-none focus:outline-none transition duration-200"
            />
          </div>

          {/* Password Input */}
          {/* <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 px-4 py-3 text-stone-200 placeholder-stone-600 text-sm rounded-none focus:outline-none transition duration-200"
            />
          </div> */}

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 accent-amber-500 h-4 w-4 bg-stone-950 border-stone-800 rounded-none focus:ring-0"
            />
            <label htmlFor="terms" className="text-xs text-stone-400 leading-normal font-light">
              I agree to the <Link href="/terms" className="text-amber-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-amber-400 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          {/* Form Submit Button */}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3.5 px-4 transition duration-300 uppercase tracking-widest text-xs mt-4"
          >
            Acces Account
          </button>
        </form>

        {/* Existing User Redirect Link */}
        <p className="text-center text-xs text-stone-500 font-light mt-8">
          Already have an account?{" "}
          <Link href="/signin" className="text-amber-400 hover:underline font-normal">
            Log In
          </Link>
        </p>

      </div>
    </main>
  );
}