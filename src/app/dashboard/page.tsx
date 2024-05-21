"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  // 他のプロパティがあればここに追加
}

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const storedStudentName = sessionStorage.getItem('studentName');
    const storedUser = sessionStorage.getItem('userSession');

    console.log('Stored student name:', storedStudentName);
    console.log('Stored user session:', storedUser);

    if (storedStudentName) {
      setStudentName(storedStudentName);
    } else {
      console.log('No student name found, redirecting to login');
      router.push('/login');
    }

    if (storedUser) {
      try {
        const userSession = JSON.parse(storedUser);
        setUser(userSession);
      } catch (error) {
        console.error('Failed to parse user session:', error);
        router.push('/login');
      }
    } else {
      console.log('No user session found, redirecting to login');
      router.push('/login');
    }
  }, [router]);

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












