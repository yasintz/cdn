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
      'Türkçe': 'bg-blue-50',
      'Matematik': 'bg-purple-50',
      'Tarih': 'bg-orange-50',
      'Coğrafya': 'bg-green-50',
      'Felsefe': 'bg-pink-50',
      'Din Kültürü': 'bg-lime-50',
      'Fizik': 'bg-teal-50',
      'Kimya': 'bg-yellow-50',
      'Biyoloji': 'bg-purple-50',
      'Geometri': 'bg-indigo-50'
    };
    return colors[lesson] || 'bg-gray-50';
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
      <div className="text-center py-16 px-8 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="text-xl font-medium text-gray-500 mb-4">
          📋 Henüz hiç sınav eklenmemiş
        </h2>
        <p className="text-gray-500">
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
    <div className="max-w-6xl mx-auto">
      <h2 className="text-center mb-8 text-gray-800 text-3xl font-bold">
        📋 Tüm Sınavlar
      </h2>
      
      {averages && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 mb-8 shadow-lg text-white">
          <h3 className="text-center text-2xl font-semibold mb-6">
            📊 Ortalama Performans ({exams.length} sınav)
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/20 p-4 rounded-lg text-center backdrop-blur-sm">
              <div className="font-bold mb-2">✅ Ortalama Doğru</div>
              <div className="text-2xl font-bold">{averages.overall.correct.toFixed(1)}</div>
            </div>
            
            <div className="bg-white/20 p-4 rounded-lg text-center backdrop-blur-sm">
              <div className="font-bold mb-2">❌ Ortalama Yanlış</div>
              <div className="text-2xl font-bold">{averages.overall.wrong.toFixed(1)}</div>
            </div>
            
            <div className="bg-white/20 p-4 rounded-lg text-center backdrop-blur-sm">
              <div className="font-bold mb-2">⭕ Ortalama Boş</div>
              <div className="text-2xl font-bold">{averages.overall.skip.toFixed(1)}</div>
            </div>
            
            <div className="bg-white/20 p-4 rounded-lg text-center backdrop-blur-sm">
              <div className="font-bold mb-2">🎯 Ortalama Net</div>
              <div className="text-2xl font-bold">{averages.overall.net.toFixed(1)}</div>
            </div>
          </div>

          <div className="border-t border-white/30 pt-6">
            <h4 className="text-center text-xl font-medium mb-4">
              📚 Ders Bazlı Ortalamalar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {averages.subjects.map((subject) => (
                <div key={subject.lesson} className="bg-white/15 p-4 rounded-lg text-center backdrop-blur-sm">
                  <div className="font-bold text-sm mb-2 flex items-center justify-center gap-2">
                    <span>{getLessonIcon(subject.lesson)}</span>
                    <span>{subject.lesson}</span>
                  </div>
                  <div className="text-xs mb-2 opacity-90">
                    D:{subject.correct.toFixed(1)} Y:{subject.wrong.toFixed(1)} B:{subject.skip.toFixed(1)}
                  </div>
                  <div className="text-sm font-bold">
                    Net: {subject.net.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-8">
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
              className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Exam Header */}
              <div 
                className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-colors" 
                onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      📝 Sınav #{exam.id}
                      <span className="text-base text-gray-500">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="text-green-600 font-medium">✅ Doğru: {totalCorrect}</div>
                      <div className="text-red-600 font-medium">❌ Yanlış: {totalWrong}</div>
                      <div className="text-gray-500 font-medium">⭕ Boş: {totalSkip}</div>
                      <div className="text-blue-600 font-bold">🎯 Net: {totalNet.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(exam);
                      }}
                      className="bg-blue-600 text-white border-none px-4 py-2 rounded text-sm cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      ✏️ Düzenle
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(exam);
                      }}
                      className="bg-red-600 text-white border-none px-4 py-2 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors"
                    >
                      🗑️ Sil
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Lesson Details */}
              {isExpanded && (
                <div className="p-6">
                  <h4 className="text-gray-700 text-lg font-medium text-center mb-6">
                    📚 Ders Detayları
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(summary).map(([lesson, data]) => (
                      <div key={lesson} className={`${getLessonColor(lesson)} p-6 rounded-lg border border-gray-200 relative`}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">{getLessonIcon(lesson)}</span>
                          <h5 className="font-bold text-lg text-gray-800">
                            {lesson}
                          </h5>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="text-center p-2 bg-white/70 rounded">
                            <div className="text-xs text-gray-600">Doğru</div>
                            <div className="text-lg font-bold text-green-600">
                              {data.correct}
                            </div>
                          </div>
                          
                          <div className="text-center p-2 bg-white/70 rounded">
                            <div className="text-xs text-gray-600">Yanlış</div>
                            <div className="text-lg font-bold text-red-600">
                              {data.wrong}
                            </div>
                          </div>
                          
                          <div className="text-center p-2 bg-white/70 rounded">
                            <div className="text-xs text-gray-600">Boş</div>
                            <div className="text-lg font-bold text-gray-500">
                              {data.skip}
                            </div>
                          </div>
                          
                          <div className="text-center p-2 bg-white/70 rounded">
                            <div className="text-xs text-gray-600">Net</div>
                            <div className="text-lg font-bold text-blue-600">
                              {calculateNet(data.correct, data.wrong).toFixed(1)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 via-green-500 to-red-500 transition-all duration-300"
                            style={{ width: `${((data.correct + data.wrong) / data.total) * 100}%` }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-600 text-center">
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