import React from 'react';
import { SubjectDetailModalProps, ExamDetail } from '../types';
import { getSubjectDetails, getAnswerIcon, getAnswerColor } from '../utils/subjectDataUtils';

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  subjectName, 
  lessonName, 
  exams, 
  examCount 
}) => {
  if (!isOpen) return null;

  const { examDetails, allQuestions, stats } = getSubjectDetails(subjectName, lessonName, exams);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📊 Konu Detayı</h2>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{subjectName}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{lessonName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stats.totalQuestions === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Bu konu için veri bulunamadı</h3>
              <p className="text-gray-500">Seçilen konuya ait hiçbir soru veya sınav verisi mevcut değil.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
                  <div className="text-sm text-blue-600 font-medium">Toplam Soru</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{(stats.successRate * 100).toFixed(1)}%</div>
                  <div className="text-sm text-green-600 font-medium">Başarı Oranı</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.averageQuestionsPerExam.toFixed(1)}</div>
                  <div className="text-sm text-purple-600 font-medium">Ort. Soru/Sınav</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats.appearsInExams}</div>
                  <div className="text-sm text-orange-600 font-medium">Sınav Sayısı</div>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📈</span>
                  <span>Detaylı İstatistikler</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Doğru</span>
                    </span>
                    <span className="font-semibold">{stats.totalCorrect} ({(stats.successRate * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>❌</span>
                      <span>Yanlış</span>
                    </span>
                    <span className="font-semibold">{stats.totalWrong} ({(stats.errorRate * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>⭕</span>
                      <span>Boş</span>
                    </span>
                    <span className="font-semibold">{stats.totalSkip} ({(stats.skipRate * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Exams List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>Sınavlarda Performans ({examDetails.length} sınav)</span>
                </h3>
                <div className="space-y-3">
                  {examDetails.map(exam => (
                    <div key={exam.examId} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">📝 {exam.examId}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {exam.totalCount} soru
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span>✅</span>
                            <span className="font-medium">{exam.correctCount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>❌</span>
                            <span className="font-medium">{exam.wrongCount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>⭕</span>
                            <span className="font-medium">{exam.skipCount}</span>
                          </span>
                          <span className="font-semibold text-blue-600">
                            {(exam.successRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${exam.successRate * 100}%` }}
                        />
                      </div>

                      {/* Questions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {exam.questions.map((question, index) => (
                          <div key={`${question.questionNumber}-${index}`} className={`p-2 rounded-lg border ${getAnswerColor(question.answer)}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Soru {question.questionNumber}
                              </span>
                              <span className="text-lg">{getAnswerIcon(question.answer)}</span>
                            </div>
                            {question.rightAnswer !== '-' && question.givenAnswer !== '-' && (
                              <div className="text-xs mt-1">
                                <span>Doğru: {question.rightAnswer}</span>
                                {question.givenAnswer && (
                                  <span className="ml-2">Verilen: {question.givenAnswer}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 