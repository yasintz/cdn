'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './App.css';
import { newImpl } from './new';
import { useStore } from './useStore';
import { Button } from '@/components/ui/button';
import { ImportantSubjects } from './components/ImportantSubjects';
import { Analytics } from './components/Analytics';
import { AddExamModal } from './components/AddExamModal';
import { AllExams } from './components/AllExams';

function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentPage = searchParams.get('page') as 'analytics' | 'important-subjects' | 'all-exams' | null;
  const page = currentPage || 'analytics';
  
  const { exams } = useStore();
  const [time, setTime] = useState(Math.max(0, exams.length - 1).toString());
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  
  const data = useMemo(
    () => newImpl(exams.slice(0, parseInt(time, 10) + 1)),
    [exams, time]
  );

  const setPage = (newPage: typeof page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage);
    navigate(`?${params.toString()}`);
  };

  const handleAddExamSuccess = () => {
    setIsAddExamModalOpen(false);
    setPage('analytics');
  };

  const pages: Record<typeof page, React.ReactNode> = {
    analytics: <Analytics data={data} />,
    'important-subjects': <ImportantSubjects data={data} />,
    'all-exams': <AllExams />,
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button onClick={() => setPage('important-subjects')}>
          Onemli Konular
        </Button>
        <Button onClick={() => setPage('analytics')}>Analiz</Button>
        <Button onClick={() => setPage('all-exams')}>Tum Sinavlar</Button>
        <Button onClick={() => setIsAddExamModalOpen(true)}>Sinav Ekle</Button>
      </div>
      {(page === 'analytics' || page === 'important-subjects') &&
        exams.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <input
              id="input"
              type="range"
              min="0"
              value={time}
              style={{ width: '100%' }}
              onChange={(e) => setTime(e.target.value)}
              max={exams.length - 1}
              step="1"
            />
          </div>
        )}
      {pages[page]}
      
      <AddExamModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        onSuccess={handleAddExamSuccess}
      />
    </>
  );
}

export default App;
