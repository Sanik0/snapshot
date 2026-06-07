"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ImageCanvas } from "@/components/image-canvas"
import { Sidebar } from "@/components/sidebar"
import { FILM_PRESETS, buildFilter, type Preset } from "@/lib/presets"

type Adjustments = Preset["adjustments"] & {
  vignette: number
}

export default function Home() {



  return (
     <div className="min-h-screen" style={{ background: "#EDE8DE", fontFamily: "'Inter', sans-serif" }}>
 
      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4">
 
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#EDE8DE">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[#1a1a1a]">Алекс Романов</span>
        </div>
 
        {/* Links — desktop only */}
        <div className="hidden md:flex items-center gap-7">
          {["Обо мне", "Портфолио", "Этапы", "Услуги"].map((item) => (
            <a key={item} href="#" className="text-[14px] text-[#1a1a1a] hover:opacity-60 transition-opacity">
              {item}
            </a>
          ))}
        </div>
 
        {/* Social icon buttons */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EDE8DE" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l4.91 1.784 2.034 5.086a2.25 2.25 0 0 0 4.169-.351l3.283-12.45 3-5.857z" />
            </svg>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EDE8DE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10h.01M12 10h.01M15 10h.01" />
            </svg>
          </div>
        </div>
      </nav>
 
      {/* ── HERO ── */}
      <div className="px-4 md:px-8 pt-20 pb-6">
 
        {/* Text row — stacked on mobile, side-by-side on md+ */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
          <h1
            className="font-black leading-[1.05] text-[#1a1a1a]"
            style={{ fontSize: "clamp(1.9rem, 5.5vw, 3.25rem)", letterSpacing: "-0.02em" }}
          >
            Один фотограф.<br />
            Сотни важных историй.
          </h1>
 
          <div className="flex flex-col items-start gap-4 md:flex-shrink-0 md:pb-1">
            <p className="text-[13.5px] text-[#1a1a1a] leading-relaxed max-w-[220px]">
              Живые кадры с настроением.<br />
              Без лишнего — только ты и свет.
            </p>
            <button className="flex items-center gap-3 bg-[#1a1a1a] text-[#EDE8DE] rounded-full px-5 py-3 text-[13px] font-medium whitespace-nowrap hover:opacity-80 transition-opacity">
              Записаться на съёмку
              <span className="w-6 h-6 rounded-full bg-[#EDE8DE] flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M8 3l4 4-4 4" />
                </svg>
              </span>
            </button>
          </div>
        </div>
 
        {/*
          ── IMAGE STRIP ──
          mobile (<sm): 1 panel  — panel 1 only, full width
          sm (640px+):  2 panels — panels 1 + 2
          md (768px+):  3 panels — panels 1 + 2 + 3
        */}
        <style>{`
          .strip { grid-template-columns: 1fr; }
          @media (min-width: 640px) { .strip { grid-template-columns: 2fr 1.1fr; } }
          @media (min-width: 768px) { .strip { grid-template-columns: 2fr 1.1fr 1.3fr; } }
        `}</style>
 
        <div
          className="strip w-full grid gap-[3px] rounded-[20px] overflow-hidden"
          style={{ height: "clamp(200px, 42vw, 340px)" }}
        >
 
          {/* Panel 1 — portrait / album cover */}
          <div className="relative overflow-hidden rounded-l-[20px] sm:rounded-none sm:rounded-l-[20px]" style={{ background: "#9a8870" }}>
            <svg viewBox="0 0 400 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="400" height="340" fill="#9a8870" />
              <rect x="60" y="30" width="200" height="280" rx="4" fill="#d4c4a8" opacity="0.6" />
              <ellipse cx="180" cy="120" rx="55" ry="65" fill="#c4a882" />
              <rect x="80" y="150" width="180" height="160" rx="2" fill="#b8a07a" />
              <rect x="60" y="220" width="220" height="110" rx="2" fill="#a08060" opacity="0.7" />
              <text x="90" y="295" fontFamily="'Courier New', monospace" fontSize="11" fill="#d4c4a8" letterSpacing="4" opacity="0.7">ATFUL OF U</text>
              <rect width="400" height="340" fill="rgba(100,80,50,0.15)" />
            </svg>
            {/* Bottom-left notch — shown when panel 2 is visible */}
            <div className="hidden sm:block absolute bottom-0 left-0 w-[44px] h-[44px] md:w-[54px] md:h-[54px] rounded-tr-[24px] md:rounded-tr-[28px]" style={{ background: "#EDE8DE" }} />
          </div>
 
          {/* Panel 2 — vinyl (hidden on mobile) */}
          <div className="hidden sm:block relative overflow-hidden" style={{ background: "#1e1a10" }}>
            <svg viewBox="0 0 180 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="180" height="340" fill="#1e1a10" />
              <circle cx="90" cy="170" r="130" fill="#111" stroke="#333" strokeWidth="0.5" />
              <circle cx="90" cy="170" r="100" fill="#0a0a0a" />
              <circle cx="90" cy="170" r="70" fill="#111" />
              <circle cx="90" cy="170" r="18" fill="#2a2418" />
              <circle cx="90" cy="170" r="8" fill="#1e1a10" />
              <circle cx="90" cy="170" r="3" fill="#555" />
              <rect width="180" height="340" fill="rgba(20,15,5,0.25)" />
            </svg>
            {/* Top-left notch */}
            <div className="absolute top-0 left-0 w-[44px] h-[44px] md:w-[54px] md:h-[54px] rounded-br-[24px] md:rounded-br-[28px]" style={{ background: "#EDE8DE" }} />
            {/* Bottom-right notch — shown when panel 3 is visible */}
            <div className="hidden md:block absolute bottom-0 right-0 w-[54px] h-[54px] rounded-tl-[28px]" style={{ background: "#EDE8DE" }} />
            {/* On sm only: rounded right edge */}
            <div className="block md:hidden absolute top-0 right-0 h-full w-0 rounded-r-[20px]" />
          </div>
 
          {/* Panel 3 — wood tones (desktop only) */}
          <div className="hidden md:block relative overflow-hidden rounded-r-[20px]" style={{ background: "#7a6a54" }}>
            <svg viewBox="0 0 260 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="260" height="340" fill="#7a6a54" />
              <rect x="20" y="20" width="220" height="300" rx="6" fill="#a8906e" opacity="0.5" />
              <rect x="30" y="30" width="80" height="280" rx="4" fill="#8a7254" opacity="0.8" />
              <rect x="120" y="30" width="110" height="280" rx="4" fill="#6a5840" opacity="0.6" />
              <line x1="115" y1="20" x2="115" y2="320" stroke="#5a4830" strokeWidth="2" />
              <rect width="260" height="340" fill="rgba(80,55,25,0.2)" />
            </svg>
            {/* Top-right notch */}
            <div className="absolute top-0 right-0 w-[54px] h-[54px] rounded-bl-[28px]" style={{ background: "#EDE8DE" }} />
          </div>
 
        </div>
      </div>

      {/* SECTION */}
       <section
      className="w-full px-4 py-20 md:py-28 flex flex-col items-center justify-center text-center"
      style={{ background: "#EDE8DE", fontFamily: "'Inter', sans-serif" }}
    >
      <p
        className="font-medium text-[#1a1a1a] leading-[1.15] max-w-4xl"
        style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)", letterSpacing: "-0.02em" }}
      >
        Hey! My name is Alex Romanov,{" "}
        {/* Pill badge — "and I'm a photographer." */}
        <span
          className="inline-flex items-center gap-1.5 border-3 border-[#d4845a] rounded-full px-3 py-0.5 whitespace-nowrap"
          style={{ verticalAlign: "middle" }}
        >
          <span>photographer.</span>
        </span>{" "}
        Working with me gives you the chance to freeze the present and capture{" "}
        genuine emotions
      </p>
 
      {/* CTA button */}
      <button
        className="mt-10 flex items-center gap-3 bg-[#1a1a1a] text-[#EDE8DE] rounded-full px-6 py-3 text-md font-medium hover:opacity-80 transition-opacity"
      >
        Start exoploring now
        <span className="w-6 h-6 rounded-full bg-[#EDE8DE] flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h10M8 3l4 4-4 4" />
          </svg>
        </span>
      </button>
    </section>

      
    </div>
  )
}