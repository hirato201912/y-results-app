"use client"
import React from 'react';

const CardComponent = ({ children }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4">
      {children}
    </div>
  );
};

export default CardComponent;
