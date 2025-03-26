'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaLightbulb, FaLock, FaTrash } from 'react-icons/fa';

interface SubjectGuidelinesProps {
  activeTab: string;
  teacherId: number;
}

interface Guideline {
  guideline_id: number;
  subject_id: number;
  content: string;
  updated_by: number;
  updated_at: string;
  updater_name?: string;
}

const SUBJECT_IDS: { [key: string]: number } = {
  '英語': 1,
  '数学': 2,
  '理科': 3,
  '社会': 4,
  '国語': 5
};

// 科目に応じたカラー設定
const SUBJECT_COLORS: { [key: string]: { border: string, bg: string, text: string } } = {
  '英語': { 
    border: 'border-red-300', 
    bg: 'bg-red-50', 
    text: 'text-red-600'
  },
  '数学': { 
    border: 'border-orange-300', 
    bg: 'bg-orange-50', 
    text: 'text-orange-600'
  },
  '理科': { 
    border: 'border-green-300', 
    bg: 'bg-green-50', 
    text: 'text-green-600'
  },
  '社会': { 
    border: 'border-blue-300', 
    bg: 'bg-blue-50', 
    text: 'text-blue-600'
  },
  '国語': { 
    border: 'border-purple-300', 
    bg: 'bg-purple-50', 
    text: 'text-purple-600'
  }
};

// 共通のイメージカラー
const IMAGE_COLOR = {
  bg: 'bg-[#4AC0B9]',
  hover: 'hover:bg-[#3DA8A2]',
  light: 'bg-[#4AC0B9]/10',
  border: 'border-[#4AC0B9]/30',
  text: 'text-[#4AC0B9]',
};

const SubjectGuidelines: React.FC<SubjectGuidelinesProps> = ({
  activeTab,
  teacherId
}) => {
  const [guideline, setGuideline] = useState<Guideline | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 現在の科目のカラー
  const currentColors = SUBJECT_COLORS[activeTab] || SUBJECT_COLORS['英語'];

  // ガイドラインを取得する関数
  const fetchGuideline = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const subjectId = SUBJECT_IDS[activeTab];
      if (!subjectId) {
        throw new Error('無効な科目が選択されています');
      }

      const response = await fetch(
        `https://mikawayatsuhashi.sakura.ne.jp/y_get_subject_guideline.php?` +
        `subject_id=${subjectId}`
      );

      if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'データの取得に失敗しました');
      } else {
        // データがnullの場合も正常に処理
        setGuideline(result.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ガイドラインを保存する関数
  const saveGuideline = async () => {
    if (!editContent.trim()) {
      setError('内容を入力してください');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const subjectId = SUBJECT_IDS[activeTab];
      if (!subjectId) {
        throw new Error('無効な科目が選択されています');
      }

      const requestData = {
        subject_id: subjectId,
        content: editContent,
        teacher_id: teacherId
      };

      const response = await fetch(
        'https://mikawayatsuhashi.sakura.ne.jp/y_save_subject_guideline.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '保存に失敗しました');
      }

      // 保存成功後、最新のガイドラインを取得
      await fetchGuideline();
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ガイドラインを削除する関数
  const deleteGuideline = async () => {
    if (!window.confirm('この学習ポイントを削除してもよろしいですか？')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const subjectId = SUBJECT_IDS[activeTab];
      if (!subjectId) {
        throw new Error('無効な科目が選択されています');
      }

      const requestData = {
        subject_id: subjectId,
        teacher_id: teacherId,
        action: 'delete'  // 削除アクションを指定
      };

      const response = await fetch(
        'https://mikawayatsuhashi.sakura.ne.jp/y_save_subject_guideline.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '削除に失敗しました');
      }

      // 削除成功後、ガイドラインをnullに設定
      setGuideline(null);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // 編集をキャンセルする関数
  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent(guideline?.content || '');
    setError(null);
  };

  // 編集を開始する関数
  const startEditing = () => {
    setEditContent(guideline?.content || '');
    setIsEditing(true);
  };

  // タブが変更されたときにガイドラインを再取得
  useEffect(() => {
    fetchGuideline();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 更新日時のフォーマット
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ja-JP');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mt-4 mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FaLightbulb className="text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">
            <span className={currentColors.text}>{activeTab}</span>
            <span className="text-gray-800">の学習ポイント</span>
          </h3>
        </div>
        
        {!isEditing && (
          <button
            onClick={startEditing}
            className={`flex items-center text-sm px-3 py-1 text-white ${IMAGE_COLOR.bg} ${IMAGE_COLOR.hover} rounded-md transition-colors duration-200`}
            disabled={isLoading}
          >
            <FaEdit className="mr-1" /> 
            <span className="flex items-center">
              塾長編集 <FaLock className="ml-1 text-xs" title="塾長専用機能" />
            </span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-gray-500">
          <div className="animate-pulse flex justify-center">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : isEditing ? (
        <div>
          <div className="mb-3 p-2 bg-[#4AC0B9]/10 border-l-4 border-[#4AC0B9] text-xs text-gray-600">
            <div className="flex items-center">
              <FaLock className="mr-1 text-[#4AC0B9]" />
              <span>この編集機能は塾長専用です。学習ポイントをここに入力すると、全講師が確認できます。</span>
            </div>
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={`w-full p-3 border ${IMAGE_COLOR.border} rounded-md min-h-[150px] mb-3 text-sm focus:ring-2 focus:ring-[#4AC0B9]/50 focus:border-0 outline-none`}
            placeholder="ここに学習ポイントを入力してください..."
            disabled={isSaving || isDeleting}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={deleteGuideline}
              className="px-4 py-2 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center transition-colors duration-200"
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  削除中...
                </>
              ) : (
                <>
                  <FaTrash className="mr-1" /> 削除
                </>
              )}
            </button>
            <button
              onClick={cancelEditing}
              className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center transition-colors duration-200"
              disabled={isSaving || isDeleting}
            >
              <FaTimes className="mr-1" /> キャンセル
            </button>
            <button
              onClick={saveGuideline}
              className={`px-4 py-2 text-sm rounded-md text-white ${IMAGE_COLOR.bg} ${IMAGE_COLOR.hover} flex items-center transition-colors duration-200`}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <FaSave className="mr-1" /> 保存
                </>
              )}
            </button>
          </div>
        </div>
      ) : guideline ? (
        <div>
          <div className={`${currentColors.bg} p-4 rounded-md text-sm whitespace-pre-wrap border-l-4 ${currentColors.border} leading-relaxed text-gray-700`}>
            {guideline.content}
          </div>
          <div className="text-xs text-gray-500 mt-2 text-right">
            最終更新: {formatDate(guideline.updated_at)} 
            {guideline.updater_name && ` by ${guideline.updater_name}`}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center bg-gray-50 rounded-md">
          <div className="text-gray-500 text-sm">
            まだ学習ポイントが設定されていません
          </div>
          <div className="mt-3">
            <button
              onClick={startEditing}
              className={`px-4 py-2 text-sm text-white ${IMAGE_COLOR.bg} ${IMAGE_COLOR.hover} rounded-md transition-colors duration-200 flex items-center mx-auto`}
            >
              <FaEdit className="mr-1" /> 
              <span className="flex items-center">
                学習ポイントを追加
                <FaLock className="ml-1 text-xs" title="塾長専用機能" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectGuidelines;