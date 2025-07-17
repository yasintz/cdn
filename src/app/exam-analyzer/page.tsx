'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './App.css';
import { newImpl } from './new';
import { useStore } from './useStore';
import { Button } from '@/components/ui/button';
import { ImportantSubjects } from './components/ImportantSubjects';
import { AddExamModal } from './components/AddExamModal';
import { AllExams } from './components/AllExams';
import { AllSubjects } from './components/AllSubjects';
import { TextEditor } from './components/TextEditor';

function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = searchParams.get('page') as
    | 'important-subjects'
    | 'all-exams'
    | 'all-subjects'
    | 'text-editor'
    | null;
  const page = currentPage || 'all-exams';

  const { exams } = useStore();
  const [time, setTime] = useState(Math.max(0, exams.length - 1).toString());
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);

  const data = useMemo(
    () => newImpl(exams.slice(0, parseInt(time, 10) + 1)),
    [exams, time]
  );

  useEffect(() => {
    setTime(Math.max(0, exams.length - 1).toString());
  }, [exams]);

  const setPage = (newPage: typeof page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage);
    navigate(`?${params.toString()}`);
  };

  const handleAddExamSuccess = () => {
    setIsAddExamModalOpen(false);
    setPage('all-exams');
  };

  const pages: Record<typeof page, React.ReactNode> = {
    'important-subjects': <ImportantSubjects data={data} />,
    'all-exams': <AllExams />,
    'all-subjects': <AllSubjects />,
    'text-editor': <TextEditor />,
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Enhanced Navigation */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 shadow-lg">
        <h1 className="text-center text-white text-3xl font-semibold mb-6">
          Sınav Yönetim Merkezi
        </h1>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={() => setPage('all-exams')}
            className={`px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none ${
              page === 'all-exams'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📋 Tüm Sınavlar
          </Button>

          <Button
            onClick={() => setPage('important-subjects')}
            className={`px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none ${
              page === 'important-subjects'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🎯 Önemli Konular
          </Button>

          <Button
            onClick={() => setPage('all-subjects')}
            className={`px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none ${
              page === 'all-subjects'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📚 Tüm Konular
          </Button>

          <Button
            onClick={() => setPage('text-editor')}
            className={`px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none ${
              page === 'text-editor'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            ✏️ Metin Editörü
          </Button>

          <Button
            onClick={() => setIsAddExamModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shadow-md hover:bg-green-700 border-none"
          >
            ➕ Sınav Ekle
          </Button>
        </div>
      </div>

      {/* Time Slider for Important Subjects */}
      {page === 'important-subjects' && exams.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-center text-gray-700 text-lg font-medium mb-4">
            Sınav Zaman Aralığı ({parseInt(time, 10) + 1} / {exams.length}{' '}
            sınav)
          </h3>
          <input
            id="input"
            type="range"
            min="0"
            value={time}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            onChange={(e) => setTime(e.target.value)}
            max={exams.length - 1}
            step="1"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>İlk Sınav</span>
            <span>Son Sınav</span>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm min-h-[600px]">
        {pages[page]}
      </div>

      <AddExamModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        onSuccess={handleAddExamSuccess}
      />
    </div>
  );
}

export default App;
