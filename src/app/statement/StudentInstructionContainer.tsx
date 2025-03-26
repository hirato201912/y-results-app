import React, { useState, useEffect } from 'react';
import StudentInstructionPanel from './StudentInstructionPanel';

interface StudentInstructionContainerProps {
  studentId: number;
  apiUrl?: string;
}

/**
 * 生徒の学習指示データを管理するコンテナコンポーネント
 * APIとの通信を担当し、StudentInstructionPanelに表示を委譲する
 */
const StudentInstructionContainer: React.FC<StudentInstructionContainerProps> = ({
  studentId,
  apiUrl = 'https://mikawayatsuhashi.sakura.ne.jp/y_student_instruction.php'
}) => {
  const [instruction, setInstruction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 学習指示を取得する関数
  const fetchInstruction = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // パラメータの構築
      const params = new URLSearchParams();
      params.append('student_id', studentId.toString());
      params.append('action', 'get');
      
      const response = await fetch(`${apiUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'データの取得に失敗しました');
      }
      
      setInstruction(data.instruction || '');
    } catch (err) {
      console.error('学習指示取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 学習指示を保存する関数
  const saveInstruction = async (newInstruction: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('student_id', studentId.toString());
      formData.append('instruction', newInstruction);
      formData.append('action', 'update');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '保存に失敗しました');
      }
      
      return true;
    } catch (err) {
      console.error('学習指示保存エラー:', err);
      throw err;
    }
  };

  // 初回レンダリング時に学習指示を取得
  useEffect(() => {
    if (studentId) {
      fetchInstruction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800">
            <span className="mr-2">📝</span>
            塾長からの学習指示
          </h3>
        </div>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800">
            <span className="mr-2">📝</span>
            塾長からの学習指示
          </h3>
        </div>
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={fetchInstruction}
            className="mt-2 px-3 py-1 text-xs text-red-700 border border-red-500 rounded hover:bg-red-100"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <StudentInstructionPanel
      studentId={studentId}
      initialInstruction={instruction}
      isEditable={true}
      onSave={saveInstruction}
    />
  );
};

export default StudentInstructionContainer;