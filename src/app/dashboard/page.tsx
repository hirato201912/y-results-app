"use client"
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  name: string;
  // 他のプロパティがあればここに追加
}

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

export default DashboardPage;















