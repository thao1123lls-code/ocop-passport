"use client";

import dynamic from "next/dynamic";

const SupportChatBubble = dynamic(() => import("@/components/SupportChatBubble"), {
  ssr: false,
});

const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), {
  ssr: false,
});

const SyncToast = dynamic(() => import("@/components/SyncToast"), {
  ssr: false,
});

export default function ClientWidgets() {
  return (
    <>
      <ScrollToTop />
      <SupportChatBubble />
      <SyncToast />
    </>
  );
}
