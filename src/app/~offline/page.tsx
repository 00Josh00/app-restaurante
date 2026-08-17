import { LogoMark, WifiOffIcon } from '@/components/ui/icons'

export default function OfflinePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 p-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]" />
      <div className="relative flex flex-col items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ember-500/30 bg-ember-500/10 text-ember-400">
          <LogoMark className="h-7 w-7" />
        </span>
        <span className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-900 text-cream-400">
          <WifiOffIcon className="h-6 w-6" />
        </span>
        <h1 className="font-display mt-5 text-2xl font-semibold tracking-tight text-cream-50">
          Sin conexión
        </h1>
        <p className="mt-2 max-w-xs text-sm text-cream-500">
          No hay internet. Revisa tu conexión e intenta de nuevo.
        </p>
      </div>
    </main>
  )
}