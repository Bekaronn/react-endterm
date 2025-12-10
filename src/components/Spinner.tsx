export default function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative h-10 w-10" role="status" aria-label="Loading">
        <div className="h-full w-full rounded-full border-4 border-border" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

