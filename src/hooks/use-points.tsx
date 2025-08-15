"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PointOfInterest, atms, constructionSites, incidents, sanitationPoints } from '@/lib/data';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: PointOfInterest) => void;
  updatePointStatus: (pointId: string, status: PointOfInterest['status']) => void;
}

const PointsContext = createContext<PointsContextType>({
  allData: [],
  addPoint: () => {},
  updatePointStatus: () => {},
});

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [allData, setAllData] = useState<PointOfInterest[]>([
    ...atms,
    ...constructionSites,
    ...incidents,
    ...sanitationPoints,
  ]);

  const addPoint = (point: PointOfInterest) => {
    setAllData(prevData => [...prevData, point]);
  };

  const updatePointStatus = (pointId: string, status: PointOfInterest['status']) => {
    setAllData(currentData =>
      currentData.map(poi =>
        poi.id === pointId
          ? { ...poi, status, lastReported: new Date().toISOString() }
          : poi
      )
    );
  };

  return (
    <PointsContext.Provider value={{ allData, addPoint, updatePointStatus }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
