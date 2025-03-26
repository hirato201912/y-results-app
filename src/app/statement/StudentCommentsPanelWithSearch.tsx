import React, { useState, useEffect } from 'react';
import { FaUser, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CommentSearchFilter from './CommentSearchFilter';

interface Comment {
  id: number;
  message: string;
  post_date: string;
  formatted_date: string;
  username: string;
  fixed: number;
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

interface StudentCommentsPanelProps {
  studentId?: number;
  studentName?: string;
  apiUrl?: string;
}

const StudentCommentsPanel: React.FC<StudentCommentsPanelProps> = ({ 
  studentId, 
  studentName, 
  apiUrl = 'https://mikawayatsuhashi.sakura.ne.jp/y_get_student_comments.php' 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    per_page: 5,
    current_page: 1,
    total_pages: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // コメントをフェッチする関数
  const fetchComments = async (page = 1, search = searchKeyword): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // パラメータの構築
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId.toString());
      if (studentName) params.append('student_name', studentName);
      params.append('page', page.toString());
      params.append('limit', pagination.per_page.toString());
      params.append('only_fixed', 'false');
      
      // 検索キーワードがある場合は追加
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`${apiUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'データの取得に失敗しました');
      }
      
      setComments(data.data.comments);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('コメント取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 検索処理
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchComments(1, keyword); // ページを1に戻して検索
  };

  // 初回レンダリング時にコメントを取得
  useEffect(() => {
    if (studentId || studentName) {
      fetchComments(1, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, studentName]);

  // ページ変更ハンドラ
  const handlePageChange = (newPage: number): void => {
    if (newPage < 1 || newPage > pagination.total_pages) return;
    fetchComments(newPage);
  };

  // 日本語曜日表示
  const formatDateWithDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = days[date.getDay()];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${dayOfWeek}) ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 検索キーワードでテキストをハイライト
  const highlightText = (text: string): string => {
    if (!searchKeyword) return text;
    
    // HTMLをエスケープする関数
    const escapeHtml = (html: string) => {
      return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    
    const escapedText = escapeHtml(text);
    const regex = new RegExp(`(${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  if (!studentId && !studentName) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              生徒IDまたは生徒名が指定されていません
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            コメント履歴
          </h3>
          <div className="text-sm text-gray-500">
            {searchKeyword && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                検索中: {searchKeyword}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 検索フィルター */}
      <div className="px-4 pt-4">
        <CommentSearchFilter 
          onSearch={handleSearch} 
          placeholder="コメント内容や講師名で検索..." 
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {searchKeyword ? (
            <p>「{searchKeyword}」に一致するコメントはありません</p>
          ) : (
            <p>コメントはありません</p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {comments.map((comment) => (
            <div key={comment.id} className={`p-4 ${comment.fixed === 1 ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center mb-2">
                {comment.fixed === 1 && (
                  <span className="inline-flex items-center mr-2 text-blue-600">
                    <span className="mr-1">📌</span>
                    <span className="text-xs">固定</span>
                  </span>
                )}
                <span className="inline-flex items-center mr-3 text-gray-600">
                  <FaUser className="mr-1" size={12} />
                  <span className="text-sm font-medium bg-blue-100 px-2 py-0.5 rounded">
                    {searchKeyword ? (
                      <span dangerouslySetInnerHTML={{ __html: highlightText(comment.username) }} />
                    ) : (
                      comment.username
                    )}
                  </span>
                </span>
                <span className="inline-flex items-center text-xs text-gray-500">
                  <FaClock className="mr-1" size={12} />
                  {formatDateWithDay(comment.post_date)}
                </span>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 whitespace-pre-wrap text-sm">
                {searchKeyword ? (
                  <div dangerouslySetInnerHTML={{ __html: highlightText(comment.message) }} />
                ) : (
                  comment.message
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ページネーション - 検索中でも表示（サーバーサイド検索のため） */}
      {!loading && comments.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                pagination.current_page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              前へ
            </button>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                pagination.current_page === pagination.total_pages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              次へ
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                全<span className="font-medium"> {pagination.total} </span>
                件中
                <span className="font-medium"> {(pagination.current_page - 1) * pagination.per_page + 1} </span>
                -
                <span className="font-medium">
                  {' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)}{' '}
                </span>
                件を表示
                {searchKeyword && <span className="ml-1">（「{searchKeyword}」で検索）</span>}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    pagination.current_page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">前へ</span>
                  <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                
                {/* ページ番号のボタン */}
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  // 現在のページを中心に最大5ページ表示する
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    // 5ページ以下の場合はそのまま表示
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    // 現在のページが3以下の場合は1~5を表示
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.total_pages - 2) {
                    // 現在のページが最後から3ページ以内の場合
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    // それ以外の場合は現在のページを中心に表示
                    pageNum = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.current_page === pageNum
                          ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    pagination.current_page === pagination.total_pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">次へ</span>
                  <FaChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCommentsPanel;