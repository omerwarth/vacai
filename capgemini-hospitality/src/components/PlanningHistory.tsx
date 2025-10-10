"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "draft";
};

const SAVED_PLANS_KEY = "vacation-plans";

function loadPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(SAVED_PLANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // ignore
  }
  return [];
}

export default function PlanningHistory() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    setPlans(loadPlans());
  }, []);

  if (!plans || plans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Planning History</h1>
          <p className="text-gray-600">You don't have any plans yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Planning History</h1>
        <p className="text-gray-600 mb-6">Review your past and in-progress vacation plans.</p>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <h2 className="font-semibold text-lg">{plan.title}</h2>
                <p className="text-sm text-gray-500">{new Date(plan.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    plan.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : plan.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {plan.status.replace("-", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlanningHistoryLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/planning-history')}
      className={className}
    >
      {children ?? 'View Planning History'}
    </button>
  );
}
