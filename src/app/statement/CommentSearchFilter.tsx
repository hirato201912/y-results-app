import React, { useState } from 'react';
import { FaSearch, FaTimes, FaLevelDownAlt } from 'react-icons/fa';

interface CommentSearchFilterProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
}

/**
 * コメント履歴のキーワード検索フィルターコンポーネント
 */
const CommentSearchFilter: React.FC<CommentSearchFilterProps> = ({
  onSearch,
  placeholder = 'キーワードで検索...'
}) => {
  const [keyword, setKeyword] = useState<string>('');
  
  // 検索キーワード変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);
    
    // 空文字の場合はフィルタリングをクリア
    if (newKeyword === '') {
      onSearch('');
    }
  };
  
  // 検索実行処理
  const handleSearch = () => {
    onSearch(keyword);
  };
  
  // Enterキーで検索実行
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 検索クリア処理
  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };
  
  return (
    <div className="mb-4">
      {/* 検索フィールドとヒントのコンテナ */}
      <div className="relative">
        <div className="flex items-center relative">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder}
              aria-label="検索キーワードを入力"
            />
            {keyword && (
              <button
                onClick={handleClear}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="検索をクリア"
              >
                <FaTimes />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="検索"
            >
              <FaSearch />
            </button>
          </div>
          
          {/* 検索ボタン */}
          <button 
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 hidden sm:inline-flex items-center"
          >
            <FaSearch className="mr-1" size={12} />
            <span>検索</span>
          </button>
        </div>
        
        {/* エンターキーのヒント */}
        <div className="absolute right-24 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center text-gray-400 text-xs">
          <span className="mr-1">Enterキーで検索</span>
          <FaLevelDownAlt className="transform rotate-90" size={10} />
        </div>
      </div>
      
      {/* モバイル用の検索ボタン */}
      <div className="mt-2 sm:hidden">
        <button 
          onClick={handleSearch}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
        >
          <FaSearch className="mr-1" size={12} />
          <span>検索</span>
        </button>
      </div>
    </div>
  );
};

export default CommentSearchFilter;