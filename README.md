This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



signin setup 

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


        