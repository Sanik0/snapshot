"use client"

import { useState, useEffect } from "react"
import type { Preset } from "@/lib/presets"

export function SliderRow({
  label, value, trackClass = "bg-white/20", onChange,
}: {
  label: string
  value: number
  trackClass?: string
  onChange?: (val: number) => void
}) {
  const [val, setVal] = useState(value)
  useEffect(() => { setVal(value) }, [value])

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs text-white/50 tabular-nums">{val.toFixed(0)}</span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className={`absolute inset-x-0 h-[2px] rounded-full ${trackClass}`} />
        <input
          type="range" min={-100} max={100} value={val}
          onChange={(e) => {
            const n = Number(e.target.value)
            setVal(n)
            onChange?.(n)
          }}
          className="relative w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-0
            [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0"
        />
      </div>
    </div>
  )
}

export function SidebarGroup({ label, badge, children }: { label: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">{label}</span>
        {badge && (
          <span className="text-[10px] text-white/40 flex items-center gap-0.5">
            {badge}
            <span className="material-icons" style={{ fontSize: "0.75rem" }}>expand_more</span>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export function SidebarSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors">
        <span className="material-icons text-white/60 transition-transform duration-200" style={{ fontSize: "1rem", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
          keyboard_arrow_down
        </span>
        <p className="text-sm font-medium text-white/90">{title}</p>
      </button>
      {open && children && <div className="pb-2">{children}</div>}
    </div>
  )
}

type Adjustments = Preset["adjustments"] & { vignette: number }

export function Sidebar({
  adjustments,
  onChange,
}: {
  adjustments: Adjustments
  onChange: (key: keyof Adjustments, val: number) => void
}) {
  return (
    <>
      <SidebarSection title="Basic" defaultOpen>
        <SidebarGroup label="WHITE BALANCE" badge="Custom">
          <SliderRow label="Temperature" value={adjustments.temperature} trackClass="bg-gradient-to-r from-blue-400 to-orange-400" onChange={v => onChange("temperature", v)} />
          <SliderRow label="Tint" value={adjustments.tint} trackClass="bg-gradient-to-r from-green-400 to-pink-400" onChange={v => onChange("tint", v)} />
        </SidebarGroup>
        <SidebarGroup label="TONE" badge="Auto">
          <SliderRow label="Exposure" value={adjustments.exposure} onChange={v => onChange("exposure", v)} />
          <SliderRow label="Contrast" value={adjustments.contrast} onChange={v => onChange("contrast", v)} />
          <SliderRow label="Highlight" value={adjustments.highlight} onChange={v => onChange("highlight", v)} />
          <SliderRow label="Shadows" value={adjustments.shadows} onChange={v => onChange("shadows", v)} />
          <SliderRow label="Saturation" value={adjustments.saturation} onChange={v => onChange("saturation", v)} />
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

      <SidebarSection title="Detail">
        <SidebarGroup label="GRAIN">
          <SliderRow label="Amount" value={adjustments.grain} trackClass="bg-gradient-to-r from-white/10 to-white/60" onChange={v => onChange("grain", v)} />
          <SliderRow label="Size" value={30} trackClass="bg-gradient-to-r from-white/10 to-white/60" />
          <SliderRow label="Roughness" value={50} trackClass="bg-gradient-to-r from-white/10 to-white/60" />
        </SidebarGroup>
        <SidebarGroup label="SHARPENING">
          <SliderRow label="Amount" value={25} />
          <SliderRow label="Radius" value={15} />
        </SidebarGroup>
      </SidebarSection>

      <SidebarSection title="Lens Corrections">
        <SidebarGroup label="VIGNETTE">
          <SliderRow
            label="Amount"
            value={adjustments.vignette}
            trackClass="bg-gradient-to-r from-white/60 to-black"
            onChange={v => onChange("vignette", v)}
          />
        </SidebarGroup>
      </SidebarSection>
    </>
  )
}