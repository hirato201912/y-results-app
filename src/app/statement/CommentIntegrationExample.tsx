import React, { useState } from 'react';
import StudentCommentsView from './StudentCommentsView';
import StudentCommentsPanel from './StudentCommentsPanel';
import { FaTimes, FaComments } from 'react-icons/fa';

interface ProgressParams {
  schoolId: number;
  gradeId: number;
  studentId: number;
  teacherId: number;
  gender: 'male' | 'female';
  bombCount?: number;
}

interface CommentIntegrationExampleProps {
  progressParams: ProgressParams | null;
  studentName: string;
}

// このコンポーネントは既存のLessonProgressManagementコンポーネントに組み込むためのサンプル
const CommentIntegrationExample: React.FC<CommentIntegrationExampleProps> = ({ progressParams, studentName }) => {
  // モバイルでのコメント表示用のモーダル状態
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);

  // スクールと学年の名前のマッピング（paste.txtから抽出）
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

  // コメントモーダルの表示/非表示を切り替える
  const toggleCommentsModal = (): void => {
    setShowCommentsModal(!showCommentsModal);
  };

  if (!progressParams) {
    return null;
  }

  return (
    <>
      {/* デスクトップ表示 - StudentCommentsViewコンポーネントをそのまま使用 */}
      <div className="hidden md:block">
        <StudentCommentsView
          studentId={progressParams.studentId}
          studentName={studentName}
          schoolId={progressParams.schoolId}
          schoolName={SCHOOL_NAMES[progressParams.schoolId]}
          gradeId={progressParams.gradeId}
          gradeName={GRADE_NAMES[progressParams.gradeId]}
        />
      </div>

      {/* モバイル表示 - コメント表示ボタンとモーダル */}
      <div className="block md:hidden">
        <button
          onClick={toggleCommentsModal}
          className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-4 shadow-lg z-50 flex items-center justify-center"
          aria-label="コメント履歴を表示"
        >
          <FaComments size={24} />
        </button>

        {/* モバイル用コメントモーダル */}
        {showCommentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
              {/* モーダルヘッダー */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {studentName}のコメント履歴
                </h3>
                <button
                  onClick={toggleCommentsModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>

              {/* モーダル本体 - StudentCommentsPanelコンポーネントを使用 */}
              <div className="flex-1 overflow-auto">
                <StudentCommentsPanel
                  studentId={progressParams.studentId}
                  studentName={studentName}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CommentIntegrationExample;