"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { FILM_PRESETS, type Preset } from "@/lib/presets"
import { applyCanvasFilter } from "@/lib/presets"
import { toPng, toJpeg } from 'html-to-image'


interface ImageCanvasProps {
    activePreset: Preset
    liveFilter: string
    adjustments: Preset["adjustments"] & { vignette: number }
    onPresetChange: (preset: Preset) => void
    selectedFrame: string | null
    onFrameChange: (frame: string | null) => void
    onExport: (fn: () => void) => void
}

// ✅ Fixed — includes frame props
export function ImageCanvas({ activePreset, liveFilter, adjustments, onPresetChange, selectedFrame, onFrameChange, onExport }: ImageCanvasProps) {
    const [image, setImage] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>("")
    const [zoom, setZoom] = useState(25)
    const [splitPos, setSplitPos] = useState(50)
    const [isDraggingSplit, setIsDraggingSplit] = useState(false)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 })
    const [canvasWidth, setCanvasWidth] = useState(0)
    const dateStampRef = useRef<HTMLCanvasElement>(null)


    const canvasRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const carouselRef = useRef<HTMLDivElement>(null)
    const grainCanvasRef = useRef<HTMLCanvasElement>(null)
    const grainFrameRef = useRef<number>(0)
    const frameCountRef = useRef<number>(0)
    const fisheyeCanvasRef = useRef<HTMLCanvasElement>(null)
    const dustCanvasRef = useRef<HTMLCanvasElement>(null)
    const sharpCanvasRef = useRef<HTMLCanvasElement>(null)
    const imageElementRef = useRef<HTMLImageElement | null>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const splitLineRef = useRef<HTMLDivElement>(null)
    const [showCamera, setShowCamera] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const handleExportRef = useRef<() => void>(() => { })

    const handleExport = useCallback(async () => {
        const container = canvasRef.current
        if (!container) return

        if (splitLineRef.current) splitLineRef.current.style.visibility = "hidden"

        const editedSide = container.querySelector("[data-edited-side]") as HTMLElement
        if (editedSide) editedSide.style.width = "100%"

        await new Promise(r => setTimeout(r, 100))

        try {
            const dataUrl = await toJpeg(container, {
                quality: 0.95,
                pixelRatio: 4,
                skipFonts: true,
            })
            const link = document.createElement("a")
            link.download = "snapshot.jpg"
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error("Export failed", err)
        } finally {
            if (splitLineRef.current) splitLineRef.current.style.visibility = ""
            if (editedSide) editedSide.style.width = ""
        }
    }, [])

    // Update the ref every render so page.tsx always calls the latest version
    useEffect(() => {
        handleExportRef.current = handleExport
    })

    // Register with parent only once
    useEffect(() => {
        onExport(() => handleExportRef.current())
    }, [])

    useEffect(() => {
        const isMobile = window.innerWidth < 768
        if (isMobile) setZoom(100)
    }, [])

    const [maxZoom, setMaxZoom] = useState(200)

    useEffect(() => {
        if (!canvasRef.current || !imageDimensions.w || !imageDimensions.h) return

        const containerH = canvasRef.current.parentElement?.clientHeight ?? 0
        const containerW = canvasRef.current.parentElement?.clientWidth ?? 0
        if (!containerH || !containerW) return

        const imageAspect = imageDimensions.w / imageDimensions.h
        const frameAspect = selectedFrame ? 3 / 4 : imageAspect

        // Max zoom = largest % where image height fits container height
        // At zoom%, image width = containerW * zoom/100
        // Image height = imageWidth / aspect
        // We want imageHeight <= containerH
        const maxByHeight = (containerH * frameAspect / containerW) * 100
        const maxByWidth = 100 // never exceed container width

        setMaxZoom(Math.min(Math.floor(Math.min(maxByHeight, maxByWidth)), 100))
    }, [imageDimensions, selectedFrame, image])

    useEffect(() => {
        if (maxZoom > 0 && image) {
            setZoom(maxZoom)
        }
    }, [maxZoom])

    useEffect(() => {
        if (!canvasRef.current) return
        const update = () => setCanvasWidth(canvasRef.current?.offsetWidth ?? 0)
        update()
        const ro = new ResizeObserver(update)
        ro.observe(canvasRef.current)
        return () => ro.disconnect()
    }, [image])
    2222222
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

        const applyFisheye = (source: HTMLCanvasElement | HTMLImageElement) => {
            const w = source instanceof HTMLImageElement ? source.naturalWidth : source.width
            const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height
            if (w === 0 || h === 0) return

            canvas.width = w
            canvas.height = h

            const off = document.createElement("canvas")
            off.width = w
            off.height = h
            const offCtx = off.getContext("2d")!
            offCtx.drawImage(source, 0, 0)
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

                    if (r > 1) {
                        dst.data[dstIdx] = 0
                        dst.data[dstIdx + 1] = 0
                        dst.data[dstIdx + 2] = 0
                        dst.data[dstIdx + 3] = 255
                        continue
                    }

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
                        dst.data[dstIdx] = 0
                        dst.data[dstIdx + 1] = 0
                        dst.data[dstIdx + 2] = 0
                        dst.data[dstIdx + 3] = 255
                    }
                }
            }

            ctx.putImageData(dst, 0, 0)
            ctx.globalCompositeOperation = "destination-in"
            const gradient = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius * 0.98)
            gradient.addColorStop(0, "rgba(0,0,0,1)")
            gradient.addColorStop(0.7, "rgba(0,0,0,1)")
            gradient.addColorStop(1, "rgba(0,0,0,0)")
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(cx, cy, radius * 0.98, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalCompositeOperation = "source-over"
            ctx.globalCompositeOperation = "destination-over"
            ctx.fillStyle = "#000000"
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = "source-over"
        }

        if (adjustments.sepiaRemap) {
            // Poll until processedCanvas has valid dimensions
            const waitForCanvas = () => {
                const pc = processedCanvasRef.current
                if (pc && pc.width > 0 && pc.height > 0) {
                    applyFisheye(pc)
                } else {
                    setTimeout(waitForCanvas, 50)
                }
            }
            waitForCanvas()
        } else {
            const img = imageElementRef.current
            if (img) applyFisheye(img)
        }
    }, [image, adjustments.fisheye, adjustments.sepiaRemap, adjustments])

    useEffect(() => {
        const canvas = dustCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const w = 1024
        const h = 1024
        canvas.width = w
        canvas.height = h
        ctx.clearRect(0, 0, w, h)

        if (adjustments.dust <= 0) return

        const count = Math.floor((adjustments.dust / 100) * 200)

        // Dust particles
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w
            const y = Math.random() * h
            const size = Math.random() * 2.5 + 0.5
            const opacity = Math.random() * 0.7 + 0.1
            ctx.beginPath()
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,255,${opacity})`
            ctx.fill()
        }

        // Scratches — thin vertical/diagonal lines
        const scratchCount = Math.floor((adjustments.dust / 100) * 8)
        for (let i = 0; i < scratchCount; i++) {
            const x = Math.random() * w
            const length = Math.random() * h * 0.6 + h * 0.2
            const startY = Math.random() * h * 0.3
            const wobble = (Math.random() - 0.5) * 10
            const opacity = Math.random() * 0.4 + 0.1
            const lineWidth = Math.random() * 1.2 + 0.3

            ctx.beginPath()
            ctx.moveTo(x, startY)
            ctx.bezierCurveTo(
                x + wobble, startY + length * 0.3,
                x - wobble, startY + length * 0.6,
                x + wobble * 0.5, startY + length
            )
            ctx.strokeStyle = `rgba(255,255,255,${opacity})`
            ctx.lineWidth = lineWidth
            ctx.stroke()
        }

        // Hair-thin horizontal scratches
        const hScratchCount = Math.floor((adjustments.dust / 100) * 5)
        for (let i = 0; i < hScratchCount; i++) {
            const y = Math.random() * h
            const startX = Math.random() * w * 0.3
            const length = Math.random() * w * 0.5 + w * 0.1
            const opacity = Math.random() * 0.3 + 0.05
            ctx.beginPath()
            ctx.moveTo(startX, y)
            ctx.lineTo(startX + length, y + (Math.random() - 0.5) * 3)
            ctx.strokeStyle = `rgba(255,255,255,${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
        }
    }, [image, adjustments.dust])

    useEffect(() => {
        const canvas = dateStampRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = 800
        canvas.height = 800
        ctx.clearRect(0, 0, 800, 800)

        if (!adjustments.dateStamp) return

        const now = new Date()
        const y = now.getFullYear()
        const m = String(now.getMonth() + 1).padStart(2, "0")
        const d = String(now.getDate()).padStart(2, "0")

        // Draw each character spaced manually — vertical stack like the photo
        const chars = `${y}.${m}.${d}`.split("")
        const color = adjustments.dateStampColor

        ctx.font = "bold 32px 'Courier New', monospace"
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8

        // Draw vertically stacked characters from bottom-left
        const charHeight = 36
        const startX = 30
        const startY = 800 - 20 - (chars.length * charHeight)

        chars.forEach((char, i) => {
            ctx.fillText(char, startX, startY + i * charHeight)
        })
    }, [adjustments.dateStamp, adjustments.dateStampColor, image])

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            const src = e.target?.result as string
            const img = new Image()
            img.onload = () => {
                setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight })
                imageElementRef.current = img
                setImage(src)
            }
            img.src = src
        }
        reader.readAsDataURL(file)
    }, [])

    const [menuOpen, setMenuOpen] = useState(false)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setMenuOpen(false)
        if (menuOpen) window.addEventListener("click", handleClickOutside)
        return () => window.removeEventListener("click", handleClickOutside)
    }, [menuOpen])

    useEffect(() => {
        const handleResize = () => {
            if (!canvasRef.current || !imageDimensions.w) return
            const containerH = canvasRef.current.parentElement?.clientHeight ?? 0
            const containerW = canvasRef.current.parentElement?.clientWidth ?? 0
            if (!containerH || !containerW) return

            const imageAspect = imageDimensions.w / imageDimensions.h
            const frameAspect = selectedFrame ? 3 / 4 : imageAspect
            const maxByHeight = (containerH * frameAspect / containerW) * 100
            setMaxZoom(Math.min(Math.floor(Math.min(maxByHeight, 100)), 100))
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [imageDimensions, selectedFrame])

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

        // Touch support
        const onTouchMove = (e: TouchEvent) => {
            if (!isDraggingSplit || !canvasRef.current) return
            const rect = canvasRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width))
            setSplitPos(x * 100)
        }
        const onTouchEnd = () => setIsDraggingSplit(false)

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        window.addEventListener("touchmove", onTouchMove)
        window.addEventListener("touchend", onTouchEnd)

        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
            window.removeEventListener("touchmove", onTouchMove)
            window.removeEventListener("touchend", onTouchEnd)
        }
    }, [isDraggingSplit])

    const processedCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!image) return
        const img = imageElementRef.current
        if (!img || !processedCanvasRef.current) return
        if (!adjustments.sepiaRemap) return

        const run = () => {
            if (!processedCanvasRef.current) return
            const result = applyCanvasFilter(img, adjustments)
            const ctx = processedCanvasRef.current.getContext("2d")
            if (!ctx) return
            processedCanvasRef.current.width = result.width
            processedCanvasRef.current.height = result.height
            ctx.drawImage(result, 0, 0)
        }

        if (img.complete && img.naturalWidth > 0) {
            run()
        } else {
            img.onload = run
        }
    }, [adjustments, image])

    const scrollCarousel = (dir: "left" | "right") => {
        if (!carouselRef.current) return
        carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
    }

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            })
            streamRef.current = stream
            setShowCamera(true)
            setTimeout(() => {
                if (videoRef.current) videoRef.current.srcObject = stream
            }, 100)
        } catch {
            // Camera not available — fall back to file picker
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.onchange = (ev) => {
                const file = (ev.target as HTMLInputElement).files?.[0]
                if (file) handleFile(file)
            }
            input.click()
        }
    }

    const capturePhoto = () => {
        const video = videoRef.current
        if (!video) return
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext("2d")!.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
            if (!blob) return
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
            handleFile(file)
            closeCamera()
        }, "image/jpeg", 0.95)
    }

    const closeCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setShowCamera(false)
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {fileName && (
                <div className="px-4 py-2 flex items-center justify-between border-b border-white/10">
                    <span className="text-xs text-white/50 truncate max-w-[70%]">{fileName}</span>
                    <div className="relative">
                        <button
                            className="text-white/30 hover:text-white/60 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o) }}
                        >
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>more_horiz</span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden z-50 w-48 shadow-2xl">
                                {/* Pick another photo */}
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:bg-white/5 transition-colors text-left"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setMenuOpen(false)
                                        // Create a fresh input to avoid any cached state
                                        const input = document.createElement("input")
                                        input.type = "file"
                                        input.accept = "image/*"
                                        input.onchange = (ev) => {
                                            const file = (ev.target as HTMLInputElement).files?.[0]
                                            if (file) handleFile(file)
                                        }
                                        input.click()
                                    }}
                                >
                                    <span className="material-icons text-white/40" style={{ fontSize: "1rem" }}>photo_library</span>
                                    Pick another photo
                                </button>
                                {/* Use camera */}
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:bg-white/5 transition-colors text-left"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setMenuOpen(false)
                                        openCamera()
                                    }}
                                >
                                    <span className="material-icons text-white/40" style={{ fontSize: "1rem" }}>photo_camera</span>
                                    Use camera
                                </button>

                                <div className="border-t border-white/5" />

                                {/* Remove photo */}
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400/70 hover:bg-white/5 transition-colors text-left"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setMenuOpen(false)
                                        setImage(null)
                                        setFileName("")
                                        setImageDimensions({ w: 0, h: 0 })
                                        imageElementRef.current = null
                                        if (fileInputRef.current) fileInputRef.current.value = ""
                                    }}
                                >
                                    <span className="material-icons text-red-400/40" style={{ fontSize: "1rem" }}>delete_outline</span>
                                    Remove photo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hidden camera input */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                    />
                </div>
            )}

            <div className="flex-1 flex items-center justify-center bg-black/60 overflow-hidden relative">
                {!image ? (
                    <div
                        className={`w-full h-full flex flex-col items-center justify-center gap-6 transition-all ${isDraggingOver ? "bg-white/5" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={onDrop}
                    >
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${isDraggingOver ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 bg-white/5"}`}>
                            <span className="material-icons text-white/40" style={{ fontSize: "1.8rem" }}>photo_camera</span>
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-medium text-white/60">Drop your image here</p>
                            <p className="text-xs text-white/25 mt-1">or choose an option below</p>
                        </div>

                        {/* Two buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-medium text-white/60 hover:text-white/90"
                            >
                                <span className="material-icons" style={{ fontSize: "1rem" }}>photo_library</span>
                                Browse photos
                            </button>

                            <button
                                onClick={openCamera}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-medium text-white/60 hover:text-white/90"
                            >
                                <span className="material-icons" style={{ fontSize: "1rem" }}>camera_alt</span>
                                Use camera
                            </button>
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
                        className="relative select-none"
                        style={{
                            width: `${Math.min(zoom, 100)}%`,
                            maxHeight: "100%",
                            aspectRatio: selectedFrame
                                ? "3/4"
                                : imageDimensions.w && imageDimensions.h
                                    ? `${imageDimensions.w}/${imageDimensions.h}`
                                    : "4/3",
                            cursor: isDraggingSplit ? "col-resize" : "default",
                            backgroundColor: selectedFrame ? "white" : "transparent",
                        }}
                    >
                        <div
                            className="absolute overflow-hidden"
                            style={selectedFrame ? {
                                top: "5%",
                                left: "5%",
                                right: "5%",
                                bottom: "18%",
                            } : {
                                top: 0, left: 0, right: 0, bottom: 0
                            }}
                        >
                            {/* Original */}
                            <img
                                src={image}
                                alt="original"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ opacity: selectedFrame ? 0 : 1 }}
                                draggable={false}
                            />

                            {/* Edited side */}
                            tsx
                            <div
                                data-edited-side
                                className="absolute inset-0 overflow-hidden pointer-events-none"
                                style={{ width: selectedFrame ? "100%" : `${splitPos}%` }}
                            >
                                {/* Black base — prevents bleed from original underneath */}
                                <div className="absolute inset-0 bg-black" style={{ zIndex: 0 }} />

                                {/* Inner isolation wrapper */}
                                <div className="absolute inset-0" style={{ isolation: "isolate", zIndex: 1 }}>

                                    {/* Regular filtered image */}
                                    {!adjustments.sepiaRemap && (
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
                                    )}

                                    {/* Processed canvas — shown only when pixel processing needed */}
                                    {adjustments.sepiaRemap && (
                                        <canvas
                                            ref={processedCanvasRef}
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                width: `${canvasWidth}px`,
                                                height: "100%",
                                                maxWidth: "none",
                                                objectFit: "cover",
                                                objectPosition: "left",
                                                display: adjustments.fisheye > 0 ? "none" : "block",
                                                filter: adjustments.blur > 0 ? `blur(${(adjustments.blur / 100) * 8}px)` : "none", // 👈 add this
                                            }}
                                        />
                                    )}

                                    {/* Fisheye canvas */}
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

                                    {/* Grain */}
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

                                    {/* Dust and scratches */}
                                    <canvas
                                        ref={dustCanvasRef}
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            width: `${canvasWidth}px`,
                                            maxWidth: "none",
                                            height: "100%",
                                            opacity: adjustments.dust > 0 ? (adjustments.dust / 100) * 0.8 : 0,
                                            mixBlendMode: "screen",
                                            imageRendering: "pixelated",
                                            transition: "opacity 0.2s",
                                        }}
                                    />

                                    {/* Date stamp */}
                                    {adjustments.dateStamp && (
                                        <canvas
                                            ref={dateStampRef}
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                width: `${canvasWidth}px`,
                                                maxWidth: "none",
                                                height: "100%",
                                            }}
                                        />
                                    )}

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

                                    {/* Light Leak */}
                                    {adjustments.lightLeakOpacity > 0 && (() => {
                                        const pos = adjustments.lightLeakPosition
                                        const gradientMap: Record<string, string> = {
                                            "top-right": `radial-gradient(ellipse at 100% 0%, ${adjustments.lightLeakColor} 0%, ${adjustments.lightLeakColor}88 25%, transparent 65%)`,
                                            "top-left": `radial-gradient(ellipse at 0% 0%, ${adjustments.lightLeakColor} 0%, ${adjustments.lightLeakColor}88 25%, transparent 65%)`,
                                            "bottom-right": `radial-gradient(ellipse at 100% 100%, ${adjustments.lightLeakColor} 0%, ${adjustments.lightLeakColor}88 25%, transparent 65%)`,
                                            "bottom-left": `radial-gradient(ellipse at 0% 100%, ${adjustments.lightLeakColor} 0%, ${adjustments.lightLeakColor}88 25%, transparent 65%)`,
                                            "center-left": `radial-gradient(ellipse at 0% 50%, ${adjustments.lightLeakColor} 0%, ${adjustments.lightLeakColor}88 30%, transparent 70%)`,
                                            "center-right": `radial-gradient(ellipse at 100% 50%, ${adjustments.lightLeakColor} 0%, ${adjustments.lightLeakColor}88 30%, transparent 70%)`,
                                            "horizontal": `linear-gradient(to bottom, transparent 20%, ${adjustments.lightLeakColor}99 45%, ${adjustments.lightLeakColor} 50%, ${adjustments.lightLeakColor}99 55%, transparent 80%)`,
                                        }
                                        return (
                                            <div
                                                className="absolute inset-0 pointer-events-none z-20"
                                                style={{
                                                    width: `${canvasWidth}px`,
                                                    maxWidth: "none",
                                                    background: gradientMap[pos] ?? gradientMap["top-right"],
                                                    opacity: adjustments.lightLeakOpacity / 100,
                                                    mixBlendMode: "screen",
                                                }}
                                            />
                                        )
                                    })()}

                                    {/* Rainbow light leak */}
                                    {adjustments.rainbowLeakOpacity > 0 && (() => {
                                        const w = adjustments.rainbowLeakWidth / 100  // 0.1 to 1.0
                                        const center = 50  // center point of streak
                                        const half = (w * 60) / 2  // half-width in percentage points

                                        return (
                                            <div
                                                className="absolute inset-0 pointer-events-none z-20"
                                                style={{
                                                    width: `${canvasWidth}px`,
                                                    maxWidth: "none",
                                                    background: `linear-gradient(
                                                        ${adjustments.rainbowLeakAngle}deg,
                                                        transparent 0%,
                                                        transparent ${center - half}%,
                                                        rgba(255,0,0,0.2) ${center - half + 2}%,
                                                        rgba(255,100,0,0.25) ${center - half * 0.7}%,
                                                        rgba(255,255,0,0.25) ${center - half * 0.3}%,
                                                        rgba(0,255,0,0.25) ${center}%,
                                                        rgba(0,200,255,0.25) ${center + half * 0.3}%,
                                                        rgba(0,0,255,0.2) ${center + half * 0.7}%,
                                                        rgba(150,0,255,0.2) ${center + half - 2}%,
                                                        transparent ${center + half}%,
                                                        transparent 100%
                                                    )`,
                                                    opacity: adjustments.rainbowLeakOpacity / 100,
                                                    mixBlendMode: "screen",
                                                }}
                                            />
                                        )
                                    })()}

                                    {/* Camcorder overlay */}
                                    {(adjustments as any).camcorderEffect && (
                                        <div
                                            className="absolute inset-0 pointer-events-none z-25"
                                            style={{ width: `${canvasWidth}px`, maxWidth: "none" }}
                                        >
                                            {/* Black bar top */}
                                            <div className="absolute top-0 left-0 right-0 bg-black" style={{ height: "8%" }} />

                                            {/* Black bar bottom */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: "4%" }} />

                                            {/* HUD text */}
                                            <div
                                                className="absolute top-0 left-0 right-0 flex items-center justify-between px-3"
                                                style={{
                                                    height: "8%",
                                                    fontFamily: "'Courier New', monospace",
                                                    fontSize: "clamp(8px, 1.5vw, 14px)",
                                                    color: "#00eeff",
                                                    fontWeight: "bold",
                                                    letterSpacing: "0.05em",
                                                    textShadow: "0 0 6px #00eeff",
                                                }}
                                            >
                                                <span>1/15</span>
                                                <span>3.3</span>
                                                <span>108-0019</span>
                                            </div>

                                            {/* Scanlines */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: `repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent 2px,
                    rgba(0,0,0,0.12) 2px,
                    rgba(0,0,0,0.12) 3px
                )`,
                                                }}
                                            />

                                            {/* Screen edge vignette */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)",
                                                }}
                                            />

                                            {/* Slight green tint on midtones — the LCD glow */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: "radial-gradient(ellipse at 50% 40%, rgba(0,255,100,0.06) 0%, transparent 70%)",
                                                    mixBlendMode: "screen",
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Vignette */}
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
                            </div>

                            {/* Split line */}
                            {!selectedFrame && (
                                <div
                                    ref={splitLineRef}
                                    data-split-line
                                    className="absolute top-0 bottom-0 w-px bg-white/80 z-10"
                                    style={{ left: `${splitPos}%` }}
                                >
                                    <div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center cursor-col-resize shadow-lg z-20"
                                        onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplit(true) }}
                                        onTouchStart={(e) => { e.preventDefault(); setIsDraggingSplit(true) }}
                                    >
                                        <span className="material-icons text-white" style={{ fontSize: "0.9rem" }}>unfold_more</span>
                                    </div>
                                </div>
                            )}

                        </div>

                        {selectedFrame && (
                            <img
                                src={selectedFrame}
                                alt="frame"
                                className="absolute inset-0 w-full h-full pointer-events-none z-40"
                                style={{ objectFit: "fill" }}
                                draggable={false}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Zoom toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-neutral-primary">
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(z => Math.max(10, z - 5))}
                        className="text-white/50 hover:text-white/90 transition-colors"
                    >
                        <span className="material-icons" style={{ fontSize: "1rem" }}>remove</span>
                    </button>
                    <input type="range" min={10} max={maxZoom} value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-50 accent-white cursor-pointer"
                    />
                    <button onClick={() => setZoom(z => Math.min(maxZoom, z + 5))}
                        className="text-white/50 hover:text-white/90 transition-colors"
                    >
                        <span className="material-icons" style={{ fontSize: "1rem" }}>add</span>
                    </button>
                    <span className="text-xs text-white/40 w-10 tabular-nums">{zoom}%</span>
                </div>
                {/* 
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
                */ }


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

            {/* Camera modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                        <button onClick={closeCamera} className="text-white/60 hover:text-white transition-colors">
                            <span className="material-icons">close</span>
                        </button>
                        <span className="text-xs text-white/50 tracking-widest uppercase">Camera</span>
                        <div className="w-8" />
                    </div>

                    {/* Video feed */}
                    <div className="flex-1 relative overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>

                    {/* Capture button */}
                    <div className="flex items-center justify-center py-8 bg-black/80">
                        <button
                            onClick={capturePhoto}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-full bg-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}