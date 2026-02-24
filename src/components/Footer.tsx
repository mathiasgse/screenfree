import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-stone-100 py-20 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 md:px-10">
        <Link href="/" className="font-serif text-2xl tracking-[0.2em] text-stone-300 transition-colors hover:text-accent">
          STILL
        </Link>
        <nav className="flex gap-8 text-sm text-stone-400">
          <Link href="/orte" className="transition-colors hover:text-accent">
            Orte
          </Link>
          <Link href="/sammlungen" className="transition-colors hover:text-accent">
            Sammlungen
          </Link>
          <Link href="/journal" className="transition-colors hover:text-accent">
            Journal
          </Link>
          <Link href="/karte" className="transition-colors hover:text-accent">
            Karte
          </Link>
          <Link href="/impressum" className="transition-colors hover:text-accent">
            Impressum
          </Link>
          <Link href="/datenschutz" className="transition-colors hover:text-accent">
            Datenschutz
          </Link>
        </nav>
        <p className="text-xs text-stone-300">
          &copy; {new Date().getFullYear()} STILL
        </p>
      </div>
    </footer>
  )
}
