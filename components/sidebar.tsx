"use client"

import { useState, useEffect, useRef } from "react"
import type { Preset } from "@/lib/presets"

type Adjustments = Preset["adjustments"] & {
    vignette: number
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
    const [val, setVal] = useState(value ?? 0)
    useEffect(() => { setVal(value ?? 0) }, [value])

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/60">{label}</span>
                <span className="text-xs text-white/50 tabular-nums">{(val ?? 0).toFixed(0)}</span>
            </div>
            <div className="relative h-4 flex items-center">
                <div className={`absolute inset-x-0 h-[2px] rounded-full ${trackClass}`} />
                <input
                    type="range" min={min} max={max} value={val ?? 0}
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

export function Sidebar({
    adjustments,
    onChange,
    selectedFrame,
    onFrameChange,
}: {
    adjustments: Adjustments
    onChange: (key: keyof Adjustments, val: number | string | boolean) => void
    selectedFrame: string | null
    onFrameChange: (frame: string | null) => void
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

                
                <SidebarGroup label="RAINBOW STREAK">
                    <SliderRow
                        label="Opacity"
                        value={adjustments.rainbowLeakOpacity}
                        min={0} max={100}
                        trackClass="bg-gradient-to-r from-red-500 via-green-400 to-blue-500"
                        onChange={v => onChange("rainbowLeakOpacity", v)}
                    />
                    <SliderRow
                        label="Width"
                        value={adjustments.rainbowLeakWidth}
                        min={5} max={100}
                        trackClass="bg-gradient-to-r from-white/10 to-white/60"
                        onChange={v => onChange("rainbowLeakWidth", v)}
                    />
                    <SliderRow
                        label="Angle"
                        value={adjustments.rainbowLeakAngle}
                        min={0} max={360}
                        trackClass="bg-gradient-to-r from-white/10 to-white/50"
                        onChange={v => onChange("rainbowLeakAngle", v)}
                    />
                </SidebarGroup>
ra
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

            <SidebarSection title="Frames">
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {/* No frame option */}
                        <button
                            onClick={() => onFrameChange(null)}
                            className={`aspect-[3/4] rounded border flex items-center justify-center transition-all ${selectedFrame === null
                                ? "border-white/40 bg-white/10"
                                : "border-white/10 hover:border-white/20"
                                }`}
                        >
                            <span className="text-[9px] text-white/40 font-medium tracking-wider uppercase">None</span>
                        </button>

                        {/* Frame options */}
                        {[
                            { id: "/frames/frame9.png", name: "Polaroid" },
                            { id: "/frames/frame4.png", name: "Instax" },
                            { id: "/frames/frame3.png", name: "Vintage" },
                            { id: "/frames/frame5.png", name: "Kodak" },
                            { id: "/frames/frame7.png", name: "Kodak1" },
                            { id: "/frames/frame8.png", name: "Film" },
                            { id: "/frames/frame10.png", name: "Film" },
                            { id: "/frames/frame11.png", name: "Smiley" },
                        ].map(({ id, name }) => (
                            <button
                                key={id}
                                onClick={() => onFrameChange(id)}
                                className={`aspect-[3/4] rounded border overflow-hidden transition-all ${selectedFrame === id
                                    ? "border-white/40"
                                    : "border-white/10 hover:border-white/20"
                                    }`}
                            >
                                <img
                                    src={id}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-[9px] text-white/20 mt-3 text-center">Drop frame PNGs into public/frames/</p>
                </div>
            </SidebarSection>
        </>
    )
}