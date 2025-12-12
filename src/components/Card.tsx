import { Link } from 'react-router-dom';
import type { Job } from '../services/jobsService';

type CardProps = {
  item: Job;
};

export default function Card({ item }: CardProps) {
  return (
    <article className="card">
      <div className="card-image job-card">
        <div className="job-badge">{item.remote ? 'Remote' : 'Onsite'}</div>
        <div className="job-title">{item.title}</div>
        <div className="job-company">{item.company_name}</div>
      </div>

      <div className="card-body">
        <p className="card-sub">{item.location || 'Worldwide'}</p>
        <div className="tags">
          {(item.tags ?? []).slice(0, 4).map((tag) => (
            <span key={tag} className="tag-chip">#{tag}</span>
          ))}
        </div>
        <Link className="card-link" to={`/jobs/${item.slug}`}>
          View details →
        </Link>
      </div>
    </article>
  );
}

