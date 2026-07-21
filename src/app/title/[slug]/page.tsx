import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalog, contentBySlug } from "@/data/catalog";
import { TitleDetailView } from "@/components/views/TitleDetailView";

export function generateStaticParams() {
  return catalog.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = contentBySlug.get(slug);
  if (!item) return {};
  return {
    title: item.title.en,
    description: item.synopsis.en,
  };
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = contentBySlug.get(slug);
  if (!item) notFound();
  return <TitleDetailView item={item} />;
}
