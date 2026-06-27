import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoginModalProvider } from './context/LoginModalContext';
import { ToastProvider } from './context/ToastContext';

// Import Components
import { Layout } from './components/Layout';

// Import Pages
import { HomePage } from './pages/HomePage';
import { LoreArchive } from './pages/LoreArchive';

// The Map and Family Tree pages pull in heavy visualization libraries
// (SVG layout / React Flow + dagre), so load them on demand to keep the
// initial bundle small. Suspense lives in Layout around the Outlet.
const MapView = lazy(() => import('./pages/MapView').then((m) => ({ default: m.MapView })));
const RegionMapView = lazy(() =>
  import('./pages/map/RegionMapView').then((m) => ({ default: m.RegionMapView })),
);
const CityMapView = lazy(() =>
  import('./pages/map/LocationMapView').then((m) => ({ default: m.CityMapView })),
);
const TownMapView = lazy(() =>
  import('./pages/map/LocationMapView').then((m) => ({ default: m.TownMapView })),
);
const VillageMapView = lazy(() =>
  import('./pages/map/LocationMapView').then((m) => ({ default: m.VillageMapView })),
);
const GeographyMapView = lazy(() =>
  import('./pages/map/LocationMapView').then((m) => ({ default: m.GeographyMapView })),
);
const FamilyTreeView = lazy(() =>
  import('./pages/FamilyTreeView').then((m) => ({ default: m.FamilyTreeView })),
);
const ManagePage = lazy(() =>
  import('./pages/manage/ManagePage').then((m) => ({ default: m.ManagePage })),
);
import { CharacterDetail } from './pages/lore/CharacterDetail';
import { RegionDetail } from './pages/lore/RegionDetail';
import {
  CityDetail,
  TownDetail,
  VillageDetail,
  GeographyDetail,
} from './pages/lore/LocationDetail';
import { PointOfInterestDetail } from './pages/lore/PointOfInterestDetail';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <LoginModalProvider>
            <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="map">
                  <Route index element={<MapView />} />
                  <Route path="regions/:id" element={<RegionMapView />} />
                  <Route path="cities/:id" element={<CityMapView />} />
                  <Route path="towns/:id" element={<TownMapView />} />
                  <Route path="villages/:id" element={<VillageMapView />} />
                  <Route path="geographies/:id" element={<GeographyMapView />} />
                </Route>
                <Route path="families" element={<FamilyTreeView />} />
                <Route path="manage/*" element={<ManagePage />} />
                <Route path="lore">
                  <Route index element={<LoreArchive />} />
                  <Route path="characters/:id" element={<CharacterDetail />} />
                  <Route path="regions/:id" element={<RegionDetail />} />
                  <Route path="cities/:id" element={<CityDetail />} />
                  <Route path="towns/:id" element={<TownDetail />} />
                  <Route path="villages/:id" element={<VillageDetail />} />
                  <Route path="geographies/:id" element={<GeographyDetail />} />
                  <Route path="pois/:id" element={<PointOfInterestDetail />} />
                </Route>
              </Route>
            </Routes>
            </Router>
          </LoginModalProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}