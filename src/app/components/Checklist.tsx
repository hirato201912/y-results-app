"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const Checklist = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    const testName = searchParams.get('test_name');
    const week = searchParams.get('week');
    const studentName = searchParams.get('name');
    const userSession = searchParams.get('user');

    console.log('Test Name:', testName);
    console.log('Week:', week);
    console.log('Student Name:', studentName);
    console.log('User Session:', userSession);

    if (testName && week && studentName && userSession) {
      // Fetch progress data for the given test and week
      fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_fetch_progress.php?apiKey=${apiKey}&studentName=${encodeURIComponent(studentName)}&testName=${encodeURIComponent(testName)}&week=${encodeURIComponent(week)}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetched Progress Data:', data);
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
        .catch(error => console.error('Error fetching progress:', error));
    } else {
      console.error('Test Name, Week, Student Name, and User Session are required to fetch progress');
    }
  }, [searchParams]);

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
    const testName = searchParams.get('test_name');
    const week = searchParams.get('week');
    const studentName = searchParams.get('name');
    const userSession = searchParams.get('user');

    console.log('Saving data:', {
      studentName,
      testName,
      week,
      progress
    });

    // Save progress to the server
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_save_progress.php?apiKey=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentName,
        testName,
        week,
        progress
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Saved Progress Data:', data);
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
      <div className="mb-4 p-4 bg-gray-100 rounded shadow">
        <h3 className="text-xl font-semibold">{searchParams.get('test_name') || 'テスト名がありません'}</h3>
        <p className="text-lg">{searchParams.get('week') || '週の情報がありません'}</p>
      </div>
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
      <button
        onClick={handleSave}
        className="mt-4 p-2 bg-blue-500 text-white rounded shadow"
      >
        進捗を保存
      </button>

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






























