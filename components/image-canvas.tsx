"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const FILM_PRESETS = [
    { id: "classic-m", name: "Classic M", icon: "📷" },
    { id: "kodak-400", name: "Kodak 400", icon: "🎞" },
    { id: "fuji-400h", name: "Fuji 400H", icon: "🌿" },
    { id: "portra-800", name: "Portra 800", icon: "🎨" },
    { id: "cinestill", name: "CineStill", icon: "🎬" },
    { id: "ilford-hp5", name: "Ilford HP5", icon: "⬛" },
    { id: "lomochrome", name: "LomoChrome", icon: "🟣" },
    { id: "ektar-100", name: "Ektar 100", icon: "🔴" },
    { id: "superia-400", name: "Superia 400", icon: "💚" },
    { id: "provia-100", name: "Provia 100", icon: "🔵" },
]

export function ImageCanvas() {
    const [image, setImage] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>("")
    const [zoom, setZoom] = useState(25)
    const [splitPos, setSplitPos] = useState(50) // percentage
    const [isDraggingSplit, setIsDraggingSplit] = useState(false)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState("classic-m")
    const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 })

    const canvasRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const carouselRef = useRef<HTMLDivElement>(null)

    // Handle file upload
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

    // Split drag logic
    const onSplitMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDraggingSplit(true)
    }, [])

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

    // Carousel scroll
    const scrollCarousel = (dir: "left" | "right") => {
        if (!carouselRef.current) return
        carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
    }

    const [canvasWidth, setCanvasWidth] = useState(0)

    useEffect(() => {
        if (!canvasRef.current) return
        const update = () => setCanvasWidth(canvasRef.current?.offsetWidth ?? 0)
        update() // run once on mount
        const ro = new ResizeObserver(update)
        ro.observe(canvasRef.current)
        return () => ro.disconnect()
    }, [image]) // re-run when image loads

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">

            {/* File name bar */}
            {fileName && (
                <div className="px-4 py-2 flex items-center justify-between border-b border-white/10">
                    <span className="text-xs text-white/50">{fileName}</span>
                    <button className="text-white/30 hover:text-white/60 transition-colors">
                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>more_horiz</span>
                    </button>
                </div>
            )}

            {/* Main canvas */}
            <div className="flex-1 flex items-center justify-center bg-black/60 overflow-hidden relative">
                {!image ? (
                    // Drop zone
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
                    // Split view
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
                        {/* Original (right side, full) */}
                        <img
                            src={image}
                            alt="original"
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                        />

                        {/* Edited (left side, clipped) */}
                        <div
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ width: `${splitPos}%` }}
                        >
                            <img
                                src={image}
                                alt="edited"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    width: `${canvasWidth}px`,
                                    maxWidth: "none",
                                    filter: selectedPreset === "ilford-hp5"
                                        ? "grayscale(1) contrast(1.1)"
                                        : selectedPreset === "cinestill"
                                            ? "sepia(0.3) saturate(1.4) hue-rotate(-10deg)"
                                            : selectedPreset === "lomochrome"
                                                ? "saturate(0.7) hue-rotate(30deg) contrast(1.1)"
                                                : "none",
                                }}
                                draggable={false}
                            />
                        </div>

                        {/* Split line */}
                        <div
                            className="absolute top-0 bottom-0 w-px bg-white/80 z-10"
                            style={{ left: `${splitPos}%` }}
                        >
                            {/* Handle */}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center cursor-col-resize shadow-lg z-20"
                                onMouseDown={onSplitMouseDown}
                            >
                                <span className="material-icons text-white" style={{ fontSize: "0.9rem" }}>unfold_more</span>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/50 text-[10px] text-white/60 font-medium tracking-wider uppercase backdrop-blur-sm">Edited</div>
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 text-[10px] text-white/60 font-medium tracking-wider uppercase backdrop-blur-sm">Original</div>
                    </div>
                )}
            </div>

            {/* Zoom toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-neutral-primary">
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="text-white/50 hover:text-white/90 transition-colors">
                        <span className="material-icons" style={{ fontSize: "1.5rem" }}>remove</span>
                    </button>
                    <input
                        type="range" min={25} max={100} value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-50 accent-blue-500 cursor-pointer"
                    />
                    <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-white/50 hover:text-white/90 transition-colors">
                        <span className="material-icons" style={{ fontSize: "1.5rem" }}>add</span>
                    </button>
                    <span className="text-md text-white/40 w-10 tabular-nums">{zoom}%</span>
                </div>

                <div className="flex items-center gap-3 text-white/30">
                    {imageDimensions.w > 0 && (
                        <span className="text-xs tabular-nums">{imageDimensions.w} × {imageDimensions.h}px</span>
                    )}
                    <div className="w-px h-4 bg-white/10" />
                    {/* Fit / Fill / Undo / Redo / Reset */}
                    {["fit_screen", "undo", "redo", "refresh"].map(icon => (
                        <button key={icon} className="hover:text-white/70 transition-colors">
                            <span className="material-icons" style={{ fontSize: "1.5rem" }}>{icon}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => scrollCarousel("left")} className="text-white/40 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-white/20">
                        <span className="material-icons" style={{ fontSize: "1.5rem" }}>chevron_left</span>
                    </button>
                    <button onClick={() => scrollCarousel("right")} className="text-white/40 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-white/20">
                        <span className="material-icons" style={{ fontSize: "1.5rem" }}>chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Film preset carousel */}
            <div className="border-t border-white/10 bg-neutral-primary py-3">
                <div
                    ref={carouselRef}
                    className="flex gap-3 px-4 overflow-x-auto scrollbar-none"
                >
                    {FILM_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => setSelectedPreset(preset.id)}
                            className={`flex flex-col items-center gap-2 shrink-0 group transition-all ${selectedPreset === preset.id ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
                        >
                            <div className={`w-20 h-20 rounded-lg border flex items-center justify-center text-2xl transition-all ${selectedPreset === preset.id ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5 group-hover:border-white/20"}`}>
                                {preset.icon}
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide whitespace-nowrap transition-colors ${selectedPreset === preset.id ? "text-white/90" : "text-white/40"}`}>
                                {preset.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    )
}