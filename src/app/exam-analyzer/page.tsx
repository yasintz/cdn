'use client';

import { useMemo, useState, useEffect } from 'react';
import './App.css';
import { newImpl } from './new';
import { UserAnswer, dersler } from './modules/helpers';
import _ from 'lodash';
import { parseExam } from './modules/parseExam';
import { useStore } from './useStore';
import { Button } from '@/components/ui/button';

function ImportantSubjects({
  data: { importantSubjects, examCount },
}: {
  data: ReturnType<typeof newImpl>;
}) {
  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Onemli Konular</h2>
      <div
        style={{
          borderTop: '1px solid #ddd',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3rem',
        }}
      >
        {[...dersler.map((i) => i.name), 'Tum Dersler'].map((item) => (
          <div key={item} style={{ marginBottom: '1rem' }}>
            <h4>{item}</h4>
            {(item === 'Tum Dersler'
              ? importantSubjects.subjectCounts.inAllClass
              : importantSubjects.subjectCounts.byClass[item]
            )
              ?.filter((i) => i.subject)
              .slice(0, 5)
              .map((i) => (
                <div key={i.className + i.subject}>
                  {Math.round(i.total / examCount)}: {i.subject}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

function Analytics({
  data: { analytics, examCount },
}: {
  data: ReturnType<typeof newImpl>;
}) {
  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Analiz</h2>
      <div
        style={{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        <h3 style={{ margin: 0, textAlign: 'center' }}>Ders Bazli</h3>

        <div style={{ display: 'flex', gap: '4rem' }}>
          <div>
            <h4>Bos Birakilan</h4>
            {_.orderBy(analytics.lessonBasedData, ['skipRate'], ['desc']).map(
              (item) => (
                <div key={item.lesson} style={{ display: 'flex' }}>
                  <div style={{ width: 60 }}>
                    {item.count}/{(item.skipRate * item.count).toFixed(1)}:{' '}
                  </div>
                  {item.lesson}
                </div>
              )
            )}
          </div>
          <div>
            <h4>Yanlis Yapilan</h4>
            {_.orderBy(analytics.lessonBasedData, ['falseRate'], ['desc']).map(
              (item) => (
                <div key={item.lesson} style={{ display: 'flex' }}>
                  <div style={{ width: 60 }}>
                    {item.count}/{(item.falseRate * item.count).toFixed(1)}:{' '}
                  </div>
                  {item.lesson}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        <h3 style={{ margin: 0, textAlign: 'center' }}>Konu Bazli</h3>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {([UserAnswer.Skip, UserAnswer.False] as const).map((key) => (
            <div key={key}>
              <h4>
                {key === UserAnswer.Skip ? 'Bos Birakilan' : 'Yanlis Yapilan'}
              </h4>
              {analytics.subjectBasedData[key]
                .filter((i) => i.subject)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.subject + item.className}
                    style={{ display: 'flex' }}
                  >
                    <div style={{ width: 44 }}>
                      {item.total}/{item.matched}:{' '}
                    </div>
                    ({item.className}) {item.subject}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        <h3 style={{ margin: 0, textAlign: 'center' }}>Ortalama</h3>

        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
          {analytics.answerCounts.map(({ count, data, lesson }) => (
            <div key={lesson}>
              <h4>{lesson}</h4>
              <div>
                {`Dogru: ${count}/${(data.True / examCount).toFixed(1)}`}
              </div>
              <div>
                {`Yanlis: ${count}/${(data.False / examCount).toFixed(1)}`}
              </div>
              <div>{`Bos: ${count}/${(data.Skip / examCount).toFixed(1)}`}</div>
              <div>---</div>
              <div>
                {`Net: ${count}/${(count * data.SuccessRate).toFixed(1)}`}
              </div>
              <div>
                {`Basari Orani: 100/${Math.floor(data.SuccessRate * 100)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AddExam({ onSuccess }: { onSuccess: () => void }) {
  const { exams, addExam } = useStore();
  const [examNumber, setExamNumber] = useState(
    (parseInt(exams[exams.length - 1]?.id || '0', 10) + 1).toString()
  );
  const [value, setValue] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const response = useMemo(() => {
    try {
      // return value ? parseExam(`${examNumber}\n${value}`) : undefined;
      if (value) {
        const exam = parseExam(examNumber, value);
        const result = newImpl([exam]);

        return { exam, result };
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }, [value, examNumber]);

  const showUserAnswer: Record<UserAnswer, string> = {
    [UserAnswer.Cancel]: 'IPT',
    [UserAnswer.False]: '-',
    [UserAnswer.Skip]: '',
    [UserAnswer.True]: '+',
    [UserAnswer.Invalid]: '??',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <a
        href="https://drive.google.com/file/d/1trEqAMhrrWS9z8nwf9HpvZaSczRs8bpe/view?usp=sharing"
        style={{ fontSize: '20px', margin: '12px 0 12px' }}
        className="text-blue-500"
        target="_blank"
      >
        Sinavimi Nasil Kopyalarim
      </a>
      <div style={{ marginBottom: '12px' }}>
        Daha once eklenen sinavlar: {exams.map((i) => i.id).join(', ')}
      </div>
      <input
        value={examNumber}
        onChange={(e) => setExamNumber(e.target.value)}
        placeholder="Sinav Numarasi"
        className="border"
        style={{
          fontSize: 16,
          borderRadius: '8px',
          padding: '0.7rem',
        }}
      />
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border"
        style={{
          margin: '1rem 0 1rem',
          borderRadius: '8px',
          padding: '1rem',
          height: '400px',
        }}
      />

      <Button
        style={{ width: '100%' }}
        onClick={() => {
          if (showResponse && response) {
            addExam(response.exam);
            onSuccess();
            return;
          }

          setShowResponse(true);
        }}
      >
        {showResponse ? 'Kaydet' : 'Goruntule'}
      </Button>
      {showResponse && response && (
        <>
          <table style={{ margin: '1rem 0 1rem' }}>
            <thead>
              <tr>
                <th>Ders</th>
                <th>Soru</th>
                <th>Dogru</th>
                <th>Yanlis</th>
                <th>Bos</th>
                <th>Net</th>
                <th>ORT</th>
              </tr>
            </thead>
            <tbody>
              {dersler.map((ders) => {
                const data = response.result.analytics.lessonBasedData.find(
                  (i) => i.lesson === ders.name
                )?.data;

                return (
                  <tr key={ders.name}>
                    <td data-no-center>{ders.name}</td>
                    <td>{ders.count}</td>
                    <td>{data?.[UserAnswer.True]}</td>
                    <td>{data?.[UserAnswer.False]}</td>
                    <td>{data?.[UserAnswer.Skip]}</td>
                    <td>{data?.Net}</td>
                    <td />
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3 className="center">Konu Analizi</h3>
          {dersler.map((ders) => (
            <table key={ders.name} style={{ margin: '1rem 0 1rem' }}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Konu</th>
                  <th>DC</th>
                  <th>OC</th>
                  <th>SO</th>
                  <th>CZM</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#5484c3' }}>
                  <td colSpan={6}>{ders.name}</td>
                </tr>
                {Object.entries(response.exam.sinav[ders.name]).map(
                  ([no, result]) => (
                    <tr key={result.question + no}>
                      <td>{no}</td>
                      <td data-no-center>{result.question}</td>
                      <td>{result.rightAnswer}</td>
                      <td>{result.givenAnswer}</td>
                      <td
                        style={{
                          backgroundColor:
                            result.answer === UserAnswer.False
                              ? '#f74e4e'
                              : undefined,
                        }}
                      >
                        {showUserAnswer[result.answer]}
                      </td>
                      <td></td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ))}
        </>
      )}
    </div>
  );
}

function EditExamModal({ 
  exam, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  exam: ReturnType<typeof parseExam> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExam: ReturnType<typeof parseExam>) => void;
}) {
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

function AllExams() {
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

function App() {
  const [page, setPage] = useState<
    'analytics' | 'important-subjects' | 'add-exam' | 'all-exams'
  >('analytics');
  const { exams } = useStore();
  const [time, setTime] = useState(Math.max(0, exams.length - 1).toString());
  const data = useMemo(
    () => newImpl(exams.slice(0, parseInt(time, 10) + 1)),
    [exams, time]
  );

  const pages: Record<typeof page, React.ReactNode> = {
    analytics: <Analytics data={data} />,
    'important-subjects': <ImportantSubjects data={data} />,
    'add-exam': <AddExam onSuccess={() => setPage('analytics')} />,
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
        <Button onClick={() => setPage('add-exam')}>Sinav Ekle</Button>
      </div>
{(page === 'analytics' || page === 'important-subjects') && exams.length > 0 && (
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
    </>
  );
}

export default App;
