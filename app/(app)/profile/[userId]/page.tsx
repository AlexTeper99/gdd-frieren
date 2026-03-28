import { verifySession } from "@/features/shared/auth/dal";
import { getProfile } from "@/features/profile/actions";
import { ProfileView } from "../profile-view";
import { redirect } from "next/navigation";

export default async function OtherProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await verifySession();
  const { userId } = await params;
  const profile = await getProfile(userId);
  if (!profile) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <ProfileView profile={profile} isMe={false} />
    </div>
  );
}
