import { useEffect, useState } from 'react';
import { UserAnswer } from '../modules/helpers';
import { parseExam } from '../modules/parseExam';
import { Button } from '@/components/ui/button';

interface EditExamModalProps {
  exam: ReturnType<typeof parseExam> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExam: ReturnType<typeof parseExam>) => void;
}

export function EditExamModal({ 
  exam, 
  isOpen, 
  onClose, 
  onSave 
}: EditExamModalProps) {
  const [examId, setExamId] = useState('');
  const [examContent, setExamContent] = useState('');

  useEffect(() => {
    if (exam) {
      setExamId(exam.id);
      // Convert exam data back to text format for editing
      const content = generateExamContent(exam);
      setExamContent(content);
    }
  }, [exam]);

  const generateExamContent = (exam: ReturnType<typeof parseExam>) => {
    let content = '';
    
    // Handle lessons in the correct order, combining Math and Geometry
    const lessonsOrder = ['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'Fizik', 'Kimya', 'Biyoloji'];
    
    lessonsOrder.forEach(lesson => {
      if (exam.sinav[lesson]) {
        content += `${lesson}\n`;
        
        // For Math, include both Math and Geometry questions
        let questions = exam.sinav[lesson];
        if (lesson === 'Matematik' && exam.sinav['Geometri']) {
          questions = { ...questions, ...exam.sinav['Geometri'] };
        }
        
        // Sort questions by number
        const sortedQuestions = Object.entries(questions).sort(([a], [b]) => parseInt(a) - parseInt(b));
        
        sortedQuestions.forEach(([questionNumber, questionData]) => {
          content += `${questionNumber} ${questionData.question} ${questionData.rightAnswer} ${questionData.givenAnswer} `;
          const userAnswer = questionData.answer;
          if (userAnswer === UserAnswer.True) content += '+ ';
          else if (userAnswer === UserAnswer.False) content += '- ';
          else if (userAnswer === UserAnswer.Skip) content += ' ';
          else if (userAnswer === UserAnswer.Cancel) content += 'IPT ';
          content += '\n';
        });
      }
    });
    
    return content;
  };

  const handleSave = () => {
    try {
      const updatedExam = parseExam(examId, examContent);
      onSave(updatedExam);
      onClose();
    } catch (error) {
      alert('Sınav formatı hatalı. Lütfen kontrol edin.');
    }
  };

  if (!isOpen || !exam) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Sınav Düzenle</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Sınav ID:
          </label>
          <input
            type="text"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Sınav İçeriği:
          </label>
          <textarea
            value={examContent}
            onChange={(e) => setExamContent(e.target.value)}
            style={{
              width: '100%',
              height: '400px',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button
            onClick={onClose}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
} 