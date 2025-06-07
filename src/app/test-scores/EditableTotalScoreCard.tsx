'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

interface EditableTotalScoreCardProps {
  score: number | null | undefined;
  previousScore: number | null | undefined;
  rank: number | null | undefined;
  previousRank: number | null | undefined;
  testId: number;
  studentId: number;
  onRankUpdate: (newRank: number | null) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const EditableTotalScoreCard: React.FC<EditableTotalScoreCardProps> = ({
  score,
  previousScore,
  rank,
  previousRank,
  testId,
  studentId,
  onRankUpdate,
  showToast
}) => {
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [editRankValue, setEditRankValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 順位編集開始
  const startEditingRank = () => {
    if (rank === null || rank === undefined) {
      setEditRankValue('');
    } else {
      setEditRankValue(rank.toString());
    }
    setIsEditingRank(true);
  };

  // 順位編集をキャンセル
  const cancelEditingRank = () => {
    setIsEditingRank(false);
    setEditRankValue('');
  };

  // 順位保存処理
  const saveRank = async () => {
    try {
      setIsSaving(true);

      // 入力値の検証
      let newRank: number | null = null;
      if (editRankValue.trim() !== '') {
        const numValue = parseInt(editRankValue);
        if (isNaN(numValue) || numValue < 1 || numValue > 999) {
          throw new Error('1〜999の数値を入力してください');
        }
        newRank = numValue;
      }

      // APIに送信
      const formData = new FormData();
      formData.append('student_id', studentId.toString());
      formData.append('test_definition_id', testId.toString());
      formData.append('field', 'class_rank');
      if (newRank !== null) {
        formData.append('value', newRank.toString());
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
      onRankUpdate(newRank);
      setIsEditingRank(false);
      setEditRankValue('');
      showToast('順位を更新しました', 'success');

    } catch (error) {
      console.error('Rank update error:', error);
      const errorMessage = error instanceof Error ? error.message : '更新に失敗しました';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Enterキーでの保存
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRank();
    } else if (e.key === 'Escape') {
      cancelEditingRank();
    }
  };

  // 編集モードになったらフォーカス
  useEffect(() => {
    if (isEditingRank && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingRank]);

  // 前回比を計算
  const calculateDifference = (current: number | null | undefined, prev: number | null | undefined) => {
    if (current == null || current === 0 || prev == null || prev === 0) {
      return null;
    }
    return current - prev;
  };

  const scoreDiff = calculateDifference(score, previousScore);
  const rankDiff = calculateDifference(rank, previousRank);

  const getChangeColor = (diff: number | null, isRank: boolean = false) => {
    if (diff === null) return 'text-gray-600';

    let actualDiff = diff;
    if (isRank) {
      actualDiff = -diff; // 順位は下がったほうが良い
    }

    if (actualDiff > 0) return 'text-green-600';
    if (actualDiff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 gap-8">
        {/* 合計点（読み取り専用） */}
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
          <div className="mt-1 text-xs text-gray-400">
            自動計算されます
          </div>
        </div>

        {/* 学年順位（編集可能） */}
        <div
          className={`
            ${isEditingRank ? 'ring-2 ring-blue-500 rounded p-2 -m-2' : 'cursor-pointer hover:bg-gray-50 rounded p-2 -m-2'}
            transition-all duration-200
          `}
        >
          <div className="text-gray-600 text-sm mb-2 flex items-center justify-between">
            学年順位
            {!isEditingRank && (
              <FaEdit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          
          {isEditingRank ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="number"
                value={editRankValue}
                onChange={(e) => setEditRankValue(e.target.value)}
                onKeyDown={handleKeyDown}
                min="1"
                max="999"
                placeholder="順位"
                className="flex-1 px-2 py-1 text-2xl font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
              <div className="flex gap-1">
                <button
                  onClick={saveRank}
                  disabled={isSaving}
                  className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                  title="保存"
                >
                  {isSaving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaCheck className="w-4 h-4" />}
                </button>
                <button
                  onClick={cancelEditingRank}
                  disabled={isSaving}
                  className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  title="キャンセル"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div onClick={startEditingRank} className="group">
              <div className="flex items-baseline">
                <span className={`text-3xl font-bold group-hover:text-blue-600 transition-colors ${rank === 0 ? 'text-gray-500' : ''}`}>
                  {displayRank(rank)}
                </span>
                {rankDiff !== null && (
                  <span className={`ml-2 text-sm ${getChangeColor(rankDiff, true)}`}>
                    {rankDiff > 0 ? '↓' : '↑'}
                    {Math.abs(rankDiff)}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                クリックして編集
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableTotalScoreCard;