export const copyToClipboard = async (value: string): Promise<boolean> => {
  if (!navigator?.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};
