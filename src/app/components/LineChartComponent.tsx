import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Score {
  id: number;
  test_name: string;
  score6: number; // 順位
}

interface LineChartComponentProps {
  data: Score[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data }) => {
  const minRank = Math.min(...data.map(d => d.score6)) - 1;
  const maxRank = Math.max(...data.map(d => d.score6)) + 1;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="test_name" />
        <YAxis domain={[minRank, maxRank]} reversed />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score6" name="順位" stroke="#8884d8" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
