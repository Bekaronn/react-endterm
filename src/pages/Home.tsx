import { NavLink } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Compass, Search, Briefcase, MessageSquare, Zap } from "lucide-react"
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">

          <div className="flex justify-center mb-6">
            <Compass className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink to="/jobs">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
                {t('home.explore')}
              </Button>
            </NavLink>
            <NavLink to="/signup">
              <Button variant="outline" className="px-8 py-6 text-lg bg-transparent">
                {t('home.getStarted')}
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">{t('home.whyTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Search className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">{t('home.features.smart.title')}</h3>
              <p className="text-muted-foreground">{t('home.features.smart.desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">{t('home.features.easy.title')}</h3>
              <p className="text-muted-foreground">{t('home.features.easy.desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">{t('home.features.direct.title')}</h3>
              <p className="text-muted-foreground">{t('home.features.direct.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-secondary-foreground">{t('home.aboutTitle')}</h2>
              <p className="text-lg text-secondary-foreground/80 mb-4">{t('home.aboutP1')}</p>
              <p className="text-lg text-secondary-foreground/80 mb-4">{t('home.aboutP2')}</p>
              <p className="text-lg text-secondary-foreground/80">{t('home.aboutP3')}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{t('home.quick.fast.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.quick.fast.desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{t('home.quick.verified.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.quick.verified.desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{t('home.quick.support.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.quick.support.desc')}</p>
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
          <h2 className="text-4xl font-bold mb-6 text-primary-foreground">{t('home.ctaTitle')}</h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            {t('home.ctaSubtitle')}
          </p>
          <NavLink to="/signup">
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-6 text-lg">
              {t('home.ctaButton')}
            </Button>
          </NavLink>
        </div>
      </section>
    </main>
  );
}

