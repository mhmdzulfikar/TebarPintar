import React, { useEffect, useState } from 'react';
import { PITCH_DECK_SLIDES, ACADEMIC_INFO } from '../data/tebarPintarData';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlideIdx((prev) =>
          Math.min(PITCH_DECK_SLIDES.length - 1, prev + 1)
        );
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slide = PITCH_DECK_SLIDES[currentSlideIdx];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Mode Presentasi Pitch Deck TebarPintar"
    >
      <div className="w-full max-w-5xl bg-[#11181C] text-white rounded-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#151F24]">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="text-emerald-400 font-semibold">
              PITCH DECK INVESTOR & AKADEMIK
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Kelas {ACADEMIC_INFO.classCode} / {ACADEMIC_INFO.course}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Slide {slide.slideNumber} dari {PITCH_DECK_SLIDES.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSpeakerNotes((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {showSpeakerNotes ? 'Sembunyikan Catatan' : 'Tampilkan Catatan Presenter'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup Presentasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400">
              {slide.sectionTag}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mt-2 font-display leading-tight">
              {slide.title}
            </h2>
            <p className="text-base sm:text-lg text-emerald-300/95 font-medium mt-3 max-w-3xl">
              {slide.headline}
            </p>

            <div className="mt-8 space-y-4 max-w-3xl">
              {slide.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 text-sm sm:text-base text-slate-200 leading-relaxed"
                >
                  <span className="font-mono text-xs text-emerald-400 mt-1 shrink-0 tabular-nums">
                    0{idx + 1}.
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Metric Highlight & Speaker Notes */}
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-xs font-mono text-slate-400">
                {slide.keyMetricLabel}
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {slide.keyMetricValue}
              </div>
            </div>

            {showSpeakerNotes && (
              <div className="md:col-span-7 bg-amber-500/10 border border-amber-400/25 rounded-xl p-4">
                <div className="text-xs font-mono text-amber-300">
                  PANDUAN PRESENTER (FAISAL · ZULFIKAR · RAMADHANI)
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                  {slide.speakerNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#151F24] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {PITCH_DECK_SLIDES.map((s, idx) => (
              <button
                key={s.slideNumber}
                type="button"
                onClick={() => setCurrentSlideIdx(idx)}
                className={`w-7 h-7 rounded-md font-mono text-xs transition-colors shrink-0 tabular-nums ${
                  idx === currentSlideIdx
                    ? 'bg-[#0D6E52] text-white font-semibold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {s.slideNumber}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={currentSlideIdx === 0}
              onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-white/10 rounded-lg hover:bg-white/15 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
               Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentSlideIdx === PITCH_DECK_SLIDES.length - 1}
              onClick={() =>
                setCurrentSlideIdx((prev) =>
                  Math.min(PITCH_DECK_SLIDES.length - 1, prev + 1)
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D6E52] rounded-lg hover:bg-[#0a5841] disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              Slide Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
