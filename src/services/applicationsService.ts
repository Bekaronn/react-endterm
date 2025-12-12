const STORAGE_KEY = 'career_atlas_applications';

export type ApplicationEntry = {
  jobId: string;
  comment?: string;
  resumeName?: string | null;
  resumeUrl?: string | null;
  createdAt?: string;
};

function readList(): ApplicationEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    // Backward compatibility: older format stored just an array of strings (jobIds)
    if (Array.isArray(parsed)) {
      if (parsed.every((item) => typeof item === 'string')) {
        return parsed.map((jobId) => ({ jobId }));
      }
      return parsed.filter(
        (entry): entry is ApplicationEntry =>
          entry && typeof entry.jobId === 'string',
      );
    }
    return [];
  } catch {
    return [];
  }
}

function writeList(list: ApplicationEntry[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        list.map((entry) => ({
          ...entry,
          jobId: entry.jobId,
        })),
      ),
    );
  } catch {
    // ignore quota errors
  }
}

export function getLocalApplications(): ApplicationEntry[] {
  return readList();
}

export function addLocalApplication(entry: ApplicationEntry): ApplicationEntry[] {
  const list = readList();
  const existingIndex = list.findIndex((item) => item.jobId === entry.jobId);
  const now = new Date().toISOString();
  const payload: ApplicationEntry = { ...entry, createdAt: entry.createdAt ?? now };

  if (existingIndex >= 0) {
    list[existingIndex] = payload;
  } else {
    list.push(payload);
  }
  writeList(list);
  return list;
}

export function removeLocalApplication(jobId: string): ApplicationEntry[] {
  const list = readList().filter((item) => item.jobId !== jobId);
  writeList(list);
  return list;
}

