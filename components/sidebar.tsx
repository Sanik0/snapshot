import { useState } from "react"

export function SidebarSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <span
          className="material-icons text-white/60 transition-transform duration-200"
          style={{ fontSize: "1rem", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          keyboard_arrow_down
        </span>
        <p className="text-sm font-medium text-white/90">{title}</p>
      </button>
      {open && children && <div className="pb-2">{children}</div>}
    </div>
  )
}

export function SidebarGroup({
  label,
  badge,
  children,
}: {
  label: string
  badge?: string
  children: React.ReactNode
}) {
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

export function SliderRow({
  label,
  value,
  trackClass = "bg-white/20",
}: {
  label: string
  value: number
  trackClass?: string
}) {
  const [val, setVal] = useState(value)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs text-white/50 tabular-nums">{val.toFixed(2)}</span>
      </div>
      <div className="relative h-4 flex items-center">
        {/* Track */}
        <div className={`absolute inset-x-0 h-[2px] rounded-full ${trackClass}`} />
        {/* Input */}
        <input
          type="range"
          min={-100}
          max={100}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="relative w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-0
            [&::-moz-range-thumb]:w-3.5
            [&::-moz-range-thumb]:h-3.5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0"
        />
      </div>
    </div>
  )
}