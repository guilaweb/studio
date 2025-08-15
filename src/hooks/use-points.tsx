"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PointOfInterest, PointOfInterestUpdate, atms, constructionSites, incidents, sanitationPoints } from '@/lib/data';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: PointOfInterest) => void;
  updatePointStatus: (pointId: string, status: PointOfInterest['status']) => void;
  addUpdateToPoint: (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => void;
}

const PointsContext = createContext<PointsContextType>({
  allData: [],
  addPoint: () => {},
  updatePointStatus: () => {},
  addUpdateToPoint: () => {},
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

  const addUpdateToPoint = (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => {
    setAllData(currentData =>
      currentData.map(poi => {
        if (poi.id === pointId) {
          const newUpdate: PointOfInterestUpdate = {
            ...update,
            id: `upd-${pointId}-${Date.now()}`,
          };
          const existingUpdates = poi.updates || [];
          return { ...poi, updates: [newUpdate, ...existingUpdates] };
        }
        return poi;
      })
    );
  };

  return (
    <PointsContext.Provider value={{ allData, addPoint, updatePointStatus, addUpdateToPoint }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
