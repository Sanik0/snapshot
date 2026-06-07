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

                <div className="photo-grid w-full">

                    {/* Cell 1 — tall left, spans 3 rows */}
                    <div className="relative overflow-hidden row-span-3 rounded-tl-[40px] rounded-tr-[4px] rounded-br-[32px] rounded-bl-[4px]">
                        <img src="https://picsum.photos/seed/photo1/600/900" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 2 — top middle */}
                    <div className="relative overflow-hidden rounded-tl-[4px] rounded-tr-[48px] rounded-br-[4px] rounded-bl-[4px]">
                        <img src="https://picsum.photos/seed/photo2/400/400" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 3 — top right (desktop only) */}
                    <div className="relative overflow-hidden hidden md:block rounded-tl-[4px] rounded-tr-[4px] rounded-br-[4px] rounded-bl-[36px]">
                        <img src="https://picsum.photos/seed/photo3/500/400" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 4 — middle row */}
                    <div className="relative overflow-hidden rounded-tl-[4px] rounded-tr-[4px] rounded-br-[40px] rounded-bl-[4px]">
                        <img src="https://picsum.photos/seed/photo4/400/300" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 5 — middle right (desktop only) */}
                    <div className="relative overflow-hidden hidden md:block rounded-tl-[28px] rounded-tr-[4px] rounded-br-[4px] rounded-bl-[4px]">
                        <img src="https://picsum.photos/seed/photo5/500/300" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 6 — bottom middle */}
                    <div className="relative overflow-hidden rounded-tl-[4px] rounded-tr-[4px] rounded-br-[4px] rounded-bl-[4px]">
                        <img src="https://picsum.photos/seed/photo6/400/300" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 7 — bottom right (desktop only) */}
                    <div className="relative overflow-hidden hidden md:block rounded-tl-[4px] rounded-tr-[4px] rounded-br-[44px] rounded-bl-[4px]">
                        <img src="https://picsum.photos/seed/photo7/500/300" alt="" className="w-full h-full object-cover" />
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