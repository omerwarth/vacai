'use client';

import {
  AssistantRuntimeProvider,
  useAssistantInstructions,
  useAssistantTool,
  useLocalRuntime,
} from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";

interface JourneyPlannerProps {
  onBack: () => void;
}

function JourneyPlannerContent({ onBack }: JourneyPlannerProps) {
  useAssistantInstructions(`
    You are a professional travel planning assistant for a hospitality platform.
    Your role is to help users plan personalized journeys based on their preferences and travel history.
  `);

  useAssistantTool({
    toolName: "restart_planning",
    description: "Restart the journey planning session with a fresh start",
    parameters: {},
    execute: async () => {
      window.location.reload();
    },
  });

  useAssistantTool({
    toolName: "back_to_dashboard",
    description: "Return to the main dashboard",
    parameters: {},
    execute: async () => {
      onBack();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Journey Planner</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">AI Journey Assistant</h2>
            <p className="text-gray-600 text-sm mt-1">
              Let me help you plan your perfect trip
            </p>
          </div>
          <div className="h-[600px] overflow-hidden">
            <Thread />
          </div>
        </div>
      </main>
    </div>
  );
}


export default function JourneyPlanner({ onBack }: JourneyPlannerProps) {

  // in production thread id would be passed as a path parameter or something similar
  // thread id is unique identifier of a chat allowing resuming of prev chats
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const thread_id = "12345"
  const azureFunctionsUrl = process.env.NEXT_PUBLIC_AZURE_FUNCTIONS_URL || 'http://localhost:7071';
  const API_URL = `${azureFunctionsUrl}/api/chat`
  const runtime = useLocalRuntime(
    {
      async run({ messages, abortSignal }) {
    // TODO replace with your own API
    const result = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // forward the messages in the chat to the API
      body: JSON.stringify({
        messages,
      }),
      // if the user hits the "cancel" button or escape keyboard key, cancel the request
      signal: abortSignal,
    });

    const data = await result.json();
    return {
      content: [
        {
          type: "text",
          text: data.text,
        },
      ],
    };
  },
    },
    {
      initialMessages: [],
    }
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <JourneyPlannerContent onBack={onBack} />
    </AssistantRuntimeProvider>
  );
}
