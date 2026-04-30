export const urlCopyMessages = {
  error: 'Unable to copy URL.',
  success: 'Copied to clipboard',
} as const;

export const urlDeleteMessages = {
  confirmMessage: 'This short link will stop working immediately and cannot be restored.',
  confirmTitle: 'Delete URL?',
  failedBatch: 'Failed to delete some URLs.',
  failedSingle: 'Failed to delete URL mapping.',
  success: 'URL deleted successfully.',
} as const;
