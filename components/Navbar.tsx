"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { RiMenuLine } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { FaCut } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Avatar } from "@mui/material";
import { checkIsAdmin } from "@/app/utils/admin";

interface NavItem {
  name: string;
  url: string;
}

export default function Navbar() {
  const { data: session } = useSession();
  
  // MUI Menu State
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mobile Menu State
  const [navOpen, setNavOpen] = useState(false);

  // Check admin status using the utility function and environment variables
  const isAdmin = checkIsAdmin(session?.user?.email);
  
  // Dynamic Navigation Items
  const navItems: NavItem[] = [
    { name: "Home", url: "/" },
    { name: "Gallery", url: "/gallery" },
    { name: "About", url: "/about" },
    ...(!session ? [{ name: "Join Club", url: "/signin" }] : []),
    ...(session && !isAdmin ? [{ name: "Membership", url: "/membership" }] : []),
    ...(session && isAdmin ? [{ name: "Admin", url: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-900 bg-stone-950/90 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* LEFT: Logo Section */}
        <Link href="/" className="group flex items-center gap-1">
          <div className="flex h-9 w-9 items-center justify-center text-white group-hover:text-amber-400 transition-colors duration-200">
            <FaCut className="w-7 h-6" />
          </div>
          <div className="flex flex-col tracking-wider uppercase">
            <span className="font-serif text-base font-bold text-stone-100 leading-none tracking-widest group-hover:text-amber-400 transition duration-200">
              Jaybliz
            </span>
            <span className="text-[9px] font-medium text-stone-500 tracking-[0.18em] mt-0.5">
              Hair Studio & Spa
            </span>
          </div>
        </Link>

        {/* CENTER: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="text-xs uppercase font-medium tracking-widest text-stone-400 hover:text-amber-400 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Actions (Avatar, Button, Mobile Toggle) */}
        <div className="flex items-center gap-4">
          
          {/* User Avatar & Dropdown (Only shows if logged in) */}
          {session && (
            <div>
              <button
                id={buttonId}
                aria-controls={open ? menuId : undefined}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={handleClick}
                className="transition hover:opacity-80"
              >
                <Avatar 
                  alt={session.user?.name || "User"} 
                  src={session.user?.image || ""} 
                  sx={{ width: 32, height: 32 }}
                />
              </button>
              <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{ list: { 'aria-labelledby': buttonId } }}
              >
                {!isAdmin && (
                  <MenuItem onClick={handleClose}>
                    <Link href="/profile" className="w-full">Profile</Link>
                  </MenuItem>
                )}
                <MenuItem onClick={() => { handleClose(); signOut(); }}>
                  <span className="w-full text-red-500">Sign Out</span>
                </MenuItem>
              </Menu>
            </div>
          )}

          {/* Elite Call-to-Action (Hidden for Admin) */}
          {!isAdmin && (
            <Link
              href="/book"
              className="max-md:hidden bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-5 py-2.5 rounded-none transition duration-300 uppercase tracking-widest text-[11px] font-sans"
            >
              Reserve Slot
            </Link>
          )}

          {/* Mobile Menu Toggle Trigger */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="lg:hidden text-xl p-2 text-stone-400 hover:text-stone-100 transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {navOpen ? <AiOutlineClose /> : <RiMenuLine />}
          </button>
        </div>
      </div>

      {/* ABSOLUTE BOTTOM: Mobile Full-Width Menu Drawer Overlay */}
      <div
        className={`absolute top-full left-0 w-full bg-stone-950/98 border-t border-stone-900 transition-all duration-300 ease-in-out lg:hidden ${
          navOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <nav className="flex flex-col p-6 gap-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              onClick={() => setNavOpen(false)}
              className="text-xs uppercase font-medium tracking-widest text-stone-300 hover:text-amber-400 py-3 transition-colors border-b border-stone-900/40"
              href={item.url}
            >
              {item.name}
            </Link>
          ))}
          {!isAdmin && (
            <Link
              href="/book"
              onClick={() => setNavOpen(false)}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-stone-950 text-center font-bold px-5 py-3 rounded-none transition duration-300 uppercase tracking-widest text-xs font-sans"
            >
              Reserve Slot
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}