import Link from "next/link";

export default function Footer() {
  const links = [
    { name: "Home", href: "/" },
    // { name: "Services", href: "/services" },
    { name: "Book Appointment", href: "/book" },
    { name: "Gallery", href: "/gallery" },
  ];

  const socials = [
    { name: "Instagram", href: "https://instagram.com" },
    { name: "Facebook", href: "https://facebook.com" },
    { name: "TikTok", href: "https://tiktok.com" },
  ];

  return (
    <footer className="relative z-10 bg-stone-950 border-t border-stone-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-stone-400 text-sm">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-bold text-stone-200 uppercase tracking-wider">
              Jaybliz Cut
            </h4>
            <p className="font-light leading-relaxed max-w-xs mx-auto md:mx-0 text-stone-400">
              Where precision barbering meets luxury spa therapy. Elite style crafting for the modern individual.
            </p>
          </div>

          {/* Quick Links Column (.map) */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 font-light">
              {links.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-amber-400 transition duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours Column */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
              Hours
            </h4>
            <ul className="space-y-2 font-light text-stone-300">
              <li className="flex justify-between md:justify-start gap-4">
                <span className="w-20 text-stone-500">Mon – Fri:</span>
                <span>9:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between md:justify-start gap-4">
                <span className="w-20 text-stone-500">Sat:</span>
                <span>8:00 AM – 6:00 PM</span>
              </li>
              <li className="flex justify-between md:justify-start gap-4">
                <span className="w-20 text-stone-500">Sun:</span>
                <span className="text-amber-500/80 font-medium">Closed</span>
              </li>
            </ul>
          </div>

          {/* Location & Social Column */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
                Location
              </h4>
              <p className="font-light leading-relaxed text-stone-300">
                P.M.B 1008, Anyigba, Km 8 <br />
                Ankpa Road
              </p>
            </div>
            
            {/* Socials array rendering */}
            <div className="mt-6">
              <div className="flex justify-center md:justify-start gap-4">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-500 hover:text-amber-400 text-xs tracking-wider uppercase transition duration-200"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-stone-900/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Jaybliz Cut Studio & Spa. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-stone-400 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-stone-400 transition">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}