// components/RadarChartComponent.tsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Score {
  id: number;
  test_name: string;
  result: string;
  post_date: string;
  student: string;
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
  if (data.length < 2) {
    return <div>データが不足しています。</div>;
  }

  // 最新のテストと前回のテストのデータを取得
  const latestTest = data[data.length - 1];
  const previousTest = data[data.length - 2];

  // レーダーチャート用のデータを変換
  const radarData = [
    { subject: '国語', 最新: latestTest.score1, 前回: previousTest.score1, fullMark: 100 },
    { subject: '社会', 最新: latestTest.score2, 前回: previousTest.score2, fullMark: 100 },
    { subject: '数学', 最新: latestTest.score3, 前回: previousTest.score3, fullMark: 100 },
    { subject: '理科', 最新: latestTest.score4, 前回: previousTest.score4, fullMark: 100 },
    { subject: '英語', 最新: latestTest.score5, 前回: previousTest.score5, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Radar name="最新" dataKey="最新" stroke="#ff0000" fill="#ff0000" fillOpacity={0.6} />
        <Radar name="前回" dataKey="前回" stroke="#0000ff" fill="#0000ff" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
