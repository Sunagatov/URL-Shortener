import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubEnv('VITE_BACKEND_REST_API_URL', 'http://localhost:8080');

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const localStorageShim = new MemoryStorage();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageShim,
});

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageShim,
});
