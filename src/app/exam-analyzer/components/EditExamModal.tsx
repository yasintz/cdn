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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg w-[95%] max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Sınav Düzenle
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-3 py-3 mb-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Exam ID */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-800">
              Sınav ID
            </label>
            <input
              type="text"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-80 px-2 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Lessons Tables */}
          <div className="grid gap-8">
            {lessonsOrder.map(lessonName => {
              const lessonData = lessonsData[lessonName];
              
              if (!lessonData || Object.keys(lessonData).length === 0) {
                return null;
              }

              const questions = Object.entries(lessonData).sort(([a], [b]) => parseInt(a) - parseInt(b));

              return (
                <div key={lessonName} className="break-inside-avoid">
                  {/* Lesson Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-gray-800">
                    <h3 className="text-base font-semibold text-gray-800">
                      {lessonName}
                    </h3>
                    <button
                      onClick={() => addQuestion(lessonName)}
                      className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-gray-600 cursor-pointer text-sm flex items-center gap-1 hover:bg-gray-100 transition-colors"
                      title="Soru Ekle"
                    >
                      <Plus size={14} />
                      Soru Ekle
                    </button>
                  </div>

                  {/* Questions Table */}
                  <table className="w-full border-collapse text-sm bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left border-r border-gray-300 w-16 font-medium">
                          No
                        </th>
                        <th className="p-2 text-left border-r border-gray-300 font-medium">
                          Soru
                        </th>
                        <th className="p-2 text-center border-r border-gray-300 w-20 font-medium">
                          Doğru
                        </th>
                        <th className="p-2 text-center border-r border-gray-300 w-20 font-medium">
                          Verilen
                        </th>
                        <th className="p-2 text-center border-r border-gray-300 w-20 font-medium">
                          Durum
                        </th>
                        <th className="p-2 text-center w-10 font-medium">
                          ⚙️
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map(([questionNumber, questionData]) => (
                        <tr key={questionNumber} className="border-b border-gray-200">
                          <td className="p-2 border-r border-gray-200 font-medium text-gray-600">
                            {questionNumber}
                          </td>
                          <td className="p-2 border-r border-gray-200">
                            <input
                              type="text"
                              value={questionData.question}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'question', e.target.value)}
                              placeholder="Soru metnini girin..."
                              className="w-full px-1 py-1 border-none outline-none text-sm bg-transparent focus:bg-gray-50 transition-colors"
                            />
                          </td>
                          <td className="p-2 text-center border-r border-gray-200">
                            <select
                              value={questionData.rightAnswer}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'rightAnswer', e.target.value)}
                              className="w-full px-1 py-1 border-none outline-none text-sm bg-transparent text-center focus:bg-gray-50 transition-colors"
                            >
                              <option value="">-</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                            </select>
                          </td>
                          <td className="p-2 text-center border-r border-gray-200">
                            <select
                              value={questionData.givenAnswer}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'givenAnswer', e.target.value)}
                              className="w-full px-1 py-1 border-none outline-none text-sm bg-transparent text-center focus:bg-gray-50 transition-colors"
                            >
                              <option value="">-</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                            </select>
                          </td>
                          <td className="p-2 text-center border-r border-gray-200">
                            <select
                              value={questionData.answer}
                              onChange={(e) => updateQuestion(lessonName, questionNumber, 'answer', e.target.value as UserAnswer)}
                              className="w-full px-1 py-1 border-none outline-none text-sm bg-transparent text-center focus:bg-gray-50 transition-colors"
                            >
                              <option value={UserAnswer.True}>✓ Doğru</option>
                              <option value={UserAnswer.False}>✗ Yanlış</option>
                              <option value={UserAnswer.Skip}>— Boş</option>
                              <option value={UserAnswer.Cancel}>⊗ İptal</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removeQuestion(lessonName, questionNumber)}
                              className="p-1 rounded border-none bg-transparent text-red-600 cursor-pointer text-xs hover:bg-red-50 transition-colors"
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
        <div className="px-6 py-4 border-t border-gray-300 flex gap-3 justify-end bg-gray-50">
          <Button
            onClick={handleClose}
            disabled={isLoading}
            className={`bg-transparent text-gray-600 border border-gray-300 px-4 py-2 rounded text-sm ${
              isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
            }`}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className={`text-white border-none px-4 py-2 rounded text-sm flex items-center gap-2 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
            }`}
          >
            <Save size={14} />
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
} 