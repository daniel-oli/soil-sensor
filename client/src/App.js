import { createElement, useState } from 'react';
import PlantSelectionPage from './pages/PlantSelectionPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);

  const handleStartMonitoring = (plant) => {
    setSelectedPlant(plant);
    setSessionStartedAt(new Date().toISOString());
    setIsMonitoring(true);
  };

  const handleBack = () => {
    setIsMonitoring(false);
  };

  if (!isMonitoring) {
    return createElement(PlantSelectionPage, { onStart: handleStartMonitoring });
  }

  return createElement(DashboardPage, {
    plantType: selectedPlant,
    sessionStartedAt,
    onBack: handleBack,
  });
}

