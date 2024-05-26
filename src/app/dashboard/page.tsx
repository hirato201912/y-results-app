"use client"
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Checklist from './../components/Checklist';
import ProgressTable from './../components/ProgressTable';
import DashboardContent from './../components/DashboardContent';
import CardComponent from './../components/CardComponent';

interface User {
  name: string;
  // 他のプロパティがあればここに追加
}

const DashboardContentWithParams: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [testName, setTestName] = useState<string>('');
  const [week, setWeek] = useState<string>('');

  useEffect(() => {
    const name = searchParams.get('name');
    const userParam = searchParams.get('user');
    const test = searchParams.get('test_name');
    const wk = searchParams.get('week');

    if (name && userParam && test && wk) {
      try {
        const userSession = JSON.parse(decodeURIComponent(userParam));
        sessionStorage.setItem('studentName', name);
        sessionStorage.setItem('userSession', JSON.stringify(userSession));
        sessionStorage.setItem('testName', test);
        sessionStorage.setItem('week', wk);
        setStudentName(name);
        setUser(userSession);
        setTestName(test);
        setWeek(wk);
      } catch (error) {
        console.error('Failed to parse user session:', error);
        router.push('/login');
      }
    } else {
      const storedStudentName = sessionStorage.getItem('studentName');
      const storedUser = sessionStorage.getItem('userSession');
      const storedTestName = sessionStorage.getItem('testName');
      const storedWeek = sessionStorage.getItem('week');

      if (storedStudentName && storedUser && storedTestName && storedWeek) {
        setStudentName(storedStudentName);
        setTestName(storedTestName);
        setWeek(storedWeek);
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
    const phpUrl = `https://mikawayatsuhashi.sakura.ne.jp/west.shows.php?name=${encodeURIComponent(studentName)}&session=${encodeURIComponent(JSON.stringify(user))}`;
    window.location.href = phpUrl;
  };

  return (
    <div className="container mx-auto p-4">
      <CardComponent>
        <DashboardContent studentName={studentName} handleRedirect={handleRedirect} />
      </CardComponent>
      <CardComponent>
        <Checklist studentName={studentName} testName={testName} week={week} />
      </CardComponent>
      <CardComponent>
        <ProgressTable studentName={studentName} />
      </CardComponent>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContentWithParams />
    </Suspense>
  );
};

export default DashboardPage;


























