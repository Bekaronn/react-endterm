import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, MapPin, DollarSign, Briefcase, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../context/AuthProvider';
import { loadFavoritesThunk, removeFavoriteThunk } from '../features/favorites/favoritesSlice';
import { fetchJobBySlug } from '../services/jobsService';
import type { AppDispatch, RootState } from '../store';
import type { Job } from '../services/jobsService';

export default function Bookmarks() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { jobIds, loading, error } = useSelector((state: RootState) => state.favorites);
  const [favoriteJobs, setFavoriteJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    dispatch(loadFavoritesThunk({ uid: user?.uid ?? null }));
  }, [dispatch, user?.uid]);

  // Загружаем детали вакансий для отображения
  useEffect(() => {
    if (jobIds.length === 0) {
      setFavoriteJobs([]);
      return;
    }

    setLoadingJobs(true);
    Promise.all(jobIds.map((slug) => fetchJobBySlug(slug)))
      .then((jobs) => {
        setFavoriteJobs(jobs.filter((job): job is Job => job !== null));
        setLoadingJobs(false);
      })
      .catch(() => {
        setLoadingJobs(false);
      });
  }, [jobIds]);

  const handleRemove = async (jobId: string) => {
    try {
      await dispatch(removeFavoriteThunk({ uid: user?.uid ?? null, jobId })).unwrap();
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (loadingJobs && jobIds.length > 0) return <Spinner />;

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">My Bookmarks</h1>
          </div>
          <p className="text-muted-foreground">
            {jobIds.length === 0
              ? 'No bookmarked jobs yet. Start exploring and save your favorites!'
              : `You have ${jobIds.length} bookmarked ${jobIds.length === 1 ? 'job' : 'jobs'}`}
          </p>
        </div>

        {jobIds.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-6">Your bookmarks list is empty</p>
            <Link to="/jobs">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteJobs.length === 0 && jobIds.length > 0 ? (
              <div className="text-center py-12">
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading bookmarked jobs...</p>
              </div>
            ) : (
              favoriteJobs.map((job) => {
                const typeLabel =
                  job.job_types && job.job_types.length > 0
                    ? job.job_types.join(' / ')
                    : 'Not specified';
                const salaryLabel = job.salary || 'Not specified';
                const tagsLabel =
                  job.tags && job.tags.length > 0 ? job.tags.slice(0, 3).join(' • ') : 'Not specified';

                return (
                  <div
                    key={job.slug}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <Link to={`/jobs/${job.slug}`} className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl" aria-hidden>
                            🧭
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-card-foreground hover:text-primary transition mb-1">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground mb-3">{job.company_name}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location || 'Worldwide'}
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
                          aria-label="Remove from bookmarks"
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

