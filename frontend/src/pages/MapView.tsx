import { Map as MapIcon } from 'lucide-react';

export const MapView = () => (
  <div className="animate-in fade-in">
    <h1 className="text-3xl font-serif font-bold mb-6">World Map</h1>
    <div className="w-full h-[600px] bg-slate-200 dark:bg-slate-900 rounded-lg border border-amber-900/20 dark:border-slate-700 flex items-center justify-center">
      <div className="text-center">
        <MapIcon className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Interactive Map Component will render here (Phase 5)</p>
      </div>
    </div>
  </div>
);