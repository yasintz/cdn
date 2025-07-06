import { useMemo, useState } from 'react';
import { UserAnswer, dersler } from '../modules/helpers';
import { parseExam } from '../modules/parseExam';
import { newImpl } from '../new';
import { useStore } from '../useStore';
import { Button } from '@/components/ui/button';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExamModal({ isOpen, onClose, onSuccess }: AddExamModalProps) {
  const { exams, addExam } = useStore();
  const [examNumber, setExamNumber] = useState(
    (parseInt(exams[exams.length - 1]?.id || '0', 10) + 1).toString()
  );
  const [value, setValue] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const response = useMemo(() => {
    try {
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

  const handleClose = () => {
    setExamNumber((parseInt(exams[exams.length - 1]?.id || '0', 10) + 1).toString());
    setValue('');
    setShowResponse(false);
    onClose();
  };

  const handleSave = () => {
    if (showResponse && response) {
      addExam(response.exam);
      onSuccess();
      handleClose();
    } else {
      setShowResponse(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-lg w-[95%] max-w-6xl max-h-[95vh] overflow-auto">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Yeni Sınav Ekle</h2>
        
        <div className="flex flex-col">
          <a
            href="https://drive.google.com/file/d/1trEqAMhrrWS9z8nwf9HpvZaSczRs8bpe/view?usp=sharing"
            className="text-xl my-3 text-blue-500 hover:text-blue-600 transition-colors"
            target="_blank"
          >
            Sinavimi Nasil Kopyalarim
          </a>
          <div className="mb-3 text-gray-700">
            Daha once eklenen sinavlar: {exams.map((i) => i.id).join(', ')}
          </div>
          <input
            value={examNumber}
            onChange={(e) => setExamNumber(e.target.value)}
            placeholder="Sinav Numarasi"
            className="border border-gray-300 rounded-lg p-3 mb-4 text-base focus:border-blue-500 outline-none transition-colors"
          />
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border border-gray-300 rounded-lg p-4 h-[400px] my-4 font-mono text-sm resize-y focus:border-blue-500 outline-none transition-colors"
            placeholder="Sınav verilerini buraya yapıştırın..."
          />

          <div className="flex gap-4 justify-end mb-4">
            <Button
              onClick={handleClose}
              className="bg-gray-500 text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-gray-600 transition-colors"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {showResponse ? 'Kaydet' : 'Goruntule'}
            </Button>
          </div>

          {showResponse && response && (
            <>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Ders</th>
                      <th className="border border-gray-300 p-2 text-center">Soru</th>
                      <th className="border border-gray-300 p-2 text-center">Dogru</th>
                      <th className="border border-gray-300 p-2 text-center">Yanlis</th>
                      <th className="border border-gray-300 p-2 text-center">Bos</th>
                      <th className="border border-gray-300 p-2 text-center">Net</th>
                      <th className="border border-gray-300 p-2 text-center">ORT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dersler.map((ders) => {
                      const data = response.result.analytics.lessonBasedData.find(
                        (i) => i.lesson === ders.name
                      )?.data;

                      return (
                        <tr key={ders.name} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-left font-medium">{ders.name}</td>
                          <td className="border border-gray-300 p-2 text-center">{ders.count}</td>
                          <td className="border border-gray-300 p-2 text-center text-green-600 font-medium">{data?.[UserAnswer.True]}</td>
                          <td className="border border-gray-300 p-2 text-center text-red-600 font-medium">{data?.[UserAnswer.False]}</td>
                          <td className="border border-gray-300 p-2 text-center text-gray-500 font-medium">{data?.[UserAnswer.Skip]}</td>
                          <td className="border border-gray-300 p-2 text-center text-blue-600 font-bold">{data?.Net}</td>
                          <td className="border border-gray-300 p-2 text-center"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <h3 className="text-center text-xl font-bold text-gray-800 mb-4">Konu Analizi</h3>
              
              {dersler.map((ders) => (
                <div key={ders.name} className="mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-center">No</th>
                          <th className="border border-gray-300 p-2 text-left">Konu</th>
                          <th className="border border-gray-300 p-2 text-center">DC</th>
                          <th className="border border-gray-300 p-2 text-center">OC</th>
                          <th className="border border-gray-300 p-2 text-center">SO</th>
                          <th className="border border-gray-300 p-2 text-center">CZM</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-500 text-white">
                          <td colSpan={6} className="border border-gray-300 p-2 font-bold text-center">{ders.name}</td>
                        </tr>
                        {Object.entries(response.exam.sinav[ders.name] || {}).map(
                          ([no, result]) => (
                            <tr key={result.question + no} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-1 text-center font-medium">{no}</td>
                              <td className="border border-gray-300 p-1 text-left">{result.question}</td>
                              <td className="border border-gray-300 p-1 text-center font-medium">{result.rightAnswer}</td>
                              <td className="border border-gray-300 p-1 text-center font-medium">{result.givenAnswer}</td>
                              <td 
                                className={`border border-gray-300 p-1 text-center font-bold ${
                                  result.answer === UserAnswer.False ? 'bg-red-400 text-white' : ''
                                }`}
                              >
                                {showUserAnswer[result.answer]}
                              </td>
                              <td className="border border-gray-300 p-1 text-center"></td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 