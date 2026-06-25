import { Map as MapIcon, Users, BookOpen } from 'lucide-react';

export const HomePage = () => (
  <div className="space-y-6 animate-in fade-in duration-700">
    <header className="border-b border-amber-900/20 dark:border-slate-800 pb-8">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
        Welcome to the Realm
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
        Explore the geographies, lineages, and histories of this low fantasy world. 
        Select a destination from the navigation above to begin your journey.
      </p>
    </header>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      {[
        { title: 'Interactive Map', desc: 'Navigate regions, cities, and towns.', icon: MapIcon },
        { title: 'Lineages', desc: 'Trace the descendants of ancient families.', icon: Users },
        { title: 'World Lore', desc: 'Read detailed accounts and character bios.', icon: BookOpen }
      ].map((card, i) => (
        <div key={i} className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-amber-900/10 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <card.icon className="h-8 w-8 text-amber-700 dark:text-amber-500 mb-4" />
          <h2 className="text-xl font-serif font-bold mb-2">{card.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{card.desc}</p>
        </div>
      ))}
    </div>
  </div>
);