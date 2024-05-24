import React, { useEffect, useState } from 'react';

const ProgressUpdateForm = ({ studentName, grade }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [progress, setProgress] = useState({
    english: '×',
    math: '×',
    science: '×',
    social: '×',
    japanese: '×',
  });

  useEffect(() => {
    const apiKey = '0401_predefined_api_key';
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/fetch_tests_by_grade.php?apiKey=${apiKey}&grade=${grade}`)
      .then(response => response.json())
      .then(data => {
        setTests(data.tests);
      })
      .catch(error => console.error('Error fetching tests:', error));
  }, [grade]);

  const handleToggle = (subject) => {
    setProgress(prev => ({
      ...prev,
      [subject]: prev[subject] === '〇' ? '×' : '〇'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 進捗データをサーバーに送信する処理をここに追加
  };

  return (
    <div className="container mx-auto p-4">
      <h1>進捗入力フォーム</h1>
      <p><strong>生徒名:</strong> {studentName}</p>
      <p><strong>所属中学:</strong> 中学名</p>
      <p><strong>学年:</strong> {grade}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testName">
            テスト名
          </label>
          <select
            id="testName"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {tests.map((test, index) => (
              <option key={index} value={test.test_name}>{test.test_name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="week">
            状態
          </label>
          <select
            id="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="3weeks">３週間前</option>
            <option value="2weeks">２週間前</option>
            <option value="1week">１週間前</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            進捗状況
          </label>
          <div className="flex justify-between">
            {['english', 'math', 'science', 'social', 'japanese'].map(subject => (
              <button
                key={subject}
                type="button"
                onClick={() => handleToggle(subject)}
                className={`py-2 px-4 rounded ${progress[subject] === '〇' ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {subject} ({progress[subject]})
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          進捗を保存
        </button>
      </form>
    </div>
  );
};

export default ProgressUpdateForm;

