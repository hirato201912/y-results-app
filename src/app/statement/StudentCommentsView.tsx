// StudentCommentsView.tsx を更新して検索機能付きパネルを使用する例

import React, { useState } from 'react';
import StudentCommentsPanelWithSearch from './StudentCommentsPanelWithSearch';
import { FaComments, FaUser, FaSchool, FaGraduationCap, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface StudentCommentsViewProps {
  studentId?: number;
  studentName: string;
  schoolId?: number;
  schoolName?: string;
  gradeId?: number;
  gradeName?: string;
  apiUrl?: string;
}

const StudentCommentsView: React.FC<StudentCommentsViewProps> = ({ 
  studentId, 
  studentName, 
  schoolId, 
  schoolName, 
  gradeId, 
  gradeName, 
  apiUrl = 'https://mikawayatsuhashi.sakura.ne.jp/y_get_student_comments.php' 
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  // パネルの展開/折りたたみを切り替える
  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      {/* ヘッダー部分 */}
      <div 
        className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <FaComments className="text-blue-500 mr-3" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">
            {studentName}のコメント履歴
          </h2>
        </div>
        <div className="flex items-center">
          {schoolName && (
            <span className="inline-flex items-center mr-4 text-sm text-gray-500">
              <FaSchool className="mr-1" /> {schoolName}
            </span>
          )}
          {gradeName && (
            <span className="inline-flex items-center mr-4 text-sm text-gray-500">
              <FaGraduationCap className="mr-1" /> {gradeName}
            </span>
          )}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* 展開されている場合にコメントパネルを表示 */}
      {isExpanded && (
        <StudentCommentsPanelWithSearch 
          studentId={studentId} 
          studentName={studentName} 
          apiUrl={apiUrl} 
        />
      )}
    </div>
  );
};

export default StudentCommentsView;