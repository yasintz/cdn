import { useState } from 'react';
import { generateId } from '../helper/generate-id';

export default function useId() {
  const [id] = useState(() => generateId(5, 'a'));

  return `id_${id}`;
}
