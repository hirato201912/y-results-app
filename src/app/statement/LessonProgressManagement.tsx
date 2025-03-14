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
  FaExclamationTriangle
} from 'react-icons/fa';
import LessonProgressTable from './LessonProgressTable';

interface ProgressParams {
  schoolId: number;
  gradeId: number;
  studentId: number;
  teacherId: number;
  gender: 'male' | 'female';
  bombCount?: number;
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
  9: "その他 (使用中止)",
  10: "東山中",
  31: "井郷中",
  32: "猿投台中",
  33: "藤岡南中",
  34: "小原中",
  35: "藤岡中",
  99: "その他の学校"
};

const GRADE_NAMES: { [key: number]: string } = {
  5: "中学3年生",
  6: "中学2年生",
  7: "中学1年生"
};

const LessonProgressManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [studentName, setStudentName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [progressParams, setProgressParams] = useState<ProgressParams | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBombCount = async (studentId: number): Promise<number> => {
    try {
      const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/y_get_bomb_count.php?student_id=${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bomb count');
      }
      const data = await response.json();
      return data.bombCount || 0;
    } catch (error) {
      console.error('Failed to fetch bomb count:', error);
      return 0;
    }
  };

  // bombカウントの監視用Effect
// bombカウントの監視用Effect
useEffect(() => {
  const handleBombCount = async () => {
    if (progressParams?.bombCount === 3) {
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
            bombCount: progressParams.bombCount,
            studentId: progressParams.studentId
          }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error);
        }

        // メール送信成功後にbombCountを再取得して表示を更新
        const newBombCount = await fetchBombCount(progressParams.studentId);
        setProgressParams(prev => prev ? {
          ...prev,
          bombCount: newBombCount
        } : null);

      } catch (error) {
        console.error('警告メール送信エラー:', error);
      }
    }
  };

  handleBombCount();
}, [progressParams?.bombCount, studentName, progressParams]);

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
        
        const bombCount = await fetchBombCount(numericStudentId);

        setProgressParams({
          schoolId: numericSchoolId,
          gradeId: numericGradeId,
          studentId: numericStudentId,
          teacherId: numericTeacherId,
          gender: gender as 'male' | 'female',
          bombCount
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

  const fetchTeacherName = async (teacherId: number) => {
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

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // 将来的なCSV出力機能のための準備
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <Image
                  src={`/images/${progressParams?.gender === 'male' ? 'study_boy.png' : 'study_girl.png'}`}
                  alt="Student icon"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <h1 className="text-xl font-bold flex items-center gap-3">
                  <span className="text-2xl" style={{ color: '#4AC0B9' }}>
                    {studentName}
                  </span>
                  <span className="text-gray-600">の進捗管理</span>
                </h1>
              </div>



{/* テスト成績管理ボタン (現在無効化中) */}
{/*
<div className="mt-4">
  <Link 
    href={`/test-scores?${new URLSearchParams({
      student: studentName,
      id: progressParams?.studentId.toString() || '',
      api_key: searchParams.get('api_key') || '',
      user: searchParams.get('user') || '',
      school_id: progressParams?.schoolId.toString() || '',
      grade_id: progressParams?.gradeId.toString() || '',
      student_id: progressParams?.studentId.toString() || '',
      gender: progressParams?.gender || ''
    }).toString()}`}
    className="inline-flex items-center px-4 py-2 bg-[#4AC0B9] text-white rounded-lg 
      hover:bg-[#3DA8A2] transition-colors duration-200"
    target="_blank"
    rel="noopener noreferrer"
  >
    <FaClipboardList className="mr-2" />
    テスト成績管理
  </Link>
</div>
*/}
{/* テスト成績管理ボタン (現在無効化中) */}
{/*
<div className="mt-4">
  <Link 
    href={`/test-scores?${new URLSearchParams({
      student: studentName,
      id: progressParams?.studentId.toString() || '',
      api_key: searchParams.get('api_key') || '',
      user: searchParams.get('user') || '',
      school_id: progressParams?.schoolId.toString() || '',
      grade_id: progressParams?.gradeId.toString() || '',
      student_id: progressParams?.studentId.toString() || '',
      gender: progressParams?.gender || ''
    }).toString()}`}
    className="inline-flex items-center px-4 py-2 bg-[#4AC0B9] text-white rounded-lg 
      hover:bg-[#3DA8A2] transition-colors duration-200"
    target="_blank"
    rel="noopener noreferrer"
  >
    <FaClipboardList className="mr-2" />
    テスト成績管理
  </Link>
</div>
*/}

{/* 準備中を一体化したボタン */}
<div className="mt-4">
  <button
    disabled
    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 
      rounded-lg cursor-not-allowed shadow-sm relative overflow-hidden"
  >
    <div className="flex items-center">
      <FaClipboardList className="mr-2 text-gray-500" />
      <span>テスト成績管理</span>
    </div>
    
    {/* 角度をつけたリボン */}
    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 py-0.5 px-3 
      text-xs font-bold shadow-sm transform translate-x-2 -translate-y-0.5 rotate-12">
      <div className="flex items-center">
        <span role="img" aria-label="工事中" className="mr-1">🔧</span>
        準備中
      </div>
    </div>
  </button>

  {/* 補足説明テキスト */}
  <p className="text-xs text-gray-500 mt-1 ml-1">
    テスト成績管理機能は現在開発中です。もうしばらくお待ちください。
  </p>
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
  <FaExclamationTriangle 
    className={`mr-2 ${progressParams?.bombCount ? 'text-yellow-500' : 'text-gray-400'}`} 
  />
  <span className={progressParams?.bombCount && progressParams.bombCount >= 2 ? 'text-red-500 font-medium' : ''}>
    イエローカード: {progressParams?.bombCount ?? 0}/3枚
    {progressParams?.bombCount && progressParams.bombCount >= 2 && ' (要注意)'}
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