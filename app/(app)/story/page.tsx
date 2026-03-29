import { verifySession } from "@/features/shared/auth/dal";
import { getStoryState } from "@/features/story/actions";
import { StoryView } from "./story-view";

export default async function StoryPage() {
  const { user } = await verifySession();
  const storyState = await getStoryState(user.id!);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historia</h1>
        <a href="/story/archive" className="text-xs text-hq-purple hover:underline">
          Leer novela completa →
        </a>
      </div>
      <StoryView
        isMyTurn={storyState.isMyTurn}
        lastEntry={storyState.lastEntry}
        entries={storyState.entries}
      />
    </div>
  );
}
