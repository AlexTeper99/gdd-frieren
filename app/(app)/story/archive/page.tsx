import { verifySession } from "@/features/shared/auth/dal";
import { getStoryArchive } from "@/features/story/actions";
import { ArchiveView } from "./archive-view";

export default async function StoryArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await verifySession();
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const archive = await getStoryArchive(page, 20);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/story" className="mb-3 text-xs text-hq-text-faint hover:text-hq-text-muted">
        ← Historia
      </a>
      <h1 className="mb-1 text-2xl font-bold">La Novela de Valdris</h1>
      <p className="mb-6 text-xs text-hq-text-muted">
        {archive.totalCount} entradas · Página {archive.page} de {archive.totalPages}
      </p>
      <ArchiveView
        entries={archive.entries}
        page={archive.page}
        totalPages={archive.totalPages}
      />
    </div>
  );
}
