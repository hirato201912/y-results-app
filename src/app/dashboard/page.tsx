"use client"
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Checklist from './../components/Checklist';
import ProgressTable from './../components/ProgressTable';

interface User {
  name: string;
  // 他のプロパティがあればここに追加
}

const DashboardContent = ({ studentName, user }) => {
  const handleRedirect = () => {
    const phpUrl = `http://mikawayatsuhashi.sakura.ne.jp/west.shows.php?name=${encodeURIComponent(studentName)}&session=${encodeURIComponent(JSON.stringify(user))}`;
    window.location.href = phpUrl;
  };

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>Student: {studentName}</h2>
      <button onClick={handleRedirect}>PHPページへ戻る</button>
      {/* 他のコンテンツ */}
    </div>
  );
};

const DashboardPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [studentName, setStudentName] = useState('');

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
        } catch (error) {
          console.error('Failed to parse stored user session:', error);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [router, searchParams]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto p-4">
        <DashboardContent studentName={studentName} user={user} />
        <Checklist studentName={studentName} />
        <ProgressTable studentName={studentName} />
      </div>
    </Suspense>
  );
};

export default DashboardPage;





















