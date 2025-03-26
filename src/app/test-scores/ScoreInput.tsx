'use client';

import React, { useState } from 'react';

interface ScoreInputProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  disabled?: boolean;
  max?: number;
  required?: boolean;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  max = 100,
  required = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 空入力
    if (inputValue === '') {
      setError(null);
      onChange('');
      return;
    }

    const num = parseInt(inputValue);

    // 数値変換エラー
    if (isNaN(num)) {
      setError('数値を入力してください');
      return;
    }

    // 0の場合は空として扱う例
    if (num === 0) {
      setError(null);
      onChange('');
      return;
    }

    // 範囲チェック
    if (num < 0) {
      setError('0以上の数値を入力してください');
      return;
    }
    if (num > max) {
      setError(`${max}以下の数値を入力してください`);
      return;
    }

    // OK
    setError(null);
    onChange(num);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    // フォーカス外れた時にエラーをクリアする設計
    setError(null);
  };

  // 表示用の値（0 は空文字表示にする設計）
  const displayValue = value === 0 ? '' : value;

  const inputStyles = `
    w-full p-3 border rounded-lg transition-all duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-white'}
    ${isFocused ? 'ring-2 ring-[#4AC0B9] border-transparent' : 'focus:ring-2 focus:ring-[#4AC0B9] focus:border-transparent'}
    ${error ? 'border-red-300' : 'border-gray-300'}
    disabled:opacity-50
  `.trim();

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min="1"
          max={max}
          className={inputStyles}
          disabled={disabled}
          placeholder="未入力"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          点
        </span>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 min-h-[1.5rem]" id={`${label}-error`}>
          {error}
        </p>
      )}

      {!error && !displayValue && (
        <p className="mt-1 text-xs text-gray-400 min-h-[1.5rem]">
          未入力の場合は空欄のままにしてください
        </p>
      )}
    </div>
  );
};

export default ScoreInput;
