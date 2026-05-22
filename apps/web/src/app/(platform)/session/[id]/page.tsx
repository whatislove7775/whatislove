"use client";

import dynamic from "next/dynamic";

const VideoSession = dynamic(
  () => import("@/components/video/VideoSession").then(m => m.VideoSession),
  { ssr: false }
);

interface SessionPageProps {
  params: { id: string };
  searchParams: { role?: string };
}

export default function SessionPage({ params, searchParams }: SessionPageProps) {
  const role =
    searchParams.role === "psychologist" ? "psychologist" : "client";

  return (
    <main style={{ height: "100vh", overflow: "hidden" }}>
      <VideoSession roomId={params.id} role={role} />
    </main>
  );
}
