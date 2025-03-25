import { 
  FaHeart, 
  FaHeartBroken, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaBook, 
  FaBookOpen,
  FaCheckCircle,
  FaSpinner,
  FaHistory,
  FaExclamationTriangle
} from "react-icons/fa";
import { Switch } from "@headlessui/react";

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
  duplicate_number: number;
  student_id?: number;
}

interface ProgressTableViewProps {
  data: Progress[];
  loading: boolean;
  updatingItems: number[];
  onProgressUpdate: (unitOrderId: number, updateData: Partial<Progress>) => Promise<void>;
  teacherName: string;
  teacherId: number;
  studentId: number;
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  onBombCountUpdate?: (count: number) => void;
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

export default function ProgressTableView({
  data,
  loading,
  updatingItems,
  onProgressUpdate,
  teacherName,
  teacherId,
  studentId,
  showToast,
  onBombCountUpdate
}: ProgressTableViewProps) {
  const isUpdating = (unitOrderId: number) => updatingItems.includes(unitOrderId);

  const handleSchoolComplete = async (unitOrderId: number) => {
    const item = data.find(p => p.unit_order_id === unitOrderId);
    if (item) {
      await onProgressUpdate(unitOrderId, {
        is_school_completed: !item.is_school_completed
      });
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return '';
    }
  };

  const handleCtHomeworkReset = async (unitOrderId: number) => {
    const item = data.find(p => p.unit_order_id === unitOrderId);
    if (!item) return;

    const confirmation = window.confirm(
      `以下の記録を取消しますか？\n\n` +
      `単元: ${item.unit_name}\n` +
      `現在の状態:\n` +
      `C/T: ${item.ct_status}\n` +
      `宿題状況: ${item.homework_status}\n\n` +
      `※C/Tと宿題の記録のみ取消しされます`
    );

    if (confirmation) {
      await onProgressUpdate(unitOrderId, {
        ct_status: "未実施",
        homework_status: "未チェック",
        homework_assigned: false
      });
    }
  };

  const handleUnitCompletion = async (unitOrderId: number) => {
    const item = data.find(p => p.unit_order_id === unitOrderId);
    if (item && (!item.completion_date || !item.teacher_name)) {
      const confirmation = window.confirm(
        `講師名: ${teacherName}\n` +
        `この単元を完了にしますか？`
      );
      
      if (confirmation) {
        const today = new Date().toISOString().split('T')[0];
        await onProgressUpdate(unitOrderId, {
          completion_date: today,
          teacher_id: teacherId,
          teacher_name: teacherName
        });
      }
    }
  };

  const handleHomeworkToggle = async (unitOrderId: number) => {
    const item = data.find(p => p.unit_order_id === unitOrderId);
    if (item) {
      await onProgressUpdate(unitOrderId, {
        homework_assigned: !item.homework_assigned
      });
    }
  };

  const handleCtAction = async (unitOrderId: number, status: "未実施" | "合格" | "不合格") => {
    const item = data.find(p => p.unit_order_id === unitOrderId);
    if (item) {
      await onProgressUpdate(unitOrderId, {
        ct_status: status,
        homework_assigned: false
      });
    }
  };

  const handleHomeworkCheck = async (unitOrderId: number, status: "未チェック" | "やってきている" | "やってきていない") => {
    try {
      // 1. 進捗の更新
      await onProgressUpdate(unitOrderId, { homework_status: status });

      // やってきていない場合のみイエローカード処理
      if (status === "やってきていない") {
        try {
          // 2. bomb countを更新
          const updateBombResponse = await fetch(
            'https://mikawayatsuhashi.sakura.ne.jp/y_update_bomb_count.php',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                student_id: studentId
              })
            }
          );

          if (!updateBombResponse.ok) {
            throw new Error('イエローカードの更新に失敗しました');
          }

          const updateBombResult = await updateBombResponse.json();

          if (!updateBombResult.success) {
            throw new Error(updateBombResult.error || 'イエローカードの更新に失敗しました');
          }

          // 親コンポーネントのbomb countを更新
          if (onBombCountUpdate) {
            onBombCountUpdate(updateBombResult.bombCount);
          }

          // 2枚目から3枚目になったときのみメール送信
          if (updateBombResult.previousBombCount === 2 && updateBombResult.bombCount === 0) {
            try {
              const emailResponse = await fetch('/api/send-warning-mail', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  studentName: updateBombResult.studentName,
                  schoolName: SCHOOL_NAMES[updateBombResult.schoolId],
                  gradeName: GRADE_NAMES[updateBombResult.gradeId],
                  bombCount: 3,
                  studentId: studentId
                }),
              });

              if (!emailResponse.ok) {
                throw new Error('警告メールの送信に失敗しました');
              }

              const emailResult = await emailResponse.json();
              if (!emailResult.success) {
                throw new Error(emailResult.error || '警告メールの送信に失敗しました');
              }

              showToast('イエローカードが3枚になりました。担当者にメールで通知しました。', 'warning');
            } catch (emailError) {
              console.error('Failed to send warning email:', emailError);
              showToast('イエローカードが3枚になりました。メール通知に失敗しました。', 'error');
            }
          } else {
            // 通常の更新時
            showToast(`イエローカード: ${updateBombResult.bombCount}枚`, 'warning');
          }
        } catch (error) {
          console.error('Bomb count update error:', error);
          showToast(error instanceof Error ? error.message : 'イエローカードの更新に失敗しました', 'error');
        }
      }
    } catch (error) {
      console.error('Error handling homework check:', error);
      showToast(error instanceof Error ? error.message : '処理に失敗しました', 'error');
    }
  };

  if (loading) {
    return (
      <tr>
        <td colSpan={10} className="text-center py-4">
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-2">読み込み中...</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {data.map((item) => (
        <tr 
          key={item.unit_order_id} 
          className={`${item.isTestRange ? "bg-yellow-50" : "bg-white"} hover:bg-gray-50`}
        >
          <td className="py-2 px-2 border-b text-center w-16">
            <button 
              onClick={() => handleUnitCompletion(item.unit_order_id)}
              className="hover:scale-110 transition-transform duration-200 inline-flex justify-center w-full"
              disabled={isUpdating(item.unit_order_id)}
            >
              {isUpdating(item.unit_order_id) ? (
                <FaSpinner className="animate-spin w-6 h-6 text-gray-400" />
              ) : (
                <FaCheckCircle 
                  className={`${
                    item.completion_date && item.teacher_name 
                      ? "text-green-500" 
                      : "text-gray-300"
                  } w-6 h-6`} 
                />
              )}
            </button>
          </td>

          <td className="py-2 px-2 border-b text-center w-16">
            {item.number}
          </td>

          <td className="py-2 px-2 border-b whitespace-nowrap">
            <div className="flex items-center">
              <span className="truncate">
                {item.unit_name}
                {item.duplicate_number > 0 && ` (${item.duplicate_number + 1}回目)`}
              </span>
              {item.isTestRange && (
                <span className="ml-2 text-xs bg-yellow-300 text-yellow-800 px-2 py-1 rounded-full shrink-0">
                  テスト範囲
                </span>
              )}
            </div>
          </td>

          <td className="py-2 px-2 border-b text-center w-16">
            <button
              onClick={() => handleSchoolComplete(item.unit_order_id)}
              className="hover:scale-110 transition-transform duration-200 inline-flex justify-center w-full"
              disabled={isUpdating(item.unit_order_id)}
            >
              {isUpdating(item.unit_order_id) ? (
                <FaSpinner className="animate-spin w-5 h-5 text-gray-400" />
              ) : item.is_school_completed ? (
                <FaBookOpen className="text-blue-500 w-5 h-5" />
              ) : (
                <FaBook className="text-gray-400 w-5 h-5" />
              )}
            </button>
          </td>

          <td className="py-2 px-2 border-b w-20 text-center whitespace-nowrap">
            <span className={item.completion_date && item.teacher_id ? "text-green-500" : "text-gray-700"}>
              {formatDate(item.completion_date)}
            </span>
          </td>

          <td className="py-2 px-2 border-b w-32">
            <span className={item.completion_date && item.teacher_name ? "text-green-500" : "text-gray-700"}>
              {item.teacher_name || ''}
            </span>
          </td>

          <td className="py-2 px-2 border-b text-center w-24">
            <div className="flex justify-center">
              <Switch
                checked={item.homework_assigned}
                onChange={() => handleHomeworkToggle(item.unit_order_id)}
                disabled={isUpdating(item.unit_order_id)}
                className={`${
                  item.homework_assigned ? "bg-blue-500" : "bg-gray-300"
                } relative inline-flex items-center h-6 rounded-full w-11
                  ${isUpdating(item.unit_order_id) ? 'opacity-50' : ''}`}
              >
                <span className="sr-only">Toggle Homework</span>
                <span
                  className={`${
                    item.homework_assigned ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                />
              </Switch>
            </div>
          </td>

          <td className="py-2 px-2 border-b text-center w-[150px]">
            {item.homework_assigned && item.ct_status === "未実施" ? (
              <div className="flex justify-center space-x-2">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  onClick={() => handleCtAction(item.unit_order_id, "合格")}
                  disabled={isUpdating(item.unit_order_id)}
                >
                  {isUpdating(item.unit_order_id) ? (
                    <FaSpinner className="animate-spin w-4 h-4" />
                  ) : (
                    "合格"
                  )}
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  onClick={() => handleCtAction(item.unit_order_id, "不合格")}
                  disabled={isUpdating(item.unit_order_id)}
                >
                  {isUpdating(item.unit_order_id) ? (
               <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                "不合格"
              )}
            </button>
          </div>
        ) : (
          <>
            {item.ct_status === "合格" && (
              <FaThumbsUp className="text-green-500 mx-auto w-5 h-5" />
            )}
            {item.ct_status === "不合格" && (
              <FaThumbsDown className="text-red-500 mx-auto w-5 h-5" />
            )}
          </>
        )}
      </td>

      <td className="py-2 px-2 border-b text-center w-[150px]">
        {item.ct_status === "不合格" && item.homework_status === "未チェック" ? (
          <div className="flex justify-center space-x-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:opacity-50"
              onClick={() => handleHomeworkCheck(item.unit_order_id, "やってきている")}
              disabled={isUpdating(item.unit_order_id)}
            >
              {isUpdating(item.unit_order_id) ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <FaHeart className="text-white w-4 h-4" />
              )}
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded disabled:opacity-50"
              onClick={() => handleHomeworkCheck(item.unit_order_id, "やってきていない")}
              disabled={isUpdating(item.unit_order_id)}
            >
              {isUpdating(item.unit_order_id) ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <FaHeartBroken className="text-white w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <>
            {item.homework_status === "やってきている" && (
              <FaHeart className="text-green-500 mx-auto w-5 h-5" />
            )}
            {item.homework_status === "やってきていない" && (
              <FaHeartBroken className="text-red-500 mx-auto w-5 h-5" />
            )}
          </>
        )}
      </td>

      <td className="py-2 px-2 border-b text-center w-20">
        {(item.ct_status !== "未実施" || 
          item.homework_status !== "未チェック" || 
          item.homework_assigned) && (
            <button
              onClick={() => handleCtHomeworkReset(item.unit_order_id)}
              className="hover:bg-gray-100 text-gray-600 hover:text-red-500 p-1.5 rounded-full transition-colors duration-200"
              title="C/Tと宿題の記録をリセット"
              disabled={isUpdating(item.unit_order_id)}
            >
              {isUpdating(item.unit_order_id) ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <div className="flex items-center space-x-0.5">
                  <FaHistory className="w-4 h-4" />
                  <FaExclamationTriangle className="w-2.5 h-2.5 text-amber-500" />
                </div>
              )}
            </button>
        )}
      </td>
    </tr>
  ))}
</>
);
}