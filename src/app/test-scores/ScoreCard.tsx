'use client';

import React from 'react';

interface ScoreCardProps {
  subject: string;
  // number | null | undefined を許容
  score: number | null | undefined;
  average: number;
  previousScore: number | null | undefined;
  previousDiffFromAvg?: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  subject,
  score,
  average,
  previousScore,
  previousDiffFromAvg
}) => {
  // スコア表示用の関数: null/undefined → '未入力'
  const displayScore = (val: number | null | undefined) => {
    if (val == null) return '未入力';  // null or undefined
    if (val === 0) return '集計中';
    return `${val}点`;
  };

  // 背景色を決める関数
  const getBackgroundColor = (
    currentScore: number | null | undefined, 
    prevScore: number | null | undefined
  ) => {
    // null or undefined or 0 はデフォルト背景
    if (currentScore == null || currentScore === 0 || prevScore == null || prevScore === 0) {
      return 'bg-white';
    }

    const diff = currentScore - prevScore;
    if (diff === 0) return 'bg-white';

    const absDiff = Math.abs(diff);
    if (diff > 0) {
      if (absDiff <= 5) return 'bg-green-50';
      if (absDiff <= 10) return 'bg-green-100';
      if (absDiff <= 20) return 'bg-green-200';
      return 'bg-green-300';
    } else {
      if (absDiff <= 5) return 'bg-red-50';
      if (absDiff <= 10) return 'bg-red-100';
      if (absDiff <= 20) return 'bg-red-200';
      return 'bg-red-300';
    }
  };

  // 上昇/下降の文字色
  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 前回スコアとの差を計算
  const calculateDifference = () => {
    if (score == null || score === 0 || previousScore == null || previousScore === 0) {
      return null;
    }
    return score - previousScore;
  };

  const difference = calculateDifference();

  // 今回スコアが平均とどれぐらい違うか
  const currentDiffFromAvg =
    score != null && score !== 0
      ? score - average
      : null;

  // 前回平均差からどれだけ変化したか
  const avgDiffChange = currentDiffFromAvg !== null && previousDiffFromAvg !== undefined
    ? currentDiffFromAvg - previousDiffFromAvg
    : null;

  const bgColor = getBackgroundColor(score, previousScore);

  // 平均点差の変化バッジ
  const AvgDiffChangeBadge = ({ change }: { change: number }) => (
    <div
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${change > 0
          ? 'bg-green-50 text-green-600 border border-green-100'
          : 'bg-red-50 text-red-600 border border-red-100'}
      `}
    >
      <span>平均点差の変化</span>
      {change > 0 ? '＋' : '－'}
      {Math.abs(change).toFixed(1)}
    </div>
  );

  return (
    <div
      className={`
        p-4 rounded-lg border shadow-sm
        ${bgColor} hover:shadow-md
        transition-all duration-200
      `}
    >
      {/* 科目名 */}
      <div className="text-gray-600 text-sm font-medium mb-2">
        {subject}
      </div>

      {/* スコア表示 */}
      <div className="flex items-baseline gap-2">
        <span
          className={`
            text-2xl font-bold tracking-tight
            ${score === 0 ? 'text-gray-400' : 'text-gray-900'}
          `}
        >
          {displayScore(score)}
        </span>
        {/* 前回との差 */}
        {difference !== null && (
          <span className={`text-sm ${getDifferenceColor(difference)}`}>
            {difference > 0 ? '↑' : '↓'}
            {Math.abs(difference)}
          </span>
        )}
      </div>

      {/* 平均点との比較 */}
      {currentDiffFromAvg !== null && (
        <div className="mt-2 space-y-2">
          {/* 平均点表示 */}
          <div className="text-sm">
            <div className="text-gray-500">
              平均点：
              <span className="font-medium text-gray-700">
                {average.toFixed(1)}点
              </span>
            </div>
            <div className={`font-medium ${getDifferenceColor(currentDiffFromAvg)}`}>
              平均点との差：
              {currentDiffFromAvg >= 0 ? '＋' : '－'}
              {Math.abs(currentDiffFromAvg).toFixed(1)}
            </div>
          </div>

          {/* 平均点差の変化 */}
          {avgDiffChange !== null && avgDiffChange !== 0 && (
            <div className="pt-1">
              <AvgDiffChangeBadge change={avgDiffChange} />
            </div>
          )}
        </div>
      )}

      {/* スコアが0の場合の表示 */}
      {score === 0 && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          採点作業中
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
