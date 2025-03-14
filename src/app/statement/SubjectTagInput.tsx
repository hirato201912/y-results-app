import { useRef, useEffect, useState, useCallback } from 'react';
import { FaComment, FaSpinner, FaSave } from 'react-icons/fa';
import { debounce } from 'lodash';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => Promise<void>;
  isSubmitting?: boolean;
  studentId: number;
}

export default function SubjectTagInput({ 
  value, 
  onChange, 
  onSubmit, 
  isSubmitting = false,
  studentId
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 科目定義
  const subjects = [
    { label: '英語', tag: '【英語】' },
    { label: '数学', tag: '【数学】' },
    { label: '理科', tag: '【理科】' },
    { label: '地理', tag: '【地理】' },
    { label: '歴史', tag: '【歴史】' },
    { label: '社会', tag: '【社会】' },
    { label: '国語', tag: '【国語】' },
    { label: '算数', tag: '【算数】' },
    { label: '入試対策', tag: '●入試対策●' },
    { label: '講習会', tag: '●講習会●' },
  ];

  const getStorageKey = () => `draft_comment_${studentId}`;

  interface DraftData {
    content: string;
    timestamp: number;
  }

  // 下書きの保存
  const saveDraft = (content: string) => {
    const data: DraftData = {
      content,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
    setLastSaved(new Date().toLocaleTimeString());
  };

  // 下書きの読み込み
  const loadDraft = useCallback(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const data: DraftData = JSON.parse(saved);
      const isRecent = (new Date().getTime() - data.timestamp) < 24 * 60 * 60 * 1000;
      if (isRecent && data.content) {
        onChange(data.content);
        setLastSaved(new Date(data.timestamp).toLocaleTimeString());
      } else {
        localStorage.removeItem(getStorageKey());
      }
    }
  }, [onChange]);

  // 自動保存
  const debouncedSave = useCallback(
    debounce((content: string) => {
      if (content.trim()) {
        saveDraft(content);
      }
    }, 1000),
    []
  );

  // 科目タグ挿入
  const handleSubjectClick = (tag: string) => {
    const textArea = textareaRef.current;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const newValue = value.substring(0, start) + tag + '\n' + value.substring(end);
      onChange(newValue);
      debouncedSave(newValue);
      
      const newPosition = start + tag.length + 1;
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    debouncedSave(newValue);
  };

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isSubmitting) return;
    
    try {
      await onSubmit(value);
      localStorage.removeItem(getStorageKey());
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 w-3/5">
   <div className="bg-white rounded-lg shadow-sm border border-[#4AC0B9] p-4">
  <div className="flex items-center justify-between gap-2 mb-3">
    <div className="flex items-center gap-2">
      <FaComment className="text-[#4AC0B9]" />
      <h3 className="text-[#4AC0B9] font-bold">授業記録をこちらに入力</h3>
    </div>
    {lastSaved && (
      <div className="text-sm text-gray-500">
        <FaSave className="inline-block mr-1" />
        最終保存: {lastSaved}
      </div>
    )}
  </div>

        <p className="text-xs text-gray-500 mb-2">
  科目ボタンを押して、該当する科目名を入力欄に挿入できます。
</p>

<div className="flex flex-wrap gap-1 mb-3">  {/* gap-1.5 → gap-1 */}
  {subjects.map(({ label, tag }) => (
    <button
      key={label}
      type="button"
      onClick={() => handleSubjectClick(tag)}
      className="px-2.5 py-0.5 text-[11px] bg-gray-500 text-white  
        rounded-full hover:bg-gray-700
        transition-all duration-200 font-medium
        shadow-sm hover:shadow"
    >
      {label}
    </button>
  ))}
</div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder="生徒のつまずきポイントを具体的に記入してください。
（例：分数の通分で間違いが多い、不規則動詞の活用を覚えられていない）
※頑張っているポイントも見つけてコメントしてもらえると励みになります。"
          className="w-full min-h-[150px] p-3 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            placeholder:text-gray-400 text-gray-700 resize-none mb-4"
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={!value.trim() || isSubmitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg
              hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors flex items-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>送信中...</span>
              </>
            ) : (
              '書き込む'
            )}
          </button>

          {value.trim() && (
            <button
              type="button"
              onClick={() => saveDraft(value)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 
                flex items-center gap-2 transition-colors"
            >
              <FaSave />
              <span>手動保存</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}