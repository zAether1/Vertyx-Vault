import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalog, contentById } from "@/data/catalog";
import { WatchView } from "@/components/views/WatchView";

export function generateStaticParams() {
  return catalog.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = contentById.get(id);
  return item ? { title: item.title.en } : {};
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = contentById.get(id);
  if (!item) notFound();
  return (
    <Suspense>
      <WatchView item={item} />
    </Suspense>
  );
}
