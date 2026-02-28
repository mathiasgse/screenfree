'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = {
  left: [
    { href: '/orte', label: 'Entdecken' },
    { href: '/karte', label: 'Karte' },
  ],
  right: [
    { href: '/sammlungen', label: 'Sammlungen' },
    { href: '/journal', label: 'Journal' },
    { href: '/ueber', label: 'Über' },
  ],
}

const ALL_LINKS = [...NAV_LINKS.left, ...NAV_LINKS.right]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const pathname = usePathname()
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const isHeroPage =
    pathname.startsWith('/orte/') ||
    pathname.startsWith('/sammlungen/') ||
    pathname.startsWith('/journal/')

  const isMapPage = pathname === '/karte'

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isTransparent = isHeroPage && !scrolled && !isMapPage

  // Close overlay (with exit animation)
  const triggerClose = useCallback(() => {
    setIsClosing(true)
  }, [])

  // Immediately close (no animation) — for route changes
  const closeImmediately = useCallback(() => {
    setMenuOpen(false)
    setIsClosing(false)
  }, [])

  // Open overlay
  const openMenu = useCallback(() => {
    setMenuOpen(true)
    setIsClosing(false)
  }, [])

  // Animation end → finalize close
  const handleAnimationEnd = useCallback(() => {
    if (isClosing) {
      setMenuOpen(false)
      setIsClosing(false)
      hamburgerRef.current?.focus()
    }
  }, [isClosing])

  // Focus close button when overlay opens
  useEffect(() => {
    if (menuOpen && !isClosing) {
      closeRef.current?.focus()
    }
  }, [menuOpen, isClosing])

  // Escape key handler
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') triggerClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen, triggerClose])

  // Body scroll lock
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Close on route change
  useEffect(() => {
    closeImmediately()
  }, [pathname, closeImmediately])

  // Desktop nav link classes
  function desktopLinkClass(href: string) {
    const active = isActive(pathname, href)
    if (isTransparent) {
      return `relative transition-colors ${
        active
          ? 'text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-white'
          : 'text-white/80 hover:text-white'
      }`
    }
    return `relative transition-colors ${
      active
        ? 'text-accent after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-accent'
        : 'text-stone-600 hover:text-accent'
    }`
  }

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled && !isTransparent ? 'border-b border-stone-200' : 'border-b border-transparent'
        }`}
        style={{
          backgroundColor: isTransparent
            ? 'rgba(250, 249, 247, 0)'
            : 'rgba(250, 249, 247, 0.9)',
          backdropFilter: isTransparent ? 'blur(0px)' : 'blur(8px)',
        }}
      >
        <nav
          className={`mx-auto max-w-7xl px-6 md:px-10 transition-all duration-300 ${
            scrolled ? 'py-3' : 'py-5'
          }`}
        >
          {/* Desktop: three-column grid */}
          <div className="hidden md:grid md:grid-cols-3 md:items-center">
            {/* Left links */}
            <div className="flex gap-8 text-sm tracking-wide">
              {NAV_LINKS.left.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={desktopLinkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center logo */}
            <Link
              href="/"
              className={`justify-self-center font-serif tracking-[0.2em] transition-all duration-300 ${
                scrolled ? 'text-lg' : 'text-xl'
              } ${isTransparent ? 'text-white' : 'text-stone-900'}`}
            >
              Stille Orte
            </Link>

            {/* Right links */}
            <div className="flex justify-end gap-8 text-sm tracking-wide">
              {NAV_LINKS.right.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={desktopLinkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: logo left, hamburger right */}
          <div className="flex items-center justify-between md:hidden">
            <Link
              href="/"
              className={`font-serif tracking-[0.2em] transition-all duration-300 ${
                scrolled ? 'text-lg' : 'text-xl'
              } ${isTransparent ? 'text-white' : 'text-stone-900'}`}
            >
              Stille Orte
            </Link>

            <button
              ref={hamburgerRef}
              onClick={openMenu}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
              aria-label="Menü öffnen"
              aria-expanded={menuOpen}
            >
              <span
                className={`block h-[1.5px] w-5 transition-colors ${
                  isTransparent ? 'bg-white' : 'bg-stone-700'
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 transition-colors ${
                  isTransparent ? 'bg-white' : 'bg-stone-700'
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 transition-colors ${
                  isTransparent ? 'bg-white' : 'bg-stone-700'
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-stone-900/50 ${
              isClosing ? 'animate-overlay-fade-out' : 'animate-overlay-fade-in'
            }`}
            onClick={triggerClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={`absolute inset-y-0 right-0 w-full bg-stone-800 ${
              isClosing
                ? 'animate-overlay-slide-out-right'
                : 'animate-overlay-slide-in-right'
            }`}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Header: logo + close */}
            <div className="flex items-center justify-between px-6 py-5">
              <Link
                href="/"
                onClick={triggerClose}
                className="font-serif text-xl tracking-[0.2em] text-stone-100"
              >
                Stille Orte
              </Link>

              <button
                ref={closeRef}
                onClick={triggerClose}
                className="flex h-11 w-11 items-center justify-center"
                aria-label="Menü schließen"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 2l16 16M18 2L2 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-stone-300"
                  />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="mt-8 px-6">
              {ALL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={triggerClose}
                  className={`block py-4 font-serif text-3xl transition-colors ${
                    isActive(pathname, link.href)
                      ? 'text-accent'
                      : 'text-stone-300 hover:text-stone-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Tagline */}
            <p className="absolute bottom-10 left-6 right-6 text-sm tracking-wide text-stone-500">
              Kuratierte stille Orte im Alpenraum
            </p>
          </div>
        </div>
      )}
    </>
  )
}
