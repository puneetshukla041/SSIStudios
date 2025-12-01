'use client'

import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Maximize2,
  Minus,
  Move,
  MousePointer2,
  Plus,
  RotateCcw,
  Settings,
  Square,
  Trash2,
  Type,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Palette,
  Eye,
  Scan,
  MoreHorizontal,
  ChevronDown,
  BoxSelect,
  Monitor
} from 'lucide-react'

// --- HELPER FUNCTIONS & ALGORITHMS ---

/**
 * Draws a rounded rectangle path.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Clips the canvas context to a rounded rectangle shape.
 */
function clipRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  drawRoundedRect(ctx, x, y, width, height, radius)
  ctx.clip()
}

/**
 * Fills a rounded rectangle.
 */
function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string
) {
  ctx.fillStyle = color
  drawRoundedRect(ctx, x, y, width, height, radius)
  ctx.fill()
}

/**
 * Strokes a rounded rectangle (Border).
 */
function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  lineWidth: number,
  color: string
) {
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  drawRoundedRect(ctx, x, y, width, height, radius)
  ctx.stroke()
}

// --- DPI WRITERS (METADATA INJECTION) ---

const crc32Table = new Int32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
  crc32Table[i] = c
}

function crc32(bytes: Uint8Array) {
  let c = -1
  for (let i = 0; i < bytes.length; i++) c = (c >>> 8) ^ crc32Table[(c ^ bytes[i]) & 0xFF]
  return (c ^ -1) >>> 0
}

function writeUInt32BE(buf: Uint8Array, offset: number, value: number) {
  buf[offset] = (value >>> 24) & 0xFF
  buf[offset + 1] = (value >>> 16) & 0xFF
  buf[offset + 2] = (value >>> 8) & 0xFF
  buf[offset + 3] = value & 0xFF
}

function setPngDpi(dataUrl: string, dpi: number) {
  if (!dataUrl.startsWith('data:image/png;base64,')) return dataUrl
  const base64 = dataUrl.split(',')[1]
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)

  const ppm = Math.round(dpi / 0.0254)
  const pHYsData = new Uint8Array(9)
  writeUInt32BE(pHYsData, 0, ppm)
  writeUInt32BE(pHYsData, 4, ppm)
  pHYsData[8] = 1 // Unit specifier: meter

  const type = new Uint8Array([112, 72, 89, 115]) // 'pHYs'
  const data = new Uint8Array(type.length + pHYsData.length)
  data.set(type, 0)
  data.set(pHYsData, type.length)
  
  const crc = crc32(data)
  const chunk = new Uint8Array(4 + 4 + 9 + 4)
  writeUInt32BE(chunk, 0, 9)
  chunk.set(type, 4)
  chunk.set(pHYsData, 8)
  writeUInt32BE(chunk, 17, crc)

  // Find insertion point (after IHDR)
  let pos = 8 // Skip signature
  while (pos < bytes.length) {
    const len = (bytes[pos] << 24) | (bytes[pos+1] << 16) | (bytes[pos+2] << 8) | bytes[pos+3]
    const chunkType = String.fromCharCode(bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7])
    if (chunkType === 'IHDR') {
      pos += 12 + len
      break
    }
    pos += 12 + len
  }

  const newBytes = new Uint8Array(bytes.length + chunk.length)
  newBytes.set(bytes.subarray(0, pos), 0)
  newBytes.set(chunk, pos)
  newBytes.set(bytes.subarray(pos), pos + chunk.length)

  let binary = ''
  const len = newBytes.byteLength
  for (let i = 0; i < len; i++) binary += String.fromCharCode(newBytes[i])
  return 'data:image/png;base64,' + btoa(binary)
}

function setJpegDpi(dataUrl: string, dpi: number) {
  if (!dataUrl.startsWith('data:image/jpeg;base64,')) return dataUrl
  const base64 = dataUrl.split(',')[1]
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)

  // Verify JFIF
  if (bytes[2] !== 0xFF || bytes[3] !== 0xE0) return dataUrl // No APP0
  
  // Set density units to pixels per inch (1)
  bytes[13] = 1
  // Set X density
  bytes[14] = (dpi >> 8) & 0xFF
  bytes[15] = dpi & 0xFF
  // Set Y density
  bytes[16] = (dpi >> 8) & 0xFF
  bytes[17] = dpi & 0xFF

  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return 'data:image/jpeg;base64,' + btoa(binary)
}

// --- TYPES & CONSTANTS ---

