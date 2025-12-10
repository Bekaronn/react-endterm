import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, MapPin, DollarSign, Briefcase, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Убедитесь, что пути к компонентам верны для вашего проекта
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../context/AuthProvider';
import type { RootState, AppDispatch } from '../store';
import { fetchJobsThunk, setQuery } from '../features/jobs/jobsSlice';
import { addFavoriteThunk, removeFavoriteThunk, loadFavoritesThunk } from '../features/favorites/favoritesSlice';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const JOB_TYPE_OPTIONS = [
  'All',
  'Apprenticeship',
  'Contract',
  'Dual studies',
  'Experienced',
  'Freelance',
  'Full-time',
  'Full-time fixed-term',
  'Full-time permanent',
  'Interim',
  'Internship',
  'Junior',
  'Management',
  'Manager',
  'Part-time',
  'Senior',
  'Side',
  'Team Lead',
  'Thesis',
  'Voluntary',
  'Working student',
  'berufseinstieg',
  'berufserfahren',
  'entry',
  'experienced',
  'geschäftsleitung',
  'hilfstätigkeit / student',
  'manager',
  'mid',
  'no experience required / student',
  'professional / experienced',
  'teamleitung',
];

const TAG_OPTIONS = [
  'All',
  'AI',
  'Account Management',
  'Accounting',
  'Accounts Receivable',
  'Administration',
  'Advisory',
  'Affiliate',
  'Agency',
  'Amazon',
  'Analysis',
  'Analytics',
  'Applications Administration',
  'Architecture',
  'Artificial Intelligence',
  'Asset',
  'Assistant',
  'Audit',
  'Auditor',
  'Automation',
  'Automation Engineering',
  'Automotive Engineering',
  'B2B',
  'Backend',
  'Banking',
  'Brand Management',
  'Branding',
  'Building',
  'Business',
  'Business Analysis',
  'Business Consulting',
  'Business Development',
  'Business Intelligence',
  'Business Operations',
  'CRM',
  'CX',
  'Campaign Management',
  'Category Management',
  'Chemistry',
  'Chief Executives',
  'Cloud',
  'Coaching',
  'Cobol',
  'Community',
  'Compliance',
  'Construction',
  'Consulting',
  'Content',
  'Content Creation',
  'Controlling',
  'Copywriting',
  'Corporate Communication',
  'Creative',
  'Creator',
  'Customer Service',
  'Customer Success',
  'Data',
  'Data Center',
  'Data Engineer',
  'Data Processing',
  'Data Protection',
  'Data Scientist',
  'Database',
  'Design',
  'DevOps',
  'Development',
  'Digital Media',
  'Direct Marketing',
  'Directors',
  'Distribution Marketing',
  'Driver',
  'E-Commerce',
  'ERP',
  'Education',
  'Electrical',
  'Electronics',
  'Embedded Systems',
  'Engagement',
  'Engineering',
  'Entrepreneurship',
  'Executive Assistant',
  'Facility Management',
  'Fashion',
  'Field Sales',
  'Field Service',
  'Finance',
  'Firmware Development',
  'Fitness',
  'Fonds Management',
  'Frontend',
  'Full Stack',
  'Gastronomy',
  'Google Ads',
  'Graphic Design',
  'Growth',
  'HR',
  'Hardware',
  'Hardware Design',
  'Health',
  'Healthcare',
  'Healthtech',
  'Helpdesk',
  'IT',
  'IT Architecture',
  'IT Security',
  'IT Support',
  'Industrial Design',
  'Influencer',
  'Influencer Marketing',
  'Information Systems',
  'Information technology',
  'Infrastructure',
  'Inspection',
  'Internet and software',
  'Java',
  'Junior',
  'Key Account Management',
  'Labor Law',
  'Lead',
  'Leadership',
  'Legal',
  'Logistics',
  'M&A',
  'Machine Learning',
  'Maintenance',
  'Management',
  'Marketing',
  'Marketing Assistant',
  'Marketing Manager',
  'Marketing and Communication',
  'Materials Administration and Logistics',
  'Mathematics',
  'Mechanics',
  'Media',
  'Medical Technology',
  'Mergers & Acquisitions',
  'Microsoft',
  'Microsoft 365',
  'Mobile',
  'Network',
  'Network Engineering',
  'Nutrition',
  'Online Marketing',
  'Operations',
  'PPC',
  'Payroll',
  'Personnel Specialist',
  'Pest Control',
  'Pharma',
  'Physics',
  'Planning',
  'Power Engineering and Environmental Engineering',
  'Private Banking',
  'Process Engineering',
  'Process Management',
  'Product Design',
  'Product Management',
  'Production',
  'Programmatic',
  'Project Management',
  'Public Relations',
  'Public Sector',
  'Purchasing',
  'Python',
  'Quality Assurance',
  'Quality Management',
  'R&D',
  'Real Estate',
  'Recruiting',
  'Recruitment and Selection',
  'Remote',
  'Research',
  'Retail',
  'Retention',
  'SAP',
  'SAP/ERP Consulting',
  'SEA',
  'SEO',
  'Safety Services Engineering',
  'Sales',
  'Sales Engineer',
  'Screen and Web Design',
  'Security',
  'Service Management',
  'Social Media',
  'Social Media Manager',
  'Software Development',
  'Strategic Marketing',
  'Strategy',
  'Supply',
  'Support',
  'System Administration',
  'System Management',
  'System and Network Administration',
  'Talent Management',
  'Tax',
  'Team Leader',
  'Technical Documentation',
  'Technology',
  'Telecommunications',
  'Thesis',
  'Trade Marketing',
  'Trading',
  'Training',
  'Video',
  'Video Editing',
  'Web Development',
  "bachelor's degree",
  'high school coursework',
  'professional',
  'vocational',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'company', label: 'Company (A-Z)' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function Items() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list, loadingList, errorList, total } = useSelector((state: RootState) => state.jobs);
  const { jobIds: favoriteIds = [] } = useSelector((state: RootState) => state.favorites);

  const [showFilters, setShowFilters] = useState(false);

  // Инициализация из URL
  const initialSearch = searchParams.get('q') ?? '';
  const initialType = searchParams.get('type') ?? 'All';
  const initialTag = searchParams.get('tag') ?? 'All';
  const initialCompany = searchParams.get('company') ?? '';
  const initialRemote = (searchParams.get('remote') as 'All' | 'true' | 'false' | null) ?? 'All';
  const initialSort = (searchParams.get('sort') as 'newest' | 'oldest' | 'company' | 'title' | null) ?? 'newest';
  
  // Безопасный парсинг номера страницы
  const parsedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [companyFilter, setCompanyFilter] = useState(initialCompany);
  const [selectedRemote, setSelectedRemote] = useState<'All' | 'true' | 'false'>(
    initialRemote === 'true' || initialRemote === 'false' ? initialRemote : 'All',
  );
  const [selectedSort, setSelectedSort] = useState<'newest' | 'oldest' | 'company' | 'title'>(
    initialSort ?? 'newest',
  );
  const [currentPage, setCurrentPage] = useState(initialPage);

  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const PAGE_SIZE = 10;

  // Helper to update URL params consistently
  const updateParams = (updates: Record<string, string | null | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace: true });
  };

  // Синхронизация стейтов с URL при навигации (back/forward)
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const type = searchParams.get('type') ?? 'All';
    const tag = searchParams.get('tag') ?? 'All';
    const company = searchParams.get('company') ?? '';
    const remote = (searchParams.get('remote') as 'All' | 'true' | 'false' | null) ?? 'All';
    const sort = (searchParams.get('sort') as 'newest' | 'oldest' | 'company' | 'title' | null) ?? 'newest';
    const pageStr = searchParams.get('page');
    const page = pageStr ? Number.parseInt(pageStr, 10) : 1;

    setSearchInput(q);
    setSelectedType(type);
    setSelectedTag(tag);
    setCompanyFilter(company);
    setSelectedRemote(remote === 'true' || remote === 'false' ? remote : 'All');
    setSelectedSort(sort ?? 'newest');
    setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
  }, [searchParams]);

  // Дебаунс поиска + запись в URL
  useEffect(() => {
    dispatch(setQuery(debouncedSearch));
    const currentQuery = searchParams.get('q') ?? '';

    // Не трогаем пагинацию, если запрос уже совпадает с URL (клик по страницам)
    if (currentQuery === debouncedSearch) return;

    setCurrentPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) {
          next.set('q', debouncedSearch);
        } else {
          next.delete('q');
        }
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, dispatch, searchParams, setSearchParams]);

  // Загрузка избранного
  useEffect(() => {
    dispatch(loadFavoritesThunk({ uid: user?.uid ?? null }));
  }, [dispatch, user?.uid]);

  // Запрос вакансий
  useEffect(() => {
    dispatch(
      fetchJobsThunk({
        query: debouncedSearch,
        page: currentPage,
        pageSize: PAGE_SIZE,
        typeFilter: selectedType,
        companyFilter,
        remoteFilter: selectedRemote,
        tagFilter: selectedTag,
        sortBy: selectedSort,
      }),
    );
  }, [dispatch, debouncedSearch, currentPage, selectedTag, selectedType, companyFilter, selectedRemote, selectedSort]);

  const handleToggleFavorite = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isFavorite = favoriteIds.includes(jobId);
    try {
      if (isFavorite) {
        await dispatch(removeFavoriteThunk({ uid: user?.uid ?? null, jobId })).unwrap();
        toast.success('Removed from bookmarks');
      } else {
        await dispatch(addFavoriteThunk({ uid: user?.uid ?? null, jobId })).unwrap();
        toast.success('Added to bookmarks');
      }
    } catch (err) {
      toast.error(isFavorite ? 'Failed to remove bookmark' : 'Failed to add bookmark');
    }
  };

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setSearchInput(v);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // --- Логика пагинации ---
  const paginationRange = useMemo(() => {
    const pages: Array<number | 'ellipsis'> = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);

    if (left > 2) {
      pages.push('ellipsis');
    }

    for (let page = left; page <= right; page++) {
      pages.push(page);
    }

    if (right < totalPages - 1) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  // Проверка: если текущая страница > totalPages (например, после фильтрации список уменьшился)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      updateParams({ page: String(totalPages) });
    }
  }, [currentPage, totalPages, setSearchParams]);

  function handlePageChange(nextPage: number) {
    const safePage = Math.max(1, Math.min(totalPages, nextPage));
    
    if (safePage === currentPage) return;

    setCurrentPage(safePage); // Оптимистичное обновление UI
    updateParams({ page: String(safePage) });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Скролл наверх
  }

  // --- Обработчики фильтров ---
  function handleTypeChange(value: string) {
    setSelectedType(value);
    setCurrentPage(1);
    updateParams({ type: value === 'All' ? null : value, page: '1' });
  }

  function handleTagChange(value: string) {
    setSelectedTag(value);
    setCurrentPage(1);
    updateParams({ tag: value === 'All' ? null : value, page: '1' });
  }

  function handleCompanyChange(value: string) {
    setCompanyFilter(value);
    setCurrentPage(1);
    updateParams({ company: value || null, page: '1' });
  }

  function handleRemoteChange(value: 'All' | 'true' | 'false') {
    setSelectedRemote(value);
    setCurrentPage(1);
    updateParams({ remote: value === 'All' ? null : value, page: '1' });
  }

  function handleSortChange(value: 'newest' | 'oldest' | 'company' | 'title') {
    setSelectedSort(value);
    setCurrentPage(1);
    updateParams({ sort: value, page: '1' });
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Next Job</h1>
          <p className="text-muted-foreground">Discover opportunities tailored to your skills</p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              value={searchInput}
              onChange={onChange}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition md:hidden"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <div className="flex items-center gap-2 text-sm ml-auto">
            <span className="text-muted-foreground">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value as typeof selectedSort)}
              className="px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-card-foreground mb-4">Job Type</h3>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Company</h3>
                <input
                  type="text"
                  value={companyFilter}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  placeholder="e.g. We Love X GmbH"
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Remote</h3>
                <div className="space-y-2">
                  {[
                    { label: 'All', value: 'All' },
                    { label: 'Remote', value: 'true' },
                    { label: 'On-site', value: 'false' },
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="remote"
                        value={item.value}
                        checked={selectedRemote === item.value}
                        onChange={(e) => handleRemoteChange(e.target.value as 'All' | 'true' | 'false')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Tag</h3>
                <select
                  value={selectedTag}
                  onChange={(e) => handleTagChange(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden mb-6 bg-card border border-border rounded-lg p-6 space-y-6 w-full">
              <div>
                <h3 className="font-semibold text-card-foreground mb-4">Job Type</h3>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Company</h3>
                <input
                  type="text"
                  value={companyFilter}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  placeholder="e.g. We Love X GmbH"
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Remote</h3>
                <div className="space-y-2">
                  {[
                    { label: 'All', value: 'All' },
                    { label: 'Remote', value: 'true' },
                    { label: 'On-site', value: 'false' },
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="remote-mobile"
                        value={item.value}
                        checked={selectedRemote === item.value}
                        onChange={(e) => handleRemoteChange(e.target.value as 'All' | 'true' | 'false')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-card-foreground mb-4">Tag</h3>
                <select
                  value={selectedTag}
                  onChange={(e) => handleTagChange(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex-1">
            {loadingList && <Spinner />}
            {errorList && <ErrorBox>{errorList}</ErrorBox>}

            {!loadingList && !errorList && (
              <div className="space-y-4">
                {list.length > 0 ? (
                  list.map((job) => {
                    const typeLabel =
                      job.job_types && job.job_types.length > 0
                        ? job.job_types.join(' / ')
                        : 'Not specified';
                    const salaryLabel = job.salary || 'Not specified';
                    const tagsLabel =
                      job.tags && job.tags.length > 0 ? job.tags.slice(0, 3).join(' • ') : 'Not specified';
                    return (
                      <Link key={job.slug} to={`/jobs/${job.slug}`} className="block">
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
                            <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                              {job.remote !== undefined && (
                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                  {job.remote ? 'Remote' : 'On-site'}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleToggleFavorite(e, job.slug)}
                                className={`${favoriteIds.includes(job.slug) ? 'text-red-500' : 'text-muted-foreground'}`}
                                aria-label={favoriteIds.includes(job.slug) ? 'Remove from bookmarks' : 'Add to bookmarks'}
                              >
                                <Heart className={`w-5 h-5 ${favoriteIds.includes(job.slug) ? 'fill-current' : ''}`} />
                              </Button>
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
                
                {/* Исправленная пагинация */}
                {total > PAGE_SIZE && (
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded-md border border-border text-sm disabled:opacity-50 hover:bg-muted"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      
                      {paginationRange.map((item, idx) =>
                        item === 'ellipsis' ? (
                          // Используем idx для уникального ключа многоточий
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            className={`w-9 h-9 rounded-md border text-sm transition flex items-center justify-center ${
                              item === currentPage
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border hover:border-primary hover:text-primary hover:bg-muted'
                            }`}
                            onClick={() => handlePageChange(item)}
                          >
                            {item}
                          </button>
                        ),
                      )}
                      
                      <button
                        className="px-3 py-1 rounded-md border border-border text-sm disabled:opacity-50 hover:bg-muted"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
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