// components/RechartsBarChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Line, CartesianGrid, ResponsiveContainer, ComposedChart } from 'recharts';

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

interface RechartsBarChartProps {
  data: Score[];
}

const RechartsBarChart: React.FC<RechartsBarChartProps> = ({ data }) => {
  const score6Domain = [Math.max(...data.map(item => item.score6)), 1]; // 順位の範囲を反転

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <XAxis dataKey="test_name" />
        <YAxis yAxisId="left" orientation="left" domain={[100, 'dataMax']} />
        <YAxis yAxisId="right" orientation="right" domain={score6Domain} reversed />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#f5f5f5" />
        <Bar yAxisId="left" dataKey="score7" barSize={20} fill="#8884d8" />
        <Line yAxisId="right" type="monotone" dataKey="score6" stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default RechartsBarChart;
