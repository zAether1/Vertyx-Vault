"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { VertyxMark } from "@/components/ui/icons";
import { genres } from "@/data/genres";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Footer() {
  const { t, locale } = useI18n();

  return (
    <footer className="border-t border-graphite-800 bg-abyss" data-i18n-region>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-2.5 text-ink">
            <VertyxMark size={24} />
            <span className="font-display font-semibold">Vertyx Vault</span>
          </div>
          <p className="text-caption text-ink-faint">{t.footer.about}</p>
          <div className="md:hidden">
            <LocaleSwitcher />
          </div>
        </div>

        <div>
          <h3 className="label-micro mb-4">{t.footer.discover}</h3>
          <ul className="space-y-2.5 text-caption text-ink-dim">
            {genres.slice(0, 4).map((g) => (
              <li key={g.id}>
                <Link href={`/search?genre=${g.id}`} className="transition-colors hover:text-ink">
                  {g.label[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-micro mb-4">{t.footer.library}</h3>
          <ul className="space-y-2.5 text-caption text-ink-dim">
            <li>
              <Link href="/favorites" className="transition-colors hover:text-ink">
                {t.nav.favorites}
              </Link>
            </li>
            <li>
              <Link href="/history" className="transition-colors hover:text-ink">
                {t.nav.history}
              </Link>
            </li>
            <li>
              <Link href="/profile" className="transition-colors hover:text-ink">
                {t.nav.profile}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-graphite-800/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
          <p className="label-micro">
            © {new Date().getFullYear()} Vertyx Vault · {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
