export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col gap-4 px-6 py-8 animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-hq-bg-card" />
      <div className="h-4 w-48 rounded bg-hq-bg-card" />
      <div className="mt-4 space-y-3">
        <div className="h-16 rounded-xl bg-hq-bg-card" />
        <div className="h-16 rounded-xl bg-hq-bg-card" />
        <div className="h-16 rounded-xl bg-hq-bg-card" />
      </div>
    </div>
  );
}
