import { useState } from 'react';
import { UserAnswer } from '../modules/helpers';
import { parseExam } from '../modules/parseExam';
import { useStore } from '../useStore';
import { EditExamModal } from './EditExamModal';
import { Button } from '@/components/ui/button';

export function AllExams() {
  const { exams, updateExam, deleteExam } = useStore();
  const [editingExam, setEditingExam] = useState<ReturnType<typeof parseExam> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  const getExamSummary = (exam: ReturnType<typeof parseExam>) => {
    const summary: Record<string, { total: number; correct: number; wrong: number; skip: number }> = {};
    
    Object.entries(exam.examResponse).forEach(([lesson, subjects]) => {
      summary[lesson] = { total: 0, correct: 0, wrong: 0, skip: 0 };
      
      Object.values(subjects).forEach((answers) => {
        answers.forEach((answer) => {
          summary[lesson].total++;
          if (answer === UserAnswer.True) summary[lesson].correct++;
          else if (answer === UserAnswer.False) summary[lesson].wrong++;
          else if (answer === UserAnswer.Skip) summary[lesson].skip++;
        });
      });
    });
    
    return summary;
  };

  const calculateNet = (correct: number, wrong: number) => {
    return correct - (wrong / 4);
  };

  const getLessonColor = (lesson: string) => {
    const colors: Record<string, string> = {
      'Türkçe': '#e3f2fd',
      'Matematik': '#f3e5f5',
      'Tarih': '#fff3e0',
      'Coğrafya': '#e8f5e8',
      'Felsefe': '#fce4ec',
      'Din Kültürü': '#f1f8e9',
      'Fizik': '#e0f2f1',
      'Kimya': '#fff8e1',
      'Biyoloji': '#f3e5f5',
      'Geometri': '#e8eaf6'
    };
    return colors[lesson] || '#f5f5f5';
  };

  const getLessonIcon = (lesson: string) => {
    const icons: Record<string, string> = {
      'Türkçe': '📚',
      'Matematik': '🔢',
      'Tarih': '🏛️',
      'Coğrafya': '🌍',
      'Felsefe': '🤔',
      'Din Kültürü': '📿',
      'Fizik': '⚛️',
      'Kimya': '🧪',
      'Biyoloji': '🧬',
      'Geometri': '📐'
    };
    return icons[lesson] || '📋';
  };

  if (exams.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#6c757d' }}>
          📋 Henüz hiç sınav eklenmemiş
        </h2>
        <p style={{ margin: '0', color: '#6c757d' }}>
          Sınav eklemek için "Sınav Ekle" butonunu kullanın.
        </p>
      </div>
    );
  }

  // Calculate averages across all exams
  const calculateAverages = () => {
    if (exams.length === 0) return null;
    
    const totalStats = { correct: 0, wrong: 0, skip: 0, total: 0 };
    const subjectStats: Record<string, { correct: number; wrong: number; skip: number; total: number }> = {};
    
    exams.forEach((exam) => {
      const summary = getExamSummary(exam);
      Object.entries(summary).forEach(([lesson, data]) => {
        totalStats.correct += data.correct;
        totalStats.wrong += data.wrong;
        totalStats.skip += data.skip;
        totalStats.total += data.total;
        
        if (!subjectStats[lesson]) {
          subjectStats[lesson] = { correct: 0, wrong: 0, skip: 0, total: 0 };
        }
        subjectStats[lesson].correct += data.correct;
        subjectStats[lesson].wrong += data.wrong;
        subjectStats[lesson].skip += data.skip;
        subjectStats[lesson].total += data.total;
      });
    });
    
    return {
      overall: {
        correct: totalStats.correct / exams.length,
        wrong: totalStats.wrong / exams.length,
        skip: totalStats.skip / exams.length,
        total: totalStats.total / exams.length,
        net: calculateNet(totalStats.correct, totalStats.wrong) / exams.length,
      },
      subjects: Object.entries(subjectStats).map(([lesson, data]) => ({
        lesson,
        correct: data.correct / exams.length,
        wrong: data.wrong / exams.length,
        skip: data.skip / exams.length,
        total: data.total / exams.length,
        net: calculateNet(data.correct, data.wrong) / exams.length,
      })),
    };
  };

  const averages = calculateAverages();

  const handleEdit = (exam: ReturnType<typeof parseExam>) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleDelete = (exam: ReturnType<typeof parseExam>) => {
    if (window.confirm(`Sınav #${exam.id} silinsin mi? Bu işlem geri alınamaz.`)) {
      deleteExam(exam.id);
    }
  };

  const handleSave = (updatedExam: ReturnType<typeof parseExam>) => {
    updateExam(editingExam!.id, updatedExam);
    setEditingExam(null);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setEditingExam(null);
    setIsModalOpen(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333',
        fontSize: '2rem'
      }}>
        📋 Tüm Sınavlar
      </h2>
      
      {averages && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.5rem' }}>
            📊 Ortalama Performans ({exams.length} sınav)
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Ortalama Doğru</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{averages.overall.correct.toFixed(1)}</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Ortalama Yanlış</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{averages.overall.wrong.toFixed(1)}</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⭕ Ortalama Boş</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{averages.overall.skip.toFixed(1)}</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🎯 Ortalama Net</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{averages.overall.net.toFixed(1)}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.3)', paddingTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontSize: '1.2rem' }}>
              📚 Ders Bazlı Ortalamalar
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '1rem' 
            }}>
              {averages.subjects.map((subject) => (
                <div key={subject.lesson} style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backdropFilter: 'blur(5px)'
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '14px', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{getLessonIcon(subject.lesson)}</span>
                    <span>{subject.lesson}</span>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '0.5rem', opacity: 0.9 }}>
                    D:{subject.correct.toFixed(1)} Y:{subject.wrong.toFixed(1)} B:{subject.skip.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    Net: {subject.net.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {exams.map((exam) => {
          const summary = getExamSummary(exam);
          const totalQuestions = Object.values(summary).reduce((acc, curr) => acc + curr.total, 0);
          const totalCorrect = Object.values(summary).reduce((acc, curr) => acc + curr.correct, 0);
          const totalWrong = Object.values(summary).reduce((acc, curr) => acc + curr.wrong, 0);
          const totalSkip = Object.values(summary).reduce((acc, curr) => acc + curr.skip, 0);
          const totalNet = calculateNet(totalCorrect, totalWrong);
          const isExpanded = expandedExam === exam.id;

          return (
            <div 
              key={exam.id}
              style={{
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Exam Header */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '1.5rem',
                borderBottom: '1px solid #e9ecef',
                cursor: 'pointer'
              }} onClick={() => setExpandedExam(isExpanded ? null : exam.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#495057',
                      fontSize: '1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📝 Sınav #{exam.id}
                      <span style={{ fontSize: '1rem', color: '#6c757d' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '1rem',
                      fontSize: '14px'
                    }}>
                      <div style={{ color: '#28a745' }}>✅ Doğru: {totalCorrect}</div>
                      <div style={{ color: '#dc3545' }}>❌ Yanlış: {totalWrong}</div>
                      <div style={{ color: '#6c757d' }}>⭕ Boş: {totalSkip}</div>
                      <div style={{ color: '#007bff', fontWeight: 'bold' }}>🎯 Net: {totalNet.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(exam);
                      }}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Düzenle
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(exam);
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Sil
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Lesson Details */}
              {isExpanded && (
                <div style={{ padding: '1.5rem' }}>
                  <h4 style={{ 
                    margin: '0 0 1.5rem 0', 
                    color: '#495057',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}>
                    📚 Ders Detayları
                  </h4>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '1.5rem' 
                  }}>
                    {Object.entries(summary).map(([lesson, data]) => (
                      <div key={lesson} style={{ 
                        backgroundColor: getLessonColor(lesson),
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>{getLessonIcon(lesson)}</span>
                          <h5 style={{ 
                            margin: '0', 
                            fontWeight: 'bold', 
                            fontSize: '1.1rem',
                            color: '#333'
                          }}>
                            {lesson}
                          </h5>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '4px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>Doğru</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                              {data.correct}
                            </div>
                          </div>
                          
                          <div style={{ 
                            textAlign: 'center',
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '4px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>Yanlış</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                              {data.wrong}
                            </div>
                          </div>
                          
                          <div style={{ 
                            textAlign: 'center',
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '4px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>Boş</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>
                              {data.skip}
                            </div>
                          </div>
                          
                          <div style={{ 
                            textAlign: 'center',
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '4px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>Net</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                              {calculateNet(data.correct, data.wrong).toFixed(1)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e9ecef',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #28a745 0%, #28a745 50%, #dc3545 50%, #dc3545 100%)',
                            width: `${((data.correct + data.wrong) / data.total) * 100}%`,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6c757d',
                          textAlign: 'center',
                          marginTop: '0.5rem'
                        }}>
                          {data.total} soru • %{((data.correct / data.total) * 100).toFixed(1)} başarı
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EditExamModal
        exam={editingExam}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
} 