type BlendMode = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'soft-light' | 'difference' | 'luminosity'
type ExportFormat = 'png' | 'jpeg'

interface LogoLayer {
  id: string
  file: File | null
  imageSrc: string
  imageElement: HTMLImageElement | null
  x: number // Horizontal Offset % (-50 to 50)
  y: number // Vertical Offset % (-50 to 50)
  scale: number // Zoom % (10-200)
  opacity: number // % (0-100)
  rotation: number // degrees
  blendMode: BlendMode
  
  // Styling
  radius: number // px
  borderWidth: number // px
  borderColor: string
  
  // Plate (Background container)
  plateType: 'none' | 'white' | 'glass'
  platePaddingX: number
  platePaddingY: number
  plateRadius: number
}

const BLEND_MODES: BlendMode[] = [
  'source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'soft-light', 'difference', 'luminosity'
]

const RESOLUTIONS = [
  { name: 'Original', width: 0, height: 0 },
  { name: 'Social Square (1080x1080)', width: 1080, height: 1080 },
  { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
  { name: '4K UHD (3840x2160)', width: 3840, height: 2160 },
  { name: 'Print A4 (300 DPI)', width: 2480, height: 3508 },
]

// --- COMPONENTS ---

// 1. Smooth Slider Component
const SmoothSlider = ({ 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  label, 
  unit = '' 
}: { 
  value: number, 
  min: number, 
  max: number, 
  step?: number, 
  onChange: (val: number) => void, 
  label: string, 
  unit?: string 
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value)
    requestAnimationFrame(() => onChange(newVal))
  }

  // Calculate percentage for background gradient
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2 mb-4 group">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] font-medium text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 min-w-[32px] text-center">{value}{unit}</span>
      </div>
      <div className="relative h-4 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute z-10 w-full h-1.5 opacity-0 cursor-pointer"
        />
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden relative">
           <div 
             className="h-full bg-indigo-500 rounded-full transition-all duration-75 ease-out"
             style={{ width: `${percentage}%` }}
           />
        </div>
        <div 
            className="absolute h-3 w-3 bg-white border border-slate-300 shadow-sm rounded-full pointer-events-none transition-all duration-75 ease-out group-hover:scale-110 group-hover:border-indigo-400 group-active:scale-95"
            style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  )
}

// 2. Color Picker
const ColorPicker = ({ color, onChange, label }: { color: string, onChange: (c: string) => void, label: string }) => (
  <div className="flex items-center justify-between mb-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-400 font-mono uppercase">{color}</span>
      <div className="relative w-6 h-6 rounded-md border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-transform">
        <input 
          type="color" 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-none opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  </div>
)

// --- MAIN APPLICATION ---

