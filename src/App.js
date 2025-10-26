import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// صفحات جدید (متصل به Backend)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MineListPage from './pages/MineListPage';
import DataUploadPage from './pages/DataUploadPage';

// صفحات قبلی (نقشه و 3D)
import UploadableMap from './UploadableMap';
import Cesium3DViewer from './components/Cesium3DViewer';

// Styles
import "@fontsource/vazir";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./GeoProject.css";

// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666',
        fontFamily: 'Vazir',
      }}>
        در حال بارگذاری...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🔓 صفحه عمومی */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 🆕 صفحات جدید با Backend */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/mines" element={
            <ProtectedRoute>
              <MineListPage />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <DataUploadPage />
            </ProtectedRoute>
          } />
          
          {/* ✅ صفحات قبلی (نقشه و 3D) */}
          <Route path="/map" element={
            <ProtectedRoute>
              <UploadableMap />
            </ProtectedRoute>
          } />
          
          <Route path="/3d" element={
            <ProtectedRoute>
              <Cesium3DViewer />
            </ProtectedRoute>
          } />
          
          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
