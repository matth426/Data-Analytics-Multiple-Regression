import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { SLIDES } from './data/slides';
import { IntroSlides } from './components/slides/IntroSlides';
import { ManualMathSlides } from './components/slides/ManualMathSlides';
import { PythonSlides } from './components/slides/PythonSlides';
import { DiagnosticsSlides } from './components/slides/DiagnosticsSlides';
import { downloadStandaloneSlidesHtml } from './utils/exportSlidesHtml';

export default function App() {
  const [slideIndex, setSlideIndex] = useState(1);
  const [direction, setDirection] = useState(1);
  const [notesOpen, setNotesOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = SLIDES[slideIndex - 1];

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(1, Math.min(SLIDES.length, nextIndex));
      if (clamped === slideIndex) return;
      setDirection(clamped > slideIndex ? 1 : -1);
      setSlideIndex(clamped);
      setGridOpen(false);
    },
    [slideIndex]
  );

  const goNext = useCallback(() => goToSlide(slideIndex + 1), [goToSlide, slideIndex]);
  const goPrev = useCallback(() => goToSlide(slideIndex - 1), [goToSlide, slideIndex]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesOpen((v) => !v);
      } else if (e.key === 'g' || e.key === 'G') {
        setGridOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setGridOpen(false);
        setDownloadOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen((v) => !v);
    }
  };

  const renderSlideContent = () => {
    if (slideIndex <= 5) {
      return <IntroSlides slideIndex={slideIndex} goToSlide={goToSlide} />;
    }
    if (slideIndex <= 10) {
      return <ManualMathSlides slideIndex={slideIndex} />;
    }
    if (slideIndex <= 13) {
      return <PythonSlides slideIndex={slideIndex} />;
    }
    return <DiagnosticsSlides slideIndex={slideIndex} />;
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-white text-slate-900 overflow-x-hidden">
      {/* Main Slide Stage (No top navigation header) */}
      <div className="flex-1 flex overflow-hidden relative bg-white">
        <main className="flex-1 overflow-y-auto px-6 sm:px-14 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {slideIndex > 1 && (
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-5 shrink-0 tabular-nums">
                <span>IT365 — Data Analytics 1</span>
                <span aria-hidden="true">·</span>
                <span>Lesson 8</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  Slide {String(slideIndex).padStart(2, '0')} / {SLIDES.length}
                </span>
              </div>
            )}

            <div className="flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, x: direction * 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -18 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  {renderSlideContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Lecturer Discussion Notes Drawer */}
        {notesOpen && (
          <aside className="w-80 lg:w-96 border-l border-slate-200 bg-white p-6 overflow-y-auto shrink-0 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="text-sm font-medium text-emerald-700">Instructor Guide</div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Slide {currentSlide.index}: Notes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNotesOpen(false)}
                aria-label="Close discussion notes"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-emerald-700 mb-1">Classroom Prompt</div>
              <p className="text-base text-slate-800 leading-relaxed">{currentSlide.discussionPrompt}</p>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-800">Talking Points</div>
              <ul className="space-y-3 text-base text-slate-600 leading-relaxed list-disc pl-5">
                {currentSlide.lectureNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Presenter Control Bar */}
      <footer className="bg-white border-t border-slate-200 shrink-0">
        <div className="h-0.5 w-full bg-slate-100">
          <div
            className="h-full bg-emerald-700 transition-all duration-200"
            style={{ width: `${(slideIndex / SLIDES.length) * 100}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setGridOpen((v) => !v)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                gridOpen
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="font-mono tabular-nums">
                {String(slideIndex).padStart(2, '0')} / {SLIDES.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                notesOpen
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Notes</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Present'}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDownloadOpen((v) => !v)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  downloadOpen
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {downloadOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-slate-200 bg-white py-1.5 z-40">
                  <button
                    type="button"
                    onClick={() => {
                      downloadStandaloneSlidesHtml();
                      setDownloadOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-slate-900">Offline HTML Slides (.html)</div>
                    <div className="text-xs text-slate-500 mt-0.5">All 17 Lesson 8 slides, single file</div>
                  </button>
                  <a
                    href="./assets/IT365_Lesson8_Multiple_Regression.pdf"
                    download="IT365_Lesson8_Multiple_Regression.pdf"
                    onClick={() => setDownloadOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50 border-t border-slate-100 transition-colors"
                  >
                    <div className="font-semibold text-slate-900">Lecture Slides (.pdf)</div>
                    <div className="text-xs text-slate-500 mt-0.5">All 17 Lesson 8 slides (16:9 PDF)</div>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block text-xs text-slate-500 truncate max-w-md">
            AI-generated interactive page · Content &amp; slides by Mattheus Marcus Contreras
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={goPrev}
              disabled={slideIndex === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-sm font-medium text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={slideIndex === SLIDES.length}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none text-sm font-medium text-white transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Slide Grid Overview Modal */}
      {gridOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-6"
          onClick={() => setGridOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-5xl w-full max-h-[84vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Slide Deck Overview</h3>
                <p className="text-sm text-slate-500">IT365 — Data Analytics 1 · Lesson 8 (17 slides)</p>
              </div>
              <button
                type="button"
                onClick={() => setGridOpen(false)}
                aria-label="Close slide grid"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SLIDES.map((s) => {
                const active = s.index === slideIndex;
                return (
                  <button
                    key={s.index}
                    type="button"
                    onClick={() => goToSlide(s.index)}
                    className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      active
                        ? 'border-emerald-700 bg-emerald-50/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm font-mono text-slate-500 mb-1.5">
                      <span>Slide {String(s.index).padStart(2, '0')}</span>
                      <span className="text-emerald-700 font-sans font-medium">{s.chapterLabel}</span>
                    </div>
                    <div className="text-base font-semibold text-slate-900">{s.title}</div>
                    <div className="text-sm text-slate-500 mt-1 line-clamp-2">{s.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
