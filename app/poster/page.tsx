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
  Palette,
  ChevronDown,
  BoxSelect,
  Monitor,
  PanelRightOpen,
  PanelLeftOpen,
  Smartphone,
  Check,
  ChevronRight
} from 'lucide-react'

// --- HELPER FUNCTIONS (UNCHANGED) ---

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

function clipRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  drawRoundedRect(ctx, x, y, w, h, r)
  ctx.clip()
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, c: string) {
  ctx.fillStyle = c
  drawRoundedRect(ctx, x, y, w, h, r)
  ctx.fill()
}

function strokeRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, lw: number, c: string) {
  ctx.lineWidth = lw
  ctx.strokeStyle = c
  drawRoundedRect(ctx, x, y, w, h, r)
  ctx.stroke()
}

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
  pHYsData[8] = 1 
  const type = new Uint8Array([112, 72, 89, 115]) 
  const data = new Uint8Array(type.length + pHYsData.length)
  data.set(type, 0)
  data.set(pHYsData, type.length)
  const crc = crc32(data)
  const chunk = new Uint8Array(4 + 4 + 9 + 4)
  writeUInt32BE(chunk, 0, 9)
  chunk.set(type, 4)
  chunk.set(pHYsData, 8)
  writeUInt32BE(chunk, 17, crc)

  let pos = 8 
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
  x: number 
  y: number 
  scale: number 
  opacity: number 
  rotation: number 
  blendMode: BlendMode
  radius: number 
  borderWidth: number 
  borderColor: string
  plateType: 'none' | 'white' | 'glass'
  platePaddingX: number
  platePaddingY: number
  plateRadius: number
}

const BLEND_MODES: BlendMode[] = [
  'source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'soft-light', 'difference', 'luminosity'
]

