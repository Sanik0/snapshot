"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ImageCanvas } from "@/components/image-canvas"
import { Sidebar } from "@/components/sidebar"
import { FILM_PRESETS, buildFilter, type Preset } from "@/lib/presets"

type Adjustments = Preset["adjustments"] & {
  vignette: number
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<Preset>(FILM_PRESETS[0])
  const [adjustments, setAdjustments] = useState<Adjustments>({
    ...FILM_PRESETS[0].adjustments,
    vignette: 0,
  })
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const exportFnRef = useRef<(() => void) | null>(null)

  const liveFilter = useMemo(() => buildFilter(adjustments), [adjustments])

  const handlePresetChange = (preset: Preset) => {
    setActivePreset(preset)
    setAdjustments({
      ...preset.adjustments,
      vignette: 0,
    })
  }

  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("tooltipSeen")
    if (!seen && window.innerWidth < 768) {
      setTimeout(() => setShowTooltip(true), 1500)
    }
  }, [])

  const handleAdjustmentChange = (key: keyof Adjustments, val: number | string | boolean) => {
    setAdjustments(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full overflow-hidden">
        <nav className="bg-neutral-primary px-0 md:px-4 flex w-full border-b border-white/30">
          <div className="w-full flex flex-wrap gap-5 items-center justify-between mx-auto p-4">
            <a href="https://flowbite.com/" className="flex items-center gap-2 rtl:space-x-reverse">
              <img src="/polaroma-logo.svg" alt="Polaroma" className="h-9" />
              <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">Polaroma</span>
            </a>
            <div className="flex gap-3 items-center">
              {/* Tune button with tooltip */}
              <div className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(o => !o)
                    setShowTooltip(false)
                    localStorage.setItem("tooltipSeen", "true")
                  }}
                  className="text-white/60 hover:text-white/90 transition-colors w-9 h-9 flex items-center justify-center rounded border border-white/10"
                >
                  <span className="material-icons" style={{ fontSize: "1.1rem" }}>tune</span>
                </button>

                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute right-0 top-12 z-50 w-56">
                    {/* Arrow pointing up */}
                    <div className="absolute -top-2 right-3 w-0 h-0"
                      style={{
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderBottom: "8px solid rgba(255,255,255,0.95)",
                      }}
                    />
                    <div className="bg-white/95 text-black rounded-xl p-3 shadow-2xl">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-600 text-black mb-0.5">Edit your photo</p>
                          <p className="text-[11px] text-black/60 leading-relaxed">
                            Tap here to adjust filters, add frames, light leaks and more.
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowTooltip(false)
                            localStorage.setItem("tooltipSeen", "true")
                          }}
                          className="text-black/30 hover:text-black/60 shrink-0 mt-0.5"
                        >
                          <span className="material-icons" style={{ fontSize: "0.9rem" }}>close</span>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setSidebarOpen(true)
                          setShowTooltip(false)
                          localStorage.setItem("tooltipSeen", "true")
                        }}
                        className="mt-2 w-full text-[11px] font-500 bg-blue-500 text-white rounded-lg py-1.5 px-3"
                      >
                        Open adjustments
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="text-white/90 bg-black hover:bg-white/20 box-border border-white/30 border-[0.5px] focus:ring-4 focus:ring-blue-300 shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">Share</button>
              <button onClick={() => exportFnRef.current?.()} type="button" className="text-black bg-blue-600 hover:bg-blue-700 box-border border border-transparent focus:ring-4 focus:ring-blue-300 shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">Save / Export</button>
            </div>
          </div>
        </nav>

        <div className="w-full h-[90vh] flex items-center justify-center gap-0 relative">
          <div className="w-full h-full overflow-hidden">
            <ImageCanvas
              activePreset={activePreset}
              liveFilter={liveFilter}
              adjustments={adjustments}
              onPresetChange={handlePresetChange}
              selectedFrame={selectedFrame}
              onFrameChange={setSelectedFrame}
              onExport={(fn) => { exportFnRef.current = fn }}
            />
          </div>

          <>
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <div className={`
              h-full flex flex-col bg-black w-72 shrink-0 bg-neutral-primary border-l border-white/10 overflow-y-auto scrollbar-none
              md:relative md:translate-x-0 md:z-auto
              fixed right-0 top-0 z-999 transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            `}>
              <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-medium text-white/80">Adjustments</span>
                <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
                  <span className="material-icons" style={{ fontSize: "1.1rem" }}>close</span>
                </button>
              </div>
              <Sidebar
                adjustments={adjustments}
                onChange={handleAdjustmentChange}
                selectedFrame={selectedFrame}
                onFrameChange={setSelectedFrame}
              />
            </div>
          </>
        </div>
      </main>
    </div >
  )
}