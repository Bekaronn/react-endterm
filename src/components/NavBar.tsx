import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Compass, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export default function Navbar() {
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            <NavLink to="/about" className="text-foreground hover:text-primary transition">
              About
            </NavLink>
            <NavLink to="/jobs" className="text-foreground hover:text-primary transition">
              Jobs
            </NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <NavLink to="/applications">
                  <Button variant="outline">Applications</Button>
                </NavLink>
                <NavLink to="/messages">
                  <Button variant="outline">Messages</Button>
                </NavLink>
                <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <Button variant="outline">Login</Button>
                </NavLink>
                <NavLink to="/signup">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
                </NavLink>
              </>
            )}
          </div>

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
            <NavLink to="/about" className="block py-2 text-foreground hover:text-primary">
              About
            </NavLink>
            <NavLink to="/jobs" className="block py-2 text-foreground hover:text-primary">
              Jobs
            </NavLink>

            <div className="pt-4 space-y-2">
              {isLoggedIn ? (
                <>
                  <NavLink to="/applications" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Applications
                    </Button>
                  </NavLink>
                  <NavLink to="/messages" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Messages
                    </Button>
                  </NavLink>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to="/signup" className="block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