const RESOLUTIONS = [
  { name: 'Original Size', width: 0, height: 0 },
  { name: 'Instagram Square (1080x1080)', width: 1080, height: 1080 },
  { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
  { name: '4K Ultra HD (3840x2160)', width: 3840, height: 2160 },
  { name: 'Print A4 (300 DPI)', width: 2480, height: 3508 },
]

// --- UI COMPONENTS ---

const SmoothSlider = ({ value, min, max, step = 1, onChange, label, unit = '' }: any) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value)
    requestAnimationFrame(() => onChange(newVal))
  }
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-2 mb-5 group">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">{label}</label>
        <motion.span 
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 min-w-[36px] text-center"
        >
            {Math.round(value)}{unit}
        </motion.span>
      </div>
      <div className="relative h-6 flex items-center cursor-pointer">
        <input 
            type="range" min={min} max={max} step={step} value={value} onChange={handleChange} 
            className="absolute z-20 w-full h-full opacity-0 cursor-pointer" 
        />
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
           <div className="h-full bg-slate-800 rounded-full transition-all duration-75 ease-out" style={{ width: `${percentage}%` }} />
        </div>
        <motion.div 
            className="absolute h-5 w-5 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full pointer-events-none z-10 flex items-center justify-center" 
            style={{ left: `calc(${percentage}% - 10px)` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}

const ColorPicker = ({ color, onChange, label }: any) => (
  <div className="flex items-center justify-between mb-4 p-1 pl-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-200 cursor-pointer group">
    <label className="text-xs font-bold text-slate-600 cursor-pointer">{label}</label>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-400 font-mono uppercase group-hover:text-slate-600 transition-colors">{color}</span>
      <div className="relative w-8 h-8 rounded-lg border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform active:scale-95">
        <input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-none opacity-0" />
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
  const [exportSettings, setExportSettings] = useState({ format: 'jpeg' as ExportFormat, resolutionIdx: 0, quality: 0.9, dpi: 300 })
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [zoomLevel, setZoomLevel] = useState(85) 

  const [activeMobileTab, setActiveMobileTab] = useState<'layers' | 'canvas' | 'properties'>('canvas')

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
    img.onerror = () => console.error("Could not load base poster.")
  }, [baseImageSrc])

  useEffect(() => {
    if (selectedLogoId) {
        if (window.innerWidth < 1024) setActiveMobileTab('properties')
    }
  }, [selectedLogoId])

  const drawCanvas = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, renderForExport = false) => {
    ctx.clearRect(0, 0, width, height)
    if (baseImage) {
      const imgRatio = baseImage.width / baseImage.height
      const canvasRatio = width / height
      let dw = width, dh = height, dx = 0, dy = 0
      
      // Force cover to ensure no white space if aspect ratios slightly differ
      if (imgRatio > canvasRatio) { 
        dw = height * imgRatio
        dx = (width - dw) / 2 
      } else { 
        dh = width / imgRatio
        dy = (height - dh) / 2 
      }
      ctx.drawImage(baseImage, dx, dy, dw, dh)
    } else {
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0,0, width, height)
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.strokeRect(0,0,width,height)
    }

    const containerConfig = { top: 0.62, bottom: 0.76, hPadding: 0.35 }
    const containerY = height * containerConfig.top
    const containerHeight = height * (containerConfig.bottom - containerConfig.top)
    const containerX = width * containerConfig.hPadding
    const containerWidth = width * (1 - 2 * containerConfig.hPadding)

    logos.forEach(logo => {
      if (!logo.imageElement) return
      const { x, y, scale, opacity, rotation, radius, borderWidth, borderColor, blendMode, plateType, platePaddingX, platePaddingY, plateRadius } = logo
      const imgW = logo.imageElement.width
      const imgH = logo.imageElement.height
      const scaleFactorToFitContainer = Math.min(containerWidth / imgW, containerHeight / imgH)
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

      if (plateType !== 'none') {
        const hPadding = finalLogoWidth * (platePaddingX / 100)
        const vPadding = finalLogoHeight * (platePaddingY / 100)
        const plateW = finalLogoWidth + hPadding * 2
        const plateH = finalLogoHeight + vPadding * 2
        ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6
        if (plateType === 'white') fillRoundedRect(ctx, posX - hPadding, posY - vPadding, plateW, plateH, plateRadius, '#ffffff')
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      }

      if (radius > 0) {
        ctx.save(); clipRoundedRect(ctx, posX, posY, finalLogoWidth, finalLogoHeight, radius); ctx.drawImage(logo.imageElement, posX, posY, finalLogoWidth, finalLogoHeight); ctx.restore()
      } else {
        ctx.drawImage(logo.imageElement, posX, posY, finalLogoWidth, finalLogoHeight)
      }

      if (borderWidth > 0) strokeRoundedRect(ctx, posX, posY, finalLogoWidth, finalLogoHeight, radius, borderWidth, borderColor)
      
      if (!renderForExport && logo.id === selectedLogoId) {
        ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2
        const pad = 6
        const selX = (plateType !== 'none' ? posX - (finalLogoWidth * (platePaddingX/100)) : posX) - pad
        const selY = (plateType !== 'none' ? posY - (finalLogoHeight * (platePaddingY/100)) : posY) - pad
        const selW = (plateType !== 'none' ? finalLogoWidth + (finalLogoWidth * (platePaddingX/100) * 2) : finalLogoWidth) + pad*2
        const selH = (plateType !== 'none' ? finalLogoHeight + (finalLogoHeight * (platePaddingY/100) * 2) : finalLogoHeight) + pad*2
        ctx.setLineDash([6, 4]); ctx.strokeRect(selX, selY, selW, selH); ctx.setLineDash([])
        ctx.fillStyle = '#fff'; const handleSize = 8
        ;[[selX, selY], [selX + selW, selY], [selX, selY + selH], [selX + selW, selY + selH]].forEach(([cx, cy]) => {
           ctx.fillRect(cx - 4, cy - 4, handleSize, handleSize); ctx.strokeRect(cx - 4, cy - 4, handleSize, handleSize)
        })
      }
      ctx.restore()
    })
  }, [baseImage, logos, selectedLogoId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !baseImage) return
    const internalW = 1920; const internalH = 1080
    canvas.width = internalW; canvas.height = internalH
    const ctx = canvas.getContext('2d')
    if (ctx) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; drawCanvas(ctx, internalW, internalH) }
  }, [drawCanvas, baseImage])

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    img.onload = () => {
      const newLogo: LogoLayer = {
        id: crypto.randomUUID(), file, imageSrc: url, imageElement: img,
        x: 0, y: 0, scale: 100, opacity: 100, rotation: 0, blendMode: 'source-over',
        radius: 0, borderWidth: 0, borderColor: '#ffffff',
        plateType: 'none', platePaddingX: 10, platePaddingY: 10, plateRadius: 10
      }
      setLogos([...logos, newLogo])
      setSelectedLogoId(newLogo.id)
      setActiveMobileTab('properties')
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
    let w = resSetting.width, h = resSetting.height
    if (w === 0) { w = baseImage.naturalWidth; h = baseImage.naturalHeight }
    const offCanvas = document.createElement('canvas')
    offCanvas.width = w; offCanvas.height = h
    const ctx = offCanvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
    drawCanvas(ctx, w, h, true)
    await new Promise(r => setTimeout(r, 800)) 
    const mime = exportSettings.format === 'png' ? 'image/png' : 'image/jpeg'
    let dataUrl = offCanvas.toDataURL(mime, exportSettings.quality)
    if (exportSettings.format === 'png') dataUrl = setPngDpi(dataUrl, exportSettings.dpi)
    else dataUrl = setJpegDpi(dataUrl, exportSettings.dpi)
    const link = document.createElement('a')
    link.download = `ssi-poster-${w}x${h}.${exportSettings.format}`
    link.href = dataUrl
    link.click()
    setExportStatus('done')
    setTimeout(() => { setExportStatus('idle'); setIsExportModalOpen(false) }, 1500)
  }

  const selectedLogo = logos.find(l => l.id === selectedLogoId)

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fc] font-sans overflow-hidden text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-transparent" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply" />

      {/* --- HEADER --- */}
      <div className="z-50 w-full flex justify-center pt-6 px-6 shrink-0">
        <header className="bg-white/70 backdrop-blur-xl rounded-full shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-white/60 px-5 py-2.5 flex items-center justify-between w-full max-w-[1600px] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-4 cursor-default">
                <div className="h-9 w-9 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <span className="font-bold text-xs">SSI</span>
                </div>
                <div className="flex flex-col justify-center">
                   <h1 className="text-sm font-bold text-slate-900 leading-tight">SSI Studio</h1>
                   <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Poster Engine</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
               <motion.button 
                 whileHover={{ scale: 1.05, backgroundColor: '#f1f5f9' }} whileTap={{ scale: 0.95 }}
                 onClick={() => setLogos([])} 
                 className="cursor-pointer text-xs font-semibold text-slate-500 px-4 py-2.5 rounded-full transition-colors flex items-center gap-2"
               >
                  <RotateCcw size={14} className="text-slate-400" /> <span className="hidden sm:inline">Reset</span>
               </motion.button>
               
               <motion.button 
                 whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95, y: 0 }}
                 onClick={() => setIsExportModalOpen(true)} 
                 className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-slate-300 flex items-center gap-2"
               >
                  <Download size={14} /> Export
               </motion.button>
            </div>
        </header>
      </div>

      {/* --- WORKSPACE CONTAINER --- */}
      <div className="flex flex-col lg:flex-row flex-1 w-full max-w-[1600px] mx-auto gap-6 px-6 pb-6 pt-4 min-h-0 z-10 relative justify-center">
        
        {/* --- LEFT PANEL: ASSETS --- */}
        <aside className={`${activeMobileTab === 'layers' ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex-col overflow-hidden transition-all absolute lg:relative inset-0 lg:inset-auto z-30 lg:z-auto h-full`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-100/50 shrink-0 flex items-center justify-between">
                <h2 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} /> Layers
                </h2>
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()} 
                    className="cursor-pointer w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                >
                    <Plus size={16}/>
                </motion.button>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 custom-scrollbar">
                
                {/* Background Selector */}
                <div className="mb-6">
                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Base Poster</h3>
                     <motion.div 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => baseInputRef.current?.click()} 
                        className="cursor-pointer group relative w-full aspect-[16/9] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden hover:border-indigo-300 transition-all shadow-sm"
                     >
                        {baseImage ? <img src={baseImage.src} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Base" /> : <div className="flex flex-col items-center justify-center h-full text-slate-400"><span className="text-xs font-medium">Click to Upload</span></div>}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-slate-700 p-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"><Upload size={16}/></div>
                        </div>
                     </motion.div>
                     <input ref={baseInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setBaseImageSrc(URL.createObjectURL(e.target.files[0])) }}/>
                </div>

                {/* Layer List */}
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Overlays</h3>
                <div className="space-y-2.5 pb-20 lg:pb-0">
                    {logos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <BoxSelect size={32} className="mb-2 opacity-50" />
                            <p className="text-[10px] font-bold uppercase tracking-wide">No Overlays Added</p>
                        </div>
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {logos.map((logo, idx) => (
                                <motion.div 
                                    key={logo.id} 
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, scale: 0.8 }} 
                                    onClick={() => setSelectedLogoId(logo.id)}
                                    whileHover={{ scale: 1.02 }}
                                    className={`cursor-pointer group relative flex items-center gap-3 p-2.5 pr-3 rounded-2xl transition-all border ${selectedLogoId === logo.id ? 'bg-white border-indigo-200 shadow-[0_4px_20px_-2px_rgba(99,102,241,0.15)] ring-1 ring-indigo-50 z-10' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'}`}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 p-1 shadow-sm shrink-0 overflow-hidden">
                                        <img src={logo.imageSrc} className="w-full h-full object-contain" alt="Layer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate ${selectedLogoId === logo.id ? 'text-indigo-950' : 'text-slate-600'}`}>Layer {idx + 1}</div>
                                        <div className="text-[10px] text-slate-400 font-medium truncate">{logo.blendMode} • {Math.round(logo.opacity)}%</div>
                                    </div>
                                    
                                    {selectedLogoId === logo.id ? (
                                        <motion.button 
                                            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                                            onClick={(e) => { e.stopPropagation(); setLogos(prev => prev.filter(l => l.id !== logo.id)); if (selectedLogoId === logo.id) setSelectedLogoId(null) }} 
                                            className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                                        >
                                            <Trash2 size={13} />
                                        </motion.button>
                                    ) : (
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-300" />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </aside>

        {/* --- CENTER: CANVAS --- */}
        <main className={`${activeMobileTab === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 bg-[#ebeef3] rounded-[2rem] shadow-inner border border-white/50 relative flex-col items-center justify-center overflow-hidden w-full h-full`}>
            {/* Dot Pattern for Canvas Background */}
            <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>

            <motion.div 
                layout
                ref={containerRef} 
                // REMOVED bg-white and ring here to remove the "card" look
                className="relative shadow-2xl shadow-slate-900/10 transition-all duration-300 ease-out" 
                style={{ 
                    aspectRatio: '16/9', 
                    // Changed width/height logic to ensure strict 16:9 box without internal padding issues
                    width: `${zoomLevel}%`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    // Ensure display block to prevent inline whitespace
                    display: 'block'
                }}
            >
                {/* Canvas is block level to fill container exactly */}
                <canvas ref={canvasRef} onClick={() => {}} className="w-full h-full block cursor-crosshair" />
            </motion.div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 flex items-center gap-1.5 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-2 py-1.5 border border-white/60">
                <button onClick={() => setZoomLevel(Math.max(20, zoomLevel - 10))} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><Minus size={14} /></button>
                <span className="text-xs font-bold text-slate-700 w-10 text-center select-none">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><Plus size={14} /></button>
                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                <button onClick={() => setZoomLevel(85)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors" title="Fit"><Maximize2 size={14} /></button>
            </div>
        </main>

        {/* --- RIGHT PANEL: PROPERTIES --- */}
        <aside className={`${activeMobileTab === 'properties' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex-col overflow-hidden absolute lg:relative inset-0 lg:inset-auto z-30 lg:z-auto h-full`}>
            {selectedLogo ? (
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100/50 sticky top-0 bg-white/80 backdrop-blur z-20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50 shadow-sm"><Settings size={16} /></div>
                             <div>
                                 <h2 className="text-sm font-bold text-slate-800">Properties</h2>
                                 <p className="text-[10px] text-slate-400 font-medium">Customize Layer</p>
                             </div>
                        </div>
                        <button className="cursor-pointer lg:hidden p-2 bg-slate-100 rounded-full hover:bg-slate-200" onClick={() => setActiveMobileTab('canvas')}><X size={16}/></button>
                    </div>

                    <div className="p-6 space-y-8 pb-24">
                        {/* Position Section */}
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-5 opacity-80"><Move size={14} className="text-indigo-500"/><h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest">Transform</h3></div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                                <SmoothSlider label="X Position" value={selectedLogo.x} min={-50} max={50} onChange={(v:any) => updateLogo({x: v})} unit="%" />
                                <SmoothSlider label="Y Position" value={selectedLogo.y} min={-50} max={50} onChange={(v:any) => updateLogo({y: v})} unit="%" />
                            </div>
                            <SmoothSlider label="Scale" value={selectedLogo.scale} min={10} max={200} onChange={(v:any) => updateLogo({scale: v})} unit="%" />
                            <SmoothSlider label="Rotation" value={selectedLogo.rotation} min={-180} max={180} onChange={(v:any) => updateLogo({rotation: v})} unit="°" />
                        </section>

                        <div className="h-px bg-slate-100" />

                        {/* Style Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-5 opacity-80"><Palette size={14} className="text-indigo-500"/><h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest">Appearance</h3></div>
                            <SmoothSlider label="Opacity" value={selectedLogo.opacity} min={0} max={100} onChange={(v:any) => updateLogo({opacity: v})} unit="%" />
                            
                            <div className="mb-6">
                                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-2 block">Blend Mode</label>
                                <div className="relative group">
                                    <select value={selectedLogo.blendMode} onChange={(e) => updateLogo({blendMode: e.target.value as BlendMode})} className="cursor-pointer w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl p-3 pr-8 shadow-sm appearance-none transition-colors focus:ring-2 focus:ring-indigo-100 outline-none">
                                        {BLEND_MODES.map(m => (<option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('-', ' ')}</option>))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none group-hover:text-slate-600" size={14} />
                                </div>
                            </div>
                            
                            <SmoothSlider label="Corner Radius" value={selectedLogo.radius} min={0} max={100} onChange={(v:any) => updateLogo({radius: v})} unit="px" />
                            <SmoothSlider label="Border Width" value={selectedLogo.borderWidth} min={0} max={20} step={0.5} onChange={(v:any) => updateLogo({borderWidth: v})} unit="px" />
                            {selectedLogo.borderWidth > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <ColorPicker label="Border Color" color={selectedLogo.borderColor} onChange={(c:any) => updateLogo({borderColor: c})} />
                                </motion.div>
                            )}
                        </section>

                        <div className="h-px bg-slate-100" />

                        {/* Container Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-5 opacity-80"><LayoutGrid size={14} className="text-indigo-500"/><h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest">Background Plate</h3></div>
                            <div className="grid grid-cols-2 gap-3 bg-slate-100/80 p-1.5 rounded-xl mb-5">
                                {['none', 'white'].map((t) => (
                                    <button key={t} onClick={() => updateLogo({ plateType: t as any })} className={`cursor-pointer py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all flex items-center justify-center gap-2 ${selectedLogo.plateType === t ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {selectedLogo.plateType === t && <Check size={12} strokeWidth={3} />} {t}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence>
                                {selectedLogo.plateType !== 'none' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="space-y-2 pt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <SmoothSlider label="Pad X" value={selectedLogo.platePaddingX} min={0} max={50} onChange={(v:any) => updateLogo({platePaddingX: v})} unit="%" />
                                                <SmoothSlider label="Pad Y" value={selectedLogo.platePaddingY} min={0} max={50} onChange={(v:any) => updateLogo({platePaddingY: v})} unit="%" />
                                            </div>
                                            <SmoothSlider label="Plate Roundness" value={selectedLogo.plateRadius} min={0} max={100} onChange={(v:any) => updateLogo({plateRadius: v})} unit="px" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                    <motion.div 
                        animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-white"
                    >
                        <MousePointer2 size={32} className="text-indigo-200 fill-indigo-50" />
                    </motion.div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">No Layer Selected</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">Select a layer from the canvas or sidebar to edit its properties.</p>
                </div>
            )}
        </aside>
      </div>

      {/* --- MOBILE DOCK (Floating Island Style) --- */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl shadow-slate-900/40">
             <button onClick={() => setActiveMobileTab('layers')} className={`cursor-pointer flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'layers' ? 'text-white' : 'text-slate-500'}`}>
                <PanelLeftOpen size={20} />
             </button>
             <button onClick={() => setActiveMobileTab('canvas')} className={`cursor-pointer flex flex-col items-center gap-1 transition-all ${activeMobileTab === 'canvas' ? 'text-white bg-indigo-600 rounded-full p-2 -my-2 shadow-lg shadow-indigo-500/50' : 'text-slate-500'}`}>
                <Smartphone size={activeMobileTab === 'canvas' ? 20 : 22} />
             </button>
             <button onClick={() => setActiveMobileTab('properties')} className={`cursor-pointer flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'properties' ? 'text-white' : 'text-slate-500'}`}>
                <PanelRightOpen size={20} />
             </button>
        </div>
      </div>

      {/* --- EXPORT MODAL --- */}
      <AnimatePresence>
        {isExportModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => setIsExportModalOpen(false)}>
                <motion.div 
                    initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} 
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-black/5" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
                        <div><h2 className="text-xl font-bold text-slate-800 tracking-tight">Export Design</h2><p className="text-xs text-slate-400 font-medium mt-1">Ready to render your masterpiece?</p></div>
                        <button onClick={() => setIsExportModalOpen(false)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                    </div>
                    <div className="p-8 space-y-6 bg-slate-50/50">
                        <div className="grid grid-cols-2 gap-4">
                            {['jpeg', 'png'].map(fmt => (
                                <button key={fmt} onClick={() => setExportSettings(s => ({...s, format: fmt as ExportFormat}))} className={`cursor-pointer p-4 border rounded-2xl text-left transition-all ${exportSettings.format === fmt ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <span className="block text-sm font-bold uppercase text-slate-800 mb-1">{fmt}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{fmt === 'png' ? 'Best for transparency' : 'Smaller file size'}</span>
                                </button>
                            ))}
                        </div>
                        <div className="space-y-6">
                            <div className="relative group">
                                <Monitor className="absolute left-4 top-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                                <select className="cursor-pointer w-full pl-12 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-sm font-bold rounded-xl p-3.5 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none" value={exportSettings.resolutionIdx} onChange={(e) => setExportSettings(s => ({...s, resolutionIdx: parseInt(e.target.value)}))}>
                                    {RESOLUTIONS.map((r, i) => (<option key={i} value={i}>{r.name}</option>))}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            <SmoothSlider label="Quality" value={Math.round(exportSettings.quality * 100)} min={10} max={100} onChange={(v:any) => setExportSettings(s => ({...s, quality: v/100}))} unit="%" />
                            <SmoothSlider label="DPI (Print Density)" value={exportSettings.dpi} min={72} max={600} onChange={(v:any) => setExportSettings(s => ({...s, dpi: v}))} />
                        </div>
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setIsExportModalOpen(false)} className="cursor-pointer px-6 py-3 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={executeExport} 
                            disabled={exportStatus !== 'idle'} 
                            className={`cursor-pointer px-8 py-3 rounded-full text-sm font-bold text-white shadow-xl shadow-indigo-200 flex items-center gap-2 transition-all ${exportStatus === 'generating' ? 'bg-slate-400' : exportStatus === 'done' ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'}`}
                        >
                            {exportStatus === 'idle' ? <><Download size={16} /> Download</> : exportStatus === 'generating' ? 'Rendering...' : <><Check size={16} /> Saved!</>}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}