import { Users } from 'lucide-react';

export const FamilyTreeView = () => (
  <div className="animate-in fade-in">
    <h1 className="text-3xl font-serif font-bold mb-6">Lineages & Families</h1>
    <p className="text-slate-600 dark:text-slate-400">Select a family to trace their descendants.</p>
    <div className="mt-8 p-8 border border-dashed border-amber-900/30 dark:border-slate-700 rounded-lg text-center">
      <Users className="h-8 w-8 text-slate-400 mx-auto mb-3" />
      <span className="text-slate-500">Tree Nodes Component (Phase 5)</span>
    </div>
  </div>
);