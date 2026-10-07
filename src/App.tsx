/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ACADEMIC_INFO,
  FINANCIAL_SCENARIOS,
  GTM_PHASES,
  IMAGES,
  MARKET_SEGMENTS,
  MOAT_PILLARS,
  NINETY_DAY_ROADMAP,
  RISK_MATRIX,
  SEED_FUNDING_ALLOCATION,
  SERIES_A_MILESTONES,
  TAM_SAM_SOM_SUMMARY,
  UNIT_ECONOMICS_TABLE,
} from './data/tebarPintarData';
import { Feeder3DViewer } from './components/Feeder3DViewer';
import { PondRoiSimulator } from './components/PondRoiSimulator';
import { PitchDeckModal } from './components/PitchDeckModal';
import {
  Presentation,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

type PageId =
  | 'ringkasan-pasar'
  | 'produk-3d'
  | 'ekonomi-unit'
  | 'strategi-gtm'
  | 'keuangan-eksekusi';

interface PageDefinition {
  id: PageId;
  shortLabel: string;
  chapterRange: string;
  title: string;
  subtitle: string;
}

const PAGES: PageDefinition[] = [
  {
    id: 'ringkasan-pasar',
    shortLabel: '1. Ringkasan & Pasar',
    chapterRange: 'Bab 01 – 02',
    title: 'Ringkasan Eksekutif & Peluang Pasar (TAM/SAM/SOM)',
    subtitle:
      'Masalah biaya pakan 60–70%, solusi ekosistem IoT TebarPintar, serta pemetaan pasar akuakultur Indonesia berbasis data KKP & BPS.',
  },
  {
    id: 'produk-3d',
    shortLabel: '2. Produk 3D & Moat',
    chapterRange: 'Bab 03',
    title: 'Studio 3D Interaktif, Lini Produk & Pertahanan Bisnis',
    subtitle:
      'Inspeksi perangkat keras 360°, simulasi lontar pakan, rincian HPP komponen, serta 4 keunggulan kompetitif (defensive moat).',
  },
  {
    id: 'ekonomi-unit',
    shortLabel: '3. Bukti ROI & Unit Economics',
    chapterRange: 'Bab 04',
    title: 'Kalkulator Bukti FCR Kolam, Aplikasi Analitik & LTV/CAC',
    subtitle:
      'Simulasi penghematan pakan 10–15% per siklus panen, pratinjau aplikasi Rp 99.000/bulan, dan uji ketahanan rasio LTV/CAC ± 7,5x.',
  },
  {
    id: 'strategi-gtm',
    shortLabel: '4. Strategi Go-to-Market',
    chapterRange: 'Bab 05',
    title: 'Strategi Pemasaran Digital & Go-to-Market (Bulan 0–36)',
    subtitle:
      'Tiga fase eksekusi dari validasi 30–50 kolam pilot, akuisisi video pendek TikTok/Meta ke WhatsApp, hingga kemitraan pakan & koperasi.',
  },
  {
    id: 'keuangan-eksekusi',
    shortLabel: '5. Keuangan, Tim & Risiko',
    chapterRange: 'Bab 06 – 10',
    title: 'Proyeksi 36 Bulan, Dana Seed Rp 5 M, Tim, Risiko & 90 Hari',
    subtitle:
      'Model keuangan 3 skenario, alokasi dana Seed, profil tim Ti23A1, tata kelola audit pasca-eFishery, dan langkah konkret 90 hari.',
  },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('ringkasan-pasar');
  const [selected3DModel, setSelected3DModel] = useState<'Pro' | 'Lite'>('Pro');
  const [activeSegmentId, setActiveSegmentId] = useState<string>('umkm');
  const [activeGtmIdx, setActiveGtmIdx] = useState<number>(0);
  const [activeScenarioId, setActiveScenarioId] = useState<
    'konservatif' | 'agresif' | 'optimis'
  >('agresif');
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState<boolean>(false);

  // Interactive LTV / CAC Stress-Test Controls
  const [ltvMonths, setLtvMonths] = useState<number>(24);
  const [targetCacIDR, setTargetCacIDR] = useState<number>(400000);
  const [selectedUnitForLtv, setSelectedUnitForLtv] = useState<'Pro' | 'Lite'>(
    'Pro'
  );

  // Interactive Digital Marketing Funnel Simulator (Tahap 2 GTM)
  const [monthlyAdSpendIDR, setMonthlyAdSpendIDR] = useState<number>(30000000);
  const [costPerWaLeadIDR, setCostPerWaLeadIDR] = useState<number>(25000);
  const [waToSaleConvPct, setWaToSaleConvPct] = useState<number>(7.5);

  // Pilot Registration / Data Room Request Form State
  const [formState, setFormState] = useState({
    name: '',
    role: 'Pembudidaya Kolam Pilot (Lele/Nila/Koi)',
    location: '',
    whatsapp: '',
    pondCount: '4',
  });
  const [formError, setFormError] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Completed 90-day roadmap items toggle
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
  });

  // Scroll to top smoothly whenever user changes page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  const currentPageIndex = PAGES.findIndex((p) => p.id === activePage);
  const currentPageObj = PAGES[currentPageIndex] || PAGES[0];
  const prevPageObj = currentPageIndex > 0 ? PAGES[currentPageIndex - 1] : null;
  const nextPageObj =
    currentPageIndex < PAGES.length - 1 ? PAGES[currentPageIndex + 1] : null;

  const toggleRoadmapStep = (step: string) => {
    setCompletedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  // Derived LTV/CAC Calculations
  const initialHardwareContribution =
    selectedUnitForLtv === 'Pro' ? 1000000 : 190000;
  const monthlySaasContribution = 84000;
  const totalLtvIDR =
    initialHardwareContribution + monthlySaasContribution * ltvMonths;
  const ltvCacRatio = (totalLtvIDR / targetCacIDR).toFixed(1);

  // Derived Digital Marketing Funnel Metrics
  const monthlyWaLeads = Math.round(monthlyAdSpendIDR / costPerWaLeadIDR);
  const monthlyConvertedCustomers = Math.round(
    monthlyWaLeads * (waToSaleConvPct / 100)
  );
  const effectiveDigitalCacIDR =
    monthlyConvertedCustomers > 0
      ? Math.round(monthlyAdSpendIDR / monthlyConvertedCustomers)
      : 0;

  const activeSegment =
    MARKET_SEGMENTS.find((s) => s.id === activeSegmentId) || MARKET_SEGMENTS[0];
  const activeScenario =
    FINANCIAL_SCENARIOS.find((s) => s.id === activeScenarioId) ||
    FINANCIAL_SCENARIOS[1];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.location.trim()) {
      setFormError('Mohon lengkapi nama dan lokasi sentra kolam terlebih dahulu.');
      return;
    }
    const phoneClean = formState.whatsapp.replace(/\D/g, '');
    if (phoneClean.length < 9) {
      setFormError('Mohon masukkan nomor WhatsApp aktif minimal 9 digit angka.');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2] text-[#11181C]">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-10 py-4 bg-[#F6F6F2]/95 backdrop-blur-md border-b border-stone-200/90">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActivePage('ringkasan-pasar')}
          className="text-xl font-bold tracking-tight text-stone-900 font-display text-left cursor-pointer"
        >
          TebarPintar
        </button>

        {/* Zone 2: 5 clean text navigation links for multi-page switching */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          {PAGES.map((page) => {
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePage(page.id)}
                className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-stone-950 font-semibold underline decoration-2 decoration-[#0D6E52] underline-offset-8'
                    : 'hover:text-stone-950'
                }`}
              >
                {page.shortLabel}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPitchDeckOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0D6E52] rounded-lg hover:bg-[#0a5841] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5" />
            Slide Presentasi (13)
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Horizontal Page Switcher Bar */}
      <div className="lg:hidden border-b border-stone-200 bg-white px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {PAGES.map((page) => {
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePage(page.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-950 bg-stone-100'
                }`}
              >
                {page.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-header Context Strip: Academic Identity & Current Page Indicator */}
      <div className="border-b border-stone-200/80 bg-[#EFEFE9]/70 px-6 lg:px-10 py-3">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mono font-semibold text-stone-900">
              Kelas {ACADEMIC_INFO.classCode} · {ACADEMIC_INFO.course}
            </span>
            <span aria-hidden="true">·</span>
            <span>Faisal Fajar (312310123)</span>
            <span aria-hidden="true">·</span>
            <span>Muhamad Zulfikar (312310011)</span>
            <span aria-hidden="true">·</span>
            <span>Muhammad Ramadhani (312310511)</span>
          </div>

          <div className="font-mono text-xs text-[#0D6E52] font-semibold tabular-nums">
            Halaman {currentPageIndex + 1} dari {PAGES.length} · {currentPageObj.chapterRange}
          </div>
        </div>
      </div>

      {/* MAIN MULTI-PAGE WORKSPACE */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 lg:px-10 py-10">
        {/* =====================================================================
            HALAMAN 1: RINGKASAN EKSEKUTIF & PELUANG PASAR (BAB 1 & BAB 2)
           ===================================================================== */}
        {activePage === 'ringkasan-pasar' && (
          <div className="space-y-14">
            {/* Hero & Bab 1: Ringkasan Eksekutif */}
            <section>
              <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                BAB 01 · RINGKASAN EKSEKUTIF
              </div>

              <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                <div className="lg:col-span-8">
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-950 font-display leading-[1.1]">
                    TebarPintar: Ekosistem IoT Pemberi Pakan Otomatis untuk Budidaya Ikan Indonesia.
                  </h1>
                  <p className="mt-4 text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl">
                    Nilai jual utama:{' '}
                    <strong className="font-semibold text-stone-950">
                      “Hemat pakan 10–15%, panen lebih cepat, kolam bisa ditinggal.”
                    </strong>{' '}
                    Janji ini dibuktikan dengan data eksperimen kolam pilot terverifikasi, bukan sekadar klaim pemasaran.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePage('produk-3d')}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0D6E52] rounded-lg hover:bg-[#0a5841] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Buka Studio Produk 3D (Halaman 2)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('ekonomi-unit')}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-stone-900 bg-white border border-stone-300 rounded-lg hover:border-stone-900 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Coba Kalkulator ROI & LTV/CAC
                    </button>
                  </div>
                </div>

                {/* Key Executive Highlights */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200/90 p-6 space-y-4">
                  <div>
                    <div className="text-xs font-mono text-stone-500">
                      MASALAH UTAMA BUDIDAYA
                    </div>
                    <div className="text-2xl font-bold font-mono text-stone-950 tabular-nums mt-0.5">
                      60% – 70% Biaya Pakan
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Pemberian masih manual & berdasar perkiraan: pakan boros, ukuran ikan tidak seragam, kualitas air memburuk, dan pembudidaya tidak bisa meninggalkan kolam.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-200">
                    <div className="text-xs font-mono text-stone-500">
                      TARGET JANGKA 36 BULAN
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#0D6E52] tabular-nums mt-0.5">
                      ± Rp 3,6 Miliar / bulan
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Target omzet bulanan dengan laba bersih{' '}
                      <strong className="text-stone-900">± Rp 1 Miliar / bulan</strong>{' '}
                      (margin bersih ± 28%).
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Pilar Solusi & Model Bisnis */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-stone-200/90 p-6">
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    01. PENDAPATAN AWAL (PERANGKAT)
                  </div>
                  <h2 className="text-lg font-bold text-stone-950 mt-1 font-display">
                    Alat Pemberi Pakan & Sensor Air
                  </h2>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    Penjualan perangkat keras tahan lapangan (TebarPintar Pro Rp 2,5 juta & Lite Rp 500 ribu) yang menghasilkan margin kontribusi positif 38–40% langsung di transaksi pertama.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/90 p-6">
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    02. PENDAPATAN BERULANG (SAAS)
                  </div>
                  <h2 className="text-lg font-bold text-stone-950 mt-1 font-display">
                    Langganan Aplikasi Analitik
                  </h2>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    Langganan Rp 99.000/bulan (margin kontribusi 85%) untuk jadwal pakan adaptif sesuai respons ikan, pelacakan FCR, alarm DO/pH kritis, dan laporan panen.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/90 p-6">
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    03. VOLUME BESAR (KEMITRAAN B2B)
                  </div>
                  <h2 className="text-lg font-bold text-stone-950 mt-1 font-display">
                    Koperasi, Produsen Pakan & Dinas
                  </h2>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    Pengadaan skala besar bersama pabrik pakan, koperasi perikanan, dan program desa melalui skema bundling alat + pakan + pendampingan.
                  </p>
                </div>
              </div>
            </section>

            {/* Bab 2: Peluang Pasar & TAM/SAM/SOM */}
            <section className="pt-10 border-t border-stone-200/90">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    BAB 02 · PELUANG PASAR & DATA TAM / SAM / SOM (KKP & BPS)
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-950 mt-1 font-display">
                    Potensi Pasar Akuakultur Indonesia & Tiga Segmen Sasaran
                  </h2>
                </div>
                <p className="text-xs text-stone-600 max-w-md">
                  Dilengkapi angka TAM, SAM, dan SOM dari populasi pembudidaya dan jumlah kolam (Statistik KKP & BPS) sesuai ekspektasi investor.
                </p>
              </div>

              {/* TAM / SAM / SOM Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TAM_SAM_SOM_SUMMARY.map((item, idx) => (
                  <div
                    key={item.tier}
                    className={`rounded-xl p-6 border flex flex-col justify-between ${
                      idx === 2
                        ? 'bg-[#11181C] text-white border-stone-800'
                        : 'bg-white text-stone-900 border-stone-200/90'
                    }`}
                  >
                    <div>
                      <div
                        className={`text-xs font-mono ${
                          idx === 2 ? 'text-emerald-400' : 'text-stone-500'
                        }`}
                      >
                        0{idx + 1} · {item.tier}
                      </div>
                      <div className="text-2xl font-bold font-mono tabular-nums mt-2">
                        {item.headline}
                      </div>
                      <p
                        className={`text-xs sm:text-sm mt-2.5 leading-relaxed ${
                          idx === 2 ? 'text-slate-300' : 'text-stone-600'
                        }`}
                      >
                        {item.subtext}
                      </p>
                    </div>
                    <div
                      className={`mt-4 pt-3 border-t text-xs ${
                        idx === 2
                          ? 'border-white/10 text-slate-400'
                          : 'border-stone-100 text-stone-500'
                      }`}
                    >
                      Dasar Asumsi: {item.methodology}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive 3-Segment Matrix */}
              <div className="mt-8 bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Karakter & Peran Tiga Segmen Pasar
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Klik segmen untuk melihat detail ukuran pasar dan strategi produknya
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-lg">
                    {MARKET_SEGMENTS.map((seg) => (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setActiveSegmentId(seg.id)}
                        className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                          activeSegmentId === seg.id
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-700 hover:text-stone-950'
                        }`}
                      >
                        {seg.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                      PERAN BAGI BISNIS: {activeSegment.businessRole.toUpperCase()}
                    </div>
                    <h4 className="text-xl font-bold text-stone-950 font-display">
                      {activeSegment.name} — {activeSegment.subsegment}
                    </h4>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      <strong>Karakter:</strong> {activeSegment.character}.{' '}
                      <strong>Masalah Lapangan:</strong> {activeSegment.keyPainPoint}
                    </p>
                    <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80 text-xs sm:text-sm text-stone-800">
                      <span className="font-semibold text-[#0D6E52]">
                        Bukti Nilai Jual:{' '}
                      </span>
                      {activeSegment.proofHook}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-stone-50 rounded-xl p-5 border border-stone-200/80 space-y-2.5 font-mono text-xs tabular-nums">
                    <div>
                      <span className="text-stone-500 block">Populasi TAM</span>
                      <span className="text-stone-950 font-semibold">
                        {activeSegment.tamUnits}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-stone-500 block">Sasaran SAM</span>
                      <span className="text-stone-950 font-semibold">
                        {activeSegment.samUnits}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-stone-500 block">Target SOM (Bulan 36)</span>
                      <span className="text-[#0D6E52] font-semibold">
                        {activeSegment.som36Months}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-stone-500 block">Rekomendasi Produk</span>
                      <span className="text-stone-950 font-semibold">
                        {activeSegment.recommendedProduct}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            HALAMAN 2: STUDIO 3D INTERAKTIF, LINI PRODUK & MOAT (BAB 3)
           ===================================================================== */}
        {activePage === 'produk-3d' && (
          <div className="space-y-12">
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    BAB 03 · PRODUK & KEUNGGULAN YANG BISA DIPERTAHANKAN (MOAT)
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-stone-950 mt-1 font-display">
                    Studio 3D Interaktif TebarPintar Pro & Lite
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md">
                  Putar model 3D 360°, klik tombol <strong>Bedah Komponen (Exploded)</strong> untuk melihat rakitan dalam, atau tekan <strong>Uji Lontar Pakan 360°</strong>.
                </p>
              </div>

              {/* Three.js 3D Hardware Studio */}
              <Feeder3DViewer
                selectedModel={selected3DModel}
                onSelectModel={setSelected3DModel}
              />
            </section>

            {/* Tabel Lini Produk */}
            <section className="bg-white rounded-xl border border-stone-200/90 overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-display">
                    Lini Produk, Fitur Inti & Asumsi Harga
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kombinasi penjualan perangkat keras (CapEx terjangkau) dan langganan aplikasi (MRR)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected3DModel('Pro')}
                    className={`px-3 py-1 text-xs font-mono rounded border cursor-pointer ${
                      selected3DModel === 'Pro'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Tampilkan 3D Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected3DModel('Lite')}
                    className={`px-3 py-1 text-xs font-mono rounded border cursor-pointer ${
                      selected3DModel === 'Lite'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Tampilkan 3D Lite
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs font-mono text-stone-500 bg-stone-50/70">
                      <th className="py-3.5 px-6">Lini</th>
                      <th className="py-3.5 px-6">Segmen Utama</th>
                      <th className="py-3.5 px-6">Fitur Inti</th>
                      <th className="py-3.5 px-6 text-right">Harga (Asumsi)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-sm">
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-4 px-6 font-semibold text-stone-950 whitespace-nowrap">
                        Pro
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        Kolam UMKM (Lele, Nila, Patin) & Tambak
                      </td>
                      <td className="py-4 px-6 text-stone-700">
                        Kapasitas besar (45L), panel surya 25Wp, sensor air (suhu, DO, pH), konektivitas LoRa/SIM offline-first
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-stone-950 tabular-nums whitespace-nowrap">
                        Rp 2.500.000
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-4 px-6 font-semibold text-stone-950 whitespace-nowrap">
                        Lite
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        Aquarium & Kolam Hobi (Koi, Arwana, Aquascape)
                      </td>
                      <td className="py-4 px-6 text-stone-700">
                        Desain ringkas (6L) kedap lembap, takaran gramasi presisi, kontrol jadwal via WiFi
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-stone-950 tabular-nums whitespace-nowrap">
                        Rp 500.000
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-4 px-6 font-semibold text-[#0D6E52] whitespace-nowrap">
                        Aplikasi (Langganan)
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        Seluruh Pengguna Pro, Lite & Koperasi B2B
                      </td>
                      <td className="py-4 px-6 text-stone-700">
                        Jadwal pakan adaptif, pelacakan FCR, alarm kualitas air real-time, laporan panen
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-[#0D6E52] tabular-nums whitespace-nowrap">
                        Rp 99.000 / bulan
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4 Pertahanan Bisnis (Moat) */}
            <section>
              <div className="text-xs font-mono text-stone-500">
                PERTAHANAN BISNIS JANGKA PANJANG (DEFENSIVE MOAT)
              </div>
              <h2 className="text-2xl font-bold text-stone-950 mt-1 font-display">
                4 Keunggulan yang Sulit Ditiru Kompetitor
              </h2>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOAT_PILLARS.map((moat) => (
                  <div
                    key={moat.index}
                    className="bg-white rounded-xl border border-stone-200/90 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                        {moat.index}. KEUNGGULAN MOAT
                      </div>
                      <h3 className="text-lg font-bold text-stone-950 mt-1 font-display">
                        {moat.title}
                      </h3>
                      <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                        {moat.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-mono text-stone-700">
                      Target Validasi: {moat.metric}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            HALAMAN 3: BUKTI ROI KOLAM & EKONOMI UNIT / LTV-CAC (BAB 4)
           ===================================================================== */}
        {activePage === 'ekonomi-unit' && (
          <div className="space-y-14">
            {/* Bab 4 Bagian A: Ekonomi Unit & LTV/CAC */}
            <section>
              <div className="mb-6">
                <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                  BAB 04 · EKONOMI UNIT (UNIT ECONOMICS) & RASIO LTV / CAC
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-950 mt-1 font-display">
                  Bedah HPP, Margin Kontribusi & Simulasi LTV/CAC ± 7,5x
                </h1>
                <p className="text-sm text-stone-600 mt-1.5 max-w-3xl">
                  Yang paling menarik bagi investor adalah rasio LTV/CAC. Jika pelanggan Pro berlangganan 24 bulan, total kontribusinya mencapai ± Rp 3 juta. Dengan CAC ≤ Rp 400.000, rasio LTV/CAC mencapai ± 7,5x (jauh di atas batas sehat 3x).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Unit Economics Table */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200/90 overflow-hidden">
                  <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/70">
                    <h2 className="text-base font-bold text-stone-900 font-display">
                      Tabel Ekonomi Unit: Pro, Lite & Aplikasi Langganan
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-xs font-mono text-stone-500">
                          <th className="py-3.5 px-5">Pos Ekonomi Unit</th>
                          <th className="py-3.5 px-5 text-right">Pro</th>
                          <th className="py-3.5 px-5 text-right">Lite</th>
                          <th className="py-3.5 px-5 text-right">Langganan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-sm font-mono tabular-nums">
                        {UNIT_ECONOMICS_TABLE.map((row, idx) => {
                          const isLast = idx === UNIT_ECONOMICS_TABLE.length - 1;
                          return (
                            <tr
                              key={row.metric}
                              className={
                                isLast
                                  ? 'bg-emerald-950/5 font-semibold text-stone-950'
                                  : 'text-stone-700'
                              }
                            >
                              <td className="py-4 px-5 font-sans font-medium text-stone-900">
                                {row.metric}
                              </td>
                              <td className="py-4 px-5 text-right whitespace-nowrap">
                                Rp {row.pro.toLocaleString('id-ID')}
                                <span className="text-xs text-stone-500">
                                  {row.unitSuffix.pro}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right whitespace-nowrap">
                                Rp {row.lite.toLocaleString('id-ID')}
                                <span className="text-xs text-stone-500">
                                  {row.unitSuffix.lite}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right whitespace-nowrap text-[#0D6E52]">
                                {row.saas > 0
                                  ? `Rp ${row.saas.toLocaleString('id-ID')}`
                                  : '—'}
                                <span className="text-xs text-stone-500">
                                  {row.saas > 0 ? row.unitSuffix.saas : ''}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-5 border-t border-stone-200 bg-stone-50/50 text-xs text-stone-600 leading-relaxed">
                    <strong>Catatan Penting:</strong> Angka LTV/CAC ini akan divalidasi penuh pada Tahap 1 (Pilot 30–50 kolam), terutama untuk mengukur tingkat berhenti langganan (<em>churn rate</em>) riil setelah bulan ke-6.
                  </div>
                </div>

                {/* Interactive LTV / CAC Simulator */}
                <div className="lg:col-span-5 bg-[#11181C] text-white rounded-xl border border-stone-800 p-6">
                  <div className="text-xs font-mono text-emerald-400">
                    SIMULATOR SENSITIVITAS LTV / CAC
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1 font-display">
                    Uji Skenario Retensi Langganan & Biaya CAC
                  </h2>

                  <div className="mt-4 flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedUnitForLtv('Pro')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        selectedUnitForLtv === 'Pro'
                          ? 'bg-[#0D6E52] text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Pelanggan Pro + Aplikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUnitForLtv('Lite')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        selectedUnitForLtv === 'Lite'
                          ? 'bg-[#0D6E52] text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Pelanggan Lite + Aplikasi
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Durasi Berlangganan Aplikasi</span>
                        <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                          {ltvMonths} Bulan
                        </span>
                      </div>
                      <input
                        type="range"
                        min={6}
                        max={36}
                        step={2}
                        value={ltvMonths}
                        onChange={(e) => setLtvMonths(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Biaya Akuisisi Pelanggan (CAC)</span>
                        <span className="font-mono font-semibold text-amber-300 tabular-nums">
                          Rp {targetCacIDR.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={200000}
                        max={800000}
                        step={50000}
                        value={targetCacIDR}
                        onChange={(e) => setTargetCacIDR(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4 font-mono tabular-nums">
                    <div>
                      <div className="text-xs text-slate-400">Nilai LTV Kontribusi</div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        Rp {totalLtvIDR.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Rp {(initialHardwareContribution / 1000).toLocaleString('id-ID')}rb + (Rp 84rb × {ltvMonths})
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400">Rasio LTV / CAC</div>
                      <div
                        className={`text-2xl font-bold mt-0.5 ${
                          Number(ltvCacRatio) >= 3
                            ? 'text-emerald-400'
                            : 'text-amber-300'
                        }`}
                      >
                        {ltvCacRatio}x
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {Number(ltvCacRatio) >= 3
                          ? 'Di atas standar sehat 3,0x'
                          : 'Di bawah ambang 3,0x'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bagian B: Kalkulator ROI Kolam & Pratinjau Aplikasi */}
            <section className="pt-10 border-t border-stone-200/90">
              <div className="mb-6">
                <div className="text-xs font-mono text-stone-500">
                  SIMULASI NILAI EKONOMI BAGI PEMBUDIDAYA
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-950 mt-1 font-display">
                  Kalkulator Penghematan Pakan 10–15% & Pratinjau Aplikasi
                </h2>
              </div>

              <PondRoiSimulator />
            </section>
          </div>
        )}

        {/* =====================================================================
            HALAMAN 4: STRATEGI GO-TO-MARKET & FUNNEL DIGITAL (BAB 5)
           ===================================================================== */}
        {activePage === 'strategi-gtm' && (
          <div className="space-y-12">
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    BAB 05 · STRATEGI GO-TO-MARKET (3 TAHAP EKSEKUSI)
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-stone-950 mt-1 font-display">
                    Peta Jalan Akuisisi Pasar: Bulan 0 hingga Bulan 36
                  </h1>
                </div>

                <div className="flex flex-wrap gap-1.5 p-1 bg-stone-200/80 rounded-lg">
                  {GTM_PHASES.map((p, idx) => (
                    <button
                      key={p.phase}
                      type="button"
                      onClick={() => setActiveGtmIdx(idx)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        activeGtmIdx === idx
                          ? 'bg-stone-950 text-white'
                          : 'text-stone-700 hover:text-stone-950'
                      }`}
                    >
                      {p.phase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active GTM Phase Box */}
              <div className="bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-stone-200">
                  <div>
                    <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                      {GTM_PHASES[activeGtmIdx].phase.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-stone-950 mt-0.5 font-display">
                      {GTM_PHASES[activeGtmIdx].subtitle}
                    </h2>
                  </div>
                  <div className="text-xs font-mono text-stone-700 bg-stone-100 px-3.5 py-2 rounded-lg tabular-nums">
                    Target KPI: {GTM_PHASES[activeGtmIdx].targetKPI}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {GTM_PHASES[activeGtmIdx].strategies.map((strat, i) => (
                    <div
                      key={strat.title}
                      className="p-5 rounded-xl bg-stone-50 border border-stone-200/80"
                    >
                      <div className="text-xs font-mono text-stone-500">
                        PILAR EKSEKUSI 0{i + 1}
                      </div>
                      <h3 className="text-base font-bold text-stone-950 mt-1 font-display">
                        {strat.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {strat.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs font-semibold text-stone-900">
                    Kanal Distribusi & Pemasaran Utama:
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600">
                    {GTM_PHASES[activeGtmIdx].digitalChannels.map((ch, idx) => (
                      <React.Fragment key={ch}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>{ch}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Simulator Funnel Iklan Digital (Meta/TikTok -> WhatsApp -> COD) */}
            <section className="bg-stone-900 text-white rounded-xl p-6 sm:p-8 border border-stone-800">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6">
                  <div className="text-xs font-mono text-emerald-400">
                    SIMULATOR AKUISISI DIGITAL MARKETING (TAHAP 2)
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1 font-display">
                    Funnel Konten Video Pendek → Iklan Click-to-WhatsApp → COD & Garansi 30 Hari
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Uji bagaimana anggaran iklan Meta/TikTok dan program Duta Kolam (komisi 8–10%) menghasilkan akuisisi pelanggan dengan CAC terkendali.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Budget Iklan Meta & TikTok / Bulan</span>
                        <span className="font-mono text-white tabular-nums">
                          Rp {monthlyAdSpendIDR.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10000000}
                        max={100000000}
                        step={5000000}
                        value={monthlyAdSpendIDR}
                        onChange={(e) => setMonthlyAdSpendIDR(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Biaya per Lead WA</span>
                          <span className="font-mono text-white tabular-nums">
                            Rp {costPerWaLeadIDR.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={15000}
                          max={50000}
                          step={2500}
                          value={costPerWaLeadIDR}
                          onChange={(e) => setCostPerWaLeadIDR(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Rasio Closing WA</span>
                          <span className="font-mono text-white tabular-nums">
                            {waToSaleConvPct}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={3}
                          max={15}
                          step={0.5}
                          value={waToSaleConvPct}
                          onChange={(e) => setWaToSaleConvPct(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono tabular-nums">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-slate-400">Leads WhatsApp / Bln</div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {monthlyWaLeads.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">
                      Masuk dari video demo & transformasi kolam
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-slate-400">Penjualan / Bln</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {monthlyConvertedCustomers.toLocaleString('id-ID')} Unit
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">
                      Didorong opsi COD, cicilan & garansi 30 hari
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-slate-400">CAC Aktual</div>
                    <div
                      className={`text-xl font-bold mt-1 ${
                        effectiveDigitalCacIDR <= 400000
                          ? 'text-emerald-400'
                          : 'text-amber-300'
                      }`}
                    >
                      Rp {effectiveDigitalCacIDR.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">
                      {effectiveDigitalCacIDR <= 400000
                        ? 'Sesuai target ≤ Rp 400.000'
                        : 'Melebihi target Rp 400.000'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dokumentasi Visual Segmen & Lapangan */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col">
                <div className="relative aspect-16/10 bg-stone-900 overflow-hidden">
                  <img
                    src={IMAGES.pilotBiofloc}
                    alt="Kolam pilot bioflok dengan TebarPintar Pro"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-xs font-mono text-white">
                      Tahap 1 · 30–50 Kolam Pilot & Kontrol
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Studi Kasus Video & Verifikasi Kampus
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Hasil penghematan pakan, FCR, dan waktu panen didokumentasikan bersama penyuluh perikanan sebagai senjata pemasaran Tahap 2.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col">
                <div className="relative aspect-16/10 bg-stone-900 overflow-hidden">
                  <img
                    src={IMAGES.koiPond}
                    alt="Kolam hobiis Koi dengan TebarPintar Lite"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-xs font-mono text-white">
                      Tahap 2 · Marketplace & Komunitas Hobiis
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Penetrasi Cepat via Kreator Niche & Reseller
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Distribusi lewat agen sentra budidaya di Jawa Barat, Jawa Tengah, Jawa Timur, dan Sumatera dengan komisi 8–10%.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col">
                <div className="relative aspect-16/10 bg-stone-900 overflow-hidden">
                  <img
                    src={IMAGES.fieldTeam}
                    alt="Pendampingan teknis dan kemitraan B2B"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-xs font-mono text-white">
                      Tahap 3 · Bundling Pakan & Ekspansi Udang
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Skema Bagi Hasil / Cicilan Potong Panen
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Kemitraan dengan produsen pakan, koperasi, dan dinas untuk membuka akses pembudidaya skala menengah-besar di luar Jawa.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            HALAMAN 5: KEUANGAN 36 BULAN, DANA SEED, TIM, RISIKO & 90 HARI (BAB 6-10)
           ===================================================================== */}
        {activePage === 'keuangan-eksekusi' && (
          <div className="space-y-14">
            {/* Bab 6: Proyeksi 36 Bulan dengan 3 Skenario */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                    BAB 06 · PROYEKSI KEUANGAN 36 BULAN (TIGA SKENARIO)
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-stone-950 mt-1 font-display">
                    Lintasan Omzet, Pelanggan Berlangganan & Laba Bersih
                  </h1>
                </div>

                <div className="flex flex-wrap gap-1.5 p-1 bg-stone-200/80 rounded-lg">
                  {FINANCIAL_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => setActiveScenarioId(scen.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        activeScenarioId === scen.id
                          ? 'bg-stone-950 text-white'
                          : 'text-stone-700 hover:text-stone-950'
                      }`}
                    >
                      {scen.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-stone-200">
                  <div>
                    <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                      {activeScenario.badge.toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-stone-950 mt-0.5 font-display">
                      {activeScenario.name} — Margin Bersih Bulan ke-36: {activeScenario.netMarginMonth36}
                    </h2>
                    <p className="text-xs text-stone-600 mt-1 max-w-2xl">
                      {activeScenario.description}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-stone-600 tabular-nums">
                    Asumsi Churn: {activeScenario.churnAssumption} · CAC: {activeScenario.cacAssumption}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeScenario.milestones.map((m) => (
                    <div
                      key={m.period}
                      className="p-5 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                          <span>PERIODE</span>
                          <span>{m.period.toUpperCase()}</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs text-stone-500 block">
                            Omzet / Bulan
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-950 tabular-nums">
                            {m.revenueLabel}
                          </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-stone-200/80 space-y-2 font-mono text-xs tabular-nums">
                          <div className="flex justify-between">
                            <span className="text-stone-500 font-sans">
                              Pelanggan Berlangganan:
                            </span>
                            <span className="font-semibold text-stone-900">
                              ± {m.activeSubscribers.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500 font-sans">
                              Unit Terjual / Bulan:
                            </span>
                            <span className="text-stone-800">
                              {m.proUnitsMonthly} Pro · {m.liteUnitsMonthly} Lite
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="text-stone-500">Laba Bersih/Bln:</span>
                        <span
                          className={`font-bold ${
                            m.netProfitMonthlyIDR > 0
                              ? 'text-[#0D6E52]'
                              : 'text-amber-700'
                          }`}
                        >
                          {m.netProfitLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bab 7: Kebutuhan Dana Seed Rp 5 Miliar & Milestone */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
                <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                  BAB 07 · KEBUTUHKAN DANA & PENGGUNAAN (PUTARAN SEED RP 5 MILIAR)
                </div>
                <h2 className="text-2xl font-bold text-stone-950 mt-1 font-display">
                  Alokasi Dana Seed Rp 5 Miliar
                </h2>

                <div className="mt-6 space-y-4">
                  {SEED_FUNDING_ALLOCATION.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-stone-900">
                          {item.category}
                        </span>
                        <span className="font-mono text-xs font-semibold text-stone-900 tabular-nums">
                          {item.percentage}% · {item.amountIDR}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0D6E52]"
                          style={{ width: `${item.percentage * 2.5}%` }}
                        />
                      </div>
                      <p className="text-xs text-stone-600">{item.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#11181C] text-white rounded-xl border border-stone-800 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-emerald-400">
                    MILESTONE PENENTU PUTARAN BERIKUTNYA
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1 font-display">
                    4 Indikator Validasi Menuju Seri A
                  </h2>
                  <div className="mt-6 space-y-4">
                    {SERIES_A_MILESTONES.map((ms) => (
                      <div
                        key={ms.label}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                            {ms.metric}
                          </span>
                          <span className="text-xs font-semibold text-white text-right">
                            {ms.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {ms.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Bab 8: Tim yang Dibutuhkan */}
            <section className="bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
              <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                BAB 08 · TIM YANG DIBUTUHKAN & PENUTUPAN CELAH KOMPETENSI
              </div>
              <h2 className="text-2xl font-bold text-stone-950 mt-1 font-display">
                Struktur Founder Kelompok Ti23A1 & Penasihat Ahli Akuakultur
              </h2>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-5">
                {ACADEMIC_INFO.members.map((m) => (
                  <div
                    key={m.nim}
                    className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono text-[#0D6E52] tabular-nums">
                        NIM {m.nim} · Kelas {ACADEMIC_INFO.classCode}
                      </div>
                      <h3 className="text-lg font-bold text-stone-950 mt-1 font-display">
                        {m.name}
                      </h3>
                      <div className="text-xs font-semibold text-stone-800 mt-1">
                        {m.role}
                      </div>
                      <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                        {m.focus}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-300/80 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-amber-900 font-semibold">
                      PENUTUPAN CELAH (GAP)
                    </div>
                    <h3 className="text-lg font-bold text-stone-950 mt-1 font-display">
                      Penasihat Ahli Akuakultur
                    </h3>
                    <div className="text-xs font-semibold text-amber-900 mt-1">
                      Akademisi Kampus & Penyuluh Perikanan
                    </div>
                    <p className="text-xs text-stone-700 mt-2.5 leading-relaxed">
                      Menutup celah biologi budidaya dengan merekrut dosen Fakultas Perikanan dan praktisi senior sebagai dewan penasihat untuk memvalidasi algoritma FCR dan memimpin audit kolam pilot.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bab 9: Risiko & Mitigasi */}
            <section className="bg-white rounded-xl border border-stone-200/90 overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                  BAB 09 · RISIKO DAN MITIGASI (TERMASUK AUDIT PASCA-KASUS EFISHERY)
                </div>
                <h2 className="text-xl font-bold text-stone-950 mt-0.5 font-display">
                  Matriks Mitigasi Risiko Teknis, Pasar & Tata Kelola Data
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs font-mono text-stone-500 bg-stone-50/70">
                      <th className="py-3.5 px-6">Risiko</th>
                      <th className="py-3.5 px-6">Kategori</th>
                      <th className="py-3.5 px-6">Dampak</th>
                      <th className="py-3.5 px-6">Mitigasi Konkret</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-sm">
                    {RISK_MATRIX.map((r) => (
                      <tr key={r.risk} className="hover:bg-stone-50/60">
                        <td className="py-4 px-6 font-semibold text-stone-950 max-w-xs">
                          {r.risk}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-stone-700 whitespace-nowrap">
                          {r.severity}
                        </td>
                        <td className="py-4 px-6 text-xs text-stone-600 max-w-xs leading-relaxed">
                          {r.impact}
                        </td>
                        <td className="py-4 px-6 text-xs text-stone-800 max-w-md leading-relaxed">
                          {r.mitigation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Bab 10: Langkah Selanjutnya (90 Hari) & Form Kolam Pilot */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7">
                <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                  BAB 10 · LANGKAH SELANJUTNYA (RENCANA EKSEKUSI 90 HARI)
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-950 mt-1 font-display">
                  5 Agenda Prioritas 90 Hari Pertama
                </h2>

                <div className="mt-5 space-y-3">
                  {NINETY_DAY_ROADMAP.map((item) => {
                    const isDone = !!completedSteps[item.step];
                    return (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => toggleRoadmapStep(item.step)}
                        className={`w-full text-left p-5 rounded-xl border transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-white border-[#0D6E52]/60'
                            : 'bg-white border-stone-200/90 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-[#0D6E52] font-semibold">
                            LANGKAH {item.step} · {item.timeframe}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-stone-600">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isDone ? 'text-[#0D6E52]' : 'text-stone-300'
                              }`}
                            />
                            {isDone ? 'Tersedia / Terverifikasi' : item.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-stone-950 mt-1 font-display">
                          {item.title}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                          {item.deliverable}
                        </p>
                        <div className="mt-3 pt-2.5 border-t border-stone-100 text-xs text-stone-500">
                          PIC: <span className="font-medium text-stone-800">{item.owner}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Kolaborasi Pilot / Data Room */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
                <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                  REKRUTMEN 30 KOLAM PILOT & DATA ROOM
                </div>
                <h2 className="text-2xl font-bold text-stone-950 mt-1 font-display">
                  Daftar Kolam Pilot atau Akses Dokumen BoM
                </h2>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  Simulasi formulir pendaftaran untuk pemilik kolam lele/nila/koi maupun permintaan akses Data Room investor.
                </p>

                {formSubmitted ? (
                  <div className="mt-6 p-5 rounded-xl bg-emerald-950/5 border border-[#0D6E52]/40">
                    <div className="text-xs font-mono text-[#0D6E52] font-semibold">
                      PENGAJUAN DITERIMA
                    </div>
                    <h3 className="text-base font-bold text-stone-950 mt-1">
                      Terima kasih, {formState.name}
                    </h3>
                    <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">
                      Tim TebarPintar telah mencatat pendaftaran kategori{' '}
                      <strong>{formState.role}</strong> di{' '}
                      <strong>{formState.location}</strong> ({formState.pondCount} kolam) untuk nomor WhatsApp{' '}
                      <span className="font-mono">{formState.whatsapp}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Isi Data Baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Nama Lengkap / Kelompok Tani / Instansi
                      </label>
                      <input
                        type="text"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        placeholder="Contoh: Bpk. Hendra — Pokdakan Mina Jaya"
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#0D6E52]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Kategori Kemitraan
                      </label>
                      <select
                        value={formState.role}
                        onChange={(e) =>
                          setFormState({ ...formState, role: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#0D6E52]"
                      >
                        <option>Pembudidaya Kolam Pilot (Lele/Nila/Koi)</option>
                        <option>Calon Duta Kolam / Agen Sentra (Komisi 8–10%)</option>
                        <option>Koperasi Perikanan / Produsen Pakan B2B</option>
                        <option>Investor / Dosen Penguji (Akses Data Room)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          value={formState.location}
                          onChange={(e) =>
                            setFormState({ ...formState, location: e.target.value })
                          }
                          placeholder="Subang, Jawa Barat"
                          className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#0D6E52]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Jumlah Kolam
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={formState.pondCount}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              pondCount: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#0D6E52]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Nomor WhatsApp Aktif
                      </label>
                      <input
                        type="tel"
                        value={formState.whatsapp}
                        onChange={(e) =>
                          setFormState({ ...formState, whatsapp: e.target.value })
                        }
                        placeholder="081234567890"
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#0D6E52]"
                      />
                    </div>

                    {formError && (
                      <p className="text-xs text-red-600 font-medium">
                        {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0D6E52] rounded-lg hover:bg-[#0a5841] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Kirim Pendaftaran Kolam Pilot
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            BOTTOM MULTI-PAGE PAGINATION BAR (PREV / NEXT CHAPTER)
           ===================================================================== */}
        <div className="mt-14 pt-8 border-t border-stone-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {prevPageObj ? (
            <button
              type="button"
              onClick={() => setActivePage(prevPageObj.id)}
              className="flex items-center gap-3 px-5 py-3.5 bg-white border border-stone-300 rounded-xl hover:border-stone-900 transition-colors text-left cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600 shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-stone-500">
                  HALAMAN SEBELUMNYA ({prevPageObj.chapterRange})
                </div>
                <div className="text-sm font-bold text-stone-950 font-display">
                  {prevPageObj.shortLabel}
                </div>
              </div>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-center gap-1.5">
            {PAGES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(p.id)}
                className={`w-8 h-8 rounded-lg font-mono text-xs transition-colors cursor-pointer tabular-nums ${
                  p.id === activePage
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-200/70 text-stone-600 hover:bg-stone-300'
                }`}
                title={p.title}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {nextPageObj ? (
            <button
              type="button"
              onClick={() => setActivePage(nextPageObj.id)}
              className="flex items-center justify-between sm:justify-end gap-3 px-5 py-3.5 bg-[#0D6E52] text-white rounded-xl hover:bg-[#0a5841] transition-colors text-right cursor-pointer"
            >
              <div>
                <div className="text-[11px] font-mono text-emerald-200">
                  LANJUT KE HALAMAN BERIKUTNYA ({nextPageObj.chapterRange})
                </div>
                <div className="text-sm font-bold text-white font-display">
                  {nextPageObj.shortLabel}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPitchDeckOpen(true)}
              className="flex items-center justify-between sm:justify-end gap-3 px-5 py-3.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors text-right cursor-pointer"
            >
              <div>
                <div className="text-[11px] font-mono text-emerald-400">
                  SELESAI MEMBACA 5 HALAMAN
                </div>
                <div className="text-sm font-bold text-white font-display">
                  Buka Mode Presentasi 13 Slide
                </div>
              </div>
              <Presentation className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>
          )}
        </div>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-stone-200/90 bg-[#EFEFE9] py-8 px-6 lg:px-10 mt-12">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-stone-900 font-display">
              TebarPintar — Ekosistem IoT Pemberi Pakan Otomatis Budidaya Ikan Indonesia
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              Faisal Fajar (312310123) · Muhamad Zulfikar (312310011) · Muhammad Ramadhani (312310511) · Kelas Ti23A1 · Digital Marketing
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {PAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(p.id)}
                className={`cursor-pointer ${
                  activePage === p.id
                    ? 'font-semibold text-stone-950 underline underline-offset-4'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* 13-Slide Pitch Deck Modal */}
      <PitchDeckModal
        isOpen={isPitchDeckOpen}
        onClose={() => setIsPitchDeckOpen(false)}
      />
    </div>
  );
}
