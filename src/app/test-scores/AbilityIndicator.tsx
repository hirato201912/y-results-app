'use client';

import React from 'react';

interface TestScore {
  japanese_score?: number | null;
  math_score?: number | null;
  english_score?: number | null;
  science_score?: number | null;
  social_score?: number | null;
}

interface AbilityIndicatorProps {
  // 過去のテストスコア（新しい順）
  allScores: TestScore[];
  // 生徒名
  studentName: string;
}

const AbilityIndicator: React.FC<AbilityIndicatorProps> = ({
  allScores = [], // デフォルト値を設定
  studentName
}) => {
  // デバッグ用：データ構造を確認
  console.log('AbilityIndicator - allScores:', allScores);
  console.log('AbilityIndicator - allScores.length:', allScores.length);
  // 各教科の実力値を5段階で算出する関数
  const calculateAbilityLevel = (subjectScores: (number | null | undefined)[]): number => {
    // 有効なスコアのみをフィルタリング
    const validScores = subjectScores.filter(score => 
      score != null && score > 0
    ) as number[];

    if (validScores.length === 0) return 0; // データなし

    // 分析要素（最新重視）
    const recent3 = validScores.slice(0, 3); // 最新3回
    const latest = validScores[0]; // 最新テスト
    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    const recentAverage = recent3.length > 0 
      ? recent3.reduce((sum, score) => sum + score, 0) / recent3.length 
      : average;
    
    // トレンド分析（最新が向上傾向にあるか）
    let trendBonus = 0;
    if (validScores.length >= 2) {
      const previousAvg = validScores.slice(1, 4).reduce((sum, score) => sum + score, 0) / Math.min(3, validScores.length - 1);
      const improvement = latest - previousAvg;
      
      if (improvement > 10) trendBonus = 0.8; // 大幅向上
      else if (improvement > 5) trendBonus = 0.5; // 向上傾向
      else if (improvement < -10) trendBonus = -0.5; // 大幅下降
      else if (improvement < -5) trendBonus = -0.3; // 下降傾向
    }

    // 安定性ボーナス（ばらつきが少ないほど高評価）
    const variance = validScores.reduce((sum, score) => 
      sum + Math.pow(score - average, 2), 0) / validScores.length;
    const stabilityBonus = variance < 50 ? 0.4 : variance < 150 ? 0.2 : -0.1;

    // 総合スコア計算（最新テストを80%重視）
    const baseScore = latest * 0.8 + recentAverage * 0.2;
    const finalScore = baseScore + (trendBonus * 10) + (stabilityBonus * 5);

    // 5段階に変換（幅広い点数範囲に対応）
    if (finalScore >= 80) return 5;
    if (finalScore >= 65) return 4;
    if (finalScore >= 45) return 3;
    if (finalScore >= 25) return 2;
    return 1;
  };

  // 各教科のスコア履歴を抽出
  const getSubjectScores = (subject: keyof TestScore): (number | null | undefined)[] => {
    if (!allScores || allScores.length === 0) return [];
    return allScores.map(score => score[subject]);
  };

// 教科データの準備
const subjectData = [
    { 
      name: '国語', 
      level: calculateAbilityLevel(getSubjectScores('japanese_score')),
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100'
    },
    { 
      name: '数学', 
      level: calculateAbilityLevel(getSubjectScores('math_score')),
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100'
    },
    { 
      name: '英語', 
      level: calculateAbilityLevel(getSubjectScores('english_score')),
      color: 'bg-red-500',
      lightColor: 'bg-red-100'
    },
    { 
      name: '理科', 
      level: calculateAbilityLevel(getSubjectScores('science_score')),
      color: 'bg-green-500',
      lightColor: 'bg-green-100'
    },
    { 
      name: '社会', 
      level: calculateAbilityLevel(getSubjectScores('social_score')),
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100'
    }
  ];

  // レベル表示用の関数
  const formatLevel = (level: number): string => {
    if (level === 0) return '--';
    return level.toString();
  };

  // レベル説明
  const getLevelDescription = (level: number): string => {
    switch (level) {
      case 5: return '優秀';
      case 4: return '良好';
      case 3: return '標準';
      case 2: return '基礎';
      case 1: return '要支援';
      default: return '未評価';
    }
  };

  // バーの幅計算（5段階）
  const getBarWidth = (level: number): string => {
    if (level === 0) return '0%';
    return `${(level / 5) * 100}%`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-800">
          {studentName} の実力値
        </h3>
        <div className="text-xs text-gray-500">
          過去のテスト動向から算出（5段階評価）
        </div>
      </div>

      {/* 教科別実力値バー */}
      <div className="space-y-2">
        {allScores.length > 0 ? (
          subjectData.map((subject) => (
            <div key={subject.name} className="flex items-center gap-3">
              {/* 教科名 */}
              <span className={`w-8 text-xs font-medium ${
                subject.level === 0 
                  ? 'text-gray-400' 
                  : 'text-gray-700'
              }`}>
                {subject.name}
              </span>

              {/* 5段階プログレスバー */}
              <div className="flex-1 max-w-20">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-sm ${
                        subject.level === 0 
                          ? 'bg-gray-200'
                          : step <= subject.level 
                            ? subject.color 
                            : subject.lightColor
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* レベル表示 */}
              <div className="w-12 text-right">
                <span className={`text-xs font-bold ${
                  subject.level === 0
                    ? 'text-gray-400'
                    : subject.level >= 4
                      ? 'text-green-600'
                      : subject.level >= 3
                        ? 'text-blue-600'
                        : 'text-orange-600'
                }`}>
                  {formatLevel(subject.level)}
                </span>
                <div className={`text-xs ${
                  subject.level === 0 ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {getLevelDescription(subject.level)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-xs">
            テストデータがありません
          </div>
        )}
      </div>

      {/* 説明 */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <div>※最新テストを重視し、向上傾向・安定性を総合評価</div>
          <div className="flex gap-4">
            <span>5:優秀</span>
            <span>4:良好</span>
            <span>3:標準</span>
            <span>2:基礎</span>
            <span>1:要支援</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbilityIndicator;