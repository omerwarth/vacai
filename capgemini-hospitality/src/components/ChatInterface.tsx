// src/app/ChatInterface.tsx
'use client';

import { Thread } from "@/components/assistant-ui/thread";

interface ChatInterfaceProps {
  onBack: () => void;
}
export default function ChatInterface({ onBack }: ChatInterfaceProps){
  return <Thread />;
}
