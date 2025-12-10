import { useState } from "react";
import { NavLink } from "react-router-dom";
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

export default function Navbar() {
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuth();

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
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
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
                  <button className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:border-primary transition">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? user.email ?? "User"} />
                      <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground hidden lg:inline">
                      {user.displayName || user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <NavLink to="/profile">Profile</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void logout()}>Logout</DropdownMenuItem>
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

            <div className="flex items-center gap-2 px-2 pt-1">
              <span className="text-sm text-muted-foreground">Theme</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("light")} disabled={loading}>Light</Button>
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("dark")} disabled={loading}>Dark</Button>
                <Button size="sm" variant="outline" className="px-2" onClick={() => setTheme("system")} disabled={loading}>System</Button>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <NavLink to="/profile" className="flex items-center gap-3 px-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? user.email ?? "User"} />
                      <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{user.displayName || user.email}</p>
                      <p className="text-xs text-muted-foreground">Profile</p>
                    </div>
                  </NavLink>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => void logout()}
                    disabled={loading}
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
