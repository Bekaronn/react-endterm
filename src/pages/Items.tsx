import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, DollarSign, Briefcase } from 'lucide-react';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import type { RootState, AppDispatch } from '../store';
import { fetchJobsThunk, setQuery } from '../features/jobs/jobsSlice';

export default function Items() {
  const dispatch = useDispatch<AppDispatch>();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const { list, loadingList, errorList } = useSelector((state: RootState) => state.jobs);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    dispatch(fetchJobsThunk({ query: q }));
  }, [dispatch, q]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    dispatch(setQuery(v));

    if (v) setSearchParams({ q: v });
    else setSearchParams({});
  }

  const filteredJobs = useMemo(() => {
    return list.filter((job) => {
      const type = (job.job_types?.[0] ?? 'All').toLowerCase();
      const levelFromTags =
        job.tags?.find((tag) => ['junior', 'mid', 'senior'].includes(tag.toLowerCase())) ??
        'All';

      const typeMatches =
        selectedType === 'All' || type === selectedType.toLowerCase();
      const levelMatches =
        selectedLevel === 'All' ||
        levelFromTags.toLowerCase() === selectedLevel.toLowerCase();

      return typeMatches && levelMatches;
    });
  }, [list, selectedLevel, selectedType]);

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Next Job</h1>
          <p className="text-muted-foreground">Discover opportunities tailored to your skills</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              value={q}
              onChange={onChange}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition md:hidden"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-card-foreground mb-4">Job Type</h3>
                <div className="space-y-2">
                  {['All', 'Full-time', 'Part-time', 'Contract'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={selectedType === type}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Experience Level</h3>
                <div className="space-y-2">
                  {['All', 'Junior', 'Mid-level', 'Senior'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={selectedLevel === level}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="md:hidden mb-6 bg-card border border-border rounded-lg p-6 space-y-6 w-full">
              <div>
                <h3 className="font-semibold text-card-foreground mb-4">Job Type</h3>
                <div className="space-y-2">
                  {['All', 'Full-time', 'Part-time', 'Contract'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type-mobile"
                        value={type}
                        checked={selectedType === type}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Experience Level</h3>
                <div className="space-y-2">
                  {['All', 'Junior', 'Mid-level', 'Senior'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="level-mobile"
                        value={level}
                        checked={selectedLevel === level}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {loadingList && <Spinner />}
            {errorList && <ErrorBox>{errorList}</ErrorBox>}

            {!loadingList && !errorList && (
              <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const typeLabel = job.job_types?.[0] ?? 'N/A';
                    const levelLabel =
                      job.tags?.find((tag) =>
                        ['junior', 'mid', 'senior'].includes(tag.toLowerCase()),
                      ) ?? 'All';
                    return (
                      <Link key={job.slug} to={`/jobs/${job.slug}`}>
                        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition cursor-pointer">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="text-3xl" aria-hidden>
                                🧭
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-card-foreground hover:text-primary transition">
                                  {job.title}
                                </h3>
                                <p className="text-muted-foreground">{job.company_name}</p>
                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location || 'Worldwide'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    Not specified
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {typeLabel}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                {levelLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No jobs found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

