"use client"
import React, { useEffect, useState } from 'react';


const Checklist = ({ studentName }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [progress, setProgress] = useState({
    english: '未',
    math: '未',
    science: '未',
    social: '未',
    japanese: '未'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const apiKey = '0401_predefined_api_key';
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_fetch_tests.php?apiKey=${apiKey}&studentName=${studentName}`)
      .then(response => response.json())
      .then(data => {
        setTests(data.tests);
      })
      .catch(error => console.error('Error fetching tests:', error));
  }, [studentName]);

  useEffect(() => {
    if (selectedTest && selectedWeek) {
      const apiKey = '0401_predefined_api_key';
      fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_fetch_progress.php?apiKey=${apiKey}&studentName=${studentName}&testId=${selectedTest}&week=${selectedWeek}`)
        .then(response => response.json())
        .then(data => {
          if (data.progress) {
            setProgress(data.progress);
          }
        })
        .catch(error => console.error('Error fetching progress:', error));
    }
  }, [selectedTest, selectedWeek, studentName]);

  const toggleProgress = (subject) => {
    setProgress((prevProgress) => ({
      ...prevProgress,
      [subject]: prevProgress[subject] === '未' ? '済' : '未'
    }));
  };

  const handleSave = () => {
    const apiKey = '0401_predefined_api_key';
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_save_progress.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({
        studentName,
        testId: selectedTest,
        week: selectedWeek,
        progress
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('進捗情報が保存されました');
        } else {
          alert('進捗情報の保存に失敗しました');
        }
      })
      .catch(error => console.error('Error saving progress:', error));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">進捗管理</h2>
      <div className="mb-4">
        <label className="block mb-2">テスト名を選択してください</label>
        <select
          className="p-2 border rounded"
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
        >
          <option value="">選択してください</option>
          {tests.map(test => (
            <option key={test.test_id} value={test.test_id}>{test.test_name}</option>
          ))}
        </select>
      </div>
      {selectedTest && (
        <div className="mb-4">
          <label className="block mb-2">週を選択してください</label>
          <select
            className="p-2 border rounded"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="3週間前">3週間前</option>
            <option value="2週間前">2週間前</option>
            <option value="1週間前">1週間前</option>
          </select>
        </div>
      )}
      {selectedWeek && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          {['english', 'math', 'science', 'social', 'japanese'].map(subject => (
            <div key={subject} className="text-center">
              <div className="mb-2">{subject === 'english' ? '英語' : subject === 'math' ? '数学' : subject === 'science' ? '理科' : subject === 'social' ? '社会' : '国語'}</div>
              <button
                onClick={() => toggleProgress(subject)}
                className={`p-4 rounded shadow ${
                  progress[subject] === '済' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
              >
                {progress[subject]}
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedWeek && (
        <div className="mt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          >
            保存
          </button>
        </div>
      )}

        
          <div className="min-h-screen px-4 text-center">
           
            
          

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
               
                  進捗情報の保存
             
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    進捗情報を保存しますか？
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={() => {
                      handleSave();
                      setIsModalOpen(false);
                    }}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 ml-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                    onClick={() => setIsModalOpen(false)}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
         
          </div>
     
   
    </div>
  );
};

export default Checklist;


















