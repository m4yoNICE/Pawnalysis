"use client";

import { useState } from "react";

const SPECIMEN_MOVES = [
  "1. e4 e5",
  "2. Nf3 Nc6",
  "3. Bb5 a6",
  "4. Ba4 Nf6",
  "5. O-O Be7",
  "6. Re1 b5",
  "7. Bb3 d6",
  "8. c3 O-O",
];

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
  }

  return (
    <main className="min-h-screen bg-white flex">
      {/* Decorative side panel — a scoresheet column, not a gradient blob */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#2A2440]">
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <span className="font-mono text-lg font-semibold tracking-tight">
            Pawn<span className="text-[#B3ABC9]">alysis</span>
          </span>

          <div className="max-w-md">
            <h2 className="font-mono text-3xl font-semibold leading-snug tracking-tight">
              Every saved game is
              <br />
              one you can replay.
            </h2>
            <p className="mt-4 text-[#C6BEDD] text-base leading-relaxed">
              Sign in to keep your analyzed games, revisit the commentary, and
              come back to where you left off.
            </p>

            <div className="mt-8 font-mono text-sm leading-loose text-[#8F84AD]">
              {SPECIMEN_MOVES.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="flex gap-8 text-sm text-[#8F84AD]">
            <div>
              <p className="font-mono text-xl font-semibold text-white">Stockfish</p>
              <p>Engine analysis</p>
            </div>
            <div>
              <p className="font-mono text-xl font-semibold text-white">AI</p>
              <p>Move commentary</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 text-center">
            <span className="font-mono text-lg font-semibold tracking-tight text-[#1A1A1A]">
              Pawn<span className="text-[#7B6FA0]">alysis</span>
            </span>
          </div>

          {/* Segmented toggle */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-[#F3EFFE] mb-8">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "login"
                  ? "bg-white text-[#6A5E8C] shadow-sm"
                  : "text-[#A99FC4] hover:text-[#6A5E8C]"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "register"
                  ? "bg-white text-[#6A5E8C] shadow-sm"
                  : "text-[#A99FC4] hover:text-[#6A5E8C]"
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="font-mono text-2xl font-semibold text-[#1A1A1A] mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[#6B6B6B] mb-8">
            {mode === "login"
              ? "Log in to pick up where you left off."
              : "It only takes a minute to get started."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 border border-[#E7E0F3] rounded-lg text-sm text-[#1A1A1A] bg-white placeholder:text-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#7B6FA0] focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#6B6B6B]">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="text-xs text-[#6A5E8C] hover:text-[#584D77] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={4}
                  className="w-full px-3.5 py-2.5 border border-[#E7E0F3] rounded-lg text-sm text-[#1A1A1A] bg-white placeholder:text-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#7B6FA0] focus:border-transparent transition-shadow pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6A5E8C] hover:text-[#584D77]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-[#6A5E8C] hover:bg-[#584D77] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#6A5E8C]/20 transition-colors"
            >
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E7E0F3]" />
            <span className="text-xs text-[#B3B3B3]">or</span>
            <div className="flex-1 h-px bg-[#E7E0F3]" />
          </div>

          <p className="text-center text-sm text-[#6B6B6B]">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-[#6A5E8C] font-medium hover:underline"
            >
              {mode === "login" ? "Register" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}