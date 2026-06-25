import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoginModalProvider } from './context/LoginModalContext';

// Import Components
import { Layout } from './components/Layout';

// Import Pages
import { HomePage } from './pages/HomePage';
import { MapView } from './pages/MapView';
import { FamilyTreeView } from './pages/FamilyTreeView';
import { LoreArchive } from './pages/LoreArchive';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginModalProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="map" element={<MapView />} />
                <Route path="families" element={<FamilyTreeView />} />
                <Route path="lore" element={<LoreArchive />} />
              </Route>
            </Routes>
          </Router>
        </LoginModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}