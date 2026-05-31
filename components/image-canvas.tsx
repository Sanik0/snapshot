"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { FILM_PRESETS, type Preset } from "@/lib/presets"

// Change the props interface to:
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


    // Add this hook inside image-canvas.tsx
    const grainCanvasRef = useRef<HTMLCanvasElement>(null)

    const grainFrameRef = useRef<number>(0)

    useEffect(() => {
        const canvas = grainCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const size = 512
        canvas.width = size
        canvas.height = size

        const drawGrain = () => {
            const imageData = ctx.createImageData(size, size)
            for (let i = 0; i < imageData.data.length; i += 4) {
                const val = Math.random() * 255
                imageData.data[i] = val
                imageData.data[i + 1] = val
                imageData.data[i + 2] = val
                imageData.data[i + 3] = 255
            }
            ctx.putImageData(imageData, 0, 0)
            grainFrameRef.current = requestAnimationFrame(drawGrain)
        }

        drawGrain()

        return () => cancelAnimationFrame(grainFrameRef.current)
    }, [image])


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

    // Build grain overlay style
    const grainOpacity = activePreset.adjustments.grain / 100 * 0.6

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
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                    </div>
                ) : (
                    <div
                        ref={canvasRef}
                        className="relative select-none overflow-hidden"
                        style={{
                            width: `${Math.min(zoom, 100)}%`,
                            maxHeight: "100%",
                            aspectRatio: imageDimensions.w && imageDimensions.h ? `${imageDimensions.w}/${imageDimensions.h}` : "4/3",
                            cursor: isDraggingSplit ? "col-resize" : "default",
                        }}
                    >
                        {/* Original */}
                        <img src={image} alt="original" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

                        {/* Edited with filter + grain */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${splitPos}%` }}>
                            <img
                                src={image}
                                alt="edited"
                                className="absolute inset-0 h-full object-cover object-left"
                                style={{ width: `${canvasWidth}px`, maxWidth: "none", filter: liveFilter }}
                                draggable={false}
                            />
                            {/* Grain overlay */}
                            {adjustments.grain > 0 && (
                                <canvas
                                    ref={grainCanvasRef}
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        width: `${canvasWidth}px`,
                                        maxWidth: "none",
                                        height: "100%",
                                        opacity: (adjustments.grain / 100) * 2.5,
                                        mixBlendMode: "overlay",
                                        imageRendering: "pixelated",
                                    }}
                                />
                            )}
                            {/* Vignette overlay */}
                            {adjustments.vignette > 0 && (
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        width: `${canvasWidth}px`,
                                        maxWidth: "none",
                                        background: `radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,${(adjustments.vignette / 100) * 1.8}) 75%, rgba(0,0,0,${(adjustments.vignette / 100) * 2.2}) 100%)`,
                                    }}
                                />
                            )}
                        </div>

                        {/* Split line */}
                        <div className="absolute top-0 bottom-0 w-px bg-white/80 z-10" style={{ left: `${splitPos}%` }}>
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center cursor-col-resize shadow-lg z-20"
                                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplit(true) }}
                            >
                                <span className="material-icons text-white" style={{ fontSize: "0.9rem" }}>unfold_more</span>
                            </div>
                        </div>

                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/50 text-[10px] text-white/60 font-medium tracking-wider uppercase backdrop-blur-sm">Edited</div>
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 text-[10px] text-white/60 font-medium tracking-wider uppercase backdrop-blur-sm">Original</div>
                    </div>
                )}
            </div>

            {/* Zoom toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-neutral-primary">
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="text-white/50 hover:text-white/90 transition-colors">
                        <span className="material-icons" style={{ fontSize: "1rem" }}>remove</span>
                    </button>
                    <input type="range" min={25} max={200} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-20 accent-blue-500 cursor-pointer" />
                    <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-white/50 hover:text-white/90 transition-colors">
                        <span className="material-icons" style={{ fontSize: "1rem" }}>add</span>
                    </button>
                    <span className="text-xs text-white/40 w-10 tabular-nums">{zoom}%</span>
                </div>
                <div className="flex items-center gap-3 text-white/30">
                    {imageDimensions.w > 0 && (
                        <span className="text-xs tabular-nums">{imageDimensions.w} × {imageDimensions.h}px</span>
                    )}
                    <div className="w-px h-4 bg-white/10" />
                    {["fit_screen", "undo", "redo", "refresh"].map(icon => (
                        <button key={icon} className="hover:text-white/70 transition-colors">
                            <span className="material-icons" style={{ fontSize: "1rem" }}>{icon}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => scrollCarousel("left")} className="text-white/40 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-white/20">
                        <span className="material-icons" style={{ fontSize: "0.9rem" }}>chevron_left</span>
                    </button>
                    <button onClick={() => scrollCarousel("right")} className="text-white/40 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-white/20">
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