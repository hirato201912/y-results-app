import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaChartBar, FaChartLine, FaHistory, FaChartArea, FaArrowLeft } from 'react-icons/fa';
import RechartsBarChart from './../components/RechartsBarChart';
import RadarChartComponent from './../components/RadarChartComponent';
import LineChartComponent from './../components/LineChartComponent';
import classNames from 'classnames';

interface User {
  name: string;
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
    const apiKey = searchParams.get('api_key');

    if (name && userParam && apiKey) {
      verifyApiKey(apiKey).then(isValid => {
        if (isValid) {
          try {
            const userSession = JSON.parse(decodeURIComponent(userParam)) as User;
            setStudentName(name);
            setUser(userSession);
            fetchScores(name);
          } catch (error) {
            console.error('Failed to parse user session:', error);
            router.push('/login');
          }
        } else {
          alert('APIキーが無効です。');
          router.push('/login');
        }
      });
    } else {
      alert('パラメータが不正です。');
      router.push('/login');
    }
  }, [router, searchParams]);

  const verifyApiKey = async (apiKey: string) => {
    const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/verify_api_key.php?api_key=${apiKey}`);
    const data = await response.json();
    // alert(`Provided API Key: ${data.provided_api_key}\nExpected API Key: ${data.expected_api_key}`);
    return data.valid;
  };

  const fetchScores = async (name: string) => {
    try {
      const response = await fetch(`https://mikawayatsuhashi.sakura.ne.jp/fetch_student_scores.php?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Score[] = await response.json();
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

  const handleRedirect = () => {
    router.back();
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

  const getScoreChangeClass = (currentScore: number, previousScore: number | undefined, isRank: boolean = false) => {
    if (previousScore === undefined) return '';
    if (isRank) {
      if (currentScore < previousScore) {
        return 'text-green-500 font-bold'; // 順位が上がっている（値が低くなっている）場合、緑色と太字で表示
      } else if (currentScore > previousScore) {
        return 'text-red-500 font-bold'; // 順位が下がっている（値が高くなっている）場合、赤色と太字で表示
      }
    } else {
      if (currentScore > previousScore) {
        return 'text-green-500 font-bold'; // 成績が上がっている場合、緑色と太字で表示
      } else if (currentScore < previousScore) {
        return 'text-red-500 font-bold'; // 成績が下がっている場合、赤色と太字で表示
      }
    }
    return ''; // 変化がない場合、通常の表示
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button onClick={handleRedirect} className="flex items-center p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700">
          <FaArrowLeft className="mr-2" /> 戻る
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        <span className="text-3xl" style={{ color: '#4AC0B9' }}>{studentName}</span> の成績分析
      </h1>

      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><FaHistory className="mr-2" />前回との比較</h2>
        <RadarChartComponent data={scores} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><FaChartBar className="mr-2" />点数グラフ</h2>
        <div className="mb-4 text-center text-sm text-gray-600">
          初期表示は「合計」が表示されていますが、科目をチェックするとその科目のデータが表示されます。合計のチェックを外すと、科目のみが表示されます。
        </div>
        <div className="flex justify-center mb-4">
          {['合計点', '国語', '社会', '数学', '理科', '英語'].map(subject => (
            <label key={subject} className="mr-4">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
                className="mr-1"
              />
              {subject}
            </label>
          ))}
        </div>
        <RechartsBarChart data={scores} selectedSubjects={selectedSubjects} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><FaChartLine className="mr-2" />順位グラフ</h2>
        <LineChartComponent data={scores} />
      </div>

      {scores.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4 mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><FaChartArea className="mr-2" />成績の推移</h2>
          <p className="mb-4">
            <span className="text-green-500 font-bold">緑色</span>: 成績が上がっています。<br />
            <span className="text-red-500 font-bold">赤色</span>: 成績が下がっています。
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">テスト名</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">国語</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">社会</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">数学</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">理科</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">英語</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">合計</th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left">順位</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => {
                  const previousScore = index > 0 ? scores[index - 1] : undefined;
                  return (
                    <tr key={score.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b border-gray-300">{score.test_name}</td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score1, previousScore?.score1))}>
                        {score.score1}
                      </td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score2, previousScore?.score2))}>
                        {score.score2}
                      </td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score3, previousScore?.score3))}>
                        {score.score3}
                      </td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score4, previousScore?.score4))}>
                        {score.score4}
                      </td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score5, previousScore?.score5))}>
                        {score.score5}
                      </td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score7, previousScore?.score7))}>
                        {score.score7}
                      </td>
                      <td className={classNames('py-2 px-4 border-b border-gray-300', getScoreChangeClass(score.score6, previousScore?.score6, true))}>
                        {score.score6}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>成績データがありません。</div>
      )}
    </div>
  );
};

export default DashboardContentWithParams;
