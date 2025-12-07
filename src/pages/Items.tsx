import { useEffect, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import Card from '../components/Card';
import '../styles/Items.css';
import type { RootState, AppDispatch } from '../store';
import { fetchJobsThunk, setQuery } from '../features/jobs/jobsSlice';

export default function Items() {
  const dispatch = useDispatch<AppDispatch>();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const {
    list,
    loadingList,
    errorList,
  } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobsThunk({ query: q }));
  }, [dispatch, q]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    dispatch(setQuery(v));

    if (v) setSearchParams({ q: v });
    else setSearchParams({});
  }

  return (
    <div className="items-page">
      <h2 className="page-title">Find your next job</h2>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search by title, company, tag..."
          value={q}
          onChange={onChange}
        />
      </div>

      {loadingList && <Spinner />}
      {errorList && <ErrorBox>{errorList}</ErrorBox>}

      {!loadingList && !errorList && (
        <div className="items-grid">
          {list.length === 0 && <p className="no-results">No matching results.</p>}
          {list.map((job) => (
            <Card key={job.slug} item={job} />
          ))}
        </div>
      )}
    </div>
  );
}

