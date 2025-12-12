import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, DollarSign, Briefcase, Calendar, ArrowLeft, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { fetchJobBySlugThunk } from '../features/jobs/jobsSlice';
import type { AppDispatch, RootState } from '../store';
import { useTranslation } from 'react-i18next';
import { useFavoriteJobs } from '../hooks/useFavoriteJobs';
import { useApplications } from '../hooks/useApplications';
import { usePhoneValidation } from '../hooks/usePhoneValidation';
import { useAuth } from '@/context/AuthProvider';
import { getUserProfile } from '@/services/profileService';
import { setProfile } from '@/features/profile/profileSlice';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const { favoriteIds, toggleFavorite } = useFavoriteJobs();
  const { isApplied, addApplication } = useApplications();
  const { user } = useAuth();
  const profile = useSelector((state: RootState) => state.profile.data);

  const { selectedJob: job, loadingJob, errorJob } = useSelector((state: RootState) => state.jobs);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [resumeOption, setResumeOption] = useState<'saved' | 'upload'>('saved');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { normalizePhone, isValidPhone } = usePhoneValidation();

  useEffect(() => {
    if (id) {
      dispatch(fetchJobBySlugThunk(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    const display = profile?.displayName?.trim() ?? '';
    if (display) {
      const parts = display.split(' ');
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' '));
    }
    if (profile?.resumeName) {
      setResumeFileName(profile.resumeName);
    }
    if (profile?.phone) {
      setPhone(profile.phone);
    }
  }, [profile]);

  const ensureProfileLoaded = async () => {
    if (!user) return;
    const needsProfile = !profile || !profile.displayName || !profile.resumeName || !profile.phone;
    if (!needsProfile) return;
    setProfileLoading(true);
    try {
      const data = await getUserProfile(user.uid);
      if (data) {
        if (data.displayName) {
          const parts = data.displayName.split(' ');
          setFirstName(parts[0] ?? '');
          setLastName(parts.slice(1).join(' '));
        }
        if (data.resumeName) {
          setResumeFileName(data.resumeName);
        }
        if (data.phone) {
          setPhone(data.phone);
        }
        dispatch(
          setProfile({
            displayName: data.displayName ?? profile?.displayName ?? null,
            email: user.email ?? profile?.email ?? null,
            photoURL: data.photoURL ?? profile?.photoURL ?? null,
            resumeURL: data.resumeURL ?? profile?.resumeURL ?? null,
            resumeName: data.resumeName ?? profile?.resumeName ?? null,
            phone: data.phone ?? profile?.phone ?? null,
            uid: user.uid,
          }),
        );
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const isFavorite = job ? favoriteIds.includes(job.slug) : false;
  const isAlreadyApplied = job ? isApplied(job.slug) : false;

  const handleToggleFavorite = async () => {
    if (!job) return;
    try {
      await toggleFavorite(job.slug, {
        messages: {
          add: t('item.toast.add'),
          remove: t('item.toast.remove'),
          addFail: t('item.toast.addFail'),
          removeFail: t('item.toast.removeFail'),
        },
      });
    } catch (err) {
      // errors already surfaced via hook toast
    }
  };

  const formatDateTime = (value: unknown) => {
    if (!value) return null;
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) return null;
    try {
      return new Intl.DateTimeFormat(i18n.language || 'en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return date.toLocaleString();
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
  const postedLabel = useMemo(
    () => formatDateTime(job?.updated_at),
    [job?.updated_at, i18n.language],
  );
  const createdLabel = useMemo(
    () => formatDateTime(job?.created_at),
    [job?.created_at, i18n.language],
  );
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
        toast.info(t('share.unsupported', { defaultValue: 'Sharing is not supported in this browser' }));
        return false;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t('share.copied', { defaultValue: 'Link copied to clipboard' }));
        return true;
      } catch {
        toast.error(t('share.copyError', { defaultValue: 'Unable to copy link' }));
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
        toast.error(t('share.unable', { defaultValue: 'Unable to open share options' }));
      }
    }

    await tryCopy();
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error(t('apply.resumePdf', { defaultValue: 'Загрузите файл в формате PDF' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('apply.resumeLimit', { defaultValue: 'Максимальный размер резюме 5 МБ' }));
      return;
    }
    setResumeOption('upload');
    setResumeFile(file);
    setResumeFileName(file.name);
  };

  const handleSubmitApplication = () => {
    if (!job) return;
    if (isAlreadyApplied) {
      toast.info(t('apply.already', { defaultValue: 'Вы уже откликались на эту вакансию' }));
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error(t('apply.required', { defaultValue: 'Имя, фамилия и телефон обязательны' }));
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      toast.error(t('apply.phoneInvalid', { defaultValue: 'Некорректный номер телефона' }));
      return;
    }
    setPhone(normalizedPhone);

    if (resumeOption === 'saved' && !profile?.resumeName) {
      toast.error(t('apply.noSavedResume', { defaultValue: 'Нет сохранённого резюме. Загрузите новый файл.' }));
      return;
    }

    if (resumeOption === 'upload' && !resumeFile) {
      toast.error(t('apply.addResume', { defaultValue: 'Добавьте файл резюме или выберите сохранённое' }));
      return;
    }

    const resumeName =
      resumeOption === 'saved'
        ? profile?.resumeName ?? undefined
        : resumeFileName ?? undefined;
    const resumeUrl = resumeOption === 'saved' ? profile?.resumeURL ?? null : null;

    void addApplication({
      jobId: job.slug,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizedPhone,
      comment: comment || undefined,
      resumeName: resumeName ?? null,
      resumeUrl: resumeUrl ?? null,
    });
    setIsApplyOpen(false);
    setComment('');
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
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-4xl overflow-hidden">
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
            <Dialog
              open={isApplyOpen}
              onOpenChange={(open) => {
                setIsApplyOpen(open);
                if (open) {
                  void ensureProfileLoaded();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isAlreadyApplied || profileLoading}
                >
                  {isAlreadyApplied
                    ? t('apply.sent', { defaultValue: 'Отклик отправлен' })
                    : profileLoading
                      ? t('apply.loading', { defaultValue: 'Загрузка...' })
                      : t('apply.cta', { defaultValue: 'Откликнуться' })}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('apply.title', { defaultValue: 'Отклик на вакансию' })}</DialogTitle>
                  <DialogDescription>
                    {t('apply.subtitle', { defaultValue: 'Заполните контактные данные и выберите резюме для отправки.' })}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">{t('apply.firstName', { defaultValue: 'Имя' })}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Иван"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName">{t('apply.lastName', { defaultValue: 'Фамилия' })}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Иванов"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone">{t('apply.phone', { defaultValue: 'Телефон' })}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 777 000 00 00"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="comment">{t('apply.comment', { defaultValue: 'Комментарий' })}</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Расскажите кратко о себе или уточните детали"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>{t('apply.resume', { defaultValue: 'Резюме' })}</Label>
                    <div className="space-y-2 rounded-md border border-border p-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="resume"
                          className="h-4 w-4"
                          checked={resumeOption === 'saved'}
                          onChange={() => setResumeOption('saved')}
                        />
                        <span>
                          {t('apply.useSaved', { defaultValue: 'Использовать сохранённое резюме' })}{' '}
                          {profile?.resumeName ? `(${profile.resumeName})` : t('apply.noFile', { defaultValue: '(нет файла)' })}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="resume"
                          className="h-4 w-4"
                          checked={resumeOption === 'upload'}
                          onChange={() => setResumeOption('upload')}
                        />
                        <span>{t('apply.uploadOther', { defaultValue: 'Загрузить другое (PDF, до 5 МБ)' })}</span>
                      </label>

                      {resumeOption === 'upload' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {t('apply.pickFile', { defaultValue: 'Выбрать файл' })}
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {resumeFileName ?? t('apply.fileNotChosen', { defaultValue: 'Файл не выбран' })}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />

                <DialogFooter className="gap-2">
                  <Button
                    onClick={handleSubmitApplication}
                    className="bg-primary text-primary-foreground"
                    disabled={isAlreadyApplied || profileLoading}
                  >
                    {isAlreadyApplied
                      ? t('apply.alreadyShort', { defaultValue: 'Уже откликались' })
                      : profileLoading
                        ? t('apply.preparing', { defaultValue: 'Подготовка…' })
                        : t('apply.submit', { defaultValue: 'Отправить отклик' })}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

          </div>
        </div>
      </div>
    </main>
  );
}

