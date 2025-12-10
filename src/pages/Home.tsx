import { NavLink } from 'react-router-dom';
import '../styles/Home.css';
import { Button } from "@/components/ui/button"
import { Compass, Search, Briefcase, MessageSquare, Zap } from "lucide-react"

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Compass className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Navigate Your Career Path
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Discover thousands of job opportunities tailored to your skills and aspirations. Start your journey to
            your dream career today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink to="/jobs">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
                Explore Jobs
              </Button>
            </NavLink>
            <NavLink to="/signup">
              <Button variant="outline" className="px-8 py-6 text-lg bg-transparent">
                Get Started
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Why Choose Career Atlas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Search className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">Smart Search</h3>
              <p className="text-muted-foreground">
                Advanced filters to find the perfect job match by role, location, salary, and experience level.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">Easy Applications</h3>
              <p className="text-muted-foreground">
                Apply to jobs in seconds and track all your applications in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">Direct Messaging</h3>
              <p className="text-muted-foreground">
                Communicate directly with recruiters and employers about opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-secondary-foreground">About Career Atlas</h2>
              <p className="text-lg text-secondary-foreground/80 mb-4">
                Career Atlas is your trusted job search platform, designed to connect talented professionals with
                their dream opportunities.
              </p>
              <p className="text-lg text-secondary-foreground/80 mb-4">
                With our advanced filtering system, real-time notifications, and direct messaging capabilities,
                finding your next role has never been easier.
              </p>
              <p className="text-lg text-secondary-foreground/80">
                Whether you are a fresh graduate starting your first job or an experienced professional looking for
                your next challenge, Career Atlas has opportunities for everyone.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">Fast & Efficient</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply to jobs instantly with our streamlined process.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">Verified Companies</h3>
                    <p className="text-sm text-muted-foreground">All employers are verified for authenticity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">Our support team is always here to help.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary-foreground">Ready to Find Your Dream Job?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Join thousands of professionals who have already found their perfect career match.
          </p>
          <NavLink to="/signup">
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-6 text-lg">
              Sign Up Free Today
            </Button>
          </NavLink>
        </div>
      </section>
    </main>
  );
}

