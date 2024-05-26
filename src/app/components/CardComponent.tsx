"use client"
// src/app/components/CardComponent.tsx

import React, { ReactNode } from 'react';

interface CardComponentProps {
  children: ReactNode;
}

const CardComponent = ({ children }: CardComponentProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4">
      {children}
    </div>
  );
};

export default CardComponent;

