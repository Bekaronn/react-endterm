import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="text-lg font-semibold text-foreground">
          Career Atlas
        </NavLink>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
          <NavLink to="/" className="hover:text-primary">{t('footer.about')}</NavLink>
          <NavLink to="/jobs" className="hover:text-primary">{t('footer.jobs')}</NavLink>
          <NavLink to="/bookmarks" className="hover:text-primary">{t('footer.bookmarks')}</NavLink>
          <NavLink to="/profile" className="hover:text-primary">{t('footer.profile')}</NavLink>
          <NavLink to="/login" className="hover:text-primary">{t('footer.login')}</NavLink>
          <NavLink to="/signup" className="hover:text-primary">{t('footer.signup')}</NavLink>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Career Atlas. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}