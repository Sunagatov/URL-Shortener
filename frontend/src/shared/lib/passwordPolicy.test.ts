import { getNewPasswordError, passwordLength } from './passwordPolicy';

describe('new password policy', () => {
  it('counts Unicode code points after NFC, allowing 64 emoji but rejecting eight', () => {
    expect(passwordLength('😀'.repeat(8))).toBe(8);
    expect(getNewPasswordError('😀'.repeat(8))).not.toBeNull();
    expect(getNewPasswordError('😀'.repeat(64))).toBeNull();
    expect(passwordLength('e\u0301'.repeat(64))).toBe(64);
    expect(getNewPasswordError('e\u0301'.repeat(64))).toBeNull();
    expect(getNewPasswordError('😀'.repeat(65))).not.toBeNull();
  });
  it('rejects obvious common-password variants without composition rules', () => {
    expect(getNewPasswordError('passwordpassword')).not.toBeNull();
    expect(getNewPasswordError('passwordpassword123!')).not.toBeNull();
    expect(getNewPasswordError('long unique comet river phrase')).toBeNull();
  });
});
