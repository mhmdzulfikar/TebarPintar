import React, { useState } from 'react';

interface SpeciesPreset {
  id: string;
  name: string;
  defaultPonds: number;
  biomassPerPondKg: number;
  manualFCR: number;
  tebarPintarFCR: number;
  feedPricePerKg: number;
  cycleDaysManual: number;
  cycleDaysSmart: number;
}

const SPECIES_PRESETS: SpeciesPreset[] = [
  {
    id: 'lele',
    name: 'Lele Sangkuriang (Bioflok / Terpal)',
    defaultPonds: 4,
    biomassPerPondKg: 1000,
    manualFCR: 1.18,
    tebarPintarFCR: 1.02,
    feedPricePerKg: 13500,
    cycleDaysManual: 85,
    cycleDaysSmart: 74,
  },
  {
    id: 'nila',
    name: 'Nila Nirwana (Kolam Intensif)',
    defaultPonds: 4,
    biomassPerPondKg: 1200,
    manualFCR: 1.42,
    tebarPintarFCR: 1.23,
    feedPricePerKg: 14000,
    cycleDaysManual: 120,
    cycleDaysSmart: 105,
  },
  {
    id: 'patin',
    name: 'Patin Siam (Kolam Tanah / Keramba)',
    defaultPonds: 3,
    biomassPerPondKg: 1500,
    manualFCR: 1.5,
    tebarPintarFCR: 1.31,
    feedPricePerKg: 12500,
    cycleDaysManual: 150,
    cycleDaysSmart: 134,
  },
];

