import { useEffect, useState } from 'react';
import { UserAnswer } from '../modules/helpers';
import { parseExam } from '../modules/parseExam';
import { Button } from '@/components/ui/button';
import { X, Save, Edit3, FileText, Hash } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (exam) {
      setExamId(exam.id);
      // Convert exam data back to text format for editing
      const content = generateExamContent(exam);
      setExamContent(content);
      setError('');
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

  const handleSave = async () => {
    if (!examId.trim()) {
      setError('Sınav ID boş olamaz.');
      return;
    }

    if (!examContent.trim()) {
      setError('Sınav içeriği boş olamaz.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedExam = parseExam(examId, examContent);
      onSave(updatedExam);
      onClose();
    } catch (error) {
      setError('Sınav formatı hatalı. Lütfen format kurallarını kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !exam) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '95%',
        maxWidth: '900px',
        maxHeight: '95vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideIn 0.3s ease-out',
        border: '1px solid #e5e7eb',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#3b82f6',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Edit3 size={20} color="white" />
            </div>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#1f2937',
              }}>
                Sınav Düzenle
              </h2>
              <p style={{ 
                margin: 0, 
                fontSize: '0.875rem', 
                color: '#6b7280',
              }}>
                Sınav bilgilerini düzenleyin ve kaydedin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(95vh - 140px)',
          overflowY: 'auto',
        }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#dc2626',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Exam ID Field */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
              }}>
                <Hash size={16} />
                Sınav ID
              </label>
              <input
                type="text"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                placeholder="Sınav ID'sini girin"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Exam Content Field */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
              }}>
                <FileText size={16} />
                Sınav İçeriği
              </label>
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}>
                <textarea
                  value={examContent}
                  onChange={(e) => setExamContent(e.target.value)}
                  placeholder="Sınav içeriğini buraya yapıştırın..."
                  style={{
                    width: '100%',
                    height: '450px',
                    padding: '1rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                  }}
                  onFocus={(e) => {
                    e.target.parentElement!.style.borderColor = '#3b82f6';
                    e.target.parentElement!.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.parentElement!.style.borderColor = '#d1d5db';
                    e.target.parentElement!.style.boxShadow = 'none';
                  }}
                />
              </div>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#6b7280',
              }}>
                Format: Ders adı, ardından sorular (soru numarası, doğru cevap, verilen cevap, durum)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          backgroundColor: '#f8fafc',
        }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <Save size={16} />
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-overlay {
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          animation: slideIn 0.3s ease-out;
        }

        /* Custom scrollbar */
        *::-webkit-scrollbar {
          width: 8px;
        }

        *::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
} 