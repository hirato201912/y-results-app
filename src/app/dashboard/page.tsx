"use client"
import React, { Suspense } from 'react';
import DashboardContentWithParams from './DashboardContentWithParams';

const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContentWithParams />
    </Suspense>
  );
};

export default DashboardPage;





























