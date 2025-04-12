import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaPrint, 
  FaDownload, 
  FaCalendar, 
  FaUser, 
  FaSchool, 
  FaGraduationCap, 
  FaChevronUp,
  FaBookOpen,
  FaClipboardList,
  FaComments,
  FaChartBar // 宿題メーター用のアイコン追加
} from 'react-icons/fa';
import LessonProgressTable from './LessonProgressTable';
import StudentCommentsView from './StudentCommentsView';

// 型定義
interface ProgressParams {
  schoolId: number;
  gradeId: number;
  studentId: number;
  teacherId: number;
  gender: 'male' | 'female';
  homeworkMeterCount?: number; // bombCountから変更
}

interface InlineStudentInstructionProps {
  studentId: number;
}

// インラインで生徒指示コンポーネントを定義
const InlineStudentInstruction: React.FC<InlineStudentInstructionProps> = ({ studentId }) => {
  const [instruction, setInstruction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedInstruction, setEditedInstruction] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // コメント内容を取得する処理
    const fetchInstruction = async () => {
      try {
        const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/y_student_instruction.php?student_id=${studentId}&action=get`);
        const data = await response.json();
        if (data.success) {
          setInstruction(data.instruction || '');
        }
      } catch (err) {
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchInstruction();
    }
  }, [studentId]);

  // 保存処理
  const saveInstruction = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('student_id', studentId.toString());
      formData.append('instruction', editedInstruction);
      formData.append('action', 'update');
      
      const response = await fetch('https://mikawayatsuhashi.sakura.ne.jp/y_student_instruction.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setInstruction(editedInstruction);
        setIsEditing(false);
        return true;
      } else {
        setError('保存に失敗しました');
        return false;
      }
    } catch (err) {
      setError('エラーが発生しました');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setEditedInstruction(instruction);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="p-3 bg-[#4AC0B9]/10 border-b border-[#4AC0B9]/30">
          <h3 className="text-base font-medium text-[#4AC0B9] flex items-center">
            <span className="mr-2">👨‍🏫</span>
            <span className="mr-1 bg-[#4AC0B9] text-white text-xs px-2 py-0.5 rounded">塾長専用</span>
            重要指示・情報
          </h3>
        </div>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4AC0B9]"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 border-t-4 border-t-[#4AC0B9]">
      <div className="p-3 bg-[#4AC0B9]/10 border-b border-[#4AC0B9]/30 flex justify-between items-center">
        <h3 className="text-base font-medium text-[#4AC0B9] flex items-center">
          <span className="mr-2">👨‍🏫</span>
          <span className="mr-1 bg-[#4AC0B9] text-white text-xs px-2 py-0.5 rounded">塾長専用</span>
          重要指示・情報
        </h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-xs font-medium text-[#4AC0B9] bg-white border border-[#4AC0B9]/30 rounded-full hover:bg-[#4AC0B9]/5 transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            塾長編集
          </button>
        )}
      </div>
  
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#4AC0B9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>このフィールドは塾長のみが編集できます</span>
            </div>
            <textarea
              value={editedInstruction}
              onChange={(e) => setEditedInstruction(e.target.value)}
              className="w-full p-3 border border-[#4AC0B9]/30 rounded-md focus:ring-2 focus:ring-[#4AC0B9]/50 focus:border-[#4AC0B9]"
              rows={4}
              placeholder="生徒の学習方針や注意点など、重要な指示・特記事項を入力してください..."
              disabled={isSaving}
            />
              
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700">
                {error}
              </div>
            )}
              
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                disabled={isSaving}
              >
                キャンセル
              </button>
              <button
                onClick={saveInstruction}
                className="px-4 py-2 text-sm text-white bg-[#4AC0B9] rounded-md hover:bg-[#3DA8A2] transition-colors duration-200 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    保存
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {instruction ? (
              <div className="p-4 bg-[#4AC0B9]/5 border border-[#4AC0B9]/20 rounded-lg whitespace-pre-wrap text-red-500 shadow-sm">
                {instruction}
              </div>
            ) : (
              <div className="p-4 text-gray-500 italic text-center border border-dashed border-gray-300 rounded-lg">
                塾長からの重要指示・情報はまだありません
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


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

const LessonProgressManagement: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [studentName, setStudentName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [progressParams, setProgressParams] = useState<ProgressParams | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  
  // コメント表示のための状態
  const [showCommentSection, setShowCommentSection] = useState<boolean>(false);

  // スクロールボタンの処理
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 宿題お知らせメーターの取得
  const fetchHomeworkMeterCount = async (studentId: number): Promise<number> => {
    try {
      const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/y_get_bomb_count.php?student_id=${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch homework meter count');
      }
      const data = await response.json();
      return data.bombCount || 0; // APIの戻り値名はまだbombCountのまま
    } catch (error) {
      console.error('Failed to fetch homework meter count:', error);
      return 0;
    }
  };

  // 宿題メーターカウントの監視用Effect
  useEffect(() => {
    const handleHomeworkMeterCount = async () => {
      if (progressParams?.homeworkMeterCount === 5) { // 上限を5に変更
        try {
          const response = await fetch('/api/send-warning-mail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentName: studentName,
              schoolName: SCHOOL_NAMES[progressParams.schoolId],
              gradeName: GRADE_NAMES[progressParams.gradeId],
              homeworkMeterCount: progressParams.homeworkMeterCount,
              studentId: progressParams.studentId
            }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error);
          }

          // メール送信成功後に宿題メーターを再取得して表示を更新
          const newHomeworkMeterCount = await fetchHomeworkMeterCount(progressParams.studentId);
          setProgressParams(prev => prev ? {
            ...prev,
            homeworkMeterCount: newHomeworkMeterCount
          } : null);

        } catch (error) {
          console.error('通知メール送信エラー:', error);
        }
      }
    };

    handleHomeworkMeterCount();
  }, [progressParams?.homeworkMeterCount, studentName, progressParams]);

  // 初期化処理
  useEffect(() => {
    const initialize = async () => {
      try {
        const name = searchParams.get('name');
        const teacherId = searchParams.get('user');
        const apiKey = searchParams.get('api_key');
        const schoolId = searchParams.get('school_id');
        const gradeId = searchParams.get('grade_id');
        const studentId = searchParams.get('student_id');
        const gender = searchParams.get('gender');
  
        if (!name || !teacherId || !apiKey || !schoolId || !gradeId || !studentId || !gender) {
          throw new Error('必要なパラメータが不足しています');
        }
  
        const isValidKey = await verifyApiKey(apiKey);
        if (!isValidKey) {
          throw new Error('APIキーが無効です');
        }

        const decodedName = decodeURIComponent(name);
        setStudentName(decodedName);
        document.title = `${decodedName}の進捗管理`;
        
        setLastUpdateTime(new Date().toLocaleString());

        const numericTeacherId = convertToNumber(teacherId, '講師ID');
        const numericSchoolId = convertToNumber(schoolId, '学校ID');
        const numericGradeId = convertToNumber(gradeId, '学年ID');
        const numericStudentId = convertToNumber(studentId, '生徒ID');

        await fetchTeacherName(numericTeacherId);
        
        const homeworkMeterCount = await fetchHomeworkMeterCount(numericStudentId);

        setProgressParams({
          schoolId: numericSchoolId,
          gradeId: numericGradeId,
          studentId: numericStudentId,
          teacherId: numericTeacherId,
          gender: gender as 'male' | 'female',
          homeworkMeterCount
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [router, searchParams]);

  const convertToNumber = (value: string | null, paramName: string): number => {
    if (!value) throw new Error(`${paramName}が不足しています`);
    const cleanValue = value.replace(/['"]/g, '');
    const numericValue = Number(cleanValue);
    if (isNaN(numericValue)) throw new Error(`不正な${paramName}の形式です`);
    return numericValue;
  };

  const verifyApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/verify_api_key.php?api_key=${apiKey}`);
      const data = await response.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const fetchTeacherName = async (teacherId: number): Promise<void> => {
    try {
      const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/statement_get_teacher_name.php?user_id=${teacherId}`);
      const data = await response.json();

      if (data.name) {
        setTeacherName(data.name);
      } else {
        throw new Error(data.error || '講師名の取得に失敗しました');
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleExport = (): void => {
    // 将来的なCSV出力機能のための準備
  };

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // コメント表示切り替え
  const toggleCommentSection = (): void => {
    setShowCommentSection(!showCommentSection);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <div className="text-gray-600 font-medium">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 
                  transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                再読み込み
              </button>
              <button
                onClick={() => window.location.href = 'https://mikawayatsuhashi.sakura.ne.jp/classmate_index.php'}
                className="w-full bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 
                  transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                トップページへ戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2
              bg-white/90 backdrop-blur-sm border border-gray-200 
              rounded-full shadow-lg hover:shadow-xl 
              hover:bg-white group transition-all duration-200 z-50"
            aria-label="トップへ戻る"
          >
            <FaChevronUp 
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600 
                transition-colors duration-200" 
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800">
              トップへ戻る
            </span>
          </button>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center px-6 py-3 bg-[#4AC0B9]/10 border-l-4 border-[#4AC0B9] 
              rounded-lg text-sm text-gray-600 max-w-xl shadow-sm">
              <div className="flex items-center">
                <svg 
                  className="w-5 h-5 mr-3 text-[#4AC0B9]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <div>
                  <p className="font-medium text-[#4AC0B9]">新しいタブで表示中</p>
                  <p className="text-gray-600 mt-1">
                    授業終了後は、このタブを閉じていただきますようお願いいたします。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-500">
                <FaUser className="mr-2" />
                <span>講師:</span>
                <span className="ml-2 font-medium text-gray-700">{teacherName}</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center text-sm text-gray-500">
                <FaCalendar className="mr-2" />
                <span>最終更新:</span>
                <span className="ml-2 font-medium text-gray-700">{lastUpdateTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                {progressParams && (
                  <Image
                    src={`/images/${progressParams.gender === 'male' ? 'study_boy.png' : 'study_girl.png'}`}
                    alt="Student icon"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                )}
                <h1 className="text-xl font-bold flex items-center gap-3">
                  <span className="text-2xl" style={{ color: '#4AC0B9' }}>
                    {studentName}
                  </span>
                  <span className="text-gray-600">の進捗管理</span>
                </h1>
              </div>

              <div className="mt-4">
                {progressParams && (
                  <Link 
                    href={`/test-scores?${new URLSearchParams({
                      student: studentName,
                      id: progressParams.studentId.toString(),
                      api_key: searchParams.get('api_key') || '',
                      user: searchParams.get('user') || '',
                      school_id: progressParams.schoolId.toString(),
                      grade_id: progressParams.gradeId.toString(),
                      student_id: progressParams.studentId.toString(),
                      gender: progressParams.gender
                    }).toString()}`}
                    className="inline-flex items-center px-4 py-2 bg-[#4AC0B9] text-white rounded-lg 
                      hover:bg-[#3DA8A2] transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaClipboardList className="mr-2" />
                    テスト成績管理
                  </Link>
                )}
                
                {/* コメント表示切り替えボタン */}
                <button 
                  onClick={toggleCommentSection}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg 
                    hover:bg-blue-600 transition-colors duration-200 ml-4"
                >
                  <FaComments className="mr-2" />
                  {showCommentSection ? 'コメント履歴を隠す' : 'コメント履歴を表示'}
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
  {progressParams && (
    <>
      <div className="flex items-center">
        <FaSchool className="mr-2" />
        <span>{SCHOOL_NAMES[progressParams.schoolId]}</span>
      </div>
      <div className="h-4 w-px bg-gray-300" />
      <div className="flex items-center">
        <FaGraduationCap className="mr-2" />
        <span>{GRADE_NAMES[progressParams.gradeId]}</span>
      </div>
      <div className="h-4 w-px bg-gray-300" />
      <div className="flex items-center">
        <FaChartBar 
          className={`mr-2 ${progressParams.homeworkMeterCount ? 'text-red-500' : 'text-gray-400'}`} 
        />
        <span className={progressParams.homeworkMeterCount && progressParams.homeworkMeterCount >= 3 ? 'text-red-600 font-medium' : ''}>
          宿題忘れメーター: 
          <span className="ml-2 inline-flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="mx-0.5">
                {i < (progressParams.homeworkMeterCount || 0) ? 
                  <span className="inline-block w-4 h-4 bg-red-500 rounded-sm border border-red-600"></span> : 
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-sm border border-gray-300"></span>
                }
              </span>
            ))}
          </span>
          <span className="ml-2">
  ({progressParams.homeworkMeterCount || 0}/5)
</span>
{progressParams.homeworkMeterCount === 5 && 
  <div className="mt-1 text-red-600 font-medium ml-6">※塾長へ通知されています</div>
}
        </span>
      </div>
    </>
  )}
</div>
            </div>

            <div className="flex gap-3">
              <a href="https://mikawayatsuhashi.sakura.ne.jp/students-progress-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#4AC0B9] text-[#4AC0B9] 
                  rounded-lg hover:bg-[#4AC0B9] hover:text-white
                  transition-all duration-200 flex items-center gap-2 shadow-sm
                  hover:shadow-md font-medium"
              >
                <FaBookOpen className="w-4 h-4" />
                <span>手順書</span>
              </a>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                 transition-colors duration-200 flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                <span>印刷</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                  transition-colors duration-200 flex items-center gap-2"
              >
                <FaDownload className="w-4 h-4" />
                <span>エクスポート</span>
              </button>
            </div>
          </div>
        </div>

        {/* 生徒学習指示セクション */}
        {progressParams && (
          <InlineStudentInstruction 
            studentId={progressParams.studentId}
          />
        )}

        {/* コメント履歴セクション */}
        {showCommentSection && progressParams && (
          <StudentCommentsView
            studentId={progressParams.studentId}
            studentName={studentName}
            schoolId={progressParams.schoolId}
            schoolName={SCHOOL_NAMES[progressParams.schoolId]}
            gradeId={progressParams.gradeId}
            gradeName={GRADE_NAMES[progressParams.gradeId]}
          />
        )}

        {progressParams && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <LessonProgressTable
              teacherName={teacherName}
              teacherId={progressParams.teacherId}
              schoolId={progressParams.schoolId}
              gradeId={progressParams.gradeId}
              studentId={progressParams.studentId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonProgressManagement;