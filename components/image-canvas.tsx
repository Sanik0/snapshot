"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { FILM_PRESETS, type Preset } from "@/lib/presets"

interface ImageCanvasProps {
    activePreset: Preset
    liveFilter: string
    adjustments: Preset["adjustments"] & { vignette: number }
    onPresetChange: (preset: Preset) => void
}

export function ImageCanvas({ activePreset, liveFilter, adjustments, onPresetChange }: ImageCanvasProps) {
    const [image, setImage] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>("")
    const [zoom, setZoom] = useState(25)
    const [splitPos, setSplitPos] = useState(50)
    const [isDraggingSplit, setIsDraggingSplit] = useState(false)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 })
    const [canvasWidth, setCanvasWidth] = useState(0)


    const canvasRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const carouselRef = useRef<HTMLDivElement>(null)
    const grainCanvasRef = useRef<HTMLCanvasElement>(null)
    const grainFrameRef = useRef<number>(0)
    const frameCountRef = useRef<number>(0)
    const fisheyeCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const isMobile = window.innerWidth < 768
        if (isMobile) setZoom(100)
    }, [])

    useEffect(() => {
        if (!canvasRef.current) return
        const update = () => setCanvasWidth(canvasRef.current?.offsetWidth ?? 0)
        update()
        const ro = new ResizeObserver(update)
        ro.observe(canvasRef.current)
        return () => ro.disconnect()
    }, [image])

    useEffect(() => {
        const canvas = grainCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const size = 512
        canvas.width = size
        canvas.height = size

        const imageData = ctx.createImageData(size, size)
        for (let i = 0; i < imageData.data.length; i += 4) {
            const val = 100 + Math.random() * 80
            imageData.data[i] = val
            imageData.data[i + 1] = val
            imageData.data[i + 2] = val
            imageData.data[i + 3] = 255
        }
        ctx.putImageData(imageData, 0, 0)
    }, [image])

    useEffect(() => {
        const canvas = fisheyeCanvasRef.current
        if (!canvas || !image || adjustments.fisheye <= 0) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.onload = () => {
            const w = img.naturalWidth
            const h = img.naturalHeight
            canvas.width = w
            canvas.height = h

            const off = document.createElement("canvas")
            off.width = w
            off.height = h
            const offCtx = off.getContext("2d")!
            offCtx.drawImage(img, 0, 0)
            const src = offCtx.getImageData(0, 0, w, h)
            const dst = ctx.createImageData(w, h)

            const strength = (adjustments.fisheye / 100) * 1.2
            const cx = w / 2
            const cy = h / 2
            const radius = Math.min(w, h) / 2

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const nx = (x - cx) / radius
                    const ny = (y - cy) / radius
                    const r = Math.sqrt(nx * nx + ny * ny)
                    const dstIdx = (y * w + x) * 4

                    // Outside the circle — pure black
                    if (r > 1) {
                        dst.data[dstIdx] = 0
                        dst.data[dstIdx + 1] = 0
                        dst.data[dstIdx + 2] = 0
                        dst.data[dstIdx + 3] = 255
                        continue
                    }

                    // Barrel distortion
                    const distorted = r === 0 ? 0 : (Math.tan(r * strength) / (Math.tan(strength) || 1))
                    const angle = Math.atan2(ny, nx)

                    const srcX = Math.round(cx + distorted * Math.cos(angle) * radius)
                    const srcY = Math.round(cy + distorted * Math.sin(angle) * radius)

                    if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
                        const srcIdx = (srcY * w + srcX) * 4
                        dst.data[dstIdx] = src.data[srcIdx]
                        dst.data[dstIdx + 1] = src.data[srcIdx + 1]
                        dst.data[dstIdx + 2] = src.data[srcIdx + 2]
                        dst.data[dstIdx + 3] = src.data[srcIdx + 3]
                    } else {
                        // Out of bounds — black
                        dst.data[dstIdx] = 0
                        dst.data[dstIdx + 1] = 0
                        dst.data[dstIdx + 2] = 0
                        dst.data[dstIdx + 3] = 255
                    }
                }
            }
            ctx.putImageData(dst, 0, 0)

            // Clip to smooth circle with feathered edge
            ctx.globalCompositeOperation = "destination-in"
            const gradient = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius)
            gradient.addColorStop(0, "rgba(0,0,0,1)")
            gradient.addColorStop(1, "rgba(0,0,0,0)")
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalCompositeOperation = "source-over"
        }
        img.src = image
    }, [image, adjustments.fisheye])

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            const src = e.target?.result as string
            const img = new Image()
            img.onload = () => setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight })
            img.src = src
            setImage(src)
        }
        reader.readAsDataURL(file)
    }, [])

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingSplit || !canvasRef.current) return
            const rect = canvasRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            setSplitPos(x * 100)
        }
        const onMouseUp = () => setIsDraggingSplit(false)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }
    }, [isDraggingSplit])

    const scrollCarousel = (dir: "left" | "right") => {
        if (!carouselRef.current) return
        carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {fileName && (
                <div className="px-4 py-2 flex items-center justify-between border-b border-white/10">
                    <span className="text-xs text-white/50">{fileName}</span>
                    <button className="text-white/30 hover:text-white/60 transition-colors">
                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>more_horiz</span>
                    </button>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center bg-black/60 overflow-hidden relative">
                {!image ? (
                    <div
                        className={`w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${isDraggingOver ? "bg-white/5" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${isDraggingOver ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 bg-white/5"}`}>
                            <span className="material-icons text-white/40" style={{ fontSize: "1.8rem" }}>upload_file</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-white/60">Drop your image here</p>
                            <p className="text-xs text-white/25 mt-1">or click to browse — JPG, PNG, RAW</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                        />
                    </div>
                ) : (
                    <div
                        ref={canvasRef}
                        className="relative select-none overflow-hidden"
                        style={{
                            width: `${Math.min(zoom, 100)}%`,
                            maxHeight: "100%",
                            aspectRatio: imageDimensions.w && imageDimensions.h
                                ? `${imageDimensions.w}/${imageDimensions.h}`
                                : "4/3",
                            cursor: isDraggingSplit ? "col-resize" : "default",
                        }}
                    >
                        {/* Original */}
                        <img
                            src={image}
                            alt="original"
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                        />

                        {/* Edited side */}
                        {/* Edited side */}
                        <div
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ width: `${splitPos}%` }}
                        >
                            {/* Regular filtered image — hide when fisheye active */}
                            <img
                                src={image}
                                alt="edited"
                                className="absolute inset-0 h-full object-cover object-left"
                                style={{
                                    width: `${canvasWidth}px`,
                                    maxWidth: "none",
                                    filter: liveFilter,
                                    display: adjustments.fisheye > 0 ? "none" : "block",
                                }}
                                draggable={false}
                            />

                            {/* Fisheye canvas — only shows when fisheye > 0 */}
                            <canvas
                                ref={fisheyeCanvasRef}
                                className="absolute inset-0 h-full object-cover object-left pointer-events-none"
                                style={{
                                    width: `${canvasWidth}px`,
                                    maxWidth: "none",
                                    filter: liveFilter,
                                    display: adjustments.fisheye > 0 ? "block" : "none",
                                }}
                            />

                            {/* Grain — always mounted */}
                            <canvas
                                ref={grainCanvasRef}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    width: `${canvasWidth}px`,
                                    maxWidth: "none",
                                    height: "100%",
                                    opacity: adjustments.grain > 0 ? (adjustments.grain / 100) * 0.9 : 0,
                                    mixBlendMode: "soft-light",
                                    imageRendering: "pixelated",
                                    transition: "opacity 0.2s",
                                }}
                            />

                            {/* Fisheye circle vignette */}
                            {adjustments.fisheye > 0 && (
                                <div
                                    className="absolute inset-0 pointer-events-none z-10"
                                    style={{
                                        width: `${canvasWidth}px`,
                                        maxWidth: "none",
                                        background: `radial-gradient(ellipse at center, transparent ${55 - adjustments.fisheye * 0.3}%, rgba(0,0,0,0.6) ${75 - adjustments.fisheye * 0.2}%, rgba(0,0,0,0.95) 100%)`,
                                    }}
                                />
                            )}

                            {/* Vignette — always mounted */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    width: `${canvasWidth}px`,
                                    maxWidth: "none",
                                    background: `radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,${(adjustments.vignette / 100) * 1.8}) 75%, rgba(0,0,0,${(adjustments.vignette / 100) * 2.2}) 100%)`,
                                    transition: "opacity 0.2s",
                                }}
                            />
                        </div>

                        {/* Split line */}
                        <div
                            className="absolute top-0 bottom-0 w-px bg-white/80 z-10"
                            style={{ left: `${splitPos}%` }}
                        >
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center cursor-col-resize shadow-lg z-20"
                                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplit(true) }}
                            >
                                <span className="material-icons text-white" style={{ fontSize: "0.9rem" }}>unfold_more</span>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/50 text-[10px] text-white/60 font-medium tracking-wider uppercase backdrop-blur-sm">
                            Edited
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 text-[10px] text-white/60 font-medium tracking-wider uppercase backdrop-blur-sm">
                            Original
                        </div>
                    </div>
                )}
            </div>

            {/* Zoom toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-neutral-primary">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom(z => Math.max(25, z - 10))}
                        className="text-white/50 hover:text-white/90 transition-colors"
                    >
                        <span className="material-icons" style={{ fontSize: "1rem" }}>remove</span>
                    </button>
                    <input
                        type="range" min={25} max={200} value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-20 accent-blue-500 cursor-pointer"
                    />
                    <button
                        onClick={() => setZoom(z => Math.min(200, z + 10))}
                        className="text-white/50 hover:text-white/90 transition-colors"
                    >
                        <span className="material-icons" style={{ fontSize: "1rem" }}>add</span>
                    </button>
                    <span className="text-xs text-white/40 w-10 tabular-nums">{zoom}%</span>
                </div>

                <div className="flex items-center gap-3 text-white/30">
                    {imageDimensions.w > 0 && (
                        <span className="text-xs tabular-nums">
                            {imageDimensions.w} × {imageDimensions.h}px
                        </span>
                    )}
                    <div className="w-px h-4 bg-white/10" />
                    {["fit_screen", "undo", "redo", "refresh"].map(icon => (
                        <button key={icon} className="hover:text-white/70 transition-colors">
                            <span className="material-icons" style={{ fontSize: "1rem" }}>{icon}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scrollCarousel("left")}
                        className="text-white/40 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-white/20"
                    >
                        <span className="material-icons" style={{ fontSize: "0.9rem" }}>chevron_left</span>
                    </button>
                    <button
                        onClick={() => scrollCarousel("right")}
                        className="text-white/40 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-white/20"
                    >
                        <span className="material-icons" style={{ fontSize: "0.9rem" }}>chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Film preset carousel */}
            <div className="border-t border-white/10 bg-neutral-primary py-3">
                <div ref={carouselRef} className="flex gap-3 px-4 overflow-x-auto scrollbar-none">
                    {FILM_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => onPresetChange(preset)}
                            className={`flex flex-col items-center gap-2 shrink-0 group transition-all ${activePreset.id === preset.id ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
                        >
                            <div className={`w-16 h-16 rounded-lg border overflow-hidden transition-all ${activePreset.id === preset.id ? "border-white/40" : "border-white/10 group-hover:border-white/20"}`}>
                                <img src={preset.image} alt={preset.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide whitespace-nowrap transition-colors ${activePreset.id === preset.id ? "text-white/90" : "text-white/40"}`}>
                                {preset.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}