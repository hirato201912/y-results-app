"use client"
import React from 'react';
import CardComponent from './CardComponent';

const DashboardContent = ({ studentName, handleRedirect }) => {
  return (
    <>
     <h2 className="text-xl font-bold"><span className="text-3xl text-green-600">{studentName}</span> のテスト課題を管理するページです</h2>
<button onClick={handleRedirect} className="mt-4 p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700">
生徒のページに戻る
</button>
    </>
  );
};

export default DashboardContent;
