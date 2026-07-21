import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { SkipLink } from "@/components/layout/SkipLink";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vertyx Vault",
    template: "%s · Vertyx Vault",
  },
  description:
    "A cinematic library to discover and organize the audiovisual content you love.",
};

export const viewport: Viewport = {
  themeColor: "#050408",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <body>
        <LocaleProvider initial={locale}>
          <SkipLink />
          <AmbientBackground />
          <Navbar />
          <AppShell>{children}</AppShell>
          <CustomCursor />
          <GrainOverlay />
          <IntroOverlay />
        </LocaleProvider>
      </body>
    </html>
  );
}
