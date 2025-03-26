"use client";
import React, { Suspense } from 'react';
import TestScoresManagement from './TestScoresManagement';

const TestScoresPage = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <div className="text-gray-600 font-medium">読み込み中...</div>
        </div>
      </div>
    }>
      <TestScoresManagement />
    </Suspense>
  );
};

export default TestScoresPage;