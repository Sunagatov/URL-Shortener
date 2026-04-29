import { useEffect, useState } from 'react';
import { z } from 'zod';
import { createUrl } from '@/features/urls/api/urlsApi';
import { createUrlSchema, type CreateUrlFormData } from '@/features/urls/model/urlValidation';
import { useClipboard } from '@/shared/lib/useClipboard';
import { useApi } from '@/shared/api/useApi';
import { useToast } from '@/shared/ui';

export function useCreateShortUrl() {
  const { copiedValue, copyValue, clearCopiedValue } = useClipboard();
  const { execute, error, loading } = useApi<{ shortUrl: string }>();
  const toast = useToast();
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error.errorMessage);
    }
  }, [error, toast]);

  const submit = async (data: CreateUrlFormData) => {
    const result = await execute(() => createUrl(data));

    if (result) {
      setShortUrl(result.shortUrl);
    }
  };

  const clear = () => {
    setShortUrl('');
    clearCopiedValue();
  };

  const copyShortUrl = async () => {
    const didCopy = await copyValue(shortUrl);

    if (!didCopy) {
      toast.error('Unable to copy URL.');
      return;
    }

    toast.success('Copied to clipboard');
  };

  return {
    clear,
    copiedShortUrl: copiedValue,
    copyShortUrl,
    loading,
    shortUrl,
    submit,
  };
}

export type CreateUrlFormInput = z.input<typeof createUrlSchema>;
