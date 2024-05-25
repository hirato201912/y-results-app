"use client"
import React, { useEffect, useState } from 'react';

const ProgressTable = ({ studentName }) => {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const apiKey = '0401_predefined_api_key';
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_fetch_all_progress.php?apiKey=${apiKey}&studentName=${studentName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched progress data:', data); // デバッグ用ログ
        setProgressData(data.progress);
      })
      .catch(error => console.error('Error fetching progress data:', error));
  }, [studentName]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">進捗一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">テスト名</th>
              <th className="py-2 px-4 border-b">週</th>
              <th className="py-2 px-4 border-b">英語</th>
              <th className="py-2 px-4 border-b">数学</th>
              <th className="py-2 px-4 border-b">理科</th>
              <th className="py-2 px-4 border-b">社会</th>
              <th className="py-2 px-4 border-b">国語</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((progress, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{progress.test_name}</td>
                <td className="py-2 px-4 border-b">{progress.week}</td>
                <td className="py-2 px-4 border-b">{progress.english}</td>
                <td className="py-2 px-4 border-b">{progress.math}</td>
                <td className="py-2 px-4 border-b">{progress.science}</td>
                <td className="py-2 px-4 border-b">{progress.social}</td>
                <td className="py-2 px-4 border-b">{progress.japanese}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressTable;



