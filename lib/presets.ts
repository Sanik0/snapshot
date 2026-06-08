export type Preset = {
  id: string
  name: string
  image: string
  adjustments: {
    temperature: number
    tint: number
    exposure: number
    contrast: number
    highlight: number
    shadows: number
    saturation: number
    grain: number
    // New fields
    sharpness: number
    blur: number
    fisheye: number
    fade: number
    hue: number
    lightLeakOpacity: number
    lightLeakColor: string
    lightLeakPosition: string
    dust: number
    dateStamp: boolean
    dateStampColor: string
    shadowTintColor: string
    highlightTintColor: string
    sepiaRemap: boolean
    crtEffect: boolean
    rainbowLeakOpacity: number
    rainbowLeakAngle: number
    rainbowLeakWidth: number
    camcorderEffect: boolean
    cctvRemap: boolean
  }
  filter: string
}

export function applyCanvasFilter(
  src: HTMLImageElement,
  adj: Preset["adjustments"]
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = src.naturalWidth
  canvas.height = src.naturalHeight
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(src, 0, 0)

  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] / 255
    let g = d[i + 1] / 255
    let b = d[i + 2] / 255

    // Step 1 — exposure
    const exp = Math.pow(2, adj.exposure / 100)
    r *= exp; g *= exp; b *= exp

    // Step 2 — saturation
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    const sat = Math.max(0, 1 + adj.saturation / 100)
    r = luma + (r - luma) * sat
    g = luma + (g - luma) * sat
    b = luma + (b - luma) * sat

    // Step 3 — contrast
    const con = 1 + adj.contrast / 100
    r = (r - 0.5) * con + 0.5
    g = (g - 0.5) * con + 0.5
    b = (b - 0.5) * con + 0.5

    // Step 4 — shadows/highlights
    const lum2 = 0.299 * r + 0.587 * g + 0.114 * b
    const sMask = Math.max(0, 1 - lum2 * 2)
    const hMask = Math.max(0, lum2 * 2 - 1)
    r += (adj.shadows / 100) * sMask * 0.4
    g += (adj.shadows / 100) * sMask * 0.4
    b += (adj.shadows / 100) * sMask * 0.4
    r += (adj.highlight / 100) * hMask * 0.4
    g += (adj.highlight / 100) * hMask * 0.4
    b += (adj.highlight / 100) * hMask * 0.4

    // Step 5 — temperature
    r += adj.temperature / 100 * 0.15
    b -= adj.temperature / 100 * 0.15

    // Step 6 — color remap
    if (adj.sepiaRemap && !(adj as any).crtEffect) {
      const newLuma = 0.299 * r + 0.587 * g + 0.114 * b

      if (adj.cctvRemap) {
        // CCTV — cool grey with slight purple-blue cast
        const mix = 0.93
        const sr = newLuma * 0.90
        const sg = newLuma * 0.88
        const sb = newLuma * 1.05
        r = r * (1 - mix) + sr * mix
        g = g * (1 - mix) + sg * mix
        b = b * (1 - mix) + sb * mix

      } else if (adj.temperature < 0) {
        // Cyan/green remap — Y2K gel
        const mix = 0.92
        const sr = newLuma * 0.55 + 0.02
        const sg = newLuma * 1.1 + 0.05
        const sb = newLuma * 1.0 + 0.08
        r = r * (1 - mix) + sr * mix
        g = g * (1 - mix) + sg * mix
        b = b * (1 - mix) + sb * mix

      } else if (adj.hue < -15) {
        // Olive/green-gold remap
        const mix = 0.65
        const shadowStrength = Math.max(0, 1 - newLuma * 2)
        const highlightStrength = Math.max(0, newLuma * 2 - 1)
        const sr = newLuma * 0.85 + highlightStrength * 0.15
        const sg = newLuma * 0.90 + shadowStrength * 0.04
        const sb = newLuma * 0.60 - shadowStrength * 0.02
        r = r * (1 - mix) + sr * mix
        g = g * (1 - mix) + sg * mix
        b = b * (1 - mix) + sb * mix

      } else {
        // Warm sepia remap — golden hour, amber gel, vintage
        const mix = 0.95
        const sr = newLuma * 1.1 + 0.08
        const sg = newLuma * 0.85
        const sb = newLuma * 0.55 + 0.02
        r = r * (1 - mix) + sr * mix
        g = g * (1 - mix) + sg * mix
        b = b * (1 - mix) + sb * mix
      }
    }

    // Step 7 — fade
    const fade = (adj.fade ?? 0) / 100 * 0.35
    r = r * (1 - fade) + fade
    g = g * (1 - fade) + fade
    b = b * (1 - fade) + fade

    // Clamp and write back
    d[i] = Math.min(255, Math.max(0, r * 255))
    d[i + 1] = Math.min(255, Math.max(0, g * 255))
    d[i + 2] = Math.min(255, Math.max(0, b * 255))
    d[i + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)

  // Step 8 — CRT effect (after pixel loop, uses canvas drawing API)
  if ((adj as any).crtEffect) {
    // Green phosphor pass — read current pixels and remap to green
    const crtData = ctx.getImageData(0, 0, w, h)
    const cd = crtData.data
    for (let i = 0; i < cd.length; i += 4) {
      const brightness = (cd[i] * 0.299 + cd[i + 1] * 0.587 + cd[i + 2] * 0.114) / 255
      cd[i] = Math.min(255, brightness * 20)
      cd[i + 1] = Math.min(255, brightness * 255)
      cd[i + 2] = Math.min(255, brightness * 60)
    }
    ctx.putImageData(crtData, 0, 0)

    // Scanlines
    for (let y = 0; y < h; y++) {
      if (y % 3 === 2) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.fillRect(0, y, w, 1)
      }
    }

    // Vertical pixel separation
    for (let x = 0; x < w; x++) {
      if (x % 3 === 2) {
        ctx.fillStyle = "rgba(0,0,0,0.3)"
        ctx.fillRect(x, 0, 1, h)
      }
    }

    // Green glow bloom
    const glowCanvas = document.createElement("canvas")
    glowCanvas.width = w
    glowCanvas.height = h
    const glowCtx = glowCanvas.getContext("2d")!
    glowCtx.filter = "blur(8px)"
    glowCtx.drawImage(canvas, 0, 0)
    ctx.globalCompositeOperation = "screen"
    ctx.globalAlpha = 0.4
    ctx.drawImage(glowCanvas, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = "source-over"
  }

  return canvas
}

