import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchView } from "@/components/views/SearchView";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