export const PondRoiSimulator: React.FC = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesPreset>(
    SPECIES_PRESETS[0]
  );
  const [pondCount, setPondCount] = useState<number>(4);
  const [biomassPerPond, setBiomassPerPond] = useState<number>(1000);
  const [feedPrice, setFeedPrice] = useState<number>(13500);
  const [activeAppTab, setActiveAppTab] = useState<'jadwal' | 'fcr' | 'sensor'>(
    'jadwal'
  );

  const handleSelectSpecies = (preset: SpeciesPreset) => {
    setSelectedSpecies(preset);
    setPondCount(preset.defaultPonds);
    setBiomassPerPond(preset.biomassPerPondKg);
    setFeedPrice(preset.feedPricePerKg);
  };

  // Calculations
  const totalBiomassKg = pondCount * biomassPerPond;
  const manualFeedKg = Math.round(totalBiomassKg * selectedSpecies.manualFCR);
  const smartFeedKg = Math.round(totalBiomassKg * selectedSpecies.tebarPintarFCR);
  const savedFeedKg = manualFeedKg - smartFeedKg;
  const savedPct = ((savedFeedKg / manualFeedKg) * 100).toFixed(1);

  const manualFeedCostIDR = manualFeedKg * feedPrice;
  const smartFeedCostIDR = smartFeedKg * feedPrice;
  const grossSavingsPerCycleIDR = manualFeedCostIDR - smartFeedCostIDR;

  const hardwareInvestmentIDR = pondCount * 2500000;
  const cycleMonths = Math.ceil(selectedSpecies.cycleDaysSmart / 30);
  const saasCostPerCycleIDR = pondCount * 99000 * cycleMonths;
  const netBenefitFirstCycleIDR =
    grossSavingsPerCycleIDR - saasCostPerCycleIDR;

  const paybackCycles =
    netBenefitFirstCycleIDR > 0
      ? (hardwareInvestmentIDR / netBenefitFirstCycleIDR).toFixed(1)
      : '—';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 Columns: Interactive Pond ROI & Feed Savings Calculator */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200/90 p-6 sm:p-8">
        <div className="text-xs font-mono text-stone-500">
          SIMULATOR BUKTI EKONOMI PEMBUDIDAYA · KALKULATOR FCR
        </div>
        <h3 className="text-2xl font-bold text-stone-900 mt-1 font-display">
          Hitung Penghematan Pakan 10–15% & Waktu Balik Modal Alat
        </h3>
        <p className="text-sm text-stone-600 mt-1.5">
          Janji utama TebarPintar bukan klaim iklan, melainkan penurunan rasio konversi pakan (FCR) yang terukur per siklus panen.
        </p>

        {/* Species Selector */}
        <div className="mt-6">
          <label className="block text-xs font-medium text-stone-600 mb-2">
            Pilih Komoditas Budidaya
          </label>
          <div className="flex flex-wrap gap-2 p-1 bg-stone-100 rounded-lg">
            {SPECIES_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectSpecies(preset)}
                className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedSpecies.id === preset.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span>Jumlah Kolam</span>
              <span className="font-mono font-semibold tabular-nums">
                {pondCount} Kolam
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={pondCount}
              onChange={(e) => setPondCount(Number(e.target.value))}
              className="w-full accent-[#0D6E52] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-1">
              <span>1</span>
              <span>20 Kolam</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span>Target Panen / Kolam</span>
              <span className="font-mono font-semibold tabular-nums">
                {biomassPerPond.toLocaleString('id-ID')} kg
              </span>
            </div>
            <input
              type="range"
              min={400}
              max={3000}
              step={100}
              value={biomassPerPond}
              onChange={(e) => setBiomassPerPond(Number(e.target.value))}
              className="w-full accent-[#0D6E52] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-1">
              <span>400 kg</span>
              <span>3.000 kg</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span>Harga Pakan / kg</span>
              <span className="font-mono font-semibold tabular-nums">
                Rp {feedPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={18000}
              step={500}
              value={feedPrice}
              onChange={(e) => setFeedPrice(Number(e.target.value))}
              className="w-full accent-[#0D6E52] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-1">
              <span>Rp 10rb</span>
              <span>Rp 18rb</span>
            </div>
          </div>
        </div>

        {/* Comparison Output Box */}
        <div className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-stone-500">
              Pakan Dihemat per Siklus ({savedPct}%)
            </div>
            <div className="text-2xl font-bold text-[#0D6E52] font-mono tabular-nums mt-1">
              {savedFeedKg.toLocaleString('id-ID')} kg
            </div>
            <div className="text-xs text-stone-500 mt-1 font-mono tabular-nums">
              Manual: {manualFeedKg.toLocaleString('id-ID')} kg (FCR {selectedSpecies.manualFCR}) → TebarPintar: {smartFeedKg.toLocaleString('id-ID')} kg (FCR {selectedSpecies.tebarPintarFCR})
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500">
              Penghematan Biaya Pakan / Siklus
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums mt-1">
              Rp {grossSavingsPerCycleIDR.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-stone-500 mt-1">
              Setelah dikurangi langganan Rp 99rb/bln: bersih{' '}
              <span className="font-mono font-semibold text-stone-800 tabular-nums">
                Rp {netBenefitFirstCycleIDR.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500">
              Estimasi Balik Modal (Payback)
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums mt-1">
              {paybackCycles} Siklus Panen
            </div>
            <div className="text-xs text-stone-500 mt-1">
              Panen maju {selectedSpecies.cycleDaysManual - selectedSpecies.cycleDaysSmart} hari lebih cepat ({selectedSpecies.cycleDaysSmart} hari vs {selectedSpecies.cycleDaysManual} hari)
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Interactive Preview of TebarPintar SaaS Application (Rp 99.000/bulan) */}
      <div className="lg:col-span-5 bg-[#11181C] text-white rounded-xl border border-stone-800 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-emerald-400">
              PRATINJAU APLIKASI ANALITIK · RP 99.000/BLN
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5 font-display">
              Dashboard Kendali Kolam Pembudidaya
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            Sinkron LoRa / 4G
          </span>
        </div>

        {/* App Interactive Tabs */}
        <div className="mt-4 flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setActiveAppTab('jadwal')}
            className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeAppTab === 'jadwal'
                ? 'bg-[#0D6E52] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Jadwal Pakan Adaptif
          </button>
          <button
            type="button"
            onClick={() => setActiveAppTab('fcr')}
            className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeAppTab === 'fcr'
                ? 'bg-[#0D6E52] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Pelacakan FCR
          </button>
          <button
            type="button"
            onClick={() => setActiveAppTab('sensor')}
            className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeAppTab === 'sensor'
                ? 'bg-[#0D6E52] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Alarm Kualitas Air
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-5">
          {activeAppTab === 'jadwal' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                <span>Kolam Aktif: {selectedSpecies.name}</span>
                <span className="font-mono text-emerald-400">Mode Otomatis Aktif</span>
              </div>
              {[
                {
                  time: '07:00 WIB',
                  dose: '4,2 kg (30% Harian)',
                  status: 'Selesai Ditebar · DO 6,5 mg/L',
                },
                {
                  time: '12:30 WIB',
                  dose: '5,6 kg (40% Harian)',
                  status: 'Disesuaikan Suhu 29,1°C · Selesai',
                },
                {
                  time: '17:00 WIB',
                  dose: '4,2 kg (30% Harian)',
                  status: 'Terjadwal Berikutnya (Memori Lokal RTC)',
                },
              ].map((slot) => (
                <div
                  key={slot.time}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-mono text-sm font-semibold text-white tabular-nums">
                      {slot.time}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {slot.status}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-medium text-emerald-400 tabular-nums text-right">
                    {slot.dose}
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400 pt-1">
                Jadwal tersimpan di memori flash perangkat: tetap berjalan akurat 100% walaupun internet kolam sedang terputus.
              </p>
            </div>
          )}

          {activeAppTab === 'fcr' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400">
                  Kurva Konversi Pakan (Hari ke-52 dari {selectedSpecies.cycleDaysSmart})
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    FCR {selectedSpecies.tebarPintarFCR}
                  </span>
                  <span className="text-xs font-mono text-slate-300 tabular-nums">
                    Rata-rata Sentra Manual: {selectedSpecies.manualFCR}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-300">TebarPintar Adaptif</span>
                      <span className="font-mono tabular-nums">
                        {smartFeedKg.toLocaleString('id-ID')} kg
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[78%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Cara Tebar Manual</span>
                      <span className="font-mono tabular-nums">
                        {manualFeedKg.toLocaleString('id-ID')} kg
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/80 w-full" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Laporan panen PDF & CSV siap diunduh pembudidaya sebagai bukti rekam jejak usaha untuk pengajuan KUR Perikanan atau pembiayaan koperasi.
              </div>
            </div>
          )}

          {activeAppTab === 'sensor' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-amber-500/15 border border-amber-400/40">
                <div className="text-xs font-mono text-amber-300 font-semibold">
                  SIMULASI PROTEKSI OKSIGEN KRITIS (INTERLOCK)
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Saat sensor mendeteksi DO turun di bawah 3,2 mg/L (misal setelah hujan deras malam hari), TebarPintar otomatis menahan jadwal pakan pagi dan mengirim peringatan WhatsApp untuk menyalakan aerator.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-400 block">Ambang Batas DO Aman</span>
                  <span className="text-white font-semibold text-sm mt-0.5 block">
                    4,5 – 7,8 mg/L
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-400 block">Rentang pH Optimal</span>
                  <span className="text-white font-semibold text-sm mt-0.5 block">
                    6,8 – 7,8 pH
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
