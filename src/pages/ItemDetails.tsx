import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import '../styles/ItemDetails.css';

import { useDispatch, useSelector } from 'react-redux';
import { fetchJobBySlugThunk } from '../features/jobs/jobsSlice';
import type { AppDispatch, RootState } from '../store';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    selectedJob: job,
    loadingJob,
    errorJob,
  } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobBySlugThunk(id));
    }
  }, [dispatch, id]);

  if (loadingJob) return <Spinner />;
  if (errorJob) return <ErrorBox>{errorJob}</ErrorBox>;
  if (!job) return <div className="not-found">Job not found</div>;

  return (
    <div className="item-details-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="item-card">
        <div className="item-info">
          <h2 className="item-title">{job.title}</h2>
          <p className="item-section"><strong>Company:</strong> {job.company_name}</p>
          <p className="item-section"><strong>Location:</strong> {job.location || 'Worldwide'}</p>
          <p className="item-section"><strong>Remote:</strong> {job.remote ? 'Yes' : 'No'}</p>

          {job.job_types?.length > 0 && (
            <div className="item-section">
              <strong>Job types:</strong>
              <div className="subjects-badges">
                {job.job_types.map((t) => (
                  <span key={t} className="subject-badge">{t}</span>
                ))}
              </div>
            </div>
          )}

          {job.tags?.length > 0 && (
            <div className="item-section">
              <strong>Tags:</strong>
              <div className="subjects-badges">
                {job.tags.map((tag) => (
                  <span key={tag} className="subject-badge">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {job.description && (
            <div className="item-section">
              <strong>Description:</strong>
              <p className="item-text" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          )}

          {job.url && (
            <div className="item-section">
              <a className="card-link" href={job.url} target="_blank" rel="noreferrer">
                Open source posting →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

