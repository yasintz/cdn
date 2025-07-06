import { useEffect, useState } from 'react';
import { UserAnswer, dersler } from '../modules/helpers';
import { parseExam } from '../modules/parseExam';
import { Button } from '@/components/ui/button';
import { X, Save, Edit3, FileText, Hash, Plus, Trash2 } from 'lucide-react';

interface EditExamModalProps {
  exam: ReturnType<typeof parseExam> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExam: ReturnType<typeof parseExam>) => void;
}

interface QuestionData {
  question: string;
  rightAnswer: string;
  givenAnswer: string;
  answer: UserAnswer;
}

export function EditExamModal({ 
  exam, 
  isOpen, 
  onClose, 
  onSave 
}: EditExamModalProps) {
  const [examId, setExamId] = useState('');
  const [lessonsData, setLessonsData] = useState<Record<string, Record<string, QuestionData>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (exam) {
      setExamId(exam.id);
      setLessonsData(exam.sinav);
      setError('');
    }
  }, [exam]);

  const updateQuestion = (lessonName: string, questionNumber: string, field: keyof QuestionData, value: string | UserAnswer) => {
    setLessonsData(prev => ({
      ...prev,
      [lessonName]: {
        ...prev[lessonName],
        [questionNumber]: {
          ...prev[lessonName][questionNumber],
          [field]: value
        }
      }
    }));
  };

  const addQuestion = (lessonName: string) => {
    const existingQuestions = Object.keys(lessonsData[lessonName] || {});
    const questionNumbers = existingQuestions.map(q => parseInt(q)).sort((a, b) => a - b);
    const nextQuestionNumber = questionNumbers.length > 0 ? Math.max(...questionNumbers) + 1 : 1;
    
    setLessonsData(prev => ({
      ...prev,
      [lessonName]: {
        ...prev[lessonName],
        [nextQuestionNumber]: {
          question: '',
          rightAnswer: '',
          givenAnswer: '',
          answer: UserAnswer.Skip
        }
      }
    }));
  };

  const removeQuestion = (lessonName: string, questionNumber: string) => {
    setLessonsData(prev => {
      const newLessonData = { ...prev[lessonName] };
      delete newLessonData[questionNumber];
      return {
        ...prev,
        [lessonName]: newLessonData
      };
    });
  };

  const handleSave = async () => {
    if (!examId.trim()) {
      setError('Sınav ID boş olamaz.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedExam = {
        id: examId,
        sinav: lessonsData,
        examResponse: {}
      };

      const examResponse: {
        [lesson: string]: {
          [subject: string]: UserAnswer[];
        };
      } = {};

      Object.entries(lessonsData).forEach(([ders, dersResult]) => {
        examResponse[ders] = examResponse[ders] || {};
        Object.values(dersResult).forEach((soruResult) => {
          const { answer, question } = soruResult;

          if (answer === UserAnswer.Cancel) {
            return;
          }

          examResponse[ders][question] = examResponse[ders][question] || [];
          examResponse[ders][question].push(answer);
        });
      });

      updatedExam.examResponse = examResponse;

      onSave(updatedExam);
      onClose();
    } catch (error) {
      setError('Sınav kaydedilirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const getStatusSymbol = (answer: UserAnswer) => {
    switch (answer) {
      case UserAnswer.True:
        return '✓';
      case UserAnswer.False:
        return '✗';
      case UserAnswer.Skip:
        return '—';
      case UserAnswer.Cancel:
        return '⊗';
      default:
        return '?';
    }
  };

  if (!isOpen || !exam) return null;

  const lessonsOrder = ['Türkçe', 'Matematik', 'Geometri', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'Fizik', 'Kimya', 'Biyoloji'];

  return (
    <div className="modal-overlay" style={{
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
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '95%',
        maxWidth: '1400px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: '1px solid #ddd',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8f9fa',
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.1rem', 
            fontWeight: '600',
            color: '#333',
          }}>
            Sınav Düzenle
          </h2>
          <button
            onClick={handleClose}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#666',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          maxHeight: 'calc(90vh - 120px)',
          overflowY: 'auto',
        }}>
          {error && (
            <div style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#c33',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          {/* Exam ID */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem', 
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#333',
            }}>
              Sınav ID
            </label>
            <input
              type="text"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              style={{
                width: '300px',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Lessons Tables */}
          <div style={{ display: 'grid', gap: '2rem' }}>
            {lessonsOrder.map(lessonName => {
              const lessonData = lessonsData[lessonName];
              
              if (!lessonData || Object.keys(lessonData).length === 0) {
                return null;
              }

              const questions = Object.entries(lessonData).sort(([a], [b]) => parseInt(a) - parseInt(b));

              return (
                <div key={lessonName} style={{ pageBreakInside: 'avoid' }}>
                  {/* Lesson Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '2px solid #333',
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: '#333',
                    }}>
                      {lessonName}
                    </h3>
                    <button
                      onClick={() => addQuestion(lessonName)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: '#f8f9fa',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Soru Ekle"
                    >
                      <Plus size={14} />
                      Soru Ekle
                    </button>
                  </div>

                  {/* Questions Table */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.85rem',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ 
                          padding: '0.5rem', 
                          textAlign: 'left', 
                          borderRight: '1px solid #ddd',
                          width: '60px',
                          fontWeight: '500',
                        }}>
                          No
                        </th>
                        <th style={{ 
                          padding: '0.5rem', 
                          textAlign: 'left', 
                          borderRight: '1px solid #ddd',
                          fontWeight: '500',
                        }}>
                          Soru
                        </th>
                        <th style={{ 
                          padding: '0.5rem', 
                          textAlign: 'center', 
                          borderRight: '1px solid #ddd',
                          width: '80px',
                          fontWeight: '500',
                        }}>
                          Doğru
                        </th>
                        <th style={{ 
                          padding: '0.5rem', 
                          textAlign: 'center', 
                          borderRight: '1px solid #ddd',
                          width: '80px',
                          fontWeight: '500',
                        }}>
                          Verilen
                        </th>
                        <th style={{ 
                          padding: '0.5rem', 
                          textAlign: 'center', 
                          borderRight: '1px solid #ddd',
                          width: '80px',
                          fontWeight: '500',
                        }}>
                          Durum
                        </th>
                        <th style={{ 
                          padding: '0.5rem', 
                          textAlign: 'center',
                          width: '40px',
                          fontWeight: '500',
                        }}>
                          ⚙️
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map(([questionNumber, questionData]) => (
                        <tr key={questionNumber} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderRight: '1px solid #eee',
                            fontWeight: '500',
                            color: '#666',
                          }}>
                            {questionNumber}
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderRight: '1px solid #eee',
                          }}>
                            <input
                              type="text"
                              value={questionData.question}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'question', e.target.value)}
                              placeholder="Soru metnini girin..."
                              style={{
                                width: '100%',
                                padding: '0.25rem',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.85rem',
                                backgroundColor: 'transparent',
                              }}
                              onFocus={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onBlur={(e) => e.target.style.backgroundColor = 'transparent'}
                            />
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            textAlign: 'center',
                            borderRight: '1px solid #eee',
                          }}>
                            <select
                              value={questionData.rightAnswer}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'rightAnswer', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.25rem',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.85rem',
                                backgroundColor: 'transparent',
                                textAlign: 'center',
                              }}
                              onFocus={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onBlur={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <option value="">-</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                            </select>
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            textAlign: 'center',
                            borderRight: '1px solid #eee',
                          }}>
                            <select
                              value={questionData.givenAnswer}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'givenAnswer', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.25rem',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.85rem',
                                backgroundColor: 'transparent',
                                textAlign: 'center',
                              }}
                              onFocus={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onBlur={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <option value="">-</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                            </select>
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            textAlign: 'center',
                            borderRight: '1px solid #eee',
                          }}>
                            <select
                              value={questionData.answer}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'answer', e.target.value as UserAnswer)}
                              style={{
                                width: '100%',
                                padding: '0.25rem',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.85rem',
                                backgroundColor: 'transparent',
                                textAlign: 'center',
                              }}
                              onFocus={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onBlur={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <option value={UserAnswer.True}>✓ Doğru</option>
                              <option value={UserAnswer.False}>✗ Yanlış</option>
                              <option value={UserAnswer.Skip}>— Boş</option>
                              <option value={UserAnswer.Cancel}>⊗ İptal</option>
                            </select>
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            textAlign: 'center',
                          }}>
                            <button
                              onClick={() => removeQuestion(lessonName, questionNumber)}
                              style={{
                                padding: '0.25rem',
                                borderRadius: '3px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#dc3545',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                              }}
                              title="Soru Sil"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          backgroundColor: '#f8f9fa',
        }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#999' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Save size={14} />
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
} 