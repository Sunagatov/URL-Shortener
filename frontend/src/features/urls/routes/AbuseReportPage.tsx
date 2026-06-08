import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaFlag } from 'react-icons/fa';
import { reportAbuse } from '@/features/urls/api/urlsApi';
import { abuseReportSchema, type AbuseReportFormData } from '@/features/urls/model/abuseReportValidation';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { Button, Card, useToast } from '@/shared/ui';

const AbuseReportPage: React.FC = () => {
  usePageTitle('Report abuse');
  const toast = useToast();
  const [submittedHash, setSubmittedHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbuseReportFormData>({
    resolver: zodResolver(abuseReportSchema),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    if (url) {
      reset({ shortUrlOrHash: url });
    }
  }, [reset]);

  const onSubmit = async (data: AbuseReportFormData) => {
    setIsSubmitting(true);
    setSubmittedHash(null);
    try {
      const result = await reportAbuse(data);
      setSubmittedHash(result.urlHash);
      reset();
      toast.success('Abuse report submitted');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to submit abuse report'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Card className="border-[color:var(--card-border)] bg-[var(--card-bg)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <FaFlag className="h-4 w-4 text-red-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--text-primary)]">Report abuse</h1>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Send a suspicious short link for review.</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
              Short URL or code
            </label>
            <input
              {...register('shortUrlOrHash')}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
              placeholder="https://zuf.uk/abc12345"
            />
            {errors.shortUrlOrHash ? (
              <p className="mt-1 text-xs text-[color:var(--danger-text)]">{errors.shortUrlOrHash.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
              Reason
            </label>
            <textarea
              {...register('reason')}
              className="min-h-28 w-full resize-y rounded-xl border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
              placeholder="Phishing, malware, spam, impersonation, or another concern"
            />
            {errors.reason ? (
              <p className="mt-1 text-xs text-[color:var(--danger-text)]">{errors.reason.message}</p>
            ) : null}
          </div>

          <Button type="submit" loading={isSubmitting}>
            Submit report
          </Button>
        </form>

        {submittedHash ? (
          <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Report received for {submittedHash}.
          </p>
        ) : null}
      </Card>
    </div>
  );
};

export default AbuseReportPage;
