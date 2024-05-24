"use client"
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Checklist from './../components/Checklist';

interface User {
  name: string;
  // 他のプロパティがあればここに追加
}

const DashboardContent = ({ studentName, user, studentData }) => {
  const handleRedirect = () => {
    const phpUrl = `http://mikawayatsuhashi.sakura.ne.jp/west.shows.php?name=${encodeURIComponent(studentName)}&session=${encodeURIComponent(JSON.stringify(user))}`;
    window.location.href = phpUrl;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
      <h2 className="text-xl mb-4">Student: {studentName}</h2>
      {studentData && (
        <div className="mb-4">
          <p><strong>生徒名:</strong> {studentData.student}</p>
          <p><strong>所属中学:</strong> {studentData.belonging}</p>
          <p><strong>学年:</strong> {studentData.grade}</p>
        </div>
      )}
      <button onClick={handleRedirect} className="bg-blue-500 text-white px-4 py-2 rounded">PHPページへ戻る</button>
      {/* 他のコンテンツ */}
    </div>
  );
};

const DashboardPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const userParam = searchParams.get('user');

    if (name && userParam) {
      try {
        const userSession = JSON.parse(decodeURIComponent(userParam));
        sessionStorage.setItem('studentName', name);
        sessionStorage.setItem('userSession', JSON.stringify(userSession));
        setStudentName(name);
        setUser(userSession);

        // 学生データを取得
        fetchStudentData(name);
      } catch (error) {
        console.error('Failed to parse user session:', error);
        router.push('/login');
      }
    } else {
      const storedStudentName = sessionStorage.getItem('studentName');
      const storedUser = sessionStorage.getItem('userSession');

      if (storedStudentName && storedUser) {
        setStudentName(storedStudentName);
        try {
          const userSession = JSON.parse(storedUser);
          setUser(userSession);
          fetchStudentData(storedStudentName);
        } catch (error) {
          console.error('Failed to parse stored user session:', error);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [router, searchParams]);

  const fetchStudentData = async (studentName) => {
    const apiKey = '0401_predefined_api_key';
    const response = await fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_get_students.php?apiKey=${apiKey}`);
    const data = await response.json();
    const student = data.students.find(student => student.student === studentName);
    setStudentData(student);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto p-4">
        <DashboardContent studentName={studentName} user={user} studentData={studentData} />
        <Checklist studentName={studentName} />
      </div>
    </Suspense>
  );
};

export default DashboardPage;




















