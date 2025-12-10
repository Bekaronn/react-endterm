import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, DollarSign, Briefcase, Calendar, ArrowLeft, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../context/AuthProvider';
import { fetchJobBySlugThunk } from '../features/jobs/jobsSlice';
import { addFavoriteThunk, removeFavoriteThunk, loadFavoritesThunk } from '../features/favorites/favoritesSlice';
import type { AppDispatch, RootState } from '../store';
import { useTranslation } from 'react-i18next';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { selectedJob: job, loadingJob, errorJob } = useSelector((state: RootState) => state.jobs);
  const { jobIds: favoriteIds } = useSelector((state: RootState) => state.favorites);

  useEffect(() => {
    dispatch(loadFavoritesThunk({ uid: user?.uid ?? null }));
  }, [dispatch, user?.uid]);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobBySlugThunk(id));
    }
  }, [dispatch, id]);

  const isFavorite = job ? favoriteIds.includes(job.slug) : false;

  const handleToggleFavorite = async () => {
    if (!job) return;
    try {
      if (isFavorite) {
        await dispatch(removeFavoriteThunk({ uid: user?.uid ?? null, jobId: job.slug })).unwrap();
        toast.success(t('item.toast.remove'));
      } else {
        await dispatch(addFavoriteThunk({ uid: user?.uid ?? null, jobId: job.slug })).unwrap();
        toast.success(t('item.toast.add'));
      }
    } catch (err) {
      toast.error(isFavorite ? t('item.toast.removeFail') : t('item.toast.addFail'));
    }
  };

  const levelLabel = useMemo(() => {
    const match = job?.tags?.find((tag) =>
      ['junior', 'mid', 'senior'].includes(tag.toLowerCase()),
    );
    return match ? match : t('item.notSpecified');
  }, [job, t]);

  const typeLabel = job?.job_types?.length ? job.job_types.join(', ') : t('item.notSpecified');
  const salaryLabel = job?.salary && job.salary.trim() !== '' ? job.salary : t('item.notSpecified');
  const postedLabel =
    job?.updated_at && typeof job.updated_at === 'string'
      ? job.updated_at
      : undefined;
  const createdLabel =
    job?.created_at && typeof job.created_at === 'string'
      ? job.created_at
      : undefined;
  const remoteLabel =
    typeof job?.remote === 'boolean'
      ? (job.remote ? t('item.remoteTrue') : t('item.remoteFalse'))
      : t('item.notSpecified');

  if (loadingJob) return <Spinner />;
  if (errorJob) return <ErrorBox>{errorJob}</ErrorBox>;
  if (!job) {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">{t('item.notFound')}</p>
          <Link to="/jobs">
            <Button className="mt-4">{t('item.back')}</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: job.title,
      text: `Check out ${job.title} at ${job.company_name}`,
      url,
    };

    const tryCopy = async () => {
      if (!navigator.clipboard?.writeText) {
        toast.info('Sharing is not supported in this browser');
        return false;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        return true;
      } catch {
        toast.error('Unable to copy link');
        return false;
      }
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Even if share succeeds, also copy for convenience.
        await tryCopy();
        return;
      } catch (error) {
        // Ignore user cancellations, surface real failures
        if (error instanceof DOMException && error.name === 'AbortError') {
          await tryCopy();
          return;
        }
        toast.error('Unable to open share options');
      }
    }

    await tryCopy();
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('item.back')}
        </button>

        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl" aria-hidden>
                🧭
              </div>
              <div>
                <h1 className="text-4xl font-bold text-card-foreground mb-2">{job.title}</h1>
                <p className="text-xl text-muted-foreground mb-4">{job.company_name}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location || t('item.notSpecified')}
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
                    <Calendar className="w-4 h-4" />
                    {remoteLabel}
                  </div>
                  {postedLabel && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {postedLabel}
                    </div>
                  )}
                  {createdLabel && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {createdLabel}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold flex-shrink-0">
              {levelLabel}
            </span>
          </div>

          <div className="flex gap-4 flex-wrap">
            {job.url ? (
              <a href={job.url} target="_blank" rel="noreferrer">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('item.apply')}
                </Button>
              </a>
            ) : (
              <Button disabled className="bg-primary text-primary-foreground">
                {t('item.apply')}
              </Button>
            )}
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              onClick={handleToggleFavorite}
              className={isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : ''}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? t('item.bookmarked') : t('item.bookmark')}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {t('item.share')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {job.description && (
              <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('item.about')}</h2>
                <div
                  className="text-muted-foreground leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>
            )}

            {job.tags?.length ? (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">{t('item.tags')}</h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold text-card-foreground mb-4">{t('item.quickFactsTitle', { defaultValue: 'Quick Facts' })}</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.company')}</p>
                  <p className="font-semibold text-card-foreground">{job.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.jobTypes')}</p>
                  <p className="font-semibold text-card-foreground">{typeLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.location')}</p>
                  <p className="font-semibold text-card-foreground">{job.location || t('item.notSpecified')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.remote')}</p>
                  <p className="font-semibold text-card-foreground">{remoteLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.salary')}</p>
                  <p className="font-semibold text-card-foreground">{salaryLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.created')}</p>
                  <p className="font-semibold text-card-foreground">{createdLabel ?? t('item.notSpecified')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('item.quickFacts.updated')}</p>
                  <p className="font-semibold text-card-foreground">{postedLabel ?? t('item.notSpecified')}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold text-card-foreground mb-4">About {job.company_name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {job.company_name} is hiring talented professionals to build world-class products.
              </p>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                View all jobs at {job.company_name}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

