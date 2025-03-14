import React from "react";
import { BsCircleFill } from "react-icons/bs";

type CompletionIconProps = {
  date: string;
  teacher: string;
  onConfirm: (date: string, teacher: string) => void;
  initialTeacherName: string;
};

const CompletionIcon: React.FC<CompletionIconProps> = ({ date, teacher, onConfirm, initialTeacherName }) => {
  const handleClick = () => {
    if (!date || !teacher) {
      // 日付や講師名がない場合のみクリック可能
      const today = new Date().toISOString().split('T')[0]; // 今日の日付
      const confirmation = window.confirm(`日付: ${today}, 講師: ${initialTeacherName} でよろしいですか？`);

      if (confirmation) {
        onConfirm(today, initialTeacherName); // 親コンポーネントに値を送る
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: date && teacher ? "default" : "pointer" }} // 緑の丸ならカーソルは通常、そうでなければポインター
    >
      {date && teacher ? (
        <BsCircleFill className="text-green-500" />
      ) : (
        <BsCircleFill className="text-gray-300" />
      )}
    </div>
  );
};

export default CompletionIcon;
