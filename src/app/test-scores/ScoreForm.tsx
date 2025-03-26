'use client';

import React from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';

interface TestScore {
  id?: number;                   // レコードID（DBに保存済みなら）
  student_id?: number;           // 生徒ID
  test_name: string;             // テスト名
  test_definition_id: number;    // テスト定義ID

  // 科目スコア: number | null | undefined を許容
  japanese_score?: number | null;
  math_score?: number | null;
  english_score?: number | null;
  science_score?: number | null;
  social_score?: number | null;

  // 順位・合計点など
  class_rank?: number | null;
  total_score?: number | null;

  // 登録日時など
  post_date?: string;
}

interface TestDefinition {
  id: number;
  grade_id: number;
  test_name: string;
  scheduled_date: string;
  provisional?: boolean; // 仮のテスト定義かどうかのフラグ
}

interface ScoreFormProps {
  currentScore: Partial<TestScore>;
  testDefinitions: TestDefinition[];
  existingScores: TestScore[];
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: keyof TestScore, value: number | string) => void;
  isSaving: boolean;
}

interface ScoreInputProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  disabled?: boolean;
  max?: number;
}
// 子コンポーネント: スコア入力
const ScoreInput: React.FC<ScoreInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  max = 100
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(''); // 空文字をそのまま返す→親側で null 扱いにしてもOK
      return;
    }
    const num = parseInt(val);
    // 0~max の範囲なら更新
    if (!isNaN(num) && num >= 0 && num <= max) {
      onChange(num);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min="0"
        max={max}
        className="w-full p-3 border rounded-lg bg-gray-50 hover:bg-white focus:bg-white
          focus:ring-2 focus:ring-[#4AC0B9] focus:border-transparent
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        placeholder="未入力"
      />
    </div>
  );
};

