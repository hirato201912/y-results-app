"use client"
import React, { useEffect, useState } from 'react';

const Checklist = ({ studentName }) => {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const apiKey = '0401_predefined_api_key';
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_fetch_progress.php?apiKey=${apiKey}&studentName=${studentName}`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // デバッグ用ログ
        if (data.progress) {
          setProgressData(data.progress);
        } else {
          console.error('No progress data found:', data);
        }
      })
      .catch(error => console.error('Error fetching progress data:', error));
  }, [studentName]);

  return (
    <div className="container mx-auto p-4">
      <h2>進捗管理</h2>
      {progressData.length === 0 ? (
        <p>該当する進捗データが見つかりません。</p>
      ) : (
        progressData.map((progress, index) => (
          <div key={index} className="mb-2">
            <p><strong>週:</strong> {progress.week}</p>
            <p><strong>英語:</strong> {progress.english}</p>
            <p><strong>数学:</strong> {progress.math}</p>
            <p><strong>理科:</strong> {progress.science}</p>
            <p><strong>社会:</strong> {progress.social}</p>
            <p><strong>国語:</strong> {progress.japanese}</p>
            <p><strong>テスト名:</strong> {progress.test_name}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Checklist;












