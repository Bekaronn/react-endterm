import { Navigate } from 'react-router-dom';
import { Camera, LogOut, ShieldCheck, User2, Check, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Spinner from '../components/Spinner';
import { SkeletonImage } from '../components/SkeletonImage';
import { cn } from '@/lib/utils';
import useProfileInfo from '../hooks/useProfileInfo';

const DEFAULT_AVATARS = [
  '/avatars/default-1.jpg',
  '/avatars/default-2.jpg',
  '/avatars/default-3.jpg',
];

export default function Profile() {
  const { t } = useTranslation();

  const {
    user,
    loading,
    logout,
    state: { photoUrl, resumeUrl, resumeName, status, resumeStatus, uploading, resumeUploading, name, savingName, phone, savingPhone },
    setName,
    setPhone,
    refs: { fileInputRef, resumeInputRef },
    handlers: { handleSelectDefault, handleFileChange, handleResumeChange, handleSaveName, handleSavePhone },
  } = useProfileInfo();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div
              className="relative cursor-pointer group"
              role="button"
              tabIndex={0}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-background shadow-md transition group-hover:ring-primary/40 bg-muted">
                <SkeletonImage
                  src={photoUrl}
                  alt={user.displayName ?? user.email ?? 'User'}
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground font-medium">
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  }
                />
              </Avatar>
              <button
                type="button"
                aria-label={t('profile.updatePhoto')}
                className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-full bg-primary text-primary-foreground p-2 shadow-lg hover:bg-primary/90 transition disabled:opacity-60"
                onClick={(e) => {
                  e.stopPropagation(); // Чтобы клик по кнопке не вызывал двойной клик родителя
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold w-fit">
                <ShieldCheck className="h-4 w-4" />
                {t('profile.accountActive')}
              </div>
              <h1 className="text-3xl font-bold text-card-foreground">{user.displayName || t('profile.yourProfile')}</h1>
              <p className="text-muted-foreground text-sm md:text-base">{t('profile.email')}: {user.email}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 border-destructive/60 text-destructive hover:bg-destructive/10"
                onClick={() => void logout()}
                disabled={uploading}
              >
                <LogOut className="h-4 w-4" />
                {t('profile.logout')}
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2">
              <User2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">{t('profile.yourProfile')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{t('profile.email')}</p>
                <p className="text-lg font-semibold text-card-foreground">{user.email}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{t('profile.name')}</p>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('profile.namePlaceholder')}
                    disabled={savingName || uploading}
                  />
                </div>
                <Button size="sm" onClick={handleSaveName} disabled={savingName || uploading}>
                  {savingName ? t('profile.saving') : t('profile.saveName')}
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{t('profile.phoneLabel', { defaultValue: 'Телефон' })}</p>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('profile.phonePlaceholder', { defaultValue: '+7 777 000 00 00' })}
                    disabled={savingPhone || uploading}
                  />
                </div>
                <Button size="sm" onClick={handleSavePhone} disabled={savingPhone || uploading}>
                  {savingPhone ? t('profile.saving') : t('profile.savePhone', { defaultValue: 'Сохранить телефон' })}
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{t('profile.uid')}</p>
                <p className="text-sm text-card-foreground break-all">{user.uid}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-card-foreground">{t('profile.updatePhoto')}</p>
              <p className="text-sm text-muted-foreground">
                {t('profile.uploadHint')}
              </p>
            </div>

            {/* --- БЛОК ВЫБОРА ГОТОВЫХ СТИЛЕЙ --- */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                {t('profile.defaultStyles', { defaultValue: 'Default styles' })}
              </p>
              <div className="flex gap-3">
                {DEFAULT_AVATARS.map((src, index) => {
                  const isSelected = photoUrl === src;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDefault(src)}
                      disabled={uploading}
                      className={cn(
                        "relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        isSelected ? "border-primary ring-2 ring-primary ring-offset-1" : "border-transparent"
                      )}
                    >
                      {/* Используем SkeletonImage и тут для плавности */}
                      <SkeletonImage
                        src={src}
                        alt={`Default avatar ${index + 1}`}
                        className="h-full w-full object-cover"
                        fallback={<div className="h-full w-full bg-muted" />}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Разделитель */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('profile.orUpload', { defaultValue: 'Or upload a photo' })}
                </span>
              </div>
            </div>
            {/* ------------------------------------- */}

            <div
              className="rounded-xl border border-dashed border-border bg-muted/20 p-4 cursor-pointer transition hover:border-primary/60 hover:bg-primary/5 mt-4"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                disabled={uploading}
                className="sr-only"
                ref={fileInputRef}
                aria-label={t('profile.updatePhoto')}
              />
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-card-foreground">{t('profile.selectFile')}</p>
                  <p className="text-xs text-muted-foreground">{t('profile.maxSize')}</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Camera className="h-4 w-4" />
                  {uploading ? t('profile.saving') : t('profile.choosePhoto')}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-card-foreground">{t('profile.resumeTitle', { defaultValue: 'Resume' })}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('profile.resumeHint', { defaultValue: 'Upload your resume as PDF (max 5 MB).' })}
              </p>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    {t('profile.resumeCurrent', { defaultValue: 'Current resume' })}
                  </p>
                  {resumeUrl ? (
                    <p className="text-sm text-card-foreground break-all">
                      {resumeName ?? t('profile.resumeDownload', { defaultValue: 'Download' })}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('profile.resumeNotUploaded', { defaultValue: 'No resume uploaded yet.' })}
                    </p>
                  )}
                </div>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {t('profile.resumeDownload', { defaultValue: 'Download' })}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  disabled={resumeUploading || uploading}
                  className="sr-only"
                  ref={resumeInputRef}
                  aria-label={t('profile.uploadResume', { defaultValue: 'Upload resume' })}
                />
                <Button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading || uploading}
                  variant="secondary"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {resumeUploading ? t('profile.saving') : t('profile.uploadResume', { defaultValue: 'Upload resume' })}
                </Button>
              </div>
            </div>

            {(status || resumeStatus) && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-card-foreground space-y-1">
                {status && <p>{status}</p>}
                {resumeStatus && <p>{resumeStatus}</p>}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}