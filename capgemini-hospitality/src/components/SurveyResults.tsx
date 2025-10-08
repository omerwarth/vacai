'use client';

import React from 'react';

interface OnboardingData {
  [key: string]: string | string[] | number;
}

interface SurveyResultsProps {
  data: OnboardingData;
  onClose: () => void;
}

const SurveyResults: React.FC<SurveyResultsProps> = ({ data, onClose }) => {
  const formatValue = (value: string | string[] | number, key?: string): string => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None selected';
    }
    
    // Handle slider values with descriptive text
    if (typeof value === 'number') {
      if (key === 'schedule_flexibility') {
        const labels = ['Very Strict', 'Somewhat Strict', 'Flexible', 'Very Flexible', 'Completely Flexible'];
        return labels[value - 1] || `${value}/5`;
      }
      if (key === 'comfort_level') {
        const labels = ['Backpacker', 'Budget', 'Mid-range', 'Upscale', 'Luxury'];
        return labels[value - 1] || `${value}/5`;
      }
      return `${value}/5`;
    }
    
    return String(value || 'Not provided');
  };

  const getQuestionLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      name: 'Preferred Name',
      transportation: 'Transportation Preference',
      schedule_flexibility: 'Schedule Flexibility',
      accommodation: 'Accommodation Preference',
      activities: 'Preferred Activities',
      dietary_restrictions: 'Dietary Restrictions',
      comfort_level: 'Comfort Level',
      trip_length: 'Typical Trip Length',
      trip_vibe: 'Ideal Trip Vibe'
    };
    return labels[key] || key;
  };

  const getIcon = (key: string): React.ReactElement => {
    const icons: { [key: string]: React.ReactElement } = {
      name: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      transportation: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      schedule_flexibility: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accommodation: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      activities: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10v.01M12 5v.01M15 5v.01M12 19v.01" />
        </svg>
      ),
      dietary_restrictions: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      comfort_level: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      trip_length: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      trip_vibe: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    };
    return icons[key] || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Survey Results</h2>
              <p className="text-gray-600 mt-1">Here's what we learned about you</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">
                Welcome aboard, {formatValue(data.name)}! 🎉
              </h3>
            </div>
            <p className="text-blue-800">
              Thanks for taking the time to tell us about yourself. We'll use this information to personalize your experience with VacAI.
            </p>
          </div>

          {/* Survey Responses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-gray-200 rounded-lg p-2 mr-3 text-gray-600">
                    {getIcon(key)}
                  </div>
                  <h4 className="font-semibold text-gray-900">{getQuestionLabel(key)}</h4>
                </div>
                <div className="text-gray-800">
                  {Array.isArray(value) && value.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((item, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-900 text-sm px-3 py-1 rounded-full font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : Array.isArray(value) && value.length === 0 ? (
                    <span className="text-gray-500 italic">None selected</span>
                  ) : (
                    <span className="bg-green-100 text-green-900 text-sm px-3 py-1 rounded-full inline-block font-medium">
                      {formatValue(value, key)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Personalized Recommendations */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900">What's Next?</h3>
            </div>
            <p className="text-green-800 mb-4">
              Based on your travel preferences, here are some personalized recommendations:
            </p>
            <ul className="space-y-2">
              {data.transportation && String(data.transportation).includes('🚶 Walking') && (
                <li className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Consider walkable city destinations like Paris, Amsterdam, or Barcelona
                </li>
              )}
              {Array.isArray(data.activities) && data.activities.includes('🖼️ Museums & Art') && (
                <li className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Explore cultural hubs like Rome, Vienna, or New York City
                </li>
              )}
              {Array.isArray(data.activities) && data.activities.includes('🏞️ Nature & Hiking') && (
                <li className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Check out national parks like Banff, Torres del Paine, or Swiss Alps
                </li>
              )}
              {data.comfort_level && Number(data.comfort_level) >= 4 && (
                <li className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Explore luxury destinations and premium experiences
                </li>
              )}
              {Array.isArray(data.trip_vibe) && data.trip_vibe.includes('🌅 Relaxing & Scenic') && (
                <li className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Consider peaceful destinations like Santorini, Bali, or Tuscany
                </li>
              )}
              <li className="flex items-center text-green-700">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Start planning your next adventure with AI-powered recommendations
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;