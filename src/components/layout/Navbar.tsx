"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, FULL_MOTION_QUERY } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavSearch } from "./NavSearch";
import { NoticeBell } from "./NoticeBell";
import {
  HeartIcon,
  ClockIcon,
  SearchIcon,
  UserIcon,
  VertyxMark,
} from "@/components/ui/icons";

function NavLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-2 rounded-pill px-3.5 py-2 text-caption transition-colors duration-[var(--duration-fast)] ${
        active ? "text-ink" : "text-ink-dim hover:text-ink"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-primary-400/0 via-primary-400 to-primary-400/0"
        />
      )}
    </Link>
  );
}

/**
 * Fixed navbar: transparent over the hero, collapses to a shorter glass bar
 * once the page scrolls. Lives outside the ScrollSmoother wrapper.
 */
export function Navbar() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useGSAP(
    () => {
      const trigger = ScrollTrigger.create({
        start: 60,
        end: "max",
        onToggle: (self) => setScrolled(self.isActive),
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [pathname] },
  );

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.to(el, {
          height: scrolled ? "var(--nav-height-compact)" : "var(--nav-height)",
          duration: 0.4,
          ease: "vv-out-expo",
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [scrolled] },
  );

  if (pathname?.startsWith("/watch")) return null;

  return (
    <header
      ref={rootRef}
      className={`fixed inset-x-0 top-0 z-40 flex items-center transition-[background-color,border-color,backdrop-filter] duration-[var(--duration-base)] ${
        scrolled ? "glass border-b border-graphite-800" : "border-b border-transparent bg-transparent"
      }`}
      style={{ height: "var(--nav-height)" }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label={t.brand.name}
        >
          <VertyxMark size={26} />
          <span className="font-display text-[1.05rem] font-semibold tracking-tight">
            Vertyx<span className="text-primary-400"> Vault</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-0.5" data-i18n-region>
          <NavLink href="/search" label={t.nav.search}>
            <SearchIcon size={16} />
          </NavLink>
          <NavLink href="/favorites" label={t.nav.favorites}>
            <HeartIcon size={16} />
          </NavLink>
          <NavLink href="/history" label={t.nav.history}>
            <ClockIcon size={16} />
          </NavLink>
          <NavLink href="/profile" label={t.nav.profile}>
            <UserIcon size={16} />
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <NavSearch />
          <NoticeBell />
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
