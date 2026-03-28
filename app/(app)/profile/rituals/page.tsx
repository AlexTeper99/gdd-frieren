import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { rituals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditRituals } from "./edit-rituals";

export default async function EditRitualsPage() {
  const { user } = await verifySession();

  const userRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.userId, user.id!));

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/profile" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Personaje
      </a>
      <h1 className="mb-1 text-2xl font-bold">Mis Rituales</h1>
      <p className="mb-6 text-xs opacity-35">
        Agregar, editar o desactivar rituales
      </p>
      <EditRituals rituals={userRituals} />
    </div>
  );
}
