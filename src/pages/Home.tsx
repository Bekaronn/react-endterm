import { Link } from 'react-router-dom';
import '../styles/Home.css';

type Feature = {
  title: string;
  desc: string;
  icon: string;
  link: string;
};

export default function Home() {
  const features: Feature[] = [
    {
      title: 'Browse Jobs',
      desc: 'Explore curated roles pulled from Firestore-backed collection.',
      icon: '📚',
      link: '/jobs',
    },
    {
      title: 'Smart Search',
      desc: 'Find roles by title, company, tags, or location on the fly.',
      icon: '🔍',
      link: '/jobs',
    },
    {
      title: 'Detailed Info',
      desc: 'Review description, tags, job type, remote flag and source link.',
      icon: '📖',
      link: '/jobs',
    },
  ];

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-content">
          <h1>Discover Your Next Role</h1>
          <p>
            Welcome to JobFinder — a minimal app backed by Firebase/Firestore to
            browse and search fresh roles.
          </p>
          <Link to="/jobs" className="hero-btn">
            Start Searching →
          </Link>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop"
            alt="Library"
          />
        </div>
      </div>

      <div className="home-cards">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <Link to={f.link} className="card-btn">
              Learn More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

