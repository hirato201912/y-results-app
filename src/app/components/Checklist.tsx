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
            setProgress({
              english: data.progress.english || '未',
              math: data.progress.math || '未',
              science: data.progress.science || '未',
              social: data.progress.social || '未',
              japanese: data.progress.japanese || '未'
            });
          } else {
            setProgress({
              english: '未',
              math: '未',
              science: '未',
              social: '未',
              japanese: '未'
            });
          }
        })
        .catch(error => {
          console.error('Error fetching progress:', error);
          setProgress({
            english: '未',
            math: '未',
            science: '未',
            social: '未',
            japanese: '未'
          });
        });
    } else {
      setProgress({
        english: '未',
        math: '未',
        science: '未',
        social: '未',
        japanese: '未'
      });
    }
  }, [selectedTest, selectedWeek, studentName]);

  const toggleProgress = (subject) => {
    setProgress((prevProgress) => ({
      ...prevProgress,
      [subject]: prevProgress[subject] === '未' ? '済' : '未'
    }));
  };

  const handleSave = () => {
    setIsModalOpen(true);
  };

  const confirmSave = () => {
    const apiKey = '0401_predefined_api_key';
    const payload = {
      studentName,
      testId: selectedTest,
      week: selectedWeek,
      progress
    };

    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_save_progress.php?apiKey=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Progress saved:', data);
        setIsModalOpen(false);
      })
      .catch(error => {
        console.error('Error saving progress:', error);
        setIsModalOpen(false);
      });
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
              <div className="mb-2 font-bold">
                {subject === 'english' && '英語'}
                {subject === 'math' && '数学'}
                {subject === 'science' && '理科'}
                {subject === 'social' && '社会'}
                {subject === 'japanese' && '国語'}
              </div>
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
        <button
          onClick={handleSave}
          className="mt-4 p-2 bg-blue-500 text-white rounded shadow"
        >
          進捗を保存
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h3 className="text-xl mb-4">保存しますか？</h3>
            <button
              onClick={confirmSave}
              className="mr-4 p-2 bg-green-500 text-white rounded shadow"
            >
              はい
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 bg-red-500 text-white rounded shadow"
            >
              いいえ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklist;



























