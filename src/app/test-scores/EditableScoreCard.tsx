'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSpinner, FaMousePointer } from 'react-icons/fa';

interface EditableScoreCardProps {
  subject: string;
  subjectKey: 'japanese_score' | 'math_score' | 'english_score' | 'science_score' | 'social_score';
  score: number | null | undefined;
  average: number;
  previousScore: number | null | undefined;
  previousDiffFromAvg?: number;
  testId: number;
  studentId: number;
  onScoreUpdate: (subjectKey: string, newScore: number | null) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const EditableScoreCard: React.FC<EditableScoreCardProps> = ({
  subject,
  subjectKey,
  score,
  average,
  previousScore,
  previousDiffFromAvg,
  testId,
  studentId,
  onScoreUpdate,
  showToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // スコア表示用の関数
  const displayScore = (val: number | null | undefined) => {
    if (val == null) return '未入力';
    if (val === 0) return '集計中';
    return `${val}点`;
  };

  // 編集開始
  const startEditing = () => {
    if (score === null || score === undefined) {
      setEditValue('');
    } else {
      setEditValue(score.toString());
    }
    setIsEditing(true);
  };

  // 編集をキャンセル
  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue('');
  };

  // 保存処理
  const saveScore = async () => {
    try {
      setIsSaving(true);

      // 入力値の検証
      let newScore: number | null = null;
      if (editValue.trim() !== '') {
        const numValue = parseInt(editValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
          throw new Error('0〜100の数値を入力してください');
        }
        newScore = numValue;
      }

      // APIに送信
      const formData = new FormData();
      formData.append('student_id', studentId.toString());
      formData.append('test_definition_id', testId.toString());
      formData.append('subject', subjectKey);
      if (newScore !== null) {
        formData.append('score', newScore.toString());
      }

      const response = await fetch(
        'https://mikawayatsuhashi.sakura.ne.jp/y_update_single_score.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '更新に失敗しました');
      }

      // 成功時の処理
      onScoreUpdate(subjectKey, newScore);
      setIsEditing(false);
      setEditValue('');
      showToast(`${subject}の点数を更新しました`, 'success');

    } catch (error) {
      console.error('Score update error:', error);
      const errorMessage = error instanceof Error ? error.message : '更新に失敗しました';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Enterキーでの保存
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveScore();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 編集モードになったらフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 背景色を決める関数
  const getBackgroundColor = (
    currentScore: number | null | undefined, 
    prevScore: number | null | undefined
  ) => {
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

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const calculateDifference = () => {
    if (score == null || score === 0 || previousScore == null || previousScore === 0) {
      return null;
    }
    return score - previousScore;
  };

  const difference = calculateDifference();
  const currentDiffFromAvg = score != null && score !== 0 ? score - average : null;
  const avgDiffChange = currentDiffFromAvg !== null && previousDiffFromAvg !== undefined
    ? currentDiffFromAvg - previousDiffFromAvg
    : null;

  const bgColor = getBackgroundColor(score, previousScore);

  return (
    <div
      className={`
        relative p-4 rounded-lg border shadow-sm transition-all duration-200
        ${bgColor}
        ${isEditing 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-blue-200'
        }
        ${isHovered && !isEditing ? 'bg-blue-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 編集可能インジケーター（ホバー時のみ表示） */}
      {!isEditing && isHovered && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium animate-fade-in">
          <FaEdit className="w-3 h-3" />
          <span>編集</span>
        </div>
      )}

      {/* カーソルヒント（ホバー時） */}
      {!isEditing && isHovered && (
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center animate-pulse">
            <FaMousePointer className="w-2 h-2" />
          </div>
        </div>
      )}

      {/* 科目名 */}
      <div className="text-gray-600 text-sm font-medium mb-2 flex items-center justify-between">
        {subject}
        {!isEditing && (
          <div className="flex items-center gap-1">
            {/* 常時表示の小さなアイコン */}
            <FaEdit className="w-3 h-3 text-gray-300 hover:text-blue-500 transition-colors" />
            {/* ホバー時の詳細ヒント */}
            {isHovered && (
              <span className="text-xs text-blue-600 animate-fade-in">
                クリックで編集
              </span>
            )}
          </div>
        )}
      </div>

      {/* スコア表示・編集 */}
      <div className="flex items-baseline gap-2 mb-2">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              ref={inputRef}
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              min="0"
              max="100"
              placeholder="点数"
              className="flex-1 px-2 py-1 text-xl font-bold border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSaving}
            />
            <div className="flex gap-1">
              <button
                onClick={saveScore}
                disabled={isSaving}
                className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 transition-colors"
                title="保存 (Enter)"
              >
                {isSaving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaCheck className="w-4 h-4" />}
              </button>
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
                title="キャンセル (Esc)"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div onClick={startEditing} className="flex items-baseline gap-2 w-full group">
            <span
              className={`
                text-2xl font-bold tracking-tight transition-all duration-200
                ${score === 0 ? 'text-gray-400' : 'text-gray-900'}
                ${isHovered ? 'text-blue-600 transform scale-105' : ''}
                group-hover:text-blue-600
              `}
            >
              {displayScore(score)}
            </span>
            {difference !== null && (
              <span className={`text-sm transition-colors ${getDifferenceColor(difference)}`}>
                {difference > 0 ? '↑' : '↓'}
                {Math.abs(difference)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 平均点との比較（編集中は非表示） */}
      {!isEditing && currentDiffFromAvg !== null && (
        <div className="mt-2 space-y-2">
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

          {avgDiffChange !== null && avgDiffChange !== 0 && (
            <div className="pt-1">
              <div
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                  ${avgDiffChange > 0
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : 'bg-red-50 text-red-600 border border-red-100'}
                `}
              >
                <span>平均点差の変化</span>
                {avgDiffChange > 0 ? '＋' : '－'}
                {Math.abs(avgDiffChange).toFixed(1)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 編集ヒント（非ホバー時の常時表示） */}
      {!isEditing && !isHovered && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 opacity-60">
          <FaMousePointer className="w-2 h-2" />
          <span>クリックして編集</span>
        </div>
      )}

      {/* スコアが0の場合の表示 */}
      {!isEditing && score === 0 && (
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

      {/* 未入力時の特別なヒント */}
      {!isEditing && (score == null) && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg">
          <div className="text-blue-600 text-sm font-medium flex items-center gap-2">
            <FaEdit className="w-4 h-4" />
            <span>クリックして点数を入力</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableScoreCard;