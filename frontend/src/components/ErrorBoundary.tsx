import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors (and lazy-chunk load failures) in the routed page
 * so one broken page shows a contained message instead of blanking the whole
 * app. Reset by remounting — the Layout keys it on the current path, so simply
 * navigating elsewhere clears the error.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // In production this is where error reporting would go.
    console.error('Page error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="py-16 flex flex-col items-center text-center gap-4">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-500" />
          <div>
            <h2 className="text-xl font-serif font-bold mb-1">
              Something went wrong on this page
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              The rest of the app is fine — use the navigation above, or reload to try again.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
