import { verifySession } from "@/features/shared/auth/dal";
import { getTodayRituals } from "@/features/rituals/actions";
import { RitualsList } from "./rituals-list";

export default async function RitualsPage() {
  const { user } = await verifySession();
  const rituals = await getTodayRituals(user.id!);
  const completed = rituals.filter((r) => r.completedToday).length;

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <h1 className="mb-1 text-2xl font-bold">Rituales de Hoy</h1>
      <p className="mb-6 text-xs capitalize opacity-35">
        {today} · {completed} de {rituals.length}
      </p>
      <RitualsList rituals={rituals} />
    </div>
  );
}
