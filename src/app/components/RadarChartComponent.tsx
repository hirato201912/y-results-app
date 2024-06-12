import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Score {
  id: number;
  test_name: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
}

interface RadarChartComponentProps {
  data: Score[];
}

const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ data }) => {
  // 最新のテストデータと前回のテストデータを取得
  const latestTest = data[data.length - 1];
  const previousTest = data[data.length - 2];

  // 5教科のいずれかの値がnullまたは0かをチェック
  const hasIncompleteData = [latestTest.score1, latestTest.score2, latestTest.score3, latestTest.score4, latestTest.score5].some(score => score === null || score === 0);

  const chartData = [
    { subject: '国語', 最新: latestTest.score1, 前回: previousTest.score1, fullMark: 100 },
    { subject: '社会', 最新: latestTest.score2, 前回: previousTest.score2, fullMark: 100 },
    { subject: '数学', 最新: latestTest.score3, 前回: previousTest.score3, fullMark: 100 },
    { subject: '理科', 最新: latestTest.score4, 前回: previousTest.score4, fullMark: 100 },
    { subject: '英語', 最新: latestTest.score5, 前回: previousTest.score5, fullMark: 100 },
  ];

  return (
    <div>
      {hasIncompleteData && <p className="text-red-500 font-bold mb-2">一部の科目が未入力のため、このデータは参考値です。</p>}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Radar name="最新" dataKey="最新" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
          <Radar name="前回" dataKey="前回" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
     
    </div>
  );
};

export default RadarChartComponent;
