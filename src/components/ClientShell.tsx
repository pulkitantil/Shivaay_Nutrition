'use client';

import dynamic from 'next/dynamic';

const FloatingCTA = dynamic(() => import('@/components/FloatingCTA'), { ssr: false });
const AiAssistant = dynamic(() => import('@/components/AiAssistant'), { ssr: false });

export default function ClientShell() {
  return (
    <>
      <FloatingCTA />
      <AiAssistant />
    </>
  );
}
