import { useState } from "react";
import { NavLink } from "react-router-dom";
<<<<<<< HEAD
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, Compass, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
=======
import { Menu, X, Compass, Moon, Sun, Heart } from "lucide-react";
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
<<<<<<< HEAD
import { useAuth } from "../context/AuthProvider";
import { setProfile } from "../features/profile/profileSlice";
import type { RootState, AppDispatch } from "../store";
=======
import { useAuth } from "../context/AuthProvider"
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0

export default function Navbar() {
  const { setTheme } = useTheme()
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD
  const { user, loading, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.data);

  const displayName = profile?.displayName ?? user?.displayName ?? user?.email ?? "User";
  const email = profile?.email ?? user?.email ?? "";
  const photoURL = profile?.photoURL ?? user?.photoURL ?? undefined;
=======
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <Compass className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold text-foreground">Career Atlas</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className="text-foreground hover:text-primary transition">
              Home
            </NavLink>
<<<<<<< HEAD
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
=======
            <NavLink to="/jobs" className="text-foreground hover:text-primary transition">
              Jobs
            </NavLink>
            <NavLink to="/bookmarks" className="text-foreground hover:text-primary transition flex items-center gap-1">
              <Heart className="w-4 h-4" />
              Bookmarks
            </NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <NavLink to="/profile">
                  <Button variant="outline">Profile</Button>
                </NavLink>
                <Button variant="outline" onClick={() => void logout()}>
                  Logout
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0
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
                  <button className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:border-primary transition">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={photoURL} alt={displayName} />
                      <AvatarFallback>{email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground hidden lg:inline">
                      {displayName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <NavLink to="/profile">Profile</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      void logout();
                      dispatch(setProfile(null));
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <NavLink to="/login">
                  <Button variant="outline" disabled={loading}>Login</Button>
                </NavLink>
                <NavLink to="/signup">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    Sign Up
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
            <NavLink to="/" className="block py-2 text-foreground hover:text-primary">
              Home
            </NavLink>
<<<<<<< HEAD

            <div className="flex items-center gap-2 px-2 pt-1">
              <span className="text-sm text-muted-foreground">Theme</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("light")} disabled={loading}>Light</Button>
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("dark")} disabled={loading}>Dark</Button>
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("system")} disabled={loading}>System</Button>
              </div>
            </div>
=======
            <NavLink to="/jobs" className="block py-2 text-foreground hover:text-primary">
              Jobs
            </NavLink>
            <NavLink to="/bookmarks" className="block py-2 text-foreground hover:text-primary flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Bookmarks
            </NavLink>
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0

            <div className="pt-4 space-y-2">
              {user ? (
                <>
<<<<<<< HEAD
                  <NavLink to="/profile" className="flex items-center gap-3 px-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={photoURL} alt={displayName} />
                      <AvatarFallback>{email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{email || 'Profile'}</p>
                    </div>
=======
                  <NavLink to="/profile" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Profile
                    </Button>
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0
                  </NavLink>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
<<<<<<< HEAD
                    onClick={() => {
                      void logout();
                      dispatch(setProfile(null));
                    }}
                    disabled={loading}
=======
                    onClick={() => void logout()}
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="block">
                    <Button variant="outline" className="w-full bg-transparent" disabled={loading}>
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to="/signup" className="block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                      Sign Up
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
