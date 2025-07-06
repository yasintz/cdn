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
import { TextEditor } from './components/TextEditor';

function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentPage = searchParams.get('page') as 'analytics' | 'important-subjects' | 'all-exams' | 'text-editor' | null;
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
    'text-editor': <TextEditor />,
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Enhanced Navigation */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: 'white', 
          margin: '0 0 1.5rem 0',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Sınav Analiz Merkezi
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Button 
            onClick={() => setPage('analytics')}
            style={{
              backgroundColor: page === 'analytics' ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
              color: page === 'analytics' ? '#667eea' : 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: page === 'analytics' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            📊 Analiz
          </Button>
          
          <Button 
            onClick={() => setPage('important-subjects')}
            style={{
              backgroundColor: page === 'important-subjects' ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
              color: page === 'important-subjects' ? '#667eea' : 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: page === 'important-subjects' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            🎯 Önemli Konular
          </Button>
          
          <Button 
            onClick={() => setPage('all-exams')}
            style={{
              backgroundColor: page === 'all-exams' ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
              color: page === 'all-exams' ? '#667eea' : 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: page === 'all-exams' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            📋 Tüm Sınavlar
          </Button>
          
          <Button 
            onClick={() => setPage('text-editor')}
            style={{
              backgroundColor: page === 'text-editor' ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
              color: page === 'text-editor' ? '#667eea' : 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: page === 'text-editor' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            ✏️ Metin Editörü
          </Button>
          
          <Button 
            onClick={() => setIsAddExamModalOpen(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            ➕ Sınav Ekle
          </Button>
        </div>
      </div>

      {/* Time Slider for Analytics and Important Subjects */}
      {(page === 'analytics' || page === 'important-subjects') && exams.length > 0 && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            margin: '0 0 1rem 0',
            color: '#495057',
            fontSize: '1.1rem'
          }}>
            Sınav Zaman Aralığı ({parseInt(time, 10) + 1} / {exams.length} sınav)
          </h3>
          <input
            id="input"
            type="range"
            min="0"
            value={time}
            style={{ 
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: '#ddd',
              outline: 'none',
              cursor: 'pointer'
            }}
            onChange={(e) => setTime(e.target.value)}
            max={exams.length - 1}
            step="1"
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: '#6c757d'
          }}>
            <span>İlk Sınav</span>
            <span>Son Sınav</span>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        minHeight: '600px'
      }}>
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
