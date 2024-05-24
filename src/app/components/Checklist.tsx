"use client"
import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const Checklist = ({ studentName }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
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
    fetch(`http://mikawayatsuhashi.sakura.ne.jp/west_fetch_tests.php?apiKey=${apiKey}&studentName=${studentName}`)
      .then(response => response.json())
      .then(data => {
        setTests(data.tests);
      })
      .catch(error => console.error('Error fetching tests:', error));
  }, [studentName]);

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
    // 進捗データを保存するための処理を追加
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">進捗管理</h2>
      <div className="mb-4">
        <label className="block mb-2">テスト名を選択してください</label>
        <select
          className="p-2 border rounded"
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
        >
          <option value="">選択してください</option>
          {tests.map(test => (
            <option key={test.test_id} value={test.test_id}>{test.test_name}</option>
          ))}
        </select>
      </div>
      {selectedTest && (
        <div className="mb-4">
          <label className="block mb-2">週を選択してください</label>
          <select
            className="p-2 border rounded"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="3週間前">3週間前</option>
            <option value="2週間前">2週間前</option>
            <option value="1週間前">1週間前</option>
          </select>
        </div>
      )}
      {selectedWeek && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          {['english', 'math', 'science', 'social', 'japanese'].map(subject => (
            <div key={subject} className="text-center">
              <div className="mb-2 bg-gray-200 p-2 rounded shadow">{subject === 'english' ? '英語' : subject === 'math' ? '数学' : subject === 'science' ? '理科' : subject === 'social' ? '社会' : '国語'}</div>
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
      )}
      <div className="mt-4">
        <button
          onClick={handleSave}
          className="p-2 bg-blue-500 text-white rounded shadow"
        >
          保存
        </button>
      </div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    進捗の保存
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      進捗を保存しますか？
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={confirmSave}
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsModalOpen(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Checklist;


















