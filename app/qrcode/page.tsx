'use client'

import { useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'

const SITE_URL = 'https://personaltrainingbymartin.netlify.app'

/* ── Portfolio images ─────────────────────────────────────────────────── */
const PORTFOLIO_IMAGES = [
  { src: '/portfolio/model1.jpg',   span: 'col-span-1 row-span-2' },
  { src: '/portfolio/model3.jpg',   span: 'col-span-1 row-span-1' },
  { src: '/portfolio/model4.jpg',   span: 'col-span-2 row-span-2' },
  { src: '/portfolio/model5.jpg',   span: 'col-span-1 row-span-1' },
  { src: '/portfolio/model6.PNG',   span: 'col-span-1 row-span-2' },
  { src: '/portfolio/model7.jpg',   span: 'col-span-1 row-span-1' },
  { src: '/portfolio/model8.PNG',   span: 'col-span-1 row-span-1' },
  { src: '/portfolio/model9.JPEG',  span: 'col-span-1 row-span-2' },
  { src: '/portfolio/model10.jpg',  span: 'col-span-1 row-span-1' },
  { src: '/portfolio/model11.jpg',  span: 'col-span-2 row-span-1' },
  { src: '/portfolio/model13.jpg',  span: 'col-span-1 row-span-2' },
  { src: '/portfolio/mode33l.png',  span: 'col-span-1 row-span-1' },
]

type Tab = 'qr' | 'portfolio'

export default function QRCodePage() {
  const [activeTab, setActiveTab] = useState<Tab>('qr')
  const posterRef = useRef<HTMLDivElement>(null)
  const portfolioRef = useRef<HTMLDivElement>(null)

  const handleDownloadQR = useCallback(async () => {
    if (!posterRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(posterRef.current, {
      backgroundColor: '#000',
      scale: 3,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = 'personal-training-zurich-qr.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const handleDownloadPortfolio = useCallback(async () => {
    if (!portfolioRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(portfolioRef.current, {
      backgroundColor: '#000',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = 'martin-portfolio.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  return (
    <div className={`min-h-screen bg-black ${activeTab === 'portfolio' ? 'portfolio-print-mode' : 'qr-page-wrapper'}`}>
      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="print:hidden flex items-center justify-center pt-6 pb-2 gap-0">
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-3 text-sm font-medium tracking-wide uppercase transition-all duration-300 border-b-2 ${
            activeTab === 'qr'
              ? 'text-white border-white'
              : 'text-white/30 border-transparent hover:text-white/60'
          }`}
        >
          QR Code
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-6 py-3 text-sm font-medium tracking-wide uppercase transition-all duration-300 border-b-2 ${
            activeTab === 'portfolio'
              ? 'text-white border-white'
              : 'text-white/30 border-transparent hover:text-white/60'
          }`}
        >
          Portfolio
        </button>
      </div>

      {/* ── Tab 1: QR Code Poster (unchanged) ────────────────────────── */}
      <div className={`${activeTab === 'qr' ? 'flex flex-col items-center justify-center p-0 md:p-8' : 'hidden print:hidden'}`} style={{ minHeight: activeTab === 'qr' ? 'calc(100vh - 60px)' : undefined }}>
        <div
          ref={posterRef}
          className="qr-poster relative w-full max-w-[595px] aspect-[210/297] mx-auto bg-black px-10 py-12 md:rounded-3xl md:border md:border-white/8 md:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent md:inset-x-0 md:rounded-t-3xl qr-print-hide" />

          <div className="qr-fade-in-scale relative mb-6">
            <div className="qr-glow-pulse qr-print-avatar relative w-[320px] h-[320px] md:w-[380px] md:h-[380px] rounded-full overflow-hidden border-[3px] border-amber-400/40 shadow-[0_0_40px_-8px_rgba(251,191,36,0.25),0_0_80px_-16px_rgba(251,191,36,0.12)]">
              <Image
                src="/assets/images/IMG_99828.jpg"
                alt="Martin – Personal Trainer in Zürich"
                fill
                className="object-cover object-[50%_18%]"
                sizes="380px"
                priority
              />
            </div>
          </div>

          <h1 className="qr-fade-in-delay-1 qr-print-name text-[3rem] md:text-[3.6rem] font-semibold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 mb-2">
            Martin
          </h1>

          <p className="qr-fade-in-delay-1 qr-print-text text-[13px] md:text-[15px] font-medium tracking-[0.18em] uppercase text-white/40 mb-6">
            Personal Trainer · Zürich
          </p>

          <p className="qr-fade-in-delay-2 qr-print-text text-xl md:text-2xl font-light text-white/75 leading-relaxed mb-7 max-w-[420px] italic">
            &ldquo;Dein Weg zu echten Resultaten&rdquo;
          </p>

          <div className="qr-print-divider w-16 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-7" />

          <div className="qr-fade-in-up relative mb-4">
            <div className="qr-print-qr-wrapper rounded-2xl bg-white p-3.5 shadow-[0_16px_48px_-8px_rgba(251,191,36,0.15)]">
              <QRCodeSVG
                value={SITE_URL}
                size={190}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          <p className="qr-fade-in-up qr-print-text text-[12px] md:text-[13px] text-white/45 font-light tracking-wide mb-7">
            Scanne mich für dein kostenloses Probetraining
          </p>

          <div className="qr-fade-in-delay-3 flex flex-col items-center gap-1 mb-6">
            <p className="qr-print-text text-[12px] md:text-[13px] font-medium tracking-[0.16em] uppercase text-white/35">
              Sportanlage Sonnenberg
            </p>
            <p className="qr-print-text-light text-[11px] md:text-[12px] text-white/25 font-light tracking-wide">
              Oberer Heuelsteig 30-34 · 8032 Zürich
            </p>
          </div>

          <div className="qr-fade-in-delay-3 flex flex-col items-center gap-0 mt-auto">
            <span className="qr-print-text flex items-center gap-2 text-sm text-white/50">
              <svg className="w-4 h-4 text-[#25D366] shrink-0 qr-print-wa-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>+41 77 485 75 35</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 mb-8 print:hidden">
          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/15 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            Download als PNG
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/15 hover:text-white transition-all"
          >
            <Printer className="w-4 h-4" />
            Drucken
          </button>
        </div>
      </div>

      {/* ── Tab 2: Portfolio ─────────────────────────────────────────── */}
      <div className={`${activeTab === 'portfolio' ? 'flex flex-col' : 'hidden print:hidden'}`} style={{ minHeight: activeTab === 'portfolio' ? '100vh' : undefined }}>
        <div ref={portfolioRef} className="portfolio-container bg-black flex-1 flex flex-col" data-portfolio>
          {/* Header */}
          <div className="pt-10 md:pt-14 pb-4 md:pb-6 text-center shrink-0">
            <h1 className="portfolio-fade-in text-[4rem] md:text-[7rem] lg:text-[9rem] font-bold leading-[0.85] tracking-[0.04em] uppercase text-white">
              Martin
            </h1>
            <p className="portfolio-fade-in-delay text-[15px] md:text-lg font-light tracking-[0.25em] uppercase text-white/30 mt-3">
              1,94 m
            </p>
          </div>

          {/* Editorial grid – fills remaining space */}
          <div className="px-1 md:px-4 lg:px-8 flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] lg:auto-rows-[280px] gap-[5px] md:gap-[6px] h-full">
              {PORTFOLIO_IMAGES.map((img, i) => (
                <div
                  key={i}
                  className={`portfolio-img-fade relative overflow-hidden ${img.span}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <Image
                    src={img.src}
                    alt={`Martin – Portfolio ${i + 1}`}
                    fill
                    className="object-cover transition-all duration-700 ease-out hover:scale-[1.04] hover:brightness-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons – screen only */}
        <div className="flex items-center justify-center gap-3 py-8 print:hidden shrink-0">
          <button
            onClick={handleDownloadPortfolio}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/15 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            Download als PNG
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/15 hover:text-white transition-all"
          >
            <Printer className="w-4 h-4" />
            Drucken
          </button>
        </div>
      </div>
    </div>
  )
}
