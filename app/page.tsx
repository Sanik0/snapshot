"use client"
import Image from "next/image";
import { SidebarSection, SidebarGroup, SliderRow } from "@/components/sidebar"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className={"h-screen w-full overflow-hidden"}>
        {/* NAVBAR */}
        <nav className="bg-neutral-primary px-0 md:px-4 flex w-full border-b border-white/30">
          <div className="w-full flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <img src="https://flowbite.com/docs/images/logo.svg" className="h-7" alt="Flowbite Logo" />
              <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">SnapShot</span>
            </a>
            <div className="flex gap-3">
              <button type="button" className="text-white/90 bg-black hover:bg-white/20 box-border border-white/30 border-[0.5px] focus:ring-4 focus:ring-blue-300 shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">
                Share
              </button>
              <button type="button" className="text-black bg-blue-600 hover:bg-blue-700 box-border border border-transparent focus:ring-4 focus:ring-blue-300 shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">
                Save / Export
              </button>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div className={"w-full h-full flex items-center justify-center gap-0"}>
          {/* CANVAS AREA */}
          <div className={"w-full h-full"}></div>

          {/* SIDEBAR */}
          <div className={"h-full flex flex-col w-64 shrink-0 bg-neutral-primary border-l border-white/10 overflow-y-auto scrollbar-none"}>

            {/* ── BASIC (expanded) ── */}
            <SidebarSection title="Basic" defaultOpen>

              {/* White Balance */}
              <SidebarGroup label="WHITE BALANCE" badge="Custom">
                <SliderRow label="Temperature" value={0} trackClass="bg-gradient-to-r from-blue-400 to-orange-400" />
                <SliderRow label="Tint" value={0} trackClass="bg-gradient-to-r from-green-400 to-pink-400" />
              </SidebarGroup>

              {/* Tone */}
              <SidebarGroup label="TONE" badge="Auto">
                <SliderRow label="Exposure" value={0} />
                <SliderRow label="Contrast" value={0} />
                <SliderRow label="Highlight" value={0} />
                <SliderRow label="Shadows" value={0} />
                <SliderRow label="Saturation" value={0} />
              </SidebarGroup>

              {/* Tone Curve */}
              <div className="px-4 pb-4">
                <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">Tone Curve</p>
                <div className="w-full aspect-square rounded bg-[#1a1a1a] border border-white/10 relative overflow-hidden">
                  {/* Grid lines */}
                  {[25, 50, 75].map(p => (
                    <div key={p}>
                      <div className="absolute inset-x-0 border-t border-white/5" style={{ top: `${p}%` }} />
                      <div className="absolute inset-y-0 border-l border-white/5" style={{ left: `${p}%` }} />
                    </div>
                  ))}
                  {/* Diagonal line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </SidebarSection>

            {/* ── DETAIL (collapsed) ── */}
            <SidebarSection title="Detail" />

            {/* ── LENS CORRECTIONS (collapsed) ── */}
            <SidebarSection title="Lens Corrections" />

          </div>
        </div>
      </main>
    </div>
  );
}
