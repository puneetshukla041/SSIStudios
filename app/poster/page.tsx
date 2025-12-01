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
  Trash2,
  Upload,
  X,
  CheckCircle2,
  Palette,
  ChevronDown,
  BoxSelect,
  Monitor,
  Type,
  Grid,
  ZoomIn,
  Wand2
} from 'lucide-react'

// --- HELPER FUNCTIONS & ALGORITHMS ---

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

  if (bytes[2] !== 0xFF || bytes[3] !== 0xE0) return dataUrl 
  
  bytes[13] = 1
  bytes[14] = (dpi >> 8) & 0xFF
  bytes[15] = dpi & 0xFF
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

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2 mb-5 group">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-600 tracking-wide">{label}</label>
        <span className="text-[10px] font-bold text-slate-500 font-mono bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm min-w-[36px] text-center">{Math.round(value)}{unit}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
           <div 
             className="h-full bg-slate-900 rounded-full transition-all duration-75 ease-out"
             style={{ width: `${percentage}%` }}
           />
        </div>
        <div 
            className="absolute h-4 w-4 bg-white border-2 border-slate-900 shadow-md rounded-full pointer-events-none transition-all duration-75 ease-out group-hover:scale-110"
            style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  )
}

const ColorPicker = ({ color, onChange, label }: { color: string, onChange: (c: string) => void, label: string }) => (
  <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
    <label className="text-xs font-semibold text-slate-600 pl-1">{label}</label>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-400 font-mono uppercase">{color}</span>
      <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform ring-1 ring-slate-100">
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
  const [baseImageSrc, setBaseImageSrc] = useState('/posters/poster1.jpg') 
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null)
  
  const [logos, setLogos] = useState<LogoLayer[]>([])
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null)
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportSettings, setExportSettings] = useState({
    format: 'jpeg' as ExportFormat,
    resolutionIdx: 0,
    quality: 0.9,
    dpi: 300
  })
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [zoomLevel, setZoomLevel] = useState(85) 

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const baseInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!baseImageSrc) return;

    const img = new Image()
    img.src = baseImageSrc
    img.crossOrigin = 'anonymous'
    img.onload = () => setBaseImage(img)
    img.onerror = () => {
      console.error("Could not load base poster.")
    }
  }, [baseImageSrc])

  const drawCanvas = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    renderForExport = false
  ) => {
    ctx.clearRect(0, 0, width, height)

    // Draw Base
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

    const containerConfig = { top: 0.62, bottom: 0.76, hPadding: 0.35 }
    
    const containerY = height * containerConfig.top
    const containerHeight = height * (containerConfig.bottom - containerConfig.top)
    const containerX = width * containerConfig.hPadding
    const containerWidth = width * (1 - 2 * containerConfig.hPadding)

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

      // Plate
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

      // Image
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

      // Border
      if (borderWidth > 0) {
        strokeRoundedRect(ctx, dX, dY, finalLogoWidth, finalLogoHeight, radius, borderWidth, borderColor)
      }
      
      // Selection Indicator
      if (!renderForExport && logo.id === selectedLogoId) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = '#3b82f6' // Blue 500
        ctx.lineWidth = 2
        const pad = 6
        
        const selX = (plateType !== 'none' ? posX - (finalLogoWidth * (platePaddingX/100)) : dX) - pad
        const selY = (plateType !== 'none' ? posY - (finalLogoHeight * (platePaddingY/100)) : dY) - pad
        const selW = (plateType !== 'none' ? finalLogoWidth + (finalLogoWidth * (platePaddingX/100) * 2) : finalLogoWidth) + pad*2
        const selH = (plateType !== 'none' ? finalLogoHeight + (finalLogoHeight * (platePaddingY/100) * 2) : finalLogoHeight) + pad*2
        
        ctx.setLineDash([6, 4])
        ctx.strokeRect(selX, selY, selW, selH)
        ctx.setLineDash([])
        
        ctx.fillStyle = '#fff'
        const handleSize = 8
        const halfHandle = handleSize / 2
        const corners = [[selX, selY], [selX + selW, selY], [selX, selY + selH], [selX + selW, selY + selH]]
        corners.forEach(([cx, cy]) => {
             ctx.fillRect(cx - halfHandle, cy - halfHandle, handleSize, handleSize)
             ctx.strokeRect(cx - halfHandle, cy - halfHandle, handleSize, handleSize)
        })
      }

      ctx.restore()
    })

  }, [baseImage, logos, selectedLogoId])

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
        x: 0, y: 0, scale: 100, opacity: 100, rotation: 0, blendMode: 'source-over',
        radius: 0, borderWidth: 0, borderColor: '#ffffff',
        plateType: 'none', platePaddingX: 10, platePaddingY: 10, plateRadius: 10
      }
      setLogos([...logos, newLogo])
      setSelectedLogoId(newLogo.id)
    }
  }

  const updateLogo = (updates: Partial<LogoLayer>) => {
    if (!selectedLogoId) return
    setLogos(prev => prev.map(l => l.id === selectedLogoId ? { ...l, ...updates } : l))
  }

  const executeExport = async () => {
    if (!baseImage) return
    setExportStatus('generating')
    
    const resSetting = RESOLUTIONS[exportSettings.resolutionIdx]
    let w = resSetting.width
    let h = resSetting.height
    
    if (w === 0) {
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
  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f4f6] font-sans overflow-hidden text-slate-800">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 50% 50%, #e0e7ff 0%, transparent 50%)',
             backgroundSize: '100% 100%'
           }} 
      />

      {/* --- FLOATING HEADER --- */}
      <div className="z-50 w-full flex justify-center pt-5 pb-2 px-6">
        <header className="bg-white/90 backdrop-blur-xl rounded-full shadow-lg shadow-indigo-100 border border-white/50 px-6 py-2.5 flex items-center justify-between min-w-[600px] max-w-4xl w-full">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                   S
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div>
                   <h1 className="text-sm font-bold text-slate-800 leading-none">SSI Studio</h1>
                   <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Poster Engine</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                  onClick={() => setLogos([])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-full transition-all flex items-center gap-2"
               >
                  <RotateCcw size={14} /> <span>Reset</span>
               </button>
               <button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-slate-300 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
               >
                  <Download size={14} /> Export
               </button>
            </div>
        </header>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex flex-1 justify-center w-full max-w-[1600px] mx-auto gap-6 px-8 pb-8 min-h-0 z-10">
        
        {/* LEFT: ASSETS */}
        <aside className="w-72 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-white flex flex-col overflow-hidden transition-all">
            <div className="p-6 border-b border-slate-100/50">
                <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ImageIcon size={14} /> Background
                </h2>
                
                <div 
                    onClick={() => baseInputRef.current?.click()}
                    className="group relative w-full aspect-[16/9] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 transition-all"
                >
                    {baseImage ? (
                        <img src={baseImage.src} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all group-hover:scale-105 duration-700" alt="Base" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                            <span className="text-xs font-medium">Upload Base</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                         <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-slate-900 rounded-full p-2 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                             <Upload size={14} />
                         </div>
                    </div>
                </div>
                <input ref={baseInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) setBaseImageSrc(URL.createObjectURL(e.target.files[0]))
                }}/>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                <div className="p-6 pb-2 flex items-center justify-between">
                    <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={14} /> Layers
                    </h2>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 p-2 rounded-xl shadow-sm border border-slate-100 transition-all group"
                        title="Add Logo"
                    >
                        <Plus size={16} className="group-hover:scale-110 transition-transform"/>
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                    {logos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 border border-dashed border-slate-200 rounded-2xl m-2">
                            <BoxSelect size={24} className="mb-2 opacity-30" />
                            <p className="text-[10px] font-medium uppercase tracking-wide opacity-60">No Layers</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {logos.map((logo, idx) => (
                                <motion.div
                                    key={logo.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSelectedLogoId(logo.id)}
                                    className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                                        selectedLogoId === logo.id 
                                        ? 'bg-white border-slate-900 shadow-md scale-[1.02] z-10' 
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-100 flex-shrink-0 p-1 overflow-hidden">
                                        <img src={logo.imageSrc} className="w-full h-full object-contain" alt="Layer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-700 truncate">Logo Asset {idx + 1}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {logo.blendMode !== 'source-over' ? logo.blendMode : 'Normal'} • {Math.round(logo.opacity)}%
                                        </div>
                                    </div>
                                    {selectedLogoId === logo.id && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setLogos(prev => prev.filter(l => l.id !== logo.id))
                                                if (selectedLogoId === logo.id) setSelectedLogoId(null)
                                            }}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </aside>

        {/* CENTER: CANVAS */}
        <main className="flex-1 bg-[#e2e4e9] rounded-[2rem] shadow-inner border border-slate-200/60 relative flex flex-col items-center justify-center overflow-hidden">
            {/* Canvas Container */}
            <div 
                ref={containerRef}
                className="relative shadow-2xl shadow-slate-400/20 bg-white transition-all duration-300 ease-out"
                style={{ 
                    aspectRatio: '16/9',
                    height: `${zoomLevel}%`,
                    maxHeight: '90%',
                    maxWidth: '90%' 
                }}
            >
                <canvas 
                    ref={canvasRef}
                    onClick={() => {}}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Bottom Tools */}
            <div className="absolute bottom-6 flex items-center gap-3 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-4 py-2 border border-white/50">
                <button onClick={() => setZoomLevel(Math.max(20, zoomLevel - 10))} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <Minus size={14} />
                </button>
                <span className="text-xs font-bold text-slate-700 w-12 text-center">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <Plus size={14} />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button onClick={() => setZoomLevel(85)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors" title="Fit">
                    <Maximize2 size={14} />
                </button>
            </div>
        </main>

        {/* RIGHT: PROPERTIES */}
        <aside className="w-80 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-white flex flex-col overflow-hidden">
            {selectedLogo ? (
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-20">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                <Settings size={16} />
                             </div>
                             <div>
                                 <h2 className="text-sm font-bold text-slate-800">Properties</h2>
                                 <p className="text-[10px] text-slate-400 font-medium">Editing Selected Layer</p>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Transform */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Move size={14} className="text-indigo-500"/>
                                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Position</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <SmoothSlider label="X Axis" value={selectedLogo.x} min={-50} max={50} onChange={(v) => updateLogo({x: v})} unit="%" />
                                <SmoothSlider label="Y Axis" value={selectedLogo.y} min={-50} max={50} onChange={(v) => updateLogo({y: v})} unit="%" />
                            </div>
                            <SmoothSlider label="Scale" value={selectedLogo.scale} min={10} max={200} onChange={(v) => updateLogo({scale: v})} unit="%" />
                            <SmoothSlider label="Rotate" value={selectedLogo.rotation} min={-180} max={180} onChange={(v) => updateLogo({rotation: v})} unit="°" />
                        </section>

                        <hr className="border-slate-100" />

                        {/* Style */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette size={14} className="text-indigo-500"/>
                                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Style</h3>
                            </div>

                            <SmoothSlider label="Opacity" value={selectedLogo.opacity} min={0} max={100} onChange={(v) => updateLogo({opacity: v})} unit="%" />

                            <div className="mb-5">
                                <label className="text-xs font-semibold text-slate-600 tracking-wide mb-2 block">Blending</label>
                                <div className="relative">
                                    <select 
                                        value={selectedLogo.blendMode}
                                        onChange={(e) => updateLogo({blendMode: e.target.value as BlendMode})}
                                        className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl p-3 pr-8 focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none cursor-pointer shadow-sm"
                                    >
                                        {BLEND_MODES.map(m => (
                                            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('-', ' ')}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                            
                            <SmoothSlider label="Radius" value={selectedLogo.radius} min={0} max={100} onChange={(v) => updateLogo({radius: v})} unit="px" />
                            <SmoothSlider label="Border" value={selectedLogo.borderWidth} min={0} max={20} step={0.5} onChange={(v) => updateLogo({borderWidth: v})} unit="px" />
                            {selectedLogo.borderWidth > 0 && (
                                <ColorPicker label="Color" color={selectedLogo.borderColor} onChange={(c) => updateLogo({borderColor: c})} />
                            )}
                        </section>

                        <hr className="border-slate-100" />

                        {/* Plate */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <LayoutGrid size={14} className="text-indigo-500"/>
                                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Container</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-xl mb-4">
                                {['none', 'white'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => updateLogo({ plateType: t as any })}
                                        className={`py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all ${
                                            selectedLogo.plateType === t 
                                            ? 'bg-white text-slate-900 shadow-sm' 
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
                                        <div className="space-y-4 pt-2">
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
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <MousePointer2 size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">No Selection</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                        Select a layer to edit its properties
                    </p>
                </div>
            )}
        </aside>

      </div>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                onClick={() => setIsExportModalOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div>
                             <h2 className="text-xl font-bold text-slate-800">Export Design</h2>
                             <p className="text-xs text-slate-500 mt-1 font-medium">Ready to download your poster?</p>
                        </div>
                        <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="p-8 space-y-8 bg-[#fafafa]">
                        <div>
                            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Format</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['jpeg', 'png'].map(fmt => (
                                    <button 
                                        key={fmt}
                                        onClick={() => setExportSettings(s => ({...s, format: fmt as ExportFormat}))}
                                        className={`relative group p-4 border rounded-2xl text-left transition-all ${
                                            exportSettings.format === fmt 
                                            ? 'border-slate-900 bg-white shadow-md ring-1 ring-slate-900'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="block text-sm font-bold uppercase text-slate-800 mb-1">{fmt}</span>
                                        <span className="block text-[11px] text-slate-500 leading-tight">
                                            {fmt === 'jpeg' ? 'Small file size, good for web' : 'High quality, transparency supported'}
                                        </span>
                                        {exportSettings.format === fmt && (
                                            <div className="absolute top-4 right-4 text-slate-900">
                                                <CheckCircle2 size={18} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <div className="col-span-2">
                                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Resolution</label>
                                <div className="relative">
                                    <Monitor className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                    <select 
                                        className="w-full pl-12 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl p-3.5 focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none cursor-pointer shadow-sm"
                                        value={exportSettings.resolutionIdx}
                                        onChange={(e) => setExportSettings(s => ({...s, resolutionIdx: parseInt(e.target.value)}))}
                                    >
                                        {RESOLUTIONS.map((r, i) => (
                                            <option key={i} value={i}>{r.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={14} />
                                </div>
                             </div>

                             <div>
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
                                     label="DPI" 
                                     value={exportSettings.dpi} 
                                     min={72} max={600} 
                                     onChange={(v) => setExportSettings(s => ({...s, dpi: v}))} 
                                  />
                             </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            onClick={() => setIsExportModalOpen(false)}
                            className="px-6 py-3 rounded-full text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeExport}
                            disabled={exportStatus !== 'idle'}
                            className={`px-8 py-3 rounded-full text-sm font-bold text-white shadow-xl shadow-slate-200 flex items-center gap-2 transition-all transform active:scale-95 ${
                                exportStatus === 'generating' ? 'bg-slate-400 cursor-wait' : 
                                exportStatus === 'done' ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800'
                            }`}
                        >
                            {exportStatus === 'generating' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {exportStatus === 'done' && <CheckCircle2 size={16} />}
                            {exportStatus === 'idle' ? 'Download Poster' : exportStatus === 'generating' ? 'Processing...' : 'Complete!'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}