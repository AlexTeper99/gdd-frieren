"use client";

import { useActionState } from "react";
import { loginWithCredentials } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginWithCredentials, null);

  return (
    <div className="w-full max-w-sm space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Habit Quest</h1>
        <p className="text-muted-foreground text-sm">
          Ingresá con tu cuenta
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
        />

        {state?.error && (
          <p className="text-destructive text-sm">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground w-full rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