export function buildFilter(adj: Preset["adjustments"] & { vignette?: number }): string {
  const brightness = 1 + adj.exposure / 100
  const contrast = 1 + adj.contrast / 100
  const saturate = Math.max(0, 1 + adj.saturation / 100)
  const sepia = adj.temperature > 0 ? adj.temperature / 400 : 0
  const hueRotate = (adj.tint * 0.5) + (adj.hue ?? 0) * 1.8
  const highlightBrightness = 1 + (adj.highlight / 100) * 0.4
  const shadowContrast = 1 + (adj.shadows / 100) * 0.3
  const shadowBrightness = 1 + (adj.shadows / 100) * 0.2
  const blur = (adj.blur ?? 0) > 0 ? `blur(${((adj.blur ?? 0) / 100) * 8}px)` : ""
  const fade = (adj.fade ?? 0) > 0 ? `opacity(${1 - ((adj.fade ?? 0) / 100) * 0.4})` : ""

  // Temperature — negative = cool/teal, positive = warm
  const tempHue = adj.temperature < 0 ? `hue-rotate(${adj.temperature * 0.3}deg)` : ""
  const tempSaturate = adj.temperature < 0 ? `saturate(${Math.max(0.3, 1 + adj.temperature / 150)})` : ""

  return [
    `brightness(${(brightness * highlightBrightness * shadowBrightness).toFixed(3)})`,
    `contrast(${(contrast * shadowContrast).toFixed(3)})`,
    `saturate(${saturate.toFixed(3)})`,
    sepia > 0 ? `sepia(${Math.min(1, sepia).toFixed(3)})` : "",
    `hue-rotate(${hueRotate.toFixed(1)}deg)`,
    tempSaturate,
    blur,
    fade,
  ].filter(Boolean).join(" ")
}
export const FILM_PRESETS: Preset[] = [
  {
    id: "polaroid",
    name: "Polar",
    image: "/cameras/polaroid.png",
    adjustments: {
      temperature: 25,
      tint: 8,
      exposure: 15,
      contrast: -15,
      highlight: 30,
      shadows: 25,
      saturation: -20,
      grain: 55,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 35,
      hue: 5,
      lightLeakOpacity: 45,
      lightLeakColor: "#ffaa33",
      lightLeakPosition: "center-left",
      dust: 72,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.15) contrast(0.85) saturate(0.8) sepia(0.25) hue-rotate(5deg)",
  },
  {
    id: "fuji-400h",
    name: " Fj Light",
    image: "/cameras/yellowfuji.png",
    adjustments: {
      temperature: -5, tint: -10, exposure: 10, contrast: -10,
      highlight: -15, shadows: 25, saturation: -10, grain: 35,
      sharpness: 0, blur: 0, fisheye: 0, fade: 0, hue: 0,
      lightLeakOpacity: 0,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "top-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "contrast(0.95) saturate(0.9) brightness(1.1) hue-rotate(-5deg)",
  },
  {
    id: "fisheye-y2k",
    name: "Fish Y2K",
    image: "/cameras/fisheye.png",
    adjustments: {
      temperature: 20,
      tint: -5,
      exposure: 10,
      contrast: -8,
      highlight: 15,
      shadows: 25,
      saturation: 35,
      grain: 40,
      sharpness: 0,
      blur: 3,
      fisheye: 45,
      fade: 18,
      hue: 5,
      lightLeakOpacity: 10,
      lightLeakColor: "#ff8800",
      lightLeakPosition: "top-right",
      dust: 12,
      dateStamp: true,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.1) contrast(0.92) saturate(1.35) hue-rotate(5deg)",
  },
  {
    id: "overexposed-leak",
    name: "Red Leak",
    image: "/cameras/compact.png",
    adjustments: {
      temperature: 30,
      tint: -5,
      exposure: 40,
      contrast: -20,
      highlight: 20,
      shadows: 30,
      saturation: -30,
      grain: 25,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 45,
      hue: 0,
      lightLeakOpacity: 85,
      lightLeakColor: "#ff4422",
      lightLeakPosition: "center-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.4) contrast(0.8) saturate(0.7) sepia(0.2)",
  },
  {
    id: "camcorder",
    name: "Camcorder",
    image: "/cameras/camcorder.png",
    adjustments: {
      temperature: 25,
      tint: -8,
      exposure: 8,
      contrast: 20,
      highlight: 25,
      shadows: -15,
      saturation: 35,
      grain: 45,
      sharpness: 0,
      blur: 2,
      fisheye: 0,
      fade: 5,
      hue: 5,
      lightLeakOpacity: 0,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "top-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: true,
      cctvRemap: false,
    },
    filter: "brightness(1.08) contrast(1.2) saturate(1.35) hue-rotate(5deg)",
  },
  {
    id: "polaroid-cool",
    name: "Cool Fade",
    image: "/cameras/fade.png",
    adjustments: {
      temperature: -55,
      tint: -15,
      exposure: -8,
      contrast: -30,
      highlight: -15,
      shadows: 30,
      saturation: -75,
      grain: 30,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 50,
      hue: -25,
      lightLeakOpacity: 22,
      lightLeakColor: "#ffe599",
      lightLeakPosition: "top-right",
      dust: 20,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(0.90) contrast(0.70) saturate(0.25) sepia(0.2) hue-rotate(-25deg)",
  },
  {
    id: "golden-sepia",
    name: "Gldn Hr",
    image: "/cameras/goldenhour.png",
    adjustments: {
      temperature: 80,
      tint: 10,
      exposure: 8,
      contrast: 30,
      highlight: 20,
      shadows: 50,
      saturation: -90,
      grain: 70,
      sharpness: 0,
      blur: 5,
      fisheye: 0,
      fade: 5,
      hue: 15,
      lightLeakOpacity: 35,
      lightLeakColor: "#cc8833",
      lightLeakPosition: "center-right",
      dust: 60,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.05) contrast(1.3) saturate(0.1) sepia(1) hue-rotate(8deg)",
  },
  {
    id: "green-gel",
    name: "Blue Gel",
    image: "/cameras/kodaky2k.png",
    adjustments: {
      temperature: -30,
      tint: -20,
      exposure: -5,
      contrast: 20,
      highlight: -10,
      shadows: -15,
      saturation: -20,
      grain: 45,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 5,
      hue: 0,
      lightLeakOpacity: 40,
      lightLeakColor: "#ffffff",
      lightLeakPosition: "center-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,

    },
    filter: "none",
  },
  {
    id: "y2k-vivid",
    name: "Y2K Vivid",
    image: "/cameras/cany2k.png",
    adjustments: {
      temperature: 15,
      tint: 5,
      exposure: 12,
      contrast: -10,
      highlight: 10,
      shadows: 25,
      saturation: 40,
      grain: 30,
      sharpness: 0,
      blur: 2,
      fisheye: 0,
      fade: 20,
      hue: 5,
      lightLeakOpacity: 20,
      lightLeakColor: "#ffccff",
      lightLeakPosition: "top-right",
      dust: 8,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.12) contrast(0.9) saturate(1.4) hue-rotate(5deg)",
  },
  {
    id: "ilford-hp5",
    name: "Ilford HP5",
    image: "/cameras/hp5.png",
    adjustments: {
      temperature: 0, tint: 0, exposure: 0, contrast: 25,
      highlight: -10, shadows: 10, saturation: -100, grain: 75,
      sharpness: 0, blur: 0, fisheye: 0, fade: 0, hue: 0,
      lightLeakOpacity: 0,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "top-right",
      dust: 82,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "grayscale(1) contrast(1.25) brightness(0.95)",
  },
  {
    id: "digicam",
    name: "Digi Cam",
    image: "/cameras/digicam.png",
    adjustments: {
      temperature: 35,
      tint: 5,
      exposure: 5,
      contrast: 25,
      highlight: 15,
      shadows: -20,
      saturation: 20,
      grain: 70,
      sharpness: 0,
      blur: 3,
      fisheye: 0,
      fade: 8,
      hue: 8,
      lightLeakOpacity: 0,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "top-right",
      dust: 5,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.05) contrast(1.25) saturate(1.2) sepia(0.15) hue-rotate(8deg)",
  },
  {
    id: "olive-film",
    name: "Olive Film",
    image: "/cameras/leica.png",
    adjustments: {
      temperature: 20,
      tint: -15,
      exposure: -8,
      contrast: 15,
      highlight: -20,
      shadows: -25,
      saturation: -30,
      grain: 50,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 15,
      hue: -25,
      lightLeakOpacity: 25,
      lightLeakColor: "#ffe066",
      lightLeakPosition: "top-right",
      dust: 15,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "none",
  },
  {
    id: "crt-phosphor",
    name: "CRT",
    image: "/cameras/crt.png",
    adjustments: {
      temperature: -20,
      tint: -30,
      exposure: -10,
      contrast: 40,
      highlight: 20,
      shadows: -30,
      saturation: -100,
      grain: 20,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 0,
      hue: 0,
      lightLeakOpacity: 0,
      lightLeakColor: "#00ff44",
      lightLeakPosition: "center-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: true,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "none",
  },
  {
    id: "vintage-light",
    name: "Vintage",
    image: "/cameras/instamatix.png",
    adjustments: {
      temperature: 30,
      tint: 5,
      exposure: 8,
      contrast: -5,
      highlight: -10,
      shadows: 30,
      saturation: -45,
      grain: 40,
      sharpness: 0,
      blur: 3,
      fisheye: 0,
      fade: 35,
      hue: 10,
      lightLeakOpacity: 15,
      lightLeakColor: "#ffe0aa",
      lightLeakPosition: "top-right",
      dust: 80,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "none",
  },
  {
    id: "cross-process",
    name: "Cross Process",
    image: "/cameras/crossprocessed.png",
    adjustments: {
      temperature: -15,
      tint: 20,
      exposure: 8,
      contrast: 40,
      highlight: 25,
      shadows: -35,
      saturation: 50,
      grain: 45,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 5,
      hue: 15,
      lightLeakOpacity: 20,
      lightLeakColor: "#ff2200",
      lightLeakPosition: "bottom-left",
      dust: 15,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 55,
      rainbowLeakAngle: 145,
      rainbowLeakWidth: 25,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(1.08) contrast(1.4) saturate(1.5) hue-rotate(15deg)",
  },
  {
    id: "tungsten-slide",
    name: "Tungsten",
    image: "/cameras/nikonf3.png",
    adjustments: {
      temperature: 55,
      tint: 15,
      exposure: -5,
      contrast: 20,
      highlight: -15,
      shadows: -10,
      saturation: 15,
      grain: 35,
      sharpness: 0,
      blur: 2,
      fisheye: 0,
      fade: 8,
      hue: 20,
      lightLeakOpacity: 25,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "bottom-left",
      dust: 12,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "none",
  },
  {
    id: "expired-film",
    name: "Expired",
    image: "/cameras/sureshot.png",
    adjustments: {
      temperature: 25,
      tint: -12,
      exposure: 15,
      contrast: -20,
      highlight: 20,
      shadows: 35,
      saturation: -35,
      grain: 80,
      sharpness: 0,
      blur: 4,
      fisheye: 0,
      fade: 45,
      hue: -15,
      lightLeakOpacity: 35,
      lightLeakColor: "#ff4400",
      lightLeakPosition: "top-left",
      dust: 40,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 20,
      rainbowLeakAngle: 110,
      rainbowLeakWidth: 15,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "none",
  },
  {
    id: "lomo-lca",
    name: "Lomo LC-A",
    image: "/cameras/lomo.png",
    adjustments: {
      temperature: 10,
      tint: -8,
      exposure: -12,
      contrast: 35,
      highlight: -10,
      shadows: -30,
      saturation: 45,
      grain: 55,
      sharpness: 0,
      blur: 0,
      fisheye: 0,
      fade: 0,
      hue: -8,
      lightLeakOpacity: 40,
      lightLeakColor: "#ff3300",
      lightLeakPosition: "top-left",
      dust: 20,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
      crtEffect: false,
      rainbowLeakOpacity: 30,
      rainbowLeakAngle: 160,
      rainbowLeakWidth: 20,
      camcorderEffect: false,
      cctvRemap: false,
    },
    filter: "brightness(0.88) contrast(1.35) saturate(1.45) hue-rotate(-8deg)",
  },
  {
    id: "cctv",
    name: "CCTV",
    image: "/cameras/cctv.png",
    adjustments: {
      temperature: -10,
      tint: -5,
      exposure: -5,
      contrast: 35,
      highlight: 25,
      shadows: -30,
      saturation: -85,
      grain: 85,
      sharpness: 0,
      blur: 3,
      fisheye: 0,
      fade: 5,
      hue: 10,
      lightLeakOpacity: 0,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "top-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ffffff",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: true,
      crtEffect: false,
      rainbowLeakOpacity: 0,
      rainbowLeakAngle: 135,
      rainbowLeakWidth: 40,
      camcorderEffect: true,
      cctvRemap: true,
    },
    filter: "none",
  },
]