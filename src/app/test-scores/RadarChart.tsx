'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface RadarChartProps {
  // 現在のスコア
  currentScore: {
    japanese_score?: number | null;
    math_score?: number | null;
    english_score?: number | null;
    science_score?: number | null;
    social_score?: number | null;
  };
  // 平均点（比較用）
  averageScores: {
    japanese: number;
    math: number;
    english: number;
    science: number;
    social: number;
  };
  // 前回のスコア（オプション）
  previousScore?: {
    japanese_score?: number | null;
    math_score?: number | null;
    english_score?: number | null;
    science_score?: number | null;
    social_score?: number | null;
  };
  // チャートのタイトル
  title?: string;
  // 高さ指定（オプション）
  height?: number;
}

const SubjectRadarChart: React.FC<RadarChartProps> = ({
  currentScore,
  averageScores,
  previousScore,
  title = "教科別成績レーダーチャート",
  height = 400
}) => {
  // レーダーチャート用のデータを準備
  const chartData = [
    {
      subject: '国語',
      current: currentScore.japanese_score || 0,
      average: averageScores.japanese,
      previous: previousScore?.japanese_score || 0,
      fullMark: 100
    },
    {
      subject: '数学',
      current: currentScore.math_score || 0,
      average: averageScores.math,
      previous: previousScore?.math_score || 0,
      fullMark: 100
    },
    {
      subject: '英語',
      current: currentScore.english_score || 0,
      average: averageScores.english,
      previous: previousScore?.english_score || 0,
      fullMark: 100
    },
    {
      subject: '理科',
      current: currentScore.science_score || 0,
      average: averageScores.science,
      previous: previousScore?.science_score || 0,
      fullMark: 100
    },
    {
      subject: '社会',
      current: currentScore.social_score || 0,
      average: averageScores.social,
      previous: previousScore?.social_score || 0,
      fullMark: 100
    }
  ];

  // 有効なスコアがあるかチェック
  const hasValidCurrentScore = chartData.some(item => item.current > 0);
  const hasValidPreviousScore = previousScore && chartData.some(item => item.previous > 0);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* タイトル */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        {!hasValidCurrentScore && (
          <p className="text-sm text-gray-500">
            成績データが入力されると、レーダーチャートが表示されます
          </p>
        )}
      </div>

      {/* レーダーチャート */}
      {hasValidCurrentScore && (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            {/* グリッド */}
            <PolarGrid stroke="#e5e7eb" />
            
            {/* 軸ラベル（教科名） */}
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
            />
            
            {/* 半径軸（点数） */}
            <PolarRadiusAxis 
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickCount={6}
            />
            
            {/* 平均点ライン */}
            <Radar
              name="平均点"
              dataKey="average"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            
            {/* 前回のスコア（ある場合） */}
            {hasValidPreviousScore && (
              <Radar
                name="前回"
                dataKey="previous"
                stroke="#fb7185"
                fill="#fb7185"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            )}
            
            {/* 現在のスコア */}
            <Radar
              name="今回"
              dataKey="current"
              stroke="#4AC0B9"
              fill="#4AC0B9"
              fillOpacity={0.2}
              strokeWidth={3}
              dot={{ fill: '#4AC0B9', strokeWidth: 2, r: 4 }}
            />
            
            {/* 凡例 */}
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {/* スコアがない場合のプレースホルダー */}
      {!hasValidCurrentScore && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-4xl text-gray-300 mb-2">📊</div>
            <p className="text-gray-500 text-sm">データを入力してください</p>
          </div>
        </div>
      )}

      {/* 簡易分析コメント */}
      {hasValidCurrentScore && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">📈 簡易分析</h4>
          <div className="text-xs text-gray-600 space-y-1">
            {(() => {
              const scores = chartData.filter(item => item.current > 0);
              const maxScore = Math.max(...scores.map(item => item.current));
              const minScore = Math.min(...scores.map(item => item.current));
              const maxSubject = scores.find(item => item.current === maxScore)?.subject;
              const minSubject = scores.find(item => item.current === minScore)?.subject;
              const aboveAverage = scores.filter(item => item.current > item.average);
              
              return (
                <>
                  <p>• 最高得点: {maxSubject} ({maxScore}点)</p>
                  <p>• 最低得点: {minSubject} ({minScore}点)</p>
                  <p>• 平均超え: {aboveAverage.length}/{scores.length}教科</p>
                  {/* {aboveAverage.length >= 3 && (
                    <p className="text-green-600 font-medium">✨ バランスよく高得点を維持しています！</p>
                  )} */}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectRadarChart;