import React from 'react';

const ProgressTable = ({ progress }) => {
  return (
    <div className="mt-8">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">週</th>
            <th className="py-2 px-4 border-b">国語</th>
            <th className="py-2 px-4 border-b">英語</th>
            <th className="py-2 px-4 border-b">数学</th>
            <th className="py-2 px-4 border-b">理科</th>
            <th className="py-2 px-4 border-b">社会</th>
          </tr>
        </thead>
        <tbody>
          {['week3', 'week2', 'week1'].map((week) => (
            <tr key={week}>
              <td className="py-2 px-4 border-b">{week === 'week3' ? '3週間前' : week === 'week2' ? '2週間前' : '1週間前'}</td>
              <td className="py-2 px-4 border-b">{progress[week].japanese}</td>
              <td className="py-2 px-4 border-b">{progress[week].english}</td>
              <td className="py-2 px-4 border-b">{progress[week].math}</td>
              <td className="py-2 px-4 border-b">{progress[week].science}</td>
              <td className="py-2 px-4 border-b">{progress[week].social}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressTable;
