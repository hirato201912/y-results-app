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
  // 平均値を計算
  const validScores = data.filter(score => score.score6 !== null && score.score6 !== 0).map(score => score.score6);
  const averageScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;

  // null や 0 の値を平均値で置き換え
  const processedData = data.map(score => ({
    ...score,
    score6: score.score6 !== null && score.score6 !== 0 ? score.score6 : averageScore
  }));

  const hasPlaceholderValues = data.some(score => score.score6 === null || score.score6 === 0);

  // 順位の範囲を調整
  const minRank = Math.min(...processedData.map(d => d.score6)) - 1;
  const maxRank = Math.max(...processedData.map(d => d.score6)) + 1;

  return (
    <div>
      {hasPlaceholderValues && (
        <p className="text-red-500 font-bold mb-2">
          データが未入力のため、一部仮の数値を使用しています。
        </p>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processedData}>
          <XAxis dataKey="test_name" />
          <YAxis domain={[minRank, maxRank]} reversed />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score6" name="順位" stroke="#FF5733" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
