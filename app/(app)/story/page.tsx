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
      <h1 className="mb-4 text-2xl font-bold">Historia</h1>
      <StoryView
        isMyTurn={storyState.isMyTurn}
        lastEntry={storyState.lastEntry}
        entries={storyState.entries}
      />
    </div>
  );
}
