"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getEmail, clearSession } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmail(getEmail());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearSession();
    setEmail(null);
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E0F3] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo — set in the display mono, like a scoresheet header */}
        <Link href="/" className="group flex items-baseline gap-0.5">
          <span className="font-mono text-lg font-semibold tracking-tight text-[#1A1A1A]">
            Pawn
          </span>
          <span className="font-mono text-lg font-semibold tracking-tight text-[#7B6FA0]">
            alysis
          </span>
          <span className="ml-1 font-mono text-sm font-semibold text-[#7B6FA0] opacity-0 transition-opacity group-hover:opacity-100">
            !?
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#6A5E8C]"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#6A5E8C]"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#6A5E8C]"
          >
            Pricing
          </a>
          <Link
            href="/game"
            className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#6A5E8C]"
          >
            Analyze
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {email ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6A5E8C] text-sm font-semibold text-white transition-colors hover:bg-[#584D77]"
                aria-label="Account menu"
              >
                {email.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-lg border border-[#E7E0F3] bg-white py-1 shadow-lg">
                  <div className="truncate border-b border-[#E7E0F3] px-4 py-2 text-sm text-[#6B6B6B]">
                    {email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-[#6A5E8C] transition-colors hover:bg-[#F3EFFE]"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[#6A5E8C] transition-colors hover:text-[#584D77] sm:block"
              >
                Log in
              </Link>
              <Link
                href="/game"
                className="rounded-lg bg-[#6A5E8C] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#6A5E8C]/20 transition-colors hover:bg-[#584D77]"
              >
                Analyze a game
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}