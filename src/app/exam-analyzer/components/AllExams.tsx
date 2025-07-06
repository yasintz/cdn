import { useState } from 'react';
import { UserAnswer } from '../modules/helpers';
import { parseExam } from '../modules/parseExam';
import { useStore } from '../useStore';
import { EditExamModal } from './EditExamModal';

export function AllExams() {
  const { exams, updateExam, deleteExam } = useStore();
  const [editingExam, setEditingExam] = useState<ReturnType<typeof parseExam> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (exams.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Henüz hiç sınav eklenmemiş</h2>
        <p>Sınav eklemek için "Sınav Ekle" sayfasını kullanın.</p>
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
    <div style={{ padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Tüm Sınavlar</h2>
      
      {averages && (
        <div style={{
          border: '2px solid #4a90e2',
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: '#f8fbff',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center', color: '#2c5aa0' }}>
            Ortalama Performans ({exams.length} sınav)
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '0.75rem', 
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #c3e6c3'
            }}>
              <div style={{ fontWeight: 'bold', color: '#2d5a2d' }}>Ortalama Doğru</div>
              <div style={{ fontSize: '20px', color: '#2d5a2d' }}>{averages.overall.correct.toFixed(1)}</div>
            </div>
            
            <div style={{ 
              backgroundColor: '#ffeaea', 
              padding: '0.75rem', 
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #f5c2c7'
            }}>
              <div style={{ fontWeight: 'bold', color: '#a52a2a' }}>Ortalama Yanlış</div>
              <div style={{ fontSize: '20px', color: '#a52a2a' }}>{averages.overall.wrong.toFixed(1)}</div>
            </div>
            
            <div style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '0.75rem', 
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #d6d8db'
            }}>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Ortalama Boş</div>
              <div style={{ fontSize: '20px', color: '#666' }}>{averages.overall.skip.toFixed(1)}</div>
            </div>
            
            <div style={{ 
              backgroundColor: '#e8f4fd', 
              padding: '0.75rem', 
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #b8daff'
            }}>
              <div style={{ fontWeight: 'bold', color: '#1e5a96' }}>Ortalama Net</div>
              <div style={{ fontSize: '20px', color: '#1e5a96' }}>{averages.overall.net.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', textAlign: 'center', color: '#666' }}>Ders Bazlı Ortalamalar</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {averages.subjects.map((subject) => (
                <div key={subject.lesson} style={{ 
                  backgroundColor: '#fff',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  minWidth: '140px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '0.5rem', color: '#333' }}>
                    {subject.lesson}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '0.25rem' }}>
                    D:{subject.correct.toFixed(1)} Y:{subject.wrong.toFixed(1)} B:{subject.skip.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e5a96', fontWeight: 'bold' }}>
                    Net: {subject.net.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {exams.map((exam) => {
          const summary = getExamSummary(exam);
          const totalQuestions = Object.values(summary).reduce((acc, curr) => acc + curr.total, 0);
          const totalCorrect = Object.values(summary).reduce((acc, curr) => acc + curr.correct, 0);
          const totalWrong = Object.values(summary).reduce((acc, curr) => acc + curr.wrong, 0);
          const totalSkip = Object.values(summary).reduce((acc, curr) => acc + curr.skip, 0);
          const totalNet = calculateNet(totalCorrect, totalWrong);

          return (
            <div 
              key={exam.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Sınav #{exam.id}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Toplam: {totalQuestions} soru
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(exam)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(exam)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  backgroundColor: '#e8f5e8', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#2d5a2d' }}>Doğru</div>
                  <div style={{ fontSize: '18px', color: '#2d5a2d' }}>{totalCorrect}</div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#ffeaea', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#a52a2a' }}>Yanlış</div>
                  <div style={{ fontSize: '18px', color: '#a52a2a' }}>{totalWrong}</div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f0f0f0', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#666' }}>Boş</div>
                  <div style={{ fontSize: '18px', color: '#666' }}>{totalSkip}</div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#e8f4fd', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#1e5a96' }}>Net</div>
                  <div style={{ fontSize: '18px', color: '#1e5a96' }}>{totalNet.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {Object.entries(summary).map(([lesson, data]) => (
                  <div key={lesson} style={{ 
                    backgroundColor: '#fff',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #eee',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '0.25rem' }}>
                      {lesson}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      D:{data.correct} Y:{data.wrong} B:{data.skip}
                    </div>
                    <div style={{ fontSize: '11px', color: '#1e5a96', fontWeight: 'bold' }}>
                      Net: {calculateNet(data.correct, data.wrong).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
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