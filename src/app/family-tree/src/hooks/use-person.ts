import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../app/ctx';

export default function usePerson() {
  const { person: personList } = useAppContext();
  const { personId } = useParams<{ personId: string }>();
  const person = useMemo(
    () => personList.find((p) => p.id === personId),
    [personId, personList]
  );

  return person;
}
