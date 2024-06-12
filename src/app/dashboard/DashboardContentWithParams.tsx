"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RechartsBarChart from './../components/RechartsBarChart';  // チャートコンポーネントをインポート
import RadarChartComponent from './../components/RadarChartComponent';  // レーダーチャートコンポーネントをインポート

interface User {
  name: string;
  // 他のプロパティがあればここに追加
}

interface Score {
  id: number;
  test_name: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
  score6: number;
  score7: number;
}

const DashboardContentWithParams: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['合計点']);

  useEffect(() => {
    const name = searchParams.get('name');
    const userParam = searchParams.get('user');

    if (name && userParam) {
      try {
        const userSession = JSON.parse(decodeURIComponent(userParam));
        setStudentName(name);
        setUser(userSession);
        fetchScores(name);
      } catch (error) {
        console.error('Failed to parse user session:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router, searchParams]);

  const fetchScores = async (name: string) => {
    try {
      const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/fetch_student_scores.php?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setScores(data);
    } catch (error) {
      setError('データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (loading) {
    return <div className="text-center py-10">Loading scores...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">生徒の分析ページ</h1>
      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">{studentName} の成績</h2>
        <RadarChartComponent data={scores} />  {/* レーダーチャートの追加 */}
      </div>
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-center mb-4">
          {['合計点', '国語', '社会', '数学', '理科', '英語'].map(subject => (
            <label key={subject} className="mr-4">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
              />
              {subject}
            </label>
          ))}
        </div>
        <RechartsBarChart data={scores} selectedSubjects={selectedSubjects} />
      </div>
      {scores.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4 mt-8">
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">テスト名</th>
                <th className="py-2 px-4 border-b">国語</th>
                <th className="py-2 px-4 border-b">社会</th>
                <th className="py-2 px-4 border-b">数学</th>
                <th className="py-2 px-4 border-b">理科</th>
                <th className="py-2 px-4 border-b">英語</th>
                <th className="py-2 px-4 border-b">合計</th>
                <th className="py-2 px-4 border-b">順位</th>
              </tr>
            </thead>
            <tbody>
              {scores.map(score => (
                <tr key={score.id}>
                  <td className="py-2 px-4 border-b">{score.test_name}</td>
                  <td className="py-2 px-4 border-b">{score.score1}点</td>
                  <td className="py-2 px-4 border-b">{score.score2}点</td>
                  <td className="py-2 px-4 border-b">{score.score3}点</td>
                  <td className="py-2 px-4 border-b">{score.score4}点</td>
                  <td className="py-2 px-4 border-b">{score.score5}点</td>
                  <td className="py-2 px-4 border-b">{score.score7}点</td>
                  <td className="py-2 px-4 border-b">{score.score6}位</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>成績データがありません。</div>
      )}
    </div>
  );
};

export default DashboardContentWithParams;
