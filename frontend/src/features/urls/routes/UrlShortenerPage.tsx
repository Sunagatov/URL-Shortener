import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUrl } from '@/features/urls/api/urlsApi';
import { urlCopyMessages } from '@/features/urls/lib/urlMessages';
import { useAuth } from '@/shared/auth/useAuth';
import { createUrlSchema, type CreateUrlFormData } from '@/features/urls/model/urlValidation';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { LandingFeaturesSection } from '@/features/urls/ui/landing/LandingFeaturesSection';
import { LandingGuestCtaSection } from '@/features/urls/ui/landing/LandingGuestCtaSection';
import { LandingStatsSection } from '@/features/urls/ui/landing/LandingStatsSection';
import { UrlShortenerInputField } from '@/features/urls/ui/landing/UrlShortenerInputField';
import { UrlShortenerForm, UrlShortenerHero } from '@/features/urls/ui/landing/UrlShortenerHero';
import { useClipboard } from '@/shared/lib/useClipboard';
import { useApi } from '@/shared/api/useApi';
import { useToast } from '@/shared/ui';

type CreateUrlFormInput = z.input<typeof createUrlSchema>;

const UrlShortenerPage: React.FC = () => {
  usePageTitle();
  const { isAuthenticated } = useAuth();
  const { copiedValue, copyValue, clearCopiedValue } = useClipboard();
  const { execute, error, loading } = useApi<{ shortUrl: string }>();
  const toast = useToast();
  const [shortUrl, setShortUrl] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlFormInput, unknown, CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
  });

  useEffect(() => {
    if (error) {
      toast.error(error.errorMessage);
    }
  }, [error, toast]);

  const onSubmit = async (data: CreateUrlFormData) => {
    const result = await execute(() => createUrl(data), { action: 'urls.create_short_url' });

    if (result) {
      setShortUrl(result.shortUrl);
    }
  };

  const handleClear = () => {
    reset();
    setShortUrl('');
    clearCopiedValue();
  };

  const handleCopyShortUrl = async () => {
    const didCopy = await copyValue(shortUrl);

    if (!didCopy) {
      toast.error(urlCopyMessages.error);
      return;
    }

    toast.success(urlCopyMessages.success);
  };

  return (
    <div className="w-full">
      <UrlShortenerHero
        shortUrl={shortUrl}
        copiedShortUrl={copiedValue}
        isAuthenticated={isAuthenticated}
        onClear={handleClear}
        onCopy={handleCopyShortUrl}
      >
        <UrlShortenerForm onSubmit={handleSubmit(onSubmit)} isLoading={loading}>
          <UrlShortenerInputField
            registration={register('originalUrl')}
            error={errors.originalUrl}
          />
        </UrlShortenerForm>
      </UrlShortenerHero>

      <LandingFeaturesSection />
      <LandingStatsSection />
      {!isAuthenticated ? <LandingGuestCtaSection /> : null}
    </div>
  );
};

export default UrlShortenerPage;
