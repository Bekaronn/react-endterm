import type { ReactNode } from 'react';

export default function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="error-box">{children}</div>;
}

