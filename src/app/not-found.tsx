"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { VertyxMark } from "@/components/ui/icons";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <VertyxMark size={48} className="opacity-60" />
      <p className="font-display text-display-md font-semibold text-ink">404</p>
      <p className="max-w-sm text-body text-ink-dim">{t.detail.notFound}</p>
      <ButtonLink href="/">{t.detail.backHome}</ButtonLink>
    </div>
  );
}
