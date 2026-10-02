import { Suspense } from "react";

import { HomeView } from "@/components/home/home-view";

export default function Home() {
  // HomeView reads the search params (query, category, tab), which needs a Suspense boundary.
  return (
    <Suspense>
      <HomeView />
    </Suspense>
  );
}
