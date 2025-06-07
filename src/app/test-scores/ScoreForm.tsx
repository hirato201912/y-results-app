'use client';

import React from 'react';
import { FaSave, FaSpinner, FaEdit } from 'react-icons/fa';

interface TestScore {
  id?: number;                   
  student_id?: number;           
  test_name: string;             
  test_definition_id: number;    

  japanese_score?: number | null;
  math_score?: number | null;
  english_score?: number | null;
  science_score?: number | null;
  social_score?: number | null;

  class_rank?: number | null;
  total_score?: number | null;

  post_date?: string;
}

interface TestDefinition {
  id: number;
  grade_id: number;
  test_name: string;
  scheduled_date: string;
  provisional?: boolean;
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
      onChange('');
      return;
    }
    const num = parseInt(val);
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

  // 改善された入力状況判定
  const getTestStatus = (testId: number): { 
    status: string; 
    isEditable: boolean; 
    description: string;
  } => {
    const existingScore = existingScores.find(score => score.test_definition_id === testId);
    if (!existingScore) {
      return { 
        status: '', 
        isEditable: true,
        description: '未入力'
      };
    }

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

    const hasRank = existingScore.class_rank !== null && existingScore.class_rank !== 0;

    // 全くスコアが入っていなければ空表示
    if (validScores.length === 0 && !hasRank) {
      return { 
        status: '', 
        isEditable: true,
        description: '未入力'
      };
    }

    // 全科目入力済み + 順位入力済み = 完全入力済み
    if (validScores.length === subjects.length && hasRank) {
      return { 
        status: '［完全入力済み］', 
        isEditable: true,
        description: '全項目入力済み（修正可能）'
      };
    }

    // 全科目入力済み + 順位未入力 = 順位待ち
    if (validScores.length === subjects.length && !hasRank) {
      return { 
        status: '［順位待ち］', 
        isEditable: true,
        description: '点数入力済み・順位未入力'
      };
    }

    // 一部科目のみ入力済み
    if (validScores.length > 0) {
      const remaining = subjects.length - validScores.length;
      return { 
        status: '［集計中］', 
        isEditable: true,
        description: `${validScores.length}/${subjects.length}科目入力済み`
      };
    }

    // その他（順位のみ入力済みなど）
    return { 
      status: '［集計中］', 
      isEditable: true,
      description: '一部入力済み'
    };
  };

  // 状態に応じてスタイルを変える
  const getStatusStyle = (status: string): string => {
    switch (status) {
      case '［完全入力済み］':
        return 'text-green-600 font-medium';
      case '［順位待ち］':
        return 'text-blue-600 font-medium';
      case '［集計中］':
        return 'text-orange-500 font-medium';
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
    
    Object.keys(groups).forEach(year => {
      groups[year].sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    });
    
    return groups;
  };
  
  const testGroups = groupTestDefinitions();
  const sortedYears = Object.keys(testGroups).sort((a, b) => parseInt(b) - parseInt(a));
  
  // 現在選択中のテストが編集モードかどうかを判定
  const isEditMode = () => {
    if (!currentScore.test_name) return false;
    const selectedDef = testDefinitions.find(def => def.test_name === currentScore.test_name);
    if (!selectedDef) return false;
    const existingScore = existingScores.find(score => score.test_definition_id === selectedDef.id);
    return !!existingScore;
  };

  // 現在選択中のテストの状態取得
  const getCurrentTestStatus = () => {
    if (!currentScore.test_name) return null;
    const selectedDef = testDefinitions.find(def => def.test_name === currentScore.test_name);
    if (!selectedDef) return null;
    return getTestStatus(selectedDef.id);
  };

  const currentTestStatus = getCurrentTestStatus();

  return (
    <div className="max-w-4xl mx-auto">
      {/* 説明部分 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-blue-800 mb-2">
          🎯 テストの点数を入力・修正しよう！
        </h2>
        <div className="text-blue-700 text-sm leading-relaxed">
          <p>分かっている科目から順番に入力できます。</p>
          <p>空欄のままでも保存できるので、後から追加で編集もOK！</p>
          <p className="text-green-700 font-medium">📝 入力済みのテストも選択して修正できます。</p>
          <div className="mt-2 pt-2 border-t border-blue-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-medium">［完全入力済み］</span>
                <span>全項目完了</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">［順位待ち］</span>
                <span>点数入力済み・順位待ち</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-medium">［集計中］</span>
                <span>一部未入力</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 編集モード表示 */}
      {isEditMode() && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <FaEdit className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-yellow-800 font-medium">編集モード</h3>
              <p className="text-yellow-700 text-sm">
                既存の記録を修正しています。
                {currentTestStatus?.status === '［順位待ち］' && (
                  <span className="font-medium"> 順位の入力をお忘れなく！</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* フォーム本体 */}
      <form onSubmit={onSubmit} className="space-y-8">
        {/* テスト選択 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-base font-medium text-gray-700 mb-2">
            ① 入力・修正したいテストを選ぼう
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
            
            {sortedYears.map(year => (
              <optgroup key={year} label={`${year}年度のテスト`}>
                {testGroups[year].map(def => {
                  const testStatusInfo = getTestStatus(def.id);
                  const isProvisional = def.provisional;
                  
                  return (
                    <option
                      key={def.id}
                      value={def.test_name}
                      className={getStatusStyle(testStatusInfo.status)}
                      disabled={isProvisional}
                      title={testStatusInfo.description}
                    >
                      {`${def.test_name}（${formatDate(def.scheduled_date)}）${testStatusInfo.status}`}
                      {isProvisional ? '（予定）' : ''}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
          
          {/* 選択中テストの状態表示 */}
          {currentTestStatus && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <span className="text-gray-600">選択中: </span>
              <span className={getStatusStyle(currentTestStatus.status)}>
                {currentTestStatus.status}
              </span>
              <span className="text-gray-600 ml-2">
                - {currentTestStatus.description}
              </span>
            </div>
          )}
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
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                ③ 学年順位を入力しよう
                {currentTestStatus?.status === '［順位待ち］' && (
                  <span className="text-blue-600 text-sm ml-2">← 入力待ち！</span>
                )}
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
                <span>{isEditMode() ? '更新中...' : '保存中...'}</span>
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                <span>{isEditMode() ? '更新する' : '保存する'}</span>
              </>
            )}
          </button>
          <p className="text-sm text-gray-500">
            ※ {isEditMode() ? '変更した内容を更新' : '入力した内容を保存'}するには、上のボタンを押してください
          </p>
        </div>
      </form>
    </div>
  );
};

export default ScoreForm;