import { useState, useEffect } from 'react';
import { useStore } from '../useStore';
import { parseExam } from '../modules/parseExam';
import { UserAnswer } from '../modules/helpers';
import { Button } from '@/components/ui/button';

export function TextEditor() {
  const { exams, addExam, updateExam, deleteExam } = useStore();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [examId, setExamId] = useState('');
  const [examContent, setExamContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseExam> | null>(null);

  // Generate example content for new exam
  const generateExampleContent = () => {
    return `Türkçe
1 Hangi cümlede özne bulunmamaktadır A B C D E A +
2 Aşağıdaki cümlelerin hangisinde isim tamlaması vardır A B C D E B +
3 Hangi kelime birleşik fiildir A B C D E C -

Matematik
1 2x + 3 = 7 denkleminin çözümü nedir A B C D E A +
2 Bir üçgenin iç açıları toplamı kaç derecedir A B C D E B +
3 √16 kaçtır A B C D E C 

Tarih
1 Osmanlı İmparatorluğu hangi yüzyılda kurulmuştur A B C D E D +
2 Atatürk hangi yılda doğmuştur A B C D E E -

Coğrafya
1 Türkiye'nin en büyük gölü hangisidir A B C D E A +
2 Akdeniz'e kıyısı olan iller hangisidir A B C D E B +

Felsefe
1 Felsefenin babası kimdir A B C D E A +
2 Sokrates hangi yüzyılda yaşamıştır A B C D E B 

Din Kültürü
1 İslam'ın beş şartından biri hangisidir A B C D E C +
2 Kur'an kaç sureden oluşur A B C D E D +

Fizik
1 Hız formülü nedir A B C D E A +
2 Newton'un birinci yasası nedir A B C D E B -

Kimya
1 Suyun kimyasal formülü nedir A B C D E C +
2 Periyodik tabloda ilk element hangisidir A B C D E D +

Biyoloji
1 Hücrenin en küçük birimi nedir A B C D E A +
2 Fotosentez hangi organelde gerçekleşir A B C D E B +`;
  };

  // Load exam content when selected
  useEffect(() => {
    if (selectedExamId && selectedExamId !== 'new') {
      const exam = exams.find(e => e.id === selectedExamId);
      if (exam) {
        setExamId(exam.id);
        setExamContent(generateExamContent(exam));
        setIsEditing(true);
      }
    } else if (selectedExamId === 'new') {
      setExamId('');
      setExamContent(generateExampleContent());
      setIsEditing(false);
    }
  }, [selectedExamId, exams]);

  // Generate content from exam object
  const generateExamContent = (exam: ReturnType<typeof parseExam>) => {
    let content = '';
    
    const lessonsOrder = ['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'Fizik', 'Kimya', 'Biyoloji'];
    
    lessonsOrder.forEach(lesson => {
      if (exam.sinav[lesson]) {
        content += `${lesson}\n`;
        
        let questions = exam.sinav[lesson];
        if (lesson === 'Matematik' && exam.sinav['Geometri']) {
          questions = { ...questions, ...exam.sinav['Geometri'] };
        }
        
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
        content += '\n';
      }
    });
    
    return content;
  };

  // Parse and preview exam content
  const handlePreview = () => {
    try {
      const testId = examId || 'preview';
      const parsed = parseExam(testId, examContent);
      setParsedPreview(parsed);
      setPreviewMode(true);
    } catch (error) {
      alert('Sınav formatı hatalı. Lütfen kontrol edin.');
    }
  };

  // Save exam
  const handleSave = () => {
    if (!examId.trim()) {
      alert('Lütfen sınav ID\'si girin.');
      return;
    }

    try {
      const parsed = parseExam(examId, examContent);
      
      if (isEditing) {
        updateExam(selectedExamId, parsed);
        alert('Sınav başarıyla güncellendi!');
      } else {
        addExam(parsed);
        alert('Sınav başarıyla eklendi!');
      }
      
      setSelectedExamId('');
      setExamId('');
      setExamContent('');
      setIsEditing(false);
      setPreviewMode(false);
      setParsedPreview(null);
    } catch (error) {
      alert('Sınav formatı hatalı. Lütfen kontrol edin.');
    }
  };

  // Delete exam
  const handleDelete = () => {
    if (selectedExamId && selectedExamId !== 'new') {
      if (window.confirm('Sınav silinsin mi? Bu işlem geri alınamaz.')) {
        deleteExam(selectedExamId);
        setSelectedExamId('');
        setExamId('');
        setExamContent('');
        setIsEditing(false);
        setPreviewMode(false);
        setParsedPreview(null);
      }
    }
  };

  // Get lesson statistics from parsed exam
  const getLessonStats = (exam: ReturnType<typeof parseExam>) => {
    const stats: Record<string, { total: number; correct: number; wrong: number; skip: number }> = {};
    
    Object.entries(exam.examResponse).forEach(([lesson, subjects]) => {
      stats[lesson] = { total: 0, correct: 0, wrong: 0, skip: 0 };
      
      Object.values(subjects).forEach((answers) => {
        answers.forEach((answer) => {
          stats[lesson].total++;
          if (answer === UserAnswer.True) stats[lesson].correct++;
          else if (answer === UserAnswer.False) stats[lesson].wrong++;
          else if (answer === UserAnswer.Skip) stats[lesson].skip++;
        });
      });
    });
    
    return stats;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333',
        fontSize: '2rem'
      }}>
        ✏️ Metin Editörü
      </h2>
      
      {/* Exam Selection */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Sınav Seç</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            <option value="">Sınav seçin...</option>
            <option value="new">🆕 Yeni Sınav</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                📝 Sınav #{exam.id}
              </option>
            ))}
          </select>
          
          {selectedExamId && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={handlePreview}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                👁️ Önizleme
              </Button>
              
              <Button
                onClick={handleSave}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                💾 Kaydet
              </Button>
              
              {isEditing && (
                <Button
                  onClick={handleDelete}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Sil
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedExamId && (
        <div style={{ display: 'flex', gap: '2rem', minHeight: '600px' }}>
          {/* Text Editor */}
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                📝 Sınav Metni
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Sınav ID:
                </label>
                <input
                  type="text"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  placeholder="Örnek: 2024-01-15"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '14px',
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
                  placeholder="Sınav içeriğini buraya yazın..."
                  style={{
                    width: '100%',
                    height: '500px',
                    padding: '1rem',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'Consolas, Monaco, monospace',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                padding: '1rem',
                background: '#e3f2fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1565c0'
              }}>
                <strong>Format:</strong> Her ders adından sonra sorular yazılmalı. 
                <br />
                <strong>Soru formatı:</strong> [Soru No] [Konu] [Doğru Cevap] [Verilen Cevap] [+/-/boş/IPT]
                <br />
                <strong>Örnek:</strong> 1 Hangi cümlede özne bulunmamaktadır A B C D E A +
              </div>
            </div>
          </div>

          {/* Preview */}
          {previewMode && parsedPreview && (
            <div style={{ flex: 1 }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                height: '100%',
                overflow: 'auto'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                  👁️ Önizleme
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#28a745',
                    fontSize: '1.1rem'
                  }}>
                    Sınav #{parsedPreview.id}
                  </h4>
                </div>

                {/* Lesson Statistics */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                    📊 Ders Bazlı İstatistikler
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(getLessonStats(parsedPreview)).map(([lesson, stats]) => (
                      <div key={lesson} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#495057' }}>
                          {lesson}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '13px' }}>
                          <span style={{ color: '#28a745' }}>
                            ✅ {stats.correct}
                          </span>
                          <span style={{ color: '#dc3545' }}>
                            ❌ {stats.wrong}
                          </span>
                          <span style={{ color: '#6c757d' }}>
                            ⭕ {stats.skip}
                          </span>
                          <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                            Net: {(stats.correct - stats.wrong / 4).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson Details */}
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                    📚 Ders Detayları
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(parsedPreview.examResponse).map(([lesson, subjects]) => (
                      <div key={lesson} style={{
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <h5 style={{ 
                          margin: '0 0 0.5rem 0', 
                          color: '#495057',
                          fontSize: '1rem'
                        }}>
                          {lesson}
                        </h5>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {Object.keys(subjects).length} farklı konu
                        </div>
                        <div style={{ 
                          marginTop: '0.5rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25rem'
                        }}>
                          {Object.keys(subjects).map(subject => (
                            <span key={subject} style={{
                              padding: '0.25rem 0.5rem',
                              background: '#e3f2fd',
                              borderRadius: '4px',
                              fontSize: '11px',
                              color: '#1565c0'
                            }}>
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedExamId && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#6c757d' }}>
            📝 Sınav Düzenle
          </h3>
          <p style={{ margin: '0', color: '#6c757d' }}>
            Yukarıdan bir sınav seçin veya yeni sınav oluşturun
          </p>
        </div>
      )}
    </div>
  );
} 