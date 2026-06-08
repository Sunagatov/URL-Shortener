import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaChevronDown, FaTag, FaClock } from 'react-icons/fa';
import { createUrl } from '@/features/urls/api/urlsApi';
import { urlCopyMessages } from '@/features/urls/lib/urlMessages';
import { useAuth } from '@/shared/auth/useAuth';
import { createUrlSchema, type CreateUrlFormData } from '@/features/urls/model/urlValidation';
import type { CreateUrlRequest } from '@/features/urls/types/url';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { LandingFeaturesSection } from '@/features/urls/ui/landing/LandingFeaturesSection';
import { LandingGuestCtaSection } from '@/features/urls/ui/landing/LandingGuestCtaSection';
import { LandingStatsSection } from '@/features/urls/ui/landing/LandingStatsSection';
import { UrlShortenerInputField } from '@/features/urls/ui/landing/UrlShortenerInputField';
import { UrlShortenerForm, UrlShortenerHero } from '@/features/urls/ui/landing/UrlShortenerHero';
import { useClipboard } from '@/shared/lib/useClipboard';
import { useApi } from '@/shared/api/useApi';
import { TurnstileWidget, useToast } from '@/shared/ui';
import { features } from '@/shared/config/features';
import { useTurnstileVerification } from '@/shared/hooks/useTurnstileVerification';

type CreateUrlFormInput = z.input<typeof createUrlSchema>;

const UrlShortenerPage: React.FC = () => {
  usePageTitle();
  const { isAuthenticated } = useAuth();
  const { copiedValue, copyValue, clearCopiedValue } = useClipboard();
  const { execute, error, loading } = useApi<{ shortUrl: string }>();
  const toast = useToast();
  const turnstile = useTurnstileVerification(features.urlCreateTurnstile);
  const [shortUrl, setShortUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    if (!turnstile.requireVerified()) {
      return;
    }

    const payload: CreateUrlRequest = {
      originalUrl: data.originalUrl,
      ...(features.urlCreateTurnstile ? { turnstileToken: turnstile.token } : {}),
    };
    if (data.customAlias) payload.customAlias = data.customAlias;
    if (data.daysCount) payload.daysCount = data.daysCount;
    const result = await execute(() => createUrl(payload), {
      action: 'urls.create_short_url',
      onError: () => turnstile.resetChallenge(),
    });

    if (result) {
      setShortUrl(result.shortUrl);
      turnstile.resetChallenge();
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
        <UrlShortenerForm
          onSubmit={handleSubmit(onSubmit)}
          isLoading={loading}
          challenge={
            features.urlCreateTurnstile ? (
              <div className="mt-2">
                {turnstile.error ? (
                  <p className="mb-2 text-xs text-[color:var(--danger-text)]">{turnstile.error}</p>
                ) : null}
                <TurnstileWidget
                  action="url_create"
                  appearance="always"
                  onClear={turnstile.clearToken}
                  onVerify={turnstile.handleVerify}
                  size="normal"
                  widgetRef={turnstile.widgetRef}
                />
              </div>
            ) : null
          }
          advancedOptions={
            <div className="mt-2 px-1.5">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center gap-1.5 text-xs text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-secondary)]"
              >
                <FaChevronDown
                  className={`h-2.5 w-2.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                />
                Advanced options
              </button>
              {showAdvanced && (
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="relative">
                    <FaTag className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input
                      {...register('customAlias')}
                      placeholder="Custom alias (e.g. my-link)"
                      className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--input-bg)] py-2.5 pl-9 pr-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:border-[color:var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                    />
                    {errors.customAlias && (
                      <p className="mt-1 text-xs text-[color:var(--danger-text)]">
                        {errors.customAlias.message}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <FaClock className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <select
                      {...register('daysCount')}
                      defaultValue=""
                      className="w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[var(--input-bg)] py-2.5 pl-9 pr-3 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                    >
                      <option value="">Expires in 1 year (default)</option>
                      <option value="1">1 day</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">6 months</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          }
        >
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
