"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ImageCanvas } from "@/components/image-canvas"
import { Sidebar } from "@/components/sidebar"
import { FILM_PRESETS, buildFilter, type Preset } from "@/lib/presets"

type Adjustments = Preset["adjustments"] & {
    vignette: number
}

export default function Home() {

    const benefits = [
        {
            text: "I help you feel relaxed and natural in front of the camera",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="14" rx="3" />
                    <circle cx="12" cy="13" r="3" />
                    <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
                </svg>
            ),
        },
        {
            text: "I help you define your look and personal style",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
                </svg>
            ),
        },
        {
            text: "I select the style and location that fits you perfectly",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                </svg>
            ),
        },
        {
            text: "Always in touch before and after the shoot",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10h.01M12 10h.01M15 10h.01" />
                </svg>
            ),
        },
    ]

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
            <div className={"flex flex-col w-full items-center justify-center"}>
                <div className="px-4 md:px-8 pt-20 w-full max-w-7xl pb-6">
                    {/* Text row — stacked on mobile, side-by-side on md+ */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
                        <h1
                            className="font-semibold leading-[1.05] text-[#1a1a1a]"
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

                    <div className="grid gap-0 grid-cols-2 md:grid-cols-[2.2fr_1fr_1.4fr] grid-rows-[200px_160px_160px] md:grid-rows-[220px_120px_120px] w-full overflow-hidden rounded-[20px]">

                        {/* Cell 1 — tall left, spans 3 rows */}
                        <div className="relative overflow-hidden row-span-3 rounded-tl-[40px] rounded-tr-[4px] rounded-br-[40px] rounded-bl-[4px]">
                            <img src="https://picsum.photos/seed/photo1/600/900" alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Cell 2 — top middle */}
                        <div className="relative col-span-2 overflow-hidden rounded-tl-[40px] rounded-tr-[48px] rounded-br-[4px] rounded-bl-[4px]">
                            <img src="https://picsum.photos/seed/photo2/400/400" alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Cell 4 — middle row */}
                        <div className="relative row-span-2 overflow-hidden rounded-tl-[40px] rounded-tr-[4px] rounded-br-[40px] rounded-bl-[4px]">
                            <img src="https://picsum.photos/seed/photo4/400/300" alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Cell 6 — bottom middle */}
                        <div className="relative overflow-hidden rounded-tl-[4px] rounded-tr-[4px] rounded-br-[4px] rounded-bl-[40px]">
                            <img src="https://picsum.photos/seed/photo6/400/300" alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Cell 7 — bottom right (desktop only) */}
                        <div className="relative overflow-hidden hidden md:block rounded-tl-[4px] rounded-tr-[40px] rounded-br-[44px] rounded-bl-[4px]">
                            <img src="https://picsum.photos/seed/photo7/500/300" alt="" className="w-full h-full object-cover" />
                        </div>

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

            {/* SECTION */}
            <section
                className="w-full px-4 md:px-8 py-12"
                style={{ background: "#EDE8DE", fontFamily: "'Inter', sans-serif" }}
            >
                <div className="flex flex-col md:flex-row gap-0 items-stretch max-w-7xl mx-auto">

                    {/* Left card — label */}
                    <div
                        className="relative flex bg-[#e0dbd1]  flex-col justify-end p-8 md:p-10 flex-shrink-0 md:w-[50%]"
                        style={{
                            background: "#e0dbd1",
                            borderRadius: "40px",
                            minHeight: "260px",
                        }}
                    >
                        <div className="flex items-end justify-between gap-4">
                            <h2
                                className="font-semibold text-[#1a1a1a] leading-tight"
                                style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", letterSpacing: "-0.02em" }}
                            >
                                Benefits of<br />working with me
                            </h2>
                            <span className="text-[#1a1a1a] text-2xl flex-shrink-0 mb-1">→</span>
                        </div>
                    </div>

                    {/* Right — 2x2 grid of benefit cards */}
                    <div className="grid grid-cols-2 gap-0 flex-1" style={{ gridTemplateRows: "1fr 1fr" }}>
                        {benefits.map((b, i) => (
                            <div
                                key={i}
                                className="relative flex gap-15 flex-col justify-between p-6 md:p-7"
                                style={{
                                    background: "#D95F2B",
                                    borderRadius: "40px",
                                    minHeight: "140px",
                                }}
                            >
                                {/* 4-pointed star in the middle — only between cards, shown on the center gap */}
                                {i === 1 && (
                                    <div
                                        className="hidden md:flex absolute items-center justify-center"
                                        style={{
                                            right: "-18px",
                                            bottom: "-18px",
                                            width: "36px",
                                            height: "36px",
                                            zIndex: 10,
                                            color: "#EDE8DE",
                                            fontSize: "28px",
                                            lineHeight: 1,
                                        }}
                                    >
                                        ✦
                                    </div>
                                )}
                                <p
                                    className="text-[#EDE8DE] font-medium text-base md:text-xl leading-snug"
                                >
                                    {b.text}
                                </p>
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center mt-4 flex-shrink-0"
                                    style={{ border: "1.5px solid rgba(237,232,222,0.45)", color: "#EDE8DE" }}
                                >
                                    {b.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* SECTION */}
            <section
                className="w-full max-w-7xl mx-auto px-4 md:px-8 py-30"
                style={{ background: "#EDE8DE", fontFamily: "'Inter', sans-serif" }}
            >
                <div
                    className="grid w-full"
                    style={{
                        gridTemplateColumns: "1.1fr 1.3fr 1.2fr",
                        gridTemplateRows: "200px 320px",
                    }}
                >

                    {/* Cell 1 — top left: dark title card */}
                    <div
                        className="relative flex flex-col justify-between p-6"
                        style={{ background: "#1e1a10", borderRadius: "40px" }}
                    >
                        <h2
                            className="font-black text-white leading-tight"
                            style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)", letterSpacing: "-0.02em" }}
                        >
                            My<br />works
                        </h2>
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center self-end"
                            style={{ border: "1.5px solid rgba(255,255,255,0.3)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="14" rx="3" />
                                <circle cx="12" cy="13" r="3" />
                                <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
                            </svg>
                        </div>
                    </div>

                    {/* Cell 2 — top middle: couple on porch */}
                    <div className="relative overflow-hidden" style={{ borderRadius: "40px" }}>
                        <img src="https://picsum.photos/seed/couple1/500/400" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 3 — top right: blonde portrait */}
                    <div className="relative overflow-hidden" style={{ borderRadius: "40px" }}>
                        <img src="https://picsum.photos/seed/portrait1/480/400" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 4 — bottom left: family on couch */}
                    <div className="relative overflow-hidden" style={{ borderRadius: "40px" }}>
                        <img src="https://picsum.photos/seed/family1/500/560" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 5 — bottom middle: flowers/bokeh */}
                    <div className="relative overflow-hidden" style={{ borderRadius: "40px" }}>
                        <img src="https://picsum.photos/seed/flowers1/500/560" alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cell 6 — bottom right: woman on chair */}
                    <div className="relative overflow-hidden" style={{ borderRadius: "40px" }}>
                        <img src="https://picsum.photos/seed/woman1/480/560" alt="" className="w-full h-full object-cover" />
                    </div>

                </div>
            </section>

        </div>
    )
}