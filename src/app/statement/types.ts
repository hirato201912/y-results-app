// types.ts

// C/Tのステータス型
export type CtStatus = "未実施" | "合格" | "不合格";

// 宿題ステータス型
export type HomeworkStatus = "未チェック" | "やってきている" | "やってきていない";

// Progressデータのインターフェース
export interface Progress {
  unit_id: number;
  unit_name: string;
  number: string;
  order_index: number;
  isTestRange: boolean;
  isHidden: boolean;
  completion_date: string | null;  // `string | null` 型に統一
  teacher_id: number | null;
  teacher_name: string | null;
  is_school_completed: boolean;
  homework_assigned: boolean;
  ct_status: CtStatus;
  homework_status: HomeworkStatus;
}

// LessonProgressTableコンポーネントのプロパティ型
export interface LessonProgressTableProps {
  teacherName: string;
  schoolId: number;
  gradeId: number;
  studentId: number;
}

// ProgressTableViewコンポーネントのプロパティ型
export interface ProgressTableViewProps {
  data: Progress[];
  loading: boolean;
  onProgressUpdate: (unitId: number, updateData: Partial<Progress>) => Promise<void>;
  teacherName: string;
}

// 科目ごとの色を定義した定数
export const SUBJECTS = {
  英語: "bg-red-500 text-white",
  数学: "bg-orange-500 text-white",
  理科: "bg-green-500 text-white",
  社会: "bg-blue-500 text-white",
  国語: "bg-purple-500 text-white",
} as const;
