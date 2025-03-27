import React from 'react';

const YellowCardDisplay = ({ bombCount = 0 }) => {
  const maxCards = 3;
  
  return (
    <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center mb-3">
        <svg 
          className="w-5 h-5 text-yellow-500 mr-2" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="font-medium text-gray-700">宿題忘れメーター状況</h3>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {[...Array(maxCards)].map((_, index) => (
          <div
            key={index}
            className={`relative w-16 h-24 rounded-lg flex items-center justify-center 
              transition-transform duration-200 hover:scale-105
              ${index < bombCount 
                ? 'bg-yellow-400 shadow-md' 
                : 'bg-gray-100 border border-gray-200'
              }`}
          >
            <div className={`text-center ${index < bombCount ? 'text-yellow-800' : 'text-gray-400'}`}>
              <span className="block text-2xl font-bold mb-1">!</span>
              <span className="text-xs">
                {index < bombCount ? '警告' : '未発行'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {bombCount >= maxCards && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            ⚠️ 警告: 宿題忘れメーターが{maxCards}枚に達しました。
            保護者様へ通知メールが送信されます。
          </p>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        現在の累積: {bombCount} / {maxCards} 枚
      </div>
    </div>
  );
};

export default YellowCardDisplay;