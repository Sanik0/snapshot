"use client"

import { useState, useEffect, useRef } from "react"
import type { Preset } from "@/lib/presets"

type Adjustments = Preset["adjustments"] & {
    vignette: number
    sharpness: number
    blur: number
    fisheye: number
    fade: number
    hue: number
}

export function SliderRow({
    label, value, trackClass = "bg-white/20", onChange, min = -100, max = 100,
}: {
    label: string
    value: number
    trackClass?: string
    onChange?: (val: number) => void
    min?: number
    max?: number
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
                    type="range" min={min} max={max} value={val}
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

export function SidebarSection({ title, defaultOpen = false, children }: {
    title: string; defaultOpen?: boolean; children?: React.ReactNode
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors">
                <span className="material-icons text-white/60 transition-transform duration-200"
                    style={{ fontSize: "1rem", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
                    keyboard_arrow_down
                </span>
                <p className="text-sm font-medium text-white/90">{title}</p>
            </button>
            {open && children && <div className="pb-2">{children}</div>}
        </div>
    )
}

// Interactive tone curve
function ToneCurve() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [points, setPoints] = useState([
        { x: 0, y: 100 },
        { x: 25, y: 75 },
        { x: 50, y: 50 },
        { x: 75, y: 25 },
        { x: 100, y: 0 },
    ])
    const draggingIndex = useRef<number | null>(null)

    const toSvgCoords = (e: React.MouseEvent) => {
        const svg = svgRef.current
        if (!svg) return { x: 0, y: 0 }
        const rect = svg.getBoundingClientRect()
        return {
            x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
            y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
        }
    }

    const onMouseDown = (index: number) => (e: React.MouseEvent) => {
        e.preventDefault()
        draggingIndex.current = index
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if (draggingIndex.current === null) return
        const { x, y } = toSvgCoords(e)
        setPoints(prev => prev.map((p, i) => i === draggingIndex.current ? { x, y } : p))
    }

    const onMouseUp = () => { draggingIndex.current = null }

    const sorted = [...points].sort((a, b) => a.x - b.x)
    const pathD = sorted.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = sorted[i - 1]
        const cpx = (prev.x + p.x) / 2
        return `${acc} C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`
    }, "")

    return (
        <div className="px-4 pb-4">
            <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">Tone Curve</p>
            <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                className="w-full aspect-square rounded bg-[#1a1a1a] border border-white/10 cursor-crosshair"
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                preserveAspectRatio="none"
            >
                {/* Grid */}
                {[25, 50, 75].map(p => (
                    <g key={p}>
                        <line x1={p} y1={0} x2={p} y2={100} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                        <line x1={0} y1={p} x2={100} y2={p} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </g>
                ))}
                {/* Baseline */}
                <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
                {/* Curve */}
                <path d={pathD} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                {/* Control points */}
                {points.map((p, i) => (
                    <circle
                        key={i} cx={p.x} cy={p.y} r="3"
                        fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5"
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={onMouseDown(i)}
                    />
                ))}
            </svg>
            <p className="text-[9px] text-white/20 mt-1 text-center">Drag points to adjust curve</p>
        </div>
    )
}

export function Sidebar({
    adjustments, onChange,
}: {
    adjustments: Adjustments
    onChange: (key: keyof Adjustments, val: number | string | boolean) => void
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
                <SidebarGroup label="COLOR">
                    <SliderRow label="Hue" value={adjustments.hue} trackClass="bg-gradient-to-r from-red-400 via-green-400 to-blue-400" onChange={v => onChange("hue", v)} />
                    <SliderRow label="Fade" value={adjustments.fade} min={0} max={100} trackClass="bg-gradient-to-r from-white/10 to-white/50" onChange={v => onChange("fade", v)} />
                </SidebarGroup>
                <ToneCurve />
            </SidebarSection>

            <SidebarSection title="Detail">
                <SidebarGroup label="GRAIN">
                    <SliderRow label="Amount" value={adjustments.grain} min={0} max={100} trackClass="bg-gradient-to-r from-white/10 to-white/60" onChange={v => onChange("grain", v)} />
                </SidebarGroup>
                <SidebarGroup label="SHARPENING">
                    <SliderRow label="Amount" value={adjustments.sharpness} min={0} max={100} onChange={v => onChange("sharpness", v)} />
                </SidebarGroup>
                <SidebarGroup label="BLUR">
                    <SliderRow label="Amount" value={adjustments.blur} min={0} max={100} trackClass="bg-gradient-to-r from-white/60 to-white/10" onChange={v => onChange("blur", v)} />
                </SidebarGroup>
            </SidebarSection>

            <SidebarSection title="Lens Corrections">
                <SidebarGroup label="VIGNETTE">
                    <SliderRow label="Amount" value={adjustments.vignette} min={0} max={100} trackClass="bg-gradient-to-r from-white/60 to-black" onChange={v => onChange("vignette", v)} />
                </SidebarGroup>
                <SidebarGroup label="FISHEYE">
                    <SliderRow label="Distortion" value={adjustments.fisheye} min={0} max={100} onChange={v => onChange("fisheye", v)} />
                </SidebarGroup>
            </SidebarSection>

            <SidebarSection title="Light Leak">
                <SidebarGroup label="INTENSITY">
                    <SliderRow
                        label="Opacity"
                        value={adjustments.lightLeakOpacity}
                        min={0} max={100}
                        trackClass="bg-gradient-to-r from-transparent to-orange-400"
                        onChange={v => onChange("lightLeakOpacity", v)}
                    />
                </SidebarGroup>

                <div className="px-4 pb-3">
                    <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-3">Color</p>
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { color: "#ff6600", label: "Orange" },
                            { color: "#ff2200", label: "Red" },
                            { color: "#ffcc00", label: "Yellow" },
                            { color: "#ff88cc", label: "Pink" },
                            { color: "#aa44ff", label: "Purple" },
                            { color: "#00ccff", label: "Cyan" },
                            { color: "#ffffff", label: "White" },
                        ].map(({ color, label }) => (
                            <button
                                key={color}
                                title={label}
                                onClick={() => onChange("lightLeakColor", color)}
                                className="w-7 h-7 rounded-full border-2 transition-all"
                                style={{
                                    background: color,
                                    borderColor: adjustments.lightLeakColor === color ? "white" : "transparent",
                                    boxShadow: adjustments.lightLeakColor === color ? `0 0 8px ${color}` : "none",
                                }}
                            />
                        ))}
                        {/* Custom color picker */}
                        <label className="w-7 h-7 rounded-full border-2 border-white/20 overflow-hidden cursor-pointer flex items-center justify-center" title="Custom">
                            <input
                                type="color"
                                className="opacity-0 absolute w-0 h-0"
                                onChange={e => onChange("lightLeakColor", e.target.value)}
                            />
                            <span className="material-icons text-white/40" style={{ fontSize: "0.8rem" }}>colorize</span>
                        </label>
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-3">Position</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: "top-left", icon: "north_west" },
                            { id: "horizontal", icon: "horizontal_rule" },
                            { id: "top-right", icon: "north_east" },
                            { id: "center-left", icon: "west" },
                            { id: "center-right", icon: "east" },
                            { id: "bottom-left", icon: "south_west" },
                            { id: "bottom-right", icon: "south_east" },
                        ].map(({ id, icon }) => (
                            <button
                                key={id}
                                onClick={() => onChange("lightLeakPosition", id)}
                                className={`h-8 rounded flex items-center justify-center border transition-all ${adjustments.lightLeakPosition === id
                                    ? "border-white/40 bg-white/10 text-white"
                                    : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/60"
                                    }`}
                            >
                                <span className="material-icons" style={{ fontSize: "0.9rem" }}>{icon}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </SidebarSection>

            <SidebarSection title="Film Effects">
                <SidebarGroup label="DUST & SCRATCHES">
                    <SliderRow
                        label="Amount"
                        value={adjustments.dust}
                        min={0} max={100}
                        trackClass="bg-gradient-to-r from-white/10 to-white/50"
                        onChange={v => onChange("dust", v)}
                    />
                </SidebarGroup>

                <div className="px-4 pb-4">
                    <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-3">Date Stamp</p>

                    {/* Toggle */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-white/60">Show date</span>
                        <div
                            className="cursor-pointer"
                            onClick={() => onChange("dateStamp", !adjustments.dateStamp)}
                        >
                            <div className={`w-9 h-5 rounded-full border transition-all relative ${adjustments.dateStamp ? "bg-white/20 border-white/40" : "bg-transparent border-white/20"}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${adjustments.dateStamp ? "left-4" : "left-0.5"}`} />
                            </div>
                        </div>
                    </div>

                    {/* Color swatches */}
                    {adjustments.dateStamp && (
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { color: "#ff8800", label: "Orange" },
                                { color: "#ffcc00", label: "Yellow" },
                                { color: "#ff4444", label: "Red" },
                                { color: "#ffffff", label: "White" },
                                { color: "#88ff44", label: "Green" },
                            ].map(({ color, label }) => (
                                <button
                                    key={color}
                                    title={label}
                                    onClick={() => onChange("dateStampColor", color)}
                                    className="w-7 h-7 rounded-full border-2 transition-all"
                                    style={{
                                        background: color,
                                        borderColor: adjustments.dateStampColor === color ? "white" : "transparent",
                                        boxShadow: adjustments.dateStampColor === color ? `0 0 8px ${color}` : "none",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </SidebarSection>
        </>
    )
}