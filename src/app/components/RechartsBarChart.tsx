// components/RechartsBarChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

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

interface RechartsBarChartProps {
  data: Score[];
  selectedSubjects: string[];
}

const RechartsBarChart: React.FC<RechartsBarChartProps> = ({ data, selectedSubjects }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} barSize={20}>
        <XAxis dataKey="test_name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#f5f5f5" />
        {selectedSubjects.includes('国語') && <Bar dataKey="score1" name="国語" fill="#8884d8" />}
        {selectedSubjects.includes('社会') && <Bar dataKey="score2" name="社会" fill="#82ca9d" />}
        {selectedSubjects.includes('数学') && <Bar dataKey="score3" name="数学" fill="#ffc658" />}
        {selectedSubjects.includes('理科') && <Bar dataKey="score4" name="理科" fill="#ff7300" />}
        {selectedSubjects.includes('英語') && <Bar dataKey="score5" name="英語" fill="#8dd1e1" />}
        {selectedSubjects.includes('合計点') && <Bar dataKey="score7" name="合計点" fill="#82ca9d" />}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RechartsBarChart;

