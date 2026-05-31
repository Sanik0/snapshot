"use client"
import { useState } from "react"
import { ImageCanvas } from "@/components/image-canvas"
import { SidebarSection, SidebarGroup, SliderRow } from "@/components/sidebar"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full overflow-hidden">

        {/* NAVBAR */}
        <nav className="bg-neutral-primary px-0 md:px-4 flex w-full border-b border-white/30">
          <div className="w-full flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="https://flowbite.com/" className="flex mb-5 md:mb-0 items-center space-x-3 rtl:space-x-reverse">
              <img src="https://flowbite.com/docs/images/logo.svg" className="h-7" alt="Flowbite Logo" />
              <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">SnapShot</span>
            </a>
            <div className="flex gap-3 items-center">
              {/* Mobile sidebar toggle — hidden on md+ */}
              <button
                type="button"
                onClick={() => setSidebarOpen(o => !o)}
                className="md:hidden text-white/60 hover:text-white/90 transition-colors w-9 h-9 flex items-center justify-center rounded border border-white/10"
              >
                <span className="material-icons" style={{ fontSize: "1.1rem" }}>tune</span>
              </button>
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
        <div className="w-full h-[90vh] flex items-center justify-center gap-0 relative">

          {/* CANVAS AREA */}
          <div className="w-full h-full overflow-hidden">
            <ImageCanvas />
          </div>

          {/* SIDEBAR — always visible on md+, drawer on mobile */}
          <>
            {/* Backdrop — mobile only */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 z-20 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className={`
              h-full flex flex-col w-72 shrink-0 bg-black bg-neutral-primary border-l border-white/10 overflow-y-auto scrollbar-none
              md:relative md:translate-x-0 md:z-auto
              fixed right-0 top-0 z-30 transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            `}>

              {/* Mobile header with close button */}
              <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-medium text-white/80">Adjustments</span>
                <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
                  <span className="material-icons" style={{ fontSize: "1.1rem" }}>close</span>
                </button>
              </div>

              {/* ── BASIC (expanded) ── */}
              <SidebarSection title="Basic" defaultOpen>
                <SidebarGroup label="WHITE BALANCE" badge="Custom">
                  <SliderRow label="Temperature" value={0} trackClass="bg-gradient-to-r from-blue-400 to-orange-400" />
                  <SliderRow label="Tint" value={0} trackClass="bg-gradient-to-r from-green-400 to-pink-400" />
                </SidebarGroup>
                <SidebarGroup label="TONE" badge="Auto">
                  <SliderRow label="Exposure" value={0} />
                  <SliderRow label="Contrast" value={0} />
                  <SliderRow label="Highlight" value={0} />
                  <SliderRow label="Shadows" value={0} />
                  <SliderRow label="Saturation" value={0} />
                </SidebarGroup>
                <div className="px-4 pb-4">
                  <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">Tone Curve</p>
                  <div className="w-full aspect-square rounded bg-[#1a1a1a] border border-white/10 relative overflow-hidden">
                    {[25, 50, 75].map(p => (
                      <div key={p}>
                        <div className="absolute inset-x-0 border-t border-white/5" style={{ top: `${p}%` }} />
                        <div className="absolute inset-y-0 border-l border-white/5" style={{ left: `${p}%` }} />
                      </div>
                    ))}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </SidebarSection>

              {/* ── DETAIL (collapsed) ── */}
              <SidebarSection title="Detail">
                <SidebarGroup label="WHITE BALANCE" badge="Custom">
                  <SliderRow label="Temperature" value={0} trackClass="bg-gradient-to-r from-blue-400 to-orange-400" />
                  <SliderRow label="Tint" value={0} trackClass="bg-gradient-to-r from-green-400 to-pink-400" />
                </SidebarGroup>
                <SidebarGroup label="TONE" badge="Auto">
                  <SliderRow label="Exposure" value={0} />
                  <SliderRow label="Contrast" value={0} />
                  <SliderRow label="Highlight" value={0} />
                  <SliderRow label="Shadows" value={0} />
                  <SliderRow label="Saturation" value={0} />
                </SidebarGroup>
                <div className="px-4 pb-4">
                  <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">Tone Curve</p>
                  <div className="w-full aspect-square rounded bg-[#1a1a1a] border border-white/10 relative overflow-hidden">
                    {[25, 50, 75].map(p => (
                      <div key={p}>
                        <div className="absolute inset-x-0 border-t border-white/5" style={{ top: `${p}%` }} />
                        <div className="absolute inset-y-0 border-l border-white/5" style={{ left: `${p}%` }} />
                      </div>
                    ))}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </SidebarSection>

              {/* ── LENS CORRECTIONS (collapsed) ── */}
              <SidebarSection title="Lens Corrections" />

            </div>
          </>

        </div>
      </main>
    </div>
  )
}