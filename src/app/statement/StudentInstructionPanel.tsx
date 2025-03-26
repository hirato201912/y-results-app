import React, { useState, useEffect } from 'react';

interface StudentInstructionPanelProps {
  studentId: number;
  initialInstruction?: string;
  isEditable?: boolean;
  onSave?: (newInstruction: string) => Promise<boolean>;
}

/**
 * 塾長からの生徒学習指示を表示・編集するコンポーネント
 * comment2フィールドの内容を表示し、権限があれば編集可能
 */
const StudentInstructionPanel: React.FC<StudentInstructionPanelProps> = ({
  studentId,
  initialInstruction = '',
  isEditable = false,
  onSave
}) => {
  const [instruction, setInstruction] = useState<string>(initialInstruction);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editedInstruction, setEditedInstruction] = useState<string>('');
  
  useEffect(() => {
    setInstruction(initialInstruction);
  }, [initialInstruction]);

  const handleEdit = () => {
    setEditedInstruction(instruction);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const success = await onSave(editedInstruction);
      
      if (success) {
        setInstruction(editedInstruction);
        setIsEditing(false);
      } else {
        setError('保存に失敗しました。もう一度お試しください。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="p-4 bg-yellow-50 border-b border-yellow-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-yellow-800">
            <span className="mr-2">📝</span>
            塾長からの重要指示・情報
          </h3>
          {isEditable && !isEditing && (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
            >
              編集
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedInstruction}
              onChange={(e) => setEditedInstruction(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="生徒への学習指示を入力してください..."
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
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isSaving}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
                ) : '保存'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {instruction ? (
              <div className="p-4 bg-white border border-yellow-200 rounded-lg whitespace-pre-wrap">
                {instruction}
              </div>
            ) : (
              <div className="p-4 text-gray-500 italic text-center">
                学習指示はありません
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInstructionPanel;