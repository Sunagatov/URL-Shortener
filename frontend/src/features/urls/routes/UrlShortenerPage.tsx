import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/shared/auth/useAuth';
import { createUrlSchema, type CreateUrlFormData } from '@/features/urls/model/urlValidation';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import {
  useCreateShortUrl,
  type CreateUrlFormInput,
} from '@/features/urls/model/useCreateShortUrl';
import { LandingFeaturesSection } from '@/features/urls/ui/landing/LandingFeaturesSection';
import { LandingGuestCtaSection } from '@/features/urls/ui/landing/LandingGuestCtaSection';
import { LandingStatsSection } from '@/features/urls/ui/landing/LandingStatsSection';
import { UrlShortenerInputField } from '@/features/urls/ui/landing/UrlShortenerInputField';
import { UrlShortenerForm, UrlShortenerHero } from '@/features/urls/ui/landing/UrlShortenerHero';

const UrlShortenerPage: React.FC = () => {
  usePageTitle();
  const { isAuthenticated } = useAuth();
  const { clear, copiedShortUrl, copyShortUrl, loading, shortUrl, submit } = useCreateShortUrl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlFormInput, unknown, CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
  });

  const onSubmit = async (data: CreateUrlFormData) => {
    await submit(data);
  };

  const handleClear = () => {
    reset();
    clear();
  };

  return (
    <div className="w-full">
      <UrlShortenerHero
        shortUrl={shortUrl}
        copiedShortUrl={copiedShortUrl}
        isAuthenticated={isAuthenticated}
        onClear={handleClear}
        onCopy={copyShortUrl}
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
