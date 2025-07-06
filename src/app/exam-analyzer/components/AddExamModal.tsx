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
        width: '95%',
        maxWidth: '1200px',
        maxHeight: '95vh',
        overflow: 'auto',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Yeni Sınav Ekle</h2>
        
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
              marginBottom: '1rem',
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Button
              onClick={handleClose}
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
              {showResponse ? 'Kaydet' : 'Goruntule'}
            </Button>
          </div>

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
      </div>
    </div>
  );
} 