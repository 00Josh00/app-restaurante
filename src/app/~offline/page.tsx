export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-center">
      <p className="text-5xl">📡</p>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Sin conexión</h1>
      <p className="mt-2 text-zinc-500">
        No hay internet. Revisa tu conexión e intenta de nuevo.
      </p>
    </main>
  )
}