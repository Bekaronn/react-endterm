import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MapPin, DollarSign, Briefcase, Trash2, FileText, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/Spinner';
import ErrorBox from '@/components/ErrorBox';
import { fetchJobBySlug } from '@/services/jobsService';
import type { Job } from '@/services/jobsService';
import { useApplications } from '@/hooks/useApplications';
import type { ApplicationEntry } from '@/services/applicationsService';
import { useTranslation } from 'react-i18next';

export default function Applications() {
  const { applications, loading, error, removeApplication } = useApplications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const { t } = useTranslation();

  const appMap = useMemo<Record<string, ApplicationEntry>>(
    () =>
      applications.reduce((acc, cur) => {
        acc[cur.jobId] = cur;
        return acc;
      }, {} as Record<string, ApplicationEntry>),
    [applications],
  );

  useEffect(() => {
    if (applications.length === 0) {
      setJobs([]);
      return;
    }
    setLoadingJobs(true);
    Promise.all(applications.map((item) => fetchJobBySlug(item.jobId)))
      .then((items) => {
        setJobs(items.filter((job): job is Job => job !== null));
      })
      .finally(() => setLoadingJobs(false));
  }, [applications]);

  const handleRemove = async (jobId: string) => {
    try {
      await removeApplication(jobId);
    } catch {
      // errors handled in hook
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (loadingJobs && applications.length > 0) return <Spinner />;

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              {t('applications.title', { defaultValue: 'Мои отклики' })}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {applications.length === 0
              ? t('applications.empty', { defaultValue: 'Вы еще не откликались на вакансии' })
              : t('applications.total', { defaultValue: 'Всего откликов: {{count}}', count: applications.length })}
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16">
            <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-6">
              {t('applications.emptySubtitle', { defaultValue: 'Пока нет сохраненных откликов.' })}
            </p>
            <Link to="/jobs">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('applications.findJobs', { defaultValue: 'Найти вакансии' })}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length === 0 && applications.length > 0 ? (
              <div className="text-center py-12">
                <Spinner />
                <p className="text-muted-foreground mt-4">Загружаем отклики...</p>
              </div>
            ) : (
              jobs.map((job) => {
                const app = appMap[job.slug];
                const typeLabel =
                  job.job_types && job.job_types.length > 0
                    ? job.job_types.join(' / ')
                    : t('applications.notSpecified', { defaultValue: 'Не указано' });
                const salaryLabel = job.salary || t('applications.notSpecified', { defaultValue: 'Не указано' });
                const tagsLabel =
                  job.tags && job.tags.length > 0
                    ? job.tags.slice(0, 3).join(' • ')
                    : t('applications.notSpecified', { defaultValue: 'Не указано' });

                return (
                  <div
                    key={job.slug}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <Link to={`/jobs/${job.slug}`} className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl overflow-hidden">
                            {job.avatarURL ? (
                              <img
                                src={job.avatarURL}
                                alt={`${job.company_name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span aria-hidden>🧭</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-card-foreground hover:text-primary transition mb-1">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground mb-3">{job.company_name}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location || t('applications.notSpecified', { defaultValue: 'Не указано' })}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {salaryLabel}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {typeLabel}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-4 h-4 inline-flex items-center justify-center text-xs">🏷️</span>
                                {tagsLabel}
                              </div>
                            </div>

                            {app?.comment ? (
                              <div className="mt-3 text-sm text-muted-foreground flex items-start gap-2">
                                <Quote className="w-4 h-4 mt-0.5 text-primary" />
                                <span>{app.comment}</span>
                              </div>
                            ) : null}

                            {(app?.firstName || app?.lastName || app?.phone) && (
                              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-card-foreground">
                                    {`${app.firstName ?? ''} ${app.lastName ?? ''}`.trim() ||
                                      t('applications.notSpecified', { defaultValue: 'Не указано' })}
                                  </span>
                                </div>
                                {app.phone && <div>{app.phone}</div>}
                              </div>
                            )}

                            <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              {app?.resumeUrl ? (
                                <a
                                  href={app.resumeUrl}
                                  className="text-primary hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {app.resumeName ?? t('applications.resume', { defaultValue: 'Резюме' })}
                                </a>
                              ) : (
                                <span>
                                  {app?.resumeName ??
                                    t('applications.resumeMissing', { defaultValue: 'Резюме не приложено' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {job.remote !== undefined && (
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                            {job.remote ? 'Remote' : 'On-site'}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemove(job.slug)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Удалить отклик"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}

