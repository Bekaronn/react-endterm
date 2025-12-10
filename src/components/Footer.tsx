import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="text-lg font-semibold text-foreground">
          Career Atlas
        </NavLink>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <NavLink to="/" className="hover:text-primary">About</NavLink>
          <NavLink to="/jobs" className="hover:text-primary">Jobs</NavLink>
          <NavLink to="/profile" className="hover:text-primary">Profile</NavLink>
          <NavLink to="/login" className="hover:text-primary">Login</NavLink>
          <NavLink to="/signup" className="hover:text-primary">Sign Up</NavLink>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Career Atlas. All rights reserved.
        </p>
      </div>
    </footer>
  );
}