export default function ProPosterEditor() {
  // --- STATE ---
  // Updated: Mapped user local path to web-safe public path
  const [baseImageSrc, setBaseImageSrc] = useState('/posters/poster1.jpg') 
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null)
  
  const [logos, setLogos] = useState<LogoLayer[]>([])
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null)
  
  // UI State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportSettings, setExportSettings] = useState({
    format: 'jpeg' as ExportFormat,
    resolutionIdx: 0,
    quality: 0.9,
    dpi: 300
  })
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [zoomLevel, setZoomLevel] = useState(80) 

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const baseInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // --- LOGIC: INITIALIZATION ---
  
  useEffect(() => {
    // Load Base Image
    if (!baseImageSrc) return;

    const img = new Image()
    img.src = baseImageSrc
    img.crossOrigin = 'anonymous'
    img.onload = () => setBaseImage(img)
    img.onerror = () => {
      console.error("Could not load base poster. Checked path: /posters/poster1.jpg")
    }
  }, [baseImageSrc])

  // --- LOGIC: CANVAS RENDERING ---

  const drawCanvas = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    renderForExport = false
  ) => {
    ctx.clearRect(0, 0, width, height)

    // 1. Draw Base
    if (baseImage) {
      const imgRatio = baseImage.width / baseImage.height
      const canvasRatio = width / height
      let dw = width
      let dh = height
      let dx = 0
      let dy = 0

      if (imgRatio > canvasRatio) {
        dw = height * imgRatio
        dx = (width - dw) / 2
      } else {
        dh = width / imgRatio
        dy = (height - dh) / 2
      }
      ctx.drawImage(baseImage, dx, dy, dw, dh)
    } else {
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0,0, width, height)
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0,0); ctx.lineTo(width, height);
      ctx.moveTo(width, 0); ctx.lineTo(0, height);
      ctx.stroke()
    }

    // --- LOGO POSITIONING ---
    const containerConfig = { top: 0.62, bottom: 0.76, hPadding: 0.35 }
    
    const containerY = height * containerConfig.top
    const containerHeight = height * (containerConfig.bottom - containerConfig.top)
    const containerX = width * containerConfig.hPadding
    const containerWidth = width * (1 - 2 * containerConfig.hPadding)

    // Debugging container rect (Optional, for dev only)
    // if (!renderForExport) {
    //   ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
    //   ctx.strokeRect(containerX, containerY, containerWidth, containerHeight);
    // }

    // 2. Draw Logos
    logos.forEach(logo => {
      if (!logo.imageElement) return
      
      const { 
        x, y, scale, opacity, rotation, 
        radius, borderWidth, borderColor, blendMode,
        plateType, platePaddingX, platePaddingY, plateRadius
      } = logo

      const imgW = logo.imageElement.width
      const imgH = logo.imageElement.height
      
      const scaleFactorToFitContainer = Math.min(
        containerWidth / imgW,
        containerHeight / imgH
      )
      
      const finalLogoWidth = imgW * scaleFactorToFitContainer * (scale / 100)
      const finalLogoHeight = imgH * scaleFactorToFitContainer * (scale / 100)

      let posX = containerX + (containerWidth - finalLogoWidth) / 2
      let posY = containerY + (containerHeight - finalLogoHeight) / 2
      
      posX += (x / 100) * containerWidth
      posY += (y / 100) * containerHeight

      ctx.save()
      ctx.translate(posX + finalLogoWidth/2, posY + finalLogoHeight/2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-(posX + finalLogoWidth/2), -(posY + finalLogoHeight/2))
      
      ctx.globalAlpha = opacity / 100
      ctx.globalCompositeOperation = blendMode

      // 2a. Draw Plate
      if (plateType !== 'none') {
        const hPadding = finalLogoWidth * (platePaddingX / 100)
        const vPadding = finalLogoHeight * (platePaddingY / 100)
        const plateW = finalLogoWidth + hPadding * 2
        const plateH = finalLogoHeight + vPadding * 2
        const plateX = posX - hPadding
        const plateY = posY - vPadding
        
        ctx.shadowColor = 'rgba(0,0,0,0.1)'
        ctx.shadowBlur = 12
        ctx.shadowOffsetY = 6

        if (plateType === 'white') {
          fillRoundedRect(ctx, plateX, plateY, plateW, plateH, plateRadius, '#ffffff')
        }
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0
      }

      // 2b. Draw Image
      const dX = posX
      const dY = posY

      if (radius > 0) {
        ctx.save()
        clipRoundedRect(ctx, dX, dY, finalLogoWidth, finalLogoHeight, radius)
        ctx.drawImage(logo.imageElement, dX, dY, finalLogoWidth, finalLogoHeight)
        ctx.restore()
      } else {
        ctx.drawImage(logo.imageElement, dX, dY, finalLogoWidth, finalLogoHeight)
      }

      // 2c. Draw Border
      if (borderWidth > 0) {
        strokeRoundedRect(ctx, dX, dY, finalLogoWidth, finalLogoHeight, radius, borderWidth, borderColor)
      }
      
      // 2d. Draw Selection Indicator
      if (!renderForExport && logo.id === selectedLogoId) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = '#6366f1' // Indigo 500
        ctx.lineWidth = 2
        const pad = 6
        
        // Bounding box for selection
        const selX = (plateType !== 'none' ? posX - (finalLogoWidth * (platePaddingX/100)) : dX) - pad
        const selY = (plateType !== 'none' ? posY - (finalLogoHeight * (platePaddingY/100)) : dY) - pad
        const selW = (plateType !== 'none' ? finalLogoWidth + (finalLogoWidth * (platePaddingX/100) * 2) : finalLogoWidth) + pad*2
        const selH = (plateType !== 'none' ? finalLogoHeight + (finalLogoHeight * (platePaddingY/100) * 2) : finalLogoHeight) + pad*2
        
        ctx.setLineDash([6, 4])
        ctx.strokeRect(selX, selY, selW, selH)
        ctx.setLineDash([])
        
        // Corner handles
        ctx.fillStyle = '#fff'
        const handleSize = 10
        const halfHandle = handleSize / 2
        
        // Four corners
        const corners = [
            [selX, selY], [selX + selW, selY], [selX, selY + selH], [selX + selW, selY + selH]
        ]

        corners.forEach(([cx, cy]) => {
             ctx.fillRect(cx - halfHandle, cy - halfHandle, handleSize, handleSize)
             ctx.strokeRect(cx - halfHandle, cy - halfHandle, handleSize, handleSize)
        })
      }

      ctx.restore()
    })

  }, [baseImage, logos, selectedLogoId])

  // --- LOGIC: EVENTS ---

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !baseImage) return
    
    const internalW = 1920
    const internalH = 1080
    
    canvas.width = internalW
    canvas.height = internalH
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      drawCanvas(ctx, internalW, internalH)
    }
  }, [drawCanvas, baseImage])

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    img.onload = () => {
      const newLogo: LogoLayer = {
        id: crypto.randomUUID(),
        file,
        imageSrc: url,
        imageElement: img,
        x: 0, 
        y: 0, 
        scale: 100, 
        opacity: 100,
        rotation: 0,
        blendMode: 'source-over',
        radius: 0,
        borderWidth: 0,
        borderColor: '#ffffff',
        plateType: 'none',
        platePaddingX: 10,
        platePaddingY: 10,
        plateRadius: 10
      }
      setLogos([...logos, newLogo])
      setSelectedLogoId(newLogo.id)
    }
  }

  const updateLogo = (updates: Partial<LogoLayer>) => {
    if (!selectedLogoId) return
    setLogos(prev => prev.map(l => l.id === selectedLogoId ? { ...l, ...updates } : l))
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
     if (e.target === canvasRef.current) {
        // Deselect logic could be here
     }
  }

  const executeExport = async () => {
    if (!baseImage) return
    setExportStatus('generating')
    
    const resSetting = RESOLUTIONS[exportSettings.resolutionIdx]
    let w = resSetting.width
    let h = resSetting.height
    
    if (w === 0) { // Original
      w = baseImage.naturalWidth
      h = baseImage.naturalHeight
    }

    const offCanvas = document.createElement('canvas')
    offCanvas.width = w
    offCanvas.height = h
    const ctx = offCanvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    drawCanvas(ctx, w, h, true)

    await new Promise(r => setTimeout(r, 800)) 

    const mime = exportSettings.format === 'png' ? 'image/png' : 'image/jpeg'
    let dataUrl = offCanvas.toDataURL(mime, exportSettings.quality)

    if (exportSettings.format === 'png') {
      dataUrl = setPngDpi(dataUrl, exportSettings.dpi)
    } else {
      dataUrl = setJpegDpi(dataUrl, exportSettings.dpi)
    }

    const link = document.createElement('a')
    link.download = `proposter-export-${w}x${h}.${exportSettings.format}`
    link.href = dataUrl
    link.click()

    setExportStatus('done')
    setTimeout(() => {
      setExportStatus('idle')
      setIsExportModalOpen(false)
    }, 1500)
  }

  const selectedLogo = logos.find(l => l.id === selectedLogoId)

  // --- RENDER ---
  // Updated: Layout includes p-3 outer padding and gap-3 separation
  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f4f8] text-slate-800 font-sans overflow-hidden p-3 gap-3">
      
      {/* 1. TOP NAV BAR - Now rounded and floating */}
      <header className="h-14 bg-white rounded-2xl flex items-center justify-between px-4 z-40 shadow-sm border border-white/50">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-indigo-200 shadow-sm">
                S
             </div>
             <div>
                <h1 className="text-sm font-bold text-slate-800 leading-tight tracking-tight">SSI Studio</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Poster Engine</p>
             </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
                onClick={() => setLogos([])}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-md transition-all flex items-center gap-2"
            >
                <RotateCcw size={14} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button 
                onClick={() => setIsExportModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
                <Download size={14} /> Export
            </button>
         </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden gap-3">
        
        {/* LEFT SIDEBAR: Layers & Assets - Rounded card */}
        <aside className="w-64 bg-white rounded-2xl shadow-sm border border-white/50 flex flex-col z-20">
            {/* Section: Base Image */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Base Poster</h2>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">BG</span>
                </div>
                
                <div 
                    onClick={() => baseInputRef.current?.click()}
                    className="group relative w-full aspect-[16/9] bg-slate-100 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
                >
                    {baseImage ? (
                        <img src={baseImage.src} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Base" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                            <ImageIcon size={24} className="opacity-50"/>
                            <span className="text-xs font-medium">Select Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                         <span className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                             <Upload size={10} /> Replace
                         </span>
                    </div>
                </div>
                <input ref={baseInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) setBaseImageSrc(URL.createObjectURL(e.target.files[0]))
                }}/>
            </div>

            {/* Section: Layers */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 rounded-b-2xl">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={12} /> Layers ({logos.length})
                    </h2>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors"
                        title="Add Logo"
                    >
                        <Plus size={14} />
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar">
                    {logos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-2 bg-slate-50">
                            <BoxSelect size={32} className="mb-2 opacity-40" />
                            <p className="text-xs font-medium">No layers yet</p>
                            <p className="text-[10px] opacity-70">Add a logo to start editing</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {logos.map((logo, idx) => (
                                <motion.div
                                    key={logo.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSelectedLogoId(logo.id)}
                                    className={`group flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                                        selectedLogoId === logo.id 
                                        ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20' 
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-100 border border-slate-100 flex-shrink-0 p-1">
                                        <img src={logo.imageSrc} className="w-full h-full object-contain" alt="Layer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-semibold text-slate-700 truncate">Logo {idx + 1}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">X:{logo.x.toFixed(0)}</span>
                                            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">Y:{logo.y.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setLogos(prev => prev.filter(l => l.id !== logo.id))
                                            if (selectedLogoId === logo.id) setSelectedLogoId(null)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </aside>

        {/* CENTER CANVAS AREA - Maximized space, rounded card */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-white/50 relative flex flex-col items-center justify-center overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.3]" 
                style={{ 
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                    backgroundSize: '24px 24px' 
                }} 
            />
            
            {/* Optimized Canvas Container: increased size to 96% */}
            <div 
                ref={containerRef}
                className="relative shadow-2xl bg-white overflow-hidden transition-all duration-200 ease-out ring-1 ring-black/5"
                style={{ 
                    aspectRatio: '16/9',
                    height: `${zoomLevel}%`,
                    maxHeight: '96%', // Maximized height
                    maxWidth: '96%'   // Maximized width
                }}
            >
                <canvas 
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Floating Zoom Bar - Smaller and cleaner */}
            <div className="absolute bottom-6 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md shadow-xl rounded-full px-2 py-1.5 border border-white/10 ring-1 ring-black/20 z-30">
                <button onClick={() => setZoomLevel(Math.max(20, zoomLevel - 10))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-200 transition-colors">
                    <Minus size={14} />
                </button>
                <div className="w-10 text-center text-[10px] font-mono font-bold text-white">{zoomLevel}%</div>
                <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-200 transition-colors">
                    <Plus size={14} />
                </button>
                <div className="w-px h-3 bg-white/20 mx-1"></div>
                <button onClick={() => setZoomLevel(80)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Fit to Screen">
                    <Maximize2 size={14} />
                </button>
            </div>
        </main>

        {/* RIGHT PROPERTY PANEL - Rounded card */}
        <aside className="w-72 bg-white rounded-2xl shadow-sm border border-white/50 flex flex-col z-20">
            {selectedLogo ? (
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar rounded-2xl">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                        <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                                <Settings size={14} />
                             </div>
                             <span className="text-sm font-bold text-slate-800">Properties</span>
                        </div>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Transform Group */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Move size={14} className="text-slate-400"/>
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Transform</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <SmoothSlider label="Horizontal" value={selectedLogo.x} min={-50} max={50} onChange={(v) => updateLogo({x: v})} unit="%" />
                                <SmoothSlider label="Vertical" value={selectedLogo.y} min={-50} max={50} onChange={(v) => updateLogo({y: v})} unit="%" />
                            </div>
                            <SmoothSlider label="Scale" value={selectedLogo.scale} min={10} max={200} onChange={(v) => updateLogo({scale: v})} unit="%" />
                            <SmoothSlider label="Rotation" value={selectedLogo.rotation} min={-180} max={180} onChange={(v) => updateLogo({rotation: v})} unit="°" />
                        </section>

                        <hr className="border-slate-100" />

                        {/* Style Group */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette size={14} className="text-slate-400"/>
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Appearance</h3>
                            </div>

                            <SmoothSlider label="Opacity" value={selectedLogo.opacity} min={0} max={100} onChange={(v) => updateLogo({opacity: v})} unit="%" />

                            <div className="mb-4">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Blend Mode</label>
                                <div className="relative group">
                                    <select 
                                        value={selectedLogo.blendMode}
                                        onChange={(e) => updateLogo({blendMode: e.target.value as BlendMode})}
                                        className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-medium rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer transition-all"
                                    >
                                        {BLEND_MODES.map(m => (
                                            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('-', ' ')}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <SmoothSlider label="Corner Radius" value={selectedLogo.radius} min={0} max={100} onChange={(v) => updateLogo({radius: v})} unit="px" />
                                <SmoothSlider label="Border Width" value={selectedLogo.borderWidth} min={0} max={20} step={0.5} onChange={(v) => updateLogo({borderWidth: v})} unit="px" />
                                {selectedLogo.borderWidth > 0 && (
                                    <ColorPicker label="Border Color" color={selectedLogo.borderColor} onChange={(c) => updateLogo({borderColor: c})} />
                                )}
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* Plate Group */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <LayoutGrid size={14} className="text-slate-400"/>
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Backplate</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg mb-4">
                                {['none', 'white'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => updateLogo({ plateType: t as any })}
                                        className={`py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${
                                            selectedLogo.plateType === t 
                                            ? 'bg-white text-indigo-600 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {selectedLogo.plateType !== 'none' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <SmoothSlider label="Pad X" value={selectedLogo.platePaddingX} min={0} max={50} onChange={(v) => updateLogo({platePaddingX: v})} unit="%" />
                                                <SmoothSlider label="Pad Y" value={selectedLogo.platePaddingY} min={0} max={50} onChange={(v) => updateLogo({platePaddingY: v})} unit="%" />
                                            </div>
                                            <SmoothSlider label="Roundness" value={selectedLogo.plateRadius} min={0} max={100} onChange={(v) => updateLogo({plateRadius: v})} unit="px" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-2xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <MousePointer2 size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">No Selection</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                        Select a logo layer from the sidebar or click directly on the canvas to edit its properties.
                    </p>
                </div>
            )}
        </aside>

      </div>

      {/* 3. EXPORT MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                onClick={() => setIsExportModalOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-black/5"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                             <h2 className="text-lg font-bold text-slate-800">Export Final Poster</h2>
                             <p className="text-xs text-slate-500 mt-0.5">Prepare your design for download</p>
                        </div>
                        <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Format Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Format</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['jpeg', 'png'].map(fmt => (
                                    <button 
                                        key={fmt}
                                        onClick={() => setExportSettings(s => ({...s, format: fmt as ExportFormat}))}
                                        className={`relative group p-4 border rounded-xl text-left transition-all ${
                                            exportSettings.format === fmt 
                                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                            : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="block text-sm font-bold uppercase text-slate-800 mb-1">{fmt}</span>
                                        <span className="block text-[11px] text-slate-500 leading-tight">
                                            {fmt === 'jpeg' ? 'Best for social media & sharing' : 'Best for printing & high quality'}
                                        </span>
                                        {exportSettings.format === fmt && (
                                            <div className="absolute top-4 right-4 text-indigo-600">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Dimensions</label>
                                <div className="relative">
                                    <Monitor className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <select 
                                        className="w-full pl-10 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                                        value={exportSettings.resolutionIdx}
                                        onChange={(e) => setExportSettings(s => ({...s, resolutionIdx: parseInt(e.target.value)}))}
                                    >
                                        {RESOLUTIONS.map((r, i) => (
                                            <option key={i} value={i}>{r.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                                </div>
                             </div>

                             <div>
                                <div className="mb-4">
                                     <SmoothSlider 
                                        label="Quality" 
                                        value={Math.round(exportSettings.quality * 100)} 
                                        min={10} max={100} 
                                        onChange={(v) => setExportSettings(s => ({...s, quality: v/100}))} 
                                        unit="%"
                                    />
                                </div>
                                <div>
                                     <SmoothSlider 
                                        label="DPI (Print Density)" 
                                        value={exportSettings.dpi} 
                                        min={72} max={600} 
                                        onChange={(v) => setExportSettings(s => ({...s, dpi: v}))} 
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            onClick={() => setIsExportModalOpen(false)}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeExport}
                            disabled={exportStatus !== 'idle'}
                            className={`px-8 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all transform active:scale-95 ${
                                exportStatus === 'generating' ? 'bg-indigo-400 cursor-wait' : 
                                exportStatus === 'done' ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
                            }`}
                        >
                            {exportStatus === 'generating' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {exportStatus === 'done' && <CheckCircle2 size={16} />}
                            {exportStatus === 'idle' ? 'Download Poster' : exportStatus === 'generating' ? 'Rendering...' : 'Saved!'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}