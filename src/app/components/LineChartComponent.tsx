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
  // 順位は値が低いほど良いので、Y軸を反転させます
  const score6Domain = [Math.max(...data.map(item => item.score6)), 1];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="test_name" />
        <YAxis domain={score6Domain} reversed />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score6" name="順位" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
