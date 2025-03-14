"use client";
import React, { Suspense } from 'react';
import LessonProgressManagement from './LessonProgressManagement';

const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LessonProgressManagement />
    </Suspense>
  );
};

export default DashboardPage;