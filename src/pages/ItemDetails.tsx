import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, DollarSign, Briefcase, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { fetchJobBySlugThunk } from '../features/jobs/jobsSlice';
import type { AppDispatch, RootState } from '../store';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedJob: job, loadingJob, errorJob } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobBySlugThunk(id));
    }
  }, [dispatch, id]);

  const levelLabel = useMemo(() => {
    const match = job?.tags?.find((tag) =>
      ['junior', 'mid', 'senior'].includes(tag.toLowerCase()),
    );
    return match ? match : 'Not specified';
  }, [job]);

  if (loadingJob) return <Spinner />;
  if (errorJob) return <ErrorBox>{errorJob}</ErrorBox>;
  if (!job) {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Job not found</p>
          <Link to="/jobs">
            <Button className="mt-4">Back to Jobs</Button>
          </Link>
        </div>
      </main>
    );
  }

  const typeLabel = job.job_types?.[0] ?? 'Not specified';
  const salaryLabel = 'Not specified';
  const postedLabel =
    job.updated_at && typeof job.updated_at === 'string'
      ? job.updated_at
      : undefined;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      // simple feedback
      alert('Link copied to clipboard');
    } catch {
      alert('Unable to copy link');
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
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
                  {postedLabel && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {postedLabel}
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
                  Apply Now
                </Button>
              </a>
            ) : (
              <Button disabled className="bg-primary text-primary-foreground">
                Apply Now
              </Button>
            )}
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {job.description && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Role</h2>
                <div
                  className="text-muted-foreground leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>
            )}

            {job.tags?.length ? (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Tags</h2>
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
              <h3 className="font-bold text-card-foreground mb-4">Quick Facts</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Job Type</p>
                  <p className="font-semibold text-card-foreground">{typeLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Experience Level</p>
                  <p className="font-semibold text-card-foreground">{levelLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-card-foreground">{job.location || 'Worldwide'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Salary Range</p>
                  <p className="font-semibold text-card-foreground">{salaryLabel}</p>
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

