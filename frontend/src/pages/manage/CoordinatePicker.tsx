import { X } from 'lucide-react';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// A modal that shows a parent's map image and captures a click as fractional
// (0-1) coordinates — the "click-to-place" feature.
export function CoordinatePicker({
  imageUrl,
  imageWidth,
  imageHeight,
  value,
  onPick,
  onClose,
}: {
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  value: { x: number; y: number } | null;
  onPick: (x: number, y: number) => void;
  onClose: () => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onPick(
      clamp01((e.clientX - rect.left) / rect.width),
      clamp01((e.clientY - rect.top) / rect.height),
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-[#faf8f5] dark:bg-slate-900 border border-amber-900/20 dark:border-slate-700 shadow-xl p-4 animate-in fade-in zoom-in-95"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold">Click the map to place this</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {imageUrl ? (
          <>
            <div
              onClick={handleClick}
              className="relative cursor-crosshair rounded-md overflow-hidden border border-amber-900/20 dark:border-slate-700 select-none"
              style={{ aspectRatio: imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : '16 / 9' }}
            >
              <img src={imageUrl} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
              {value && (
                <span
                  className="absolute -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-rose-500 ring-2 ring-white shadow pointer-events-none"
                  style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
                />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {value ? `x ${value.x.toFixed(3)}, y ${value.y.toFixed(3)}` : 'No position set'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-medium"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <p className="py-10 text-center text-slate-500 dark:text-slate-400">
            This place has no map image yet — upload one (in the admin) before placing things on it.
          </p>
        )}
      </div>
    </div>
  );
}
