import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DriverDashboard from './pages/DriverDashboard';
import PublicReceipt from './pages/PublicReceipt';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DriverDashboard />} />
        <Route path="/receipt/:orderCode" element={<PublicReceipt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
