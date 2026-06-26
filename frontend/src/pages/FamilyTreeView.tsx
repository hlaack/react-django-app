import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertCircle } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { useFamilies, useCharacters } from '../hooks/useLore';
import { useTheme } from '../context/ThemeContext';
import type { Character } from '../types';

const NODE_W = 176;
const NODE_H = 56;

type CharacterNode = Node<{ label: string }, 'character'>;

// --- Custom node: a clickable character card ---

function CharacterNodeView({ data }: NodeProps<CharacterNode>) {
  return (
    <div className="w-44 rounded-md border border-amber-900/20 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 shadow-sm text-center cursor-pointer hover:border-amber-600 dark:hover:border-amber-500 transition-colors">
      <Handle type="target" position={Position.Top} className="!bg-amber-600 !border-0" />
      <span className="font-serif font-bold text-sm text-slate-800 dark:text-slate-100">
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-600 !border-0" />
    </div>
  );
}

const nodeTypes = { character: CharacterNodeView };

// --- Dagre top-down layout ---

function layout(nodes: CharacterNode[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 70 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const positioned = nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return { ...n, position: { x: x - NODE_W / 2, y: y - NODE_H / 2 } };
  });
  return positioned;
}

// Build the nodes/edges for a single house from the full character list.
function buildTree(characters: Character[], familyId: number) {
  const members = characters.filter((c) => c.families.some((f) => f.id === familyId));
  const memberIds = new Set(members.map((c) => c.id));

  const nodes: CharacterNode[] = members.map((c) => ({
    id: String(c.id),
    type: 'character',
    position: { x: 0, y: 0 },
    data: { label: `${c.first_name} ${c.last_name}`.trim() },
  }));

  const edges: Edge[] = [];
  for (const c of members) {
    for (const parentId of c.parents) {
      if (memberIds.has(parentId)) {
        edges.push({
          id: `${parentId}-${c.id}`,
          source: String(parentId),
          target: String(c.id),
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }
    }
  }

  return { nodes: layout(nodes, edges), edges };
}

// --- Page ---

export const FamilyTreeView = () => {
  const families = useFamilies();
  const characters = useCharacters();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Default to the first house once loaded.
  useEffect(() => {
    if (selectedId === null && families.data && families.data.length > 0) {
      setSelectedId(families.data[0].id);
    }
  }, [families.data, selectedId]);

  const { nodes, edges } = useMemo(() => {
    if (!characters.data || selectedId === null) return { nodes: [], edges: [] };
    return buildTree(characters.data, selectedId);
  }, [characters.data, selectedId]);

  const isLoading = families.isPending || characters.isPending;
  const isError = families.isError || characters.isError;

  return (
    <div className="animate-in fade-in">
      <h1 className="text-3xl font-serif font-bold mb-1">Lineages &amp; Houses</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Choose a house to trace its descendants. Click any character to open their page.
      </p>

      {isLoading ? (
        <div className="h-[70vh] min-h-[400px] rounded-lg bg-slate-200 dark:bg-slate-900 border border-amber-900/20 dark:border-slate-700 animate-pulse" />
      ) : isError ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Could not load families. Is the backend running?
        </div>
      ) : families.data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-dashed border-amber-900/30 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-center px-6">
          No houses yet. Add families and characters in the Django admin, then set each
          character's parents to build the tree.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* House selector */}
          <aside className="md:w-56 shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Houses
            </h2>
            <ul className="flex flex-wrap md:flex-col gap-2">
              {families.data.map((family) => {
                const active = family.id === selectedId;
                return (
                  <li key={family.id}>
                    <button
                      onClick={() => setSelectedId(family.id)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      {family.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Tree canvas */}
          <div className="flex-1 h-[70vh] min-h-[400px] rounded-lg border border-amber-900/20 dark:border-slate-700 overflow-hidden bg-[#faf8f5] dark:bg-slate-950">
            {nodes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-center px-6">
                No characters in this house yet, or none with recorded lineage.
              </div>
            ) : (
              <ReactFlow
                key={selectedId ?? 'none'}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                colorMode={theme}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                onNodeClick={(_, node) => navigate(`/lore/characters/${node.id}`)}
                proOptions={{ hideAttribution: true }}
              >
                <Background />
                <Controls showInteractive={false} />
              </ReactFlow>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
