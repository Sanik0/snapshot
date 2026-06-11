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
        <nav className="bg-neutral-primary px-0 md:px-4 flex w-full border-b border-white/10">
          <div className="w-full flex flex-wrap gap-5 items-center justify-between mx-auto p-4">
            <a href="/landing" className="flex items-center gap-2 rtl:space-x-reverse">
              <svg className={"h-6 w-6 fill-white"} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 500 500">
                <g>
                  <g>
                    <path d="M441.348,382.642c-11.9,0-22.956,3.584-32.212,9.688l-88.324-88.744c-0.748-0.748-1.584-1.332-2.456-1.836
                      c10.924-14.4,17.424-32.332,17.424-51.752c0-27.66-13.172-52.284-33.556-67.984l36.38-63.916c5.98,1.98,12.352,3.092,18.984,3.092
                      c33.4,0,60.572-27.168,60.572-60.568c0-33.396-27.172-60.568-60.572-60.568c-33.4,0-60.568,27.176-60.568,60.572
                      c0,18.364,8.248,34.808,21.192,45.924l-36.34,63.836c-9.864-3.96-20.612-6.168-31.872-6.168c-19.388,0-37.284,6.476-51.668,17.364
                      c-0.18-0.208-0.316-0.436-0.512-0.628l-49.764-50.008c2.692-5.304,4.244-11.28,4.244-17.624c0-21.56-17.536-39.1-39.096-39.1
                      c-21.56,0-39.096,17.544-39.096,39.1c0,21.556,17.536,39.096,39.096,39.096c6.692,0,12.996-1.696,18.504-4.668l49.5,49.74
                      c0.196,0.196,0.424,0.336,0.632,0.516c-11.04,14.436-17.62,32.46-17.62,51.996c0,17.18,5.096,33.18,13.828,46.608L96.24,367.53
                      c-10.032-7.384-22.372-11.808-35.756-11.808C27.132,355.722,0,382.854,0,416.206c0,33.352,27.132,60.484,60.484,60.484
                      s60.484-27.132,60.484-60.484c0-11.5-3.284-22.228-8.88-31.396l81.276-70.464c15.124,13.324,34.944,21.432,56.636,21.432
                      c19.744,0,37.94-6.724,52.452-17.976c0.484,0.82,1.044,1.608,1.752,2.316l88.316,88.74c-6.196,9.296-9.828,20.444-9.828,32.432
                      c0,32.34,26.316,58.656,58.656,58.656c32.344,0,58.652-26.312,58.652-58.656C500,408.954,473.692,382.642,441.348,382.642z"/>
                  </g>
                </g>
              </svg>
              <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">Polaroma</span>
            </a>
            <div className="flex gap-3 items-center">
              {/* Tune button with tooltip */}
              <button onClick={() => exportFnRef.current?.()} type="button" className="text-black block md:hidden w-fit bg-blue-600 hover:bg-blue-700 box-border border border-transparent shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">Save</button>
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
              <button type="button" className="text-white/90 bg-black hover:bg-white/10 hidden md:block box-border border-white/30 border-[0.5px] shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">Share</button>
              <button onClick={() => exportFnRef.current?.()} type="button" className="text-black hidden md:block bg-blue-600 hover:bg-blue-700 box-border border border-transparent shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none">Save / Export</button>
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