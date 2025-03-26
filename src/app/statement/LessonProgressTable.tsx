'use client';

import { useState, useEffect, useCallback } from "react";
import { FaHistory } from 'react-icons/fa';
import ProgressTableView from './ProgressTableView';
import { Toast } from './Toast';
import SubjectTagInput from './SubjectTagInput';
import SubjectGuidelines from './SubjectGuidelines'; // コンポーネント名修正

interface Progress {
  unit_id: number;
  unit_order_id: number;
  unit_name: string;
  number: string;
  order_index: number;
  isTestRange: boolean;
  completion_date: string | null;
  teacher_id: number | null;
  teacher_name: string | null;
  is_school_completed: boolean;
  homework_assigned: boolean;
  ct_status: "未実施" | "合格" | "不合格";
  homework_status: "未チェック" | "やってきている" | "やってきていない";
  level_id: number;
  duplicate_number: number;
}

interface LessonProgressTableProps {
  teacherName: string;
  teacherId: number;
  schoolId: number;
  gradeId: number;
  studentId: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const SCHOOL_NAMES: { [key: number]: string } = {
  1: "竜北中",
  2: "前林中",
  3: "知立中",
  4: "若園中",
  5: "知立南中",
  6: "雁が音中",
  7: "高岡中",
  8: "富士松中",
  9: "その他中学"
};

const GRADE_NAMES: { [key: number]: string } = {
  5: "中学3年生",
  6: "中学2年生",
  7: "中学1年生"
};

// レベルインジケーターコンポーネント
const LevelIndicator = ({ level_id }: { level_id: number }) => {
  const levelConfig = {
    1: { name: '基礎', bgColor: 'bg-red-500', textColor: 'text-white' },
    2: { name: '標準', bgColor: 'bg-yellow-500', textColor: 'text-gray-800' },
    3: { name: '発展', bgColor: 'bg-blue-500', textColor: 'text-white' }
  };

  const config = levelConfig[level_id as keyof typeof levelConfig] || levelConfig[2];

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} text-sm font-medium`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {config.name}レベル
    </div>
  );
};

function LessonProgressTable({ 
  teacherName,
  teacherId,
  schoolId,
  gradeId,
  studentId
}: LessonProgressTableProps) {
  const [activeTab, setActiveTab] = useState("英語");
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [bombCount, setBombCount] = useState<number>(0);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success'
  });

  // トースト表示関数
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // コメント送信処理
  const handleCommentSubmit = async (message: string) => {
    if (!message.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);

      const response = await fetch('https://mikawayatsuhashi.sakura.ne.jp/cr_save_comment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          teacher_name: teacherName,
          student_id: studentId
        }),
      });

      if (!response.ok) {
        throw new Error('コメントの投稿に失敗しました');
      }

      const result = await response.json();
      
      if (result.success) {
        showToast('コメントを投稿しました', 'success');
        setComment('');
      } else {
        throw new Error(result.error || 'コメントの投稿に失敗しました');
      }

    } catch (error) {
      console.error('Comment submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // bomb countの更新を処理する関数
  const handleBombCountUpdate = useCallback((newCount: number) => {
    setBombCount(newCount);
  }, []);

  // 進捗更新関数
  const handleProgressUpdate = async (unitOrderId: number, updateData: Partial<Progress>) => {
    try {
      setError(null);
      setUpdatingItems(prev => [...prev, unitOrderId]);

      setProgressData(currentData => 
        currentData.map(item => 
          item.unit_order_id === unitOrderId
            ? {
                ...item,
                ...updateData,
                // 完了取り消しの場合はteacher_idとteacher_nameもnullに
                ...(updateData.completion_date === null && {
                  teacher_id: null,
                  teacher_name: null
                }),
                // 完了設定の場合は現在の講師情報を設定
                ...(updateData.completion_date && updateData.completion_date !== null && {
                  teacher_id: teacherId,
                  teacher_name: teacherName
                })
              }
            : item
        )
      );

      const requestData = {
        student_id: studentId,
        unit_order_id: unitOrderId,
        teacher_id: teacherId,
        update_data: updateData
      };

      const response = await fetch(
        'https://mikawayatsuhashi.sakura.ne.jp/statement_update_cr_student_progress.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '更新に失敗しました');
      }

      showToast(
        updateData.completion_date === null 
          ? '完了を取り消しました' 
          : '更新が完了しました', 
        'success'
      );

    } catch (error) {
      console.error('Progress update error:', error);
      const errorMessage = error instanceof Error ? error.message : '更新に失敗しました';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      await fetchProgressData(activeTab);
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== unitOrderId));
    }
  };

  // データ取得関数
  const fetchProgressData = useCallback(async (subject: string) => {
    try {
      setIsInitialLoading(true);
      setError(null);

      const [progressResponse, bombResponse] = await Promise.all([
        fetch(
          `https://mikawayatsuhashi.sakura.ne.jp/statement_get_cr_student_progress.php?` +
          `student_id=${studentId}&` +
          `school_id=${schoolId}&` +
          `grade_id=${gradeId}&` +
          `subject=${encodeURIComponent(subject)}`
        ),
        fetch(
          `https://mikawayatsuhashi.sakura.ne.jp/cr_get_bomb_count.php?student_id=${studentId}`
        )
      ]);

      if (!progressResponse.ok || !bombResponse.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }

      const [progressResult, bombResult] = await Promise.all([
        progressResponse.json(),
        bombResponse.json()
      ]);

      if (!progressResult.success) {
        throw new Error(progressResult.error || 'データの取得に失敗しました');
      }

      const processedData = progressResult.data.map((item: Progress) => ({
        ...item,
        unit_id: Number(item.unit_id),
        unit_order_id: Number(item.unit_order_id),
        order_index: Number(item.order_index),
        isTestRange: Boolean(item.isTestRange),
        is_school_completed: Boolean(Number(item.is_school_completed)),
        homework_assigned: Boolean(Number(item.homework_assigned)),
        teacher_id: item.teacher_id ? Number(item.teacher_id) : null,
        completion_date: item.completion_date || null,
        teacher_name: item.teacher_name || null,
        ct_status: item.ct_status || "未実施",
        homework_status: item.homework_status || "未チェック",
        duplicate_number: Number(item.duplicate_number || 0)
      }));

      setProgressData(processedData);
      if (bombResult.bombCount !== undefined) {
        setBombCount(bombResult.bombCount);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsInitialLoading(false);
    }
  }, [studentId, schoolId, gradeId, showToast]);

  // 初期データ取得
  useEffect(() => {
    fetchProgressData(activeTab);
  }, [activeTab, fetchProgressData]);

  const subjectColors = {
    "英語": "bg-red-500 hover:bg-red-600",
    "数学": "bg-orange-500 hover:bg-orange-600",
    "理科": "bg-green-500 hover:bg-green-600",
    "社会": "bg-blue-500 hover:bg-blue-600",
    "国語": "bg-purple-500 hover:bg-purple-600"
  } as const;

  return (
    <div className="container mx-auto p-4">
      <SubjectTagInput
        value={comment}
        onChange={setComment}
        onSubmit={handleCommentSubmit}
        isSubmitting={isSubmittingComment}
        studentId={studentId}
      />
      <div className="bg-white shadow-md rounded p-6">
        <div className="space-y-4">
          {/* 科目タブ */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Object.entries(subjectColors).map(([subject, colorClass]) => (
              <button
                key={subject}
                onClick={() => setActiveTab(subject)}
                className={`px-6 py-2 rounded-lg whitespace-nowrap shadow-md hover:shadow-lg
                  ${
                    activeTab === subject 
                      ? `${colorClass} text-white shadow-lg` 
                      : 'bg-gray-200 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                disabled={isInitialLoading}
              >
                {subject}
              </button>
            ))}
          </div>



          

          {/* 学習ポイント */}
         <SubjectGuidelines 
            activeTab={activeTab}
            teacherId={teacherId}
          />

          {/* レベルインジケーター */}
          {progressData.length > 0 && (
            <div className="flex items-center gap-3 border-b pb-4">
              <span className="text-gray-600 font-medium">表示中の単元:</span>
              <LevelIndicator level_id={progressData[0].level_id} />
            </div>
          )}
        </div>


{/* 講師への注意書き */}
<div className="bg-[#4AC0B9]/10 border-l-4 border-[#4AC0B9] p-4 mt-4 mb-2 rounded-md shadow-sm">
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-[#4AC0B9] mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="ml-3">
      <div className="text-sm text-[#4AC0B9]">
        <p>単元の授業が完了したら、必ず<strong>一番左の完了ボタン（チェックマーク）</strong>をクリックしてください。</p>
      </div>
    </div>
  </div>
</div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded animate-fade-in">
            {error}
          </div>
        )}

        <div className="relative mt-4 overflow-x-auto -mx-4 md:mx-0">
          {/* min-widthの代わりに単元名を折り返し可能にする */}
          <div className="pb-4 px-4 md:px-0">
            <table className="w-full border-separate border-spacing-0 table-fixed">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal sticky left-0 bg-gray-100 z-10 w-16">完了</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-16">番号</th>
                  <th className="py-3 px-2 text-left border-b text-sm text-gray-900 font-normal">単元</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-16">学校</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-16">日付</th>
                  <th className="py-3 px-2 text-left border-b text-sm text-gray-900 font-normal w-20">講師</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-20">宿題割当</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-20">C/T</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-20">宿題</th>
                  <th className="py-3 px-2 text-center border-b text-sm text-gray-900 font-normal w-16">
                    <div className="flex items-center justify-center space-x-0.5">
                      <span>取消</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <ProgressTableView
                  data={progressData}
                  loading={isInitialLoading}
                  updatingItems={updatingItems}
                  onProgressUpdate={handleProgressUpdate}
                  teacherName={teacherName}
                  teacherId={teacherId}
                  studentId={studentId}
                  showToast={showToast}
                  onBombCountUpdate={handleBombCountUpdate}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Toast通知 */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast 
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonProgressTable;