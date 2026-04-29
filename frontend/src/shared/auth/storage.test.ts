import { STORAGE_KEYS, storage } from '@/shared/auth/storage';

describe('storage.getUser', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when the user key is missing', () => {
    expect(storage.getUser()).toBeNull();
  });

  it('returns null for a literal undefined value', () => {
    localStorage.setItem(STORAGE_KEYS.USER, 'undefined');

    expect(storage.getUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBe('undefined');
  });

  it('returns a parsed user for valid JSON', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    expect(storage.getUser()).toEqual(user);
  });

  it('does not throw and clears malformed JSON', () => {
    localStorage.setItem(STORAGE_KEYS.USER, '{bad json');

    expect(storage.getUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });
});
