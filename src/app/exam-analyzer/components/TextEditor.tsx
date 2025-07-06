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
    <div className="max-w-6xl mx-auto">
      <h2 className="text-center mb-8 text-gray-800 text-3xl font-bold">
        ✏️ Metin Editörü
      </h2>
      
      {/* Exam Selection */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-gray-700 text-lg font-medium mb-4">Sınav Seç</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded text-sm min-w-[200px] focus:border-blue-500 outline-none"
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
            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                className="bg-cyan-600 text-white border-none px-4 py-2 rounded text-sm hover:bg-cyan-700 transition-colors"
              >
                👁️ Önizleme
              </Button>
              
              <Button
                onClick={handleSave}
                className="bg-green-600 text-white border-none px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
              >
                💾 Kaydet
              </Button>
              
              {isEditing && (
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 text-white border-none px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  🗑️ Sil
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedExamId && (
        <div className="flex gap-8 min-h-[600px]">
          {/* Text Editor */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-6 shadow-sm h-full">
              <h3 className="text-gray-700 text-lg font-medium mb-4">
                📝 Sınav Metni
              </h3>
              
              <div className="mb-4">
                <label className="block mb-2 font-bold text-gray-800">
                  Sınav ID:
                </label>
                <input
                  type="text"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  placeholder="Örnek: 2024-01-15"
                  className="w-full px-3 py-3 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold text-gray-800">
                  Sınav İçeriği:
                </label>
                <textarea
                  value={examContent}
                  onChange={(e) => setExamContent(e.target.value)}
                  placeholder="Sınav içeriğini buraya yazın..."
                  className="w-full h-[500px] px-4 py-4 border border-gray-300 rounded text-sm font-mono leading-relaxed resize-y focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded text-xs text-blue-800">
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
            <div className="flex-1">
              <div className="bg-white rounded-xl p-6 shadow-sm h-full overflow-auto">
                <h3 className="text-gray-700 text-lg font-medium mb-4">
                  👁️ Önizleme
                </h3>
                
                <div className="mb-6">
                  <h4 className="text-green-600 text-lg font-medium mb-2">
                    Sınav #{parsedPreview.id}
                  </h4>
                </div>

                {/* Lesson Statistics */}
                <div className="mb-6">
                  <h4 className="text-gray-700 text-base font-medium mb-4">
                    📊 Ders Bazlı İstatistikler
                  </h4>
                  <div className="flex flex-col gap-2">
                    {Object.entries(getLessonStats(parsedPreview)).map(([lesson, stats]) => (
                      <div key={lesson} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="font-bold text-gray-700">
                          {lesson}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">
                            ✅ {stats.correct}
                          </span>
                          <span className="text-red-600">
                            ❌ {stats.wrong}
                          </span>
                          <span className="text-gray-500">
                            ⭕ {stats.skip}
                          </span>
                          <span className="text-blue-600 font-bold">
                            Net: {(stats.correct - stats.wrong / 4).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson Details */}
                <div>
                  <h4 className="text-gray-700 text-base font-medium mb-4">
                    📚 Ders Detayları
                  </h4>
                  <div className="flex flex-col gap-4">
                    {Object.entries(parsedPreview.examResponse).map(([lesson, subjects]) => (
                      <div key={lesson} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="text-gray-700 text-base font-medium mb-2">
                          {lesson}
                        </h5>
                        <div className="text-xs text-gray-600 mb-2">
                          {Object.keys(subjects).length} farklı konu
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.keys(subjects).map(subject => (
                            <span key={subject} className="px-2 py-1 bg-blue-50 rounded text-xs text-blue-800">
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
        <div className="text-center py-16 px-8 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-gray-500 text-xl font-medium mb-4">
            📝 Sınav Düzenle
          </h3>
          <p className="text-gray-500">
            Yukarıdan bir sınav seçin veya yeni sınav oluşturun
          </p>
        </div>
      )}
    </div>
  );
} 