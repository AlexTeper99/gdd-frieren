"use client";

import { useChat } from "ai/react";

export default function TestAIPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/ai/test",
    });

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">AI Connection Test</h1>
      <p className="text-muted-foreground text-sm">
        Probá la conexión con Claude. Escribí algo y mirá la respuesta
        streameada.
      </p>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg p-3 ${
              m.role === "user"
                ? "bg-primary/10 ml-12"
                : "bg-muted mr-12"
            }`}
          >
            <p className="text-xs font-medium opacity-50">
              {m.role === "user" ? "Tú" : "Narrador"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Describí una escena o hacé una pregunta al narrador..."
          rows={2}
          className="border-input bg-background flex-1 resize-none rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
