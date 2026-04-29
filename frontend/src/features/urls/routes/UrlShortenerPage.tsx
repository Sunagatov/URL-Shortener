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
          <input
            {...register('originalUrl')}
            type="url"
            placeholder="Paste your long URL here…"
            className="h-full w-full rounded-xl border border-white/7 bg-[#11182b] py-3.5 pl-11 pr-4 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </UrlShortenerForm>
        {errors.originalUrl ? (
          <p className="-mt-4 mb-6 flex items-center gap-1.5 px-3 text-sm text-red-400">
            <span>⚠</span> {errors.originalUrl.message}
          </p>
        ) : null}
      </UrlShortenerHero>

      <LandingFeaturesSection />
      <LandingStatsSection />
      {!isAuthenticated ? <LandingGuestCtaSection /> : null}
    </div>
  );
};

export default UrlShortenerPage;
