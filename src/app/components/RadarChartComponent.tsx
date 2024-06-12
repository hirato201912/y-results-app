// components/RadarChartComponent.tsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Score {
  id: number;
  test_name: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
  score6: number;
  score7: number;
}

interface RadarChartComponentProps {
  data: Score[];
}

const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ data }) => {
  if (data.length < 2) return <div>データが不足しています。</div>;

  const latestTest = data[data.length - 1];
  const previousTest = data[data.length - 2];

  const radarData = [
    { subject: '国語', 最新: latestTest.score1, 前回: previousTest.score1, fullMark: 100 },
    { subject: '社会', 最新: latestTest.score2, 前回: previousTest.score2, fullMark: 100 },
    { subject: '数学', 最新: latestTest.score3, 前回: previousTest.score3, fullMark: 100 },
    { subject: '理科', 最新: latestTest.score4, 前回: previousTest.score4, fullMark: 100 },
    { subject: '英語', 最新: latestTest.score5, 前回: previousTest.score5, fullMark: 100 },
  ];

  const hasIncompleteData = radarData.some(item => item.最新 === 0 || item.前回 === 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Radar name="最新" dataKey="最新" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
          <Radar name="前回" dataKey="前回" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
      {hasIncompleteData && (
        <p className="text-red-500 font-bold mt-4">
          未入力の科目があるため、これは参考値です。
        </p>
      )}
    </div>
  );
};

export default RadarChartComponent;
