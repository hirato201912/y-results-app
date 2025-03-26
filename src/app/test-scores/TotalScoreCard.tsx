'use client';

import React from 'react';

interface TotalScoreCardProps {
  // number | null | undefined
  score: number | null | undefined;
  previousScore: number | null | undefined;
  rank: number | null | undefined;
  previousRank: number | null | undefined;
}

const TotalScoreCard: React.FC<TotalScoreCardProps> = ({
  score,
  previousScore,
  rank,
  previousRank
}) => {
  // 合計点の表示
  const displayScore = (val: number | null | undefined) => {
    if (val == null) return '未入力';
    if (val === 0) return '集計中';
    return `${val}点`;
  };

  // 順位の表示
  const displayRank = (val: number | null | undefined) => {
    if (val == null) return '未入力';
    if (val === 0) return '集計中';
    return `${val}位`;
  };

  // 前回比を計算
  const calculateDifference = (current: number | null | undefined, prev: number | null | undefined) => {
    if (current == null || current === 0 || prev == null || prev === 0) {
      return null;
    }
    return current - prev;
  };

  const scoreDiff = calculateDifference(score, previousScore);
  const rankDiff = calculateDifference(rank, previousRank);

  // 順位は下がる(数値が小さくなる)ほうが良い、という場合は
  // rankDiff の符号を反転させるなどして色分けを変える
  const getChangeColor = (diff: number | null, isRank: boolean = false) => {
    if (diff === null) return 'text-gray-600';

    let actualDiff = diff;
    if (isRank) {
      // 順位の場合: 下がったほうがプラス扱いにしたいならこうする
      actualDiff = -diff;
    }

    if (actualDiff > 0) return 'text-green-600';
    if (actualDiff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 gap-8">
        {/* 合計点 */}
        <div>
          <div className="text-gray-600 text-sm mb-2">合計点</div>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${score === 0 ? 'text-gray-500' : ''}`}>
              {displayScore(score)}
            </span>
            {scoreDiff !== null && (
              <span className={`ml-2 text-sm ${getChangeColor(scoreDiff)}`}>
                {scoreDiff > 0 ? '↑' : '↓'}
                {Math.abs(scoreDiff)}
              </span>
            )}
          </div>
        </div>

        {/* 学年順位 */}
        <div>
          <div className="text-gray-600 text-sm mb-2">学年順位</div>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${rank === 0 ? 'text-gray-500' : ''}`}>
              {displayRank(rank)}
            </span>
            {rankDiff !== null && (
              <span className={`ml-2 text-sm ${getChangeColor(rankDiff, true)}`}>
                {rankDiff > 0 ? '↓' : '↑'}
                {Math.abs(rankDiff)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalScoreCard;
