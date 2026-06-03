"use client"

import { useState, useMemo, useRef } from "react"
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

  const handleAdjustmentChange = (key: keyof Adjustments, val: number | string | boolean) => {
    setAdjustments(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full overflow-hidden">
        <nav className="bg-neutral-primary px-0 md:px-4 flex w-full border-b border-white/30">
          <div className="w-full flex flex-wrap gap-5 items-center justify-between mx-auto p-4">
            <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <img src="https://flowbite.com/docs/images/logo.svg" className="h-7" alt="Flowbite Logo" />
              <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">SnapShot</span>
            </a>
            <div className="flex gap-3 items-center">
              <button type="button" onClick={() => setSidebarOpen(o => !o)} className="md:hidden text-white/60 hover:text-white/90 transition-colors w-9 h-9 flex items-center justify-center rounded border border-white/10">
                <span className="material-icons" style={{ fontSize: "1.1rem" }}>tune</span>
              </button>
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
    </div>
  )
}