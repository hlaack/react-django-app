import { useState } from 'react';
import { NotebookPen, ChevronDown, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../context/LoginModalContext';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '../hooks/useNotes';
import type { UserNote } from '../types';

const textareaClass =
  'w-full rounded-md border border-amber-900/20 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-600 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-600/40 resize-y';

function formatTimestamp(note: UserNote): string {
  const date = new Date(note.updated_at);
  const stamp = date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return note.updated_at !== note.created_at ? `Edited ${stamp}` : stamp;
}

// --- A single note: view mode with edit/delete, or an inline edit form ---

function NoteItem({ note, pageUrl }: { note: UserNote; pageUrl: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState(note.content);

  const updateNote = useUpdateNote(pageUrl);
  const deleteNote = useDeleteNote(pageUrl);

  const saveEdit = () => {
    const content = draft.trim();
    if (!content || content === note.content) {
      setIsEditing(false);
      setDraft(note.content);
      return;
    }
    updateNote.mutate(
      { id: note.id, content },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  if (isEditing) {
    return (
      <li className="rounded-md border border-amber-900/10 dark:border-slate-800 bg-white dark:bg-slate-950 p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className={textareaClass}
          autoFocus
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setDraft(note.content);
            }}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={updateNote.isPending}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white"
          >
            <Check className="h-4 w-4" /> Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group rounded-md border border-amber-900/10 dark:border-slate-800 bg-white dark:bg-slate-950 p-3">
      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
        {note.content}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {formatTimestamp(note)}
        </span>
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <>
              <span className="text-xs text-slate-500">Delete?</span>
              <button
                type="button"
                onClick={() => deleteNote.mutate(note.id)}
                disabled={deleteNote.isPending}
                className="text-xs px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit note"
                className="p-1 rounded text-slate-500 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete note"
                className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

// --- The form for adding a new note ---

function NewNoteForm({ pageUrl }: { pageUrl: string }) {
  const [content, setContent] = useState('');
  const createNote = useCreateNote(pageUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    createNote.mutate(trimmed, { onSuccess: () => setContent('') });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Leave a private note on this page…"
        className={textareaClass}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || createNote.isPending}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          {createNote.isPending ? 'Adding…' : 'Add note'}
        </button>
      </div>
    </form>
  );
}

// --- The collapsible panel, placed at the bottom of each page ---

export function PageNotes({ pageUrl }: { pageUrl: string }) {
  const { isAuthenticated } = useAuth();
  const { openLogin } = useLoginModal();
  const [isOpen, setIsOpen] = useState(false);

  const notes = useNotes(pageUrl, isAuthenticated);
  const count = notes.data?.length ?? 0;

  return (
    <section className="mt-12 border-t border-amber-900/15 dark:border-slate-800 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-2 text-left py-2"
      >
        <span className="flex items-center gap-2 font-serif font-bold text-lg">
          <NotebookPen className="h-5 w-5 text-amber-700 dark:text-amber-500" />
          Campaign Notes
          {isAuthenticated && count > 0 && (
            <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="pt-2 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {!isAuthenticated ? (
            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
              <p className="mb-3">Private notes are only visible to you.</p>
              <button
                type="button"
                onClick={openLogin}
                className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-medium transition-colors"
              >
                Sign in to leave notes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <NewNoteForm pageUrl={pageUrl} />

              {notes.isPending ? (
                <p className="text-sm text-slate-400">Loading notes…</p>
              ) : notes.isError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Could not load notes. Please try again.
                </p>
              ) : count === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                  No notes on this page yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {notes.data.map((note) => (
                    <NoteItem key={note.id} note={note} pageUrl={pageUrl} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
