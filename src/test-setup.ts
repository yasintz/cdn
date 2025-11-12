import { vi } from 'vitest';

// Mock localStorage for all tests - must run before any modules that use it
const createMockStorage = () => {
  const storage = new Map<string, string>();
  return {
    getItem: (key: string): string | null => {
      return storage.get(key) ?? null;
    },
    setItem: (key: string, value: string): void => {
      storage.set(key, value);
    },
    removeItem: (key: string): void => {
      storage.delete(key);
    },
    clear: (): void => {
      storage.clear();
    },
    get length(): number {
      return storage.size;
    },
    key: (index: number): string | null => {
      const keys = Array.from(storage.keys());
      return keys[index] ?? null;
    },
  };
};

// Set up localStorage mock globally
const mockStorage = createMockStorage();
vi.stubGlobal('localStorage', mockStorage);

