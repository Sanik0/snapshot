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
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(src, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = imageData.data

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] / 255
    let g = d[i + 1] / 255
    let b = d[i + 2] / 255

    // Step 1 — exposure
    const exp = Math.pow(2, adj.exposure / 100)
    r *= exp; g *= exp; b *= exp

    // Step 2 — convert to luminance (desaturate based on saturation value)
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
    const sMask = Math.max(0, 1 - lum2 * 2)        // strong in darks
    const hMask = Math.max(0, lum2 * 2 - 1)        // strong in lights
    r += (adj.shadows / 100) * sMask * 0.4
    g += (adj.shadows / 100) * sMask * 0.4
    b += (adj.shadows / 100) * sMask * 0.4
    r += (adj.highlight / 100) * hMask * 0.4
    g += (adj.highlight / 100) * hMask * 0.4
    b += (adj.highlight / 100) * hMask * 0.4

    // Step 5 — temperature (red/blue shift)
    r += adj.temperature / 100 * 0.15
    b -= adj.temperature / 100 * 0.15

    // Instead of overlaying sepia, we remap ALL pixels to warm brown tones
    // Even blacks become warm dark brown
    // Step 6 — SEPIA REMAP — only for presets that want it
    if (adj.sepiaRemap) {
      const sepiaMix = 0.95
      const newLuma = 0.299 * r + 0.587 * g + 0.114 * b
      const sr = newLuma * 1.1 + 0.08
      const sg = newLuma * 0.85
      const sb = newLuma * 0.55 + 0.02
      r = r * (1 - sepiaMix) + sr * sepiaMix
      g = g * (1 - sepiaMix) + sg * sepiaMix
      b = b * (1 - sepiaMix) + sb * sepiaMix
    }

    // Step 7 — fade (lift blacks)
    const fade = (adj.fade ?? 0) / 100 * 0.35
    r = r * (1 - fade) + fade
    g = g * (1 - fade) + fade
    b = b * (1 - fade) + fade

    // Clamp and write back
    d[i] = Math.min(255, Math.max(0, r * 255))
    d[i + 1] = Math.min(255, Math.max(0, g * 255))
    d[i + 2] = Math.min(255, Math.max(0, b * 255))
  }

  ctx.putImageData(imageData, 0, 0)
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
    id: "classic-m",
    name: "Classic M",
    image: "/presets/classic-m.jpg",
    adjustments: {
      temperature: 100, tint: 5, exposure: 11, contrast: 22,
      highlight: -20, shadows: 43, saturation: 47, grain: 100,
      sharpness: 60, blur: 0, fisheye: 0, fade: 0, hue: 0,
      lightLeakOpacity: 0,
      lightLeakColor: "#ff6600",
      lightLeakPosition: "top-right",
      dust: 0,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
    },
    filter: "contrast(1.2) saturate(0.7) brightness(0.85) sepia(0.15)",
  },
  {
    id: "kodak-400",
    name: "Kodak 400",
    image: "/presets/kodak-400.jpg",
    adjustments: {
      temperature: 20, tint: 5, exposure: 5, contrast: 10,
      highlight: -10, shadows: 20, saturation: 10, grain: 45,
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
    },
    filter: "contrast(1.1) saturate(1.1) brightness(1.05) sepia(0.1) hue-rotate(5deg)",
  },
  {
    id: "fuji-400h",
    name: "Fuji 400H",
    image: "/presets/fuji-400h.jpg",
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
    },
    filter: "contrast(0.95) saturate(0.9) brightness(1.1) hue-rotate(-5deg)",
  },
  {
    id: "portra-800",
    name: "Portra 800",
    image: "/presets/portra-800.jpg",
    adjustments: {
      temperature: 25, tint: 8, exposure: 8, contrast: 5,
      highlight: -25, shadows: 30, saturation: 5, grain: 70,
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
    },
    filter: "contrast(1.05) saturate(1.05) brightness(1.08) sepia(0.15) hue-rotate(8deg)",
  },
  {
    id: "cinestill",
    name: "CineStill",
    image: "/presets/cinestill.jpg",
    adjustments: {
      temperature: 30, tint: -5, exposure: 0, contrast: 15,
      highlight: -30, shadows: 10, saturation: 20, grain: 55,
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
    },
    filter: "contrast(1.15) saturate(1.2) brightness(1.0) sepia(0.2) hue-rotate(-10deg)",
  },
  {
    id: "ilford-hp5",
    name: "Ilford HP5",
    image: "/presets/ilford-hp5.jpg",
    adjustments: {
      temperature: 0, tint: 0, exposure: 0, contrast: 25,
      highlight: -10, shadows: 10, saturation: -100, grain: 75,
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
    },
    filter: "grayscale(1) contrast(1.25) brightness(0.95)",
  },
  {
    id: "lomochrome",
    name: "LomoChrome",
    image: "/presets/lomochrome.jpg",
    adjustments: {
      temperature: -15, tint: 20, exposure: -5, contrast: 30,
      highlight: -20, shadows: 5, saturation: -20, grain: 65,
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
    },
    filter: "saturate(0.75) hue-rotate(30deg) contrast(1.3) brightness(0.95)",
  },
  {
    id: "ektar-100",
    name: "Ektar 100",
    image: "/presets/ektar-100.jpg",
    adjustments: {
      temperature: 10, tint: 0, exposure: 5, contrast: 20,
      highlight: -5, shadows: 0, saturation: 40, grain: 20,
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
    },
    filter: "contrast(1.2) saturate(1.4) brightness(1.05) hue-rotate(5deg)",
  },
  {
    id: "superia-400",
    name: "Superia 400",
    image: "/presets/superia-400.jpg",
    adjustments: {
      temperature: 5, tint: -8, exposure: 5, contrast: 10,
      highlight: -10, shadows: 15, saturation: 0, grain: 40,
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
    },
    filter: "contrast(1.1) saturate(1.0) brightness(1.05) hue-rotate(-3deg)",
  },
  {
    id: "provia-100",
    name: "Provia 100",
    image: "/presets/provia-100.jpg",
    adjustments: {
      temperature: 0, tint: 0, exposure: 5, contrast: 15,
      highlight: -5, shadows: 5, saturation: 15, grain: 15,
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
    },
    filter: "contrast(1.15) saturate(1.15) brightness(1.05)",
  },
  {
    id: "overexposed-leak",
    name: "Burned",
    image: "/presets/overexposed-leak.jpg",
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
    },
    filter: "brightness(1.4) contrast(0.8) saturate(0.7) sepia(0.2)",
  },
  {
    id: "polaroid",
    name: "Polaroid",
    image: "/presets/polaroid.jpg",
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
      blur: 8,
      fisheye: 0,
      fade: 35,
      hue: 5,
      lightLeakOpacity: 70,
      lightLeakColor: "#ffaa33",
      lightLeakPosition: "center-left",
      dust: 72,
      dateStamp: false,
      dateStampColor: "#ff8800",
      shadowTintColor: "#000000",
      highlightTintColor: "#000000",
      sepiaRemap: false,
    },
    filter: "brightness(1.15) contrast(0.85) saturate(0.8) sepia(0.25) hue-rotate(5deg)",
  },
  {
    id: "polaroid-cool",
    name: "Polaroid X",
    image: "/presets/polaroid-cool.jpg",
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
      blur: 8,
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
    },
    filter: "brightness(0.90) contrast(0.70) saturate(0.25) sepia(0.2) hue-rotate(-25deg)",
  },
  {
    id: "golden-sepia",
    name: "Golden Hour",
    image: "/presets/golden-sepia.jpg",
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
    },
    filter: "brightness(1.05) contrast(1.3) saturate(0.1) sepia(1) hue-rotate(8deg)",
  },
]