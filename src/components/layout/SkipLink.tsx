"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className="skip-link">
      {t.nav.skipToContent}
    </a>
  );
}
