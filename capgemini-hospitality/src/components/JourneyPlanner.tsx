'use client';

import { useState } from 'react';
import { useEdgeRuntime, AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import {
  useAssistantInstructions,
  useAssistantTool,
} from "@assistant-ui/react";

interface JourneyPlannerProps {
  onBack: () => void;
}

// Component that uses assistant hooks - must be inside AssistantRuntimeProvider
function JourneyPlannerContent({ onBack }: JourneyPlannerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Assistant instructions for travel planning
  useAssistantInstructions(`
    You are a professional travel planning assistant for a hospitality platform. 
    Your role is to help users plan personalized journeys based on their preferences and travel history.
    
    Key capabilities:
    - Suggest destinations based on user preferences
    - Recommend accommodations, activities, and dining
    - Create detailed itineraries
    - Provide travel tips and local insights
    - Consider budget, travel dates, and group size
    
    Always be helpful, friendly, and provide actionable travel advice.
  `);

  // Tool to refresh the planning session
  useAssistantTool({
    toolName: "restart_planning",
    description: "Restart the journey planning session with a fresh start",
    parameters: {},
    execute: async () => {
      setCurrentStep(1);
      window.location.reload();
    },
  });

  // Tool to go back to dashboard
  useAssistantTool({
    toolName: "back_to_dashboard",
    description: "Return to the main dashboard",
    parameters: {},
    execute: async () => {
      onBack();
    },
  });

  const MarkdownText = makeMarkdownText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Journey Planner</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Journey Assistant</h2>
          <div className="space-y-4">
            <Thread
              assistantMessage={{ components: { Text: MarkdownText } }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Main component that sets up the runtime provider
export default function JourneyPlanner({ onBack }: JourneyPlannerProps) {
  const runtime = useEdgeRuntime({
    api: "/api/chat",
    unstable_AISDKInterop: true,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <JourneyPlannerContent onBack={onBack} />
    </AssistantRuntimeProvider>
  );
}