import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import OverlayDisplay from './components/OverlayDisplay';
import ComponentPlayground from './components/ComponentPlayground';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">Draft Overlay Control</h1>
            <div className="flex gap-6">
              <Link 
                to="/admin" 
                className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Admin Panel
              </Link>
              <Link 
                to="/overlay" 
                className="px-8 py-4 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Overlay Display
              </Link>
              <Link 
                to="/components" 
                className="px-8 py-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Component Playground
              </Link>
            </div>
          </div>
        } />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/overlay" element={<OverlayDisplay />} />
        <Route path="/components" element={<ComponentPlayground />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
