import { LogoMark, WifiOffIcon } from '@/components/ui/icons'

export default function OfflinePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 p-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]" />
      <div className="relative flex flex-col items-center">
        <LogoMark className="h-10 w-10 text-ember-500" />
        <WifiOffIcon className="mt-6 h-10 w-10 text-cream-400" />
        <h1 className="font-display mt-4 text-2xl font-semibold tracking-tight text-cream-50">
          Sin conexión
        </h1>
        <p className="mt-2 max-w-xs text-sm text-cream-500">
          No hay internet. Revisa tu conexión e intenta de nuevo.
        </p>
      </div>
    </main>
  )
}