// メインフォームコンポーネント
const ScoreForm: React.FC<ScoreFormProps> = ({
  currentScore,
  testDefinitions,
  existingScores,
  onSubmit,
  onInputChange,
  isSaving
}) => {
  // 日付のフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // テストの入力状況を判定
  const getTestStatus = (testId: number): string => {
    const existingScore = existingScores.find(score => score.test_definition_id === testId);
    if (!existingScore) {
      return '';  // 未入力とする
    }

    // 必須科目のリスト
    const subjects: (keyof TestScore)[] = [
      'japanese_score',
      'math_score',
      'english_score',
      'science_score',
      'social_score'
    ];

    // 入力済み科目数
    const validScores = subjects.filter(
      subject => existingScore[subject] !== null && existingScore[subject] !== 0
    );

    // 全くスコアが入っていなければ空表示
    if (validScores.length === 0) {
      return '';
    }

    // 全科目＋順位まで入力済み
    if (
      validScores.length === subjects.length &&
      existingScore.class_rank !== null
    ) {
      return '［入力済み］';
    }

    // 一部のみ or 順位が未入力
    return '［集計中］';
  };

  // 状態に応じてスタイルを変える
  const getStatusStyle = (status: string): string => {
    switch (status) {
      case '［入力済み］':
        return 'text-green-600';
      case '［集計中］':
        return 'text-orange-500';
      default:
        return 'text-gray-600';
    }
  };
  
  // テスト定義を年度別に分類
  const groupTestDefinitions = () => {
    const groups: { [year: string]: TestDefinition[] } = {};
    
    testDefinitions.forEach(def => {
      const yearMatch = def.test_name.match(/(\d{4})年度/);
      const year = yearMatch ? yearMatch[1] : '不明';
      
      if (!groups[year]) {
        groups[year] = [];
      }
      
      groups[year].push(def);
    });
    
    // 各グループ内でさらに日付順にソート
    Object.keys(groups).forEach(year => {
      groups[year].sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    });
    
    return groups;
  };
  
  const testGroups = groupTestDefinitions();
  // ソートされた年度キーを取得（降順）
  const sortedYears = Object.keys(testGroups).sort((a, b) => parseInt(b) - parseInt(a));
  
  // 現在の年度を取得
  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="max-w-4xl mx-auto">
      {/* 説明部分 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-blue-800 mb-2">
          🎯 テストの点数を入力しよう！
        </h2>
        <div className="text-blue-700 text-sm leading-relaxed">
          <p>分かっている科目から順番に入力できます。</p>
          <p>空欄のままでも保存できるので、後から追加で編集もOK！</p>
          <div className="mt-2 pt-2 border-t border-blue-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-medium">［入力済み］</span>
                <span>すべての項目が入力済み</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-medium">［集計中］</span>
                <span>一部未入力 or 順位が未入力</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フォーム本体 */}
      <form onSubmit={onSubmit} className="space-y-8">
        {/* テスト選択 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-base font-medium text-gray-700 mb-2">
            ① 入力したいテストを選ぼう
          </label>
          <select
            value={currentScore.test_name ?? ''}
            onChange={(e) => onInputChange('test_name', e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 hover:bg-white focus:bg-white
              focus:ring-2 focus:ring-[#4AC0B9] focus:border-transparent
              transition-colors duration-200 text-gray-700"
            disabled={isSaving}
          >
            <option value="">テストを選択してください</option>
            
            {/* 年度ごとにグループ化して表示 */}
            {sortedYears.map(year => (
              <optgroup key={year} label={`${year}年度のテスト`}>
                {testGroups[year].map(def => {
                  const status = getTestStatus(def.id);
                  const statusStyle = getStatusStyle(status);
                  const isProvisional = def.provisional;
                  const isScoreExist = existingScores.some(score => score.test_definition_id === def.id);
                  
                  return (
                    <option
                      key={def.id}
                      value={def.test_name}
                      className={statusStyle}
                      disabled={isProvisional || (isScoreExist && status === '［入力済み］')}
                    >
                      {`${def.test_name}（${formatDate(def.scheduled_date)}）${status}`}
                      {isProvisional ? '（予定）' : ''}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 科目スコア入力 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-base font-medium text-gray-700 mb-4">
            ② 分かっている科目の点数を入力しよう
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <ScoreInput
              label="国語"
              value={currentScore.japanese_score ?? ''}
              onChange={(val) => onInputChange('japanese_score', val)}
              disabled={isSaving || !currentScore.test_name}
            />
            <ScoreInput
              label="数学"
              value={currentScore.math_score ?? ''}
              onChange={(val) => onInputChange('math_score', val)}
              disabled={isSaving || !currentScore.test_name}
            />
            <ScoreInput
              label="英語"
              value={currentScore.english_score ?? ''}
              onChange={(val) => onInputChange('english_score', val)}
              disabled={isSaving || !currentScore.test_name}
            />
            <ScoreInput
              label="理科"
              value={currentScore.science_score ?? ''}
              onChange={(val) => onInputChange('science_score', val)}
              disabled={isSaving || !currentScore.test_name}
            />
            <ScoreInput
              label="社会"
              value={currentScore.social_score ?? ''}
              onChange={(val) => onInputChange('social_score', val)}
              disabled={isSaving || !currentScore.test_name}
            />
          </div>
        </div>

        {/* 順位・合計点 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 順位入力 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                ③ 学年順位を入力しよう
              </label>
              <div className="max-w-[200px]">
                <ScoreInput
                  label="順位"
                  value={currentScore.class_rank ?? ''}
                  onChange={(val) => onInputChange('class_rank', val)}
                  max={999}
                  disabled={isSaving || !currentScore.test_name}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ※ 分からない場合は空欄でOKです
              </p>
            </div>
            {/* 合計点表示（読取専用） */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                合計点（自動計算されます）
              </label>
              <input
                type="number"
                value={currentScore.total_score ?? ''}
                readOnly
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <button
            type="submit"
            disabled={isSaving || !currentScore.test_name}
            className={`px-8 py-3 bg-[#4AC0B9] text-white rounded-lg 
              transition-colors duration-200 flex items-center gap-2 shadow-sm font-medium
              ${(isSaving || !currentScore.test_name) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3DA8A2]'}`}
          >
            {isSaving ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                <span>保存する</span>
              </>
            )}
          </button>
          <p className="text-sm text-gray-500">
            ※ 入力した内容を保存するには、上のボタンを押してください
          </p>
        </div>
      </form>
    </div>
  );
};

export default ScoreForm;