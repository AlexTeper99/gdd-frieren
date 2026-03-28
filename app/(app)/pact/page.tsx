import { verifySession } from "@/features/shared/auth/dal";
import { getCurrentPact } from "@/features/pact/actions";
import { db } from "@/features/shared/db";
import { users } from "@/features/shared/db/schema";
import { PactView } from "./pact-view";

export default async function PactPage() {
  const { user } = await verifySession();
  const pact = await getCurrentPact();

  const allUsers = await db.select().from(users);
  const isPlayer1 = allUsers[0]?.id === user.id;
  const myName = allUsers.find((u) => u.id === user.id)?.nombrePersonaje ?? "";
  const otherName = allUsers.find((u) => u.id !== user.id)?.nombrePersonaje ?? "";

  const myAnswers = isPlayer1 ? pact?.respuestasJ1 : pact?.respuestasJ2;
  const otherAnswers = isPlayer1 ? pact?.respuestasJ2 : pact?.respuestasJ1;
  const iSigned = isPlayer1 ? pact?.firmadoJ1 : pact?.firmadoJ2;
  const otherSigned = isPlayer1 ? pact?.firmadoJ2 : pact?.firmadoJ1;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <h1 className="mb-1 text-2xl font-bold">Pacto Semanal</h1>
      <PactView
        myAnswers={myAnswers as Record<string, string> | null}
        otherAnswers={otherAnswers as Record<string, string> | null}
        iSigned={iSigned ?? false}
        otherSigned={otherSigned ?? false}
        myName={myName}
        otherName={otherName}
      />
    </div>
  );
}
