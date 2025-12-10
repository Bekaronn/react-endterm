import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Menu, X, Compass, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "../context/AuthProvider";
import { setProfile } from "../features/profile/profileSlice";
import type { RootState, AppDispatch } from "../store";

export default function Navbar() {
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.data);
  const { t, i18n } = useTranslation();
  const languages = [
    { code: "kz", label: "ҚАЗ" },
    { code: "ru", label: "РУ" },
    { code: "en", label: "EN" },
  ];
  const currentLng = i18n.resolvedLanguage || i18n.language;

  const displayName = profile?.displayName ?? user?.displayName ?? user?.email ?? "User";
  const email = profile?.email ?? user?.email ?? "";
  const photoURL = profile?.photoURL ?? user?.photoURL ?? undefined;

  return (
    <nav className="bg-background border-b  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <Compass className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold text-foreground">Career Atlas</span>
          </NavLink>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <div className="hidden md:flex items-center gap-8 px-8">
              <NavLink to="/jobs" className="text-foreground hover:text-primary transition">
                {t('nav.jobs')}
              </NavLink>
              <NavLink to="/bookmarks" className="text-foreground hover:text-primary transition">
                {t('nav.bookmarks')}
              </NavLink>
            </div>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {currentLng?.toUpperCase() || 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lng) => (
                  <DropdownMenuItem key={lng.code} onClick={() => i18n.changeLanguage(lng.code)}>
                    {lng.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border hover:border-primary transition">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={photoURL} alt={displayName} />
                      <AvatarFallback>{email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-3 py-3 border-b  flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={photoURL} alt={displayName} />
                      <AvatarFallback>{email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground break-all">{email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <NavLink to="/profile">{t('nav.profile')}</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      void logout();
                      dispatch(setProfile(null));
                    }}
                  >
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <NavLink to="/login">
                  <Button variant="outline" disabled={loading}>{t('nav.login')}</Button>
                </NavLink>
                <NavLink to="/signup">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {t('nav.signup')}
                  </Button>
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <NavLink to="/jobs" className="block py-2 text-foreground hover:text-primary">
              {t('nav.jobs')}
            </NavLink>

            <NavLink to="/bookmarks" className="block py-2 text-foreground hover:text-primary">
              {t('nav.bookmarks')}
            </NavLink>

            <div className="flex items-center gap-2 px-2 pt-1">
              <span className="text-sm text-muted-foreground">Theme</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("light")} disabled={loading}>Light</Button>
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("dark")} disabled={loading}>Dark</Button>
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("system")} disabled={loading}>System</Button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 pt-1">
              <span className="text-sm text-muted-foreground">Lang</span>
              <div className="flex gap-1">
                {languages.map((lng) => {
                  const active = currentLng === lng.code;
                  return (
                    <Button
                      key={lng.code}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="px-2"
                      onClick={() => i18n.changeLanguage(lng.code)}
                    >
                      {lng.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <NavLink to="/profile" className="flex items-center gap-3 px-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={photoURL} alt={displayName} />
                      <AvatarFallback>{email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">{displayName || email || 'Profile'}</span>
                  </NavLink>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      void logout();
                      dispatch(setProfile(null));
                    }}
                    disabled={loading}
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="block">
                    <Button variant="outline" className="w-full bg-transparent" disabled={loading}>
                      {t('nav.login')}
                    </Button>
                  </NavLink>
                  <NavLink to="/signup" className="block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                      {t('nav.signup')}
                    </Button>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
