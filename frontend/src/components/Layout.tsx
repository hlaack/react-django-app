import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { PageNotes } from './PageNotes';
import { ErrorBoundary } from './ErrorBoundary';

// Routes that should NOT show the campaign-notes panel (landing pages).
const NOTES_EXCLUDED_PATHS = ['/'];

export const Layout = () => {
    const { pathname } = useLocation();
    const showNotes = !NOTES_EXCLUDED_PATHS.includes(pathname);

    return (
        <div className="min-h-screen bg-[#faf8f5] dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorBoundary key={pathname}>
                    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading…</div>}>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
                {showNotes && <PageNotes pageUrl={pathname} />}
            </main>
        </div>
    );
};
