'use client';

import React, { useState } from 'react';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'slider';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  labels?: { min: string; max: string };
}

interface OnboardingData {
  [key: string]: string | string[] | number;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onCancel: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({});

  const questions: Question[] = [
    {
      id: 'name',
      question: 'What should we call you?',
      type: 'text',
      placeholder: 'Enter your preferred name',
      required: true
    },
    {
      id: 'transportation',
      question: 'How do you prefer to get around? 🚗',
      type: 'select',
      options: ['🚕 Taxi / Uber', '🚆 Train', '🏎️ Rental Car', '🚶 Walking / Bike', '✈️ Flying', '🚌 Public Transport'],
      required: true
    },
    {
      id: 'schedule_flexibility',
      question: 'How flexible are you with your travel schedule?',
      type: 'slider',
      min: 1,
      max: 5,
      labels: { min: 'Strict Schedule', max: 'Go with the Flow' },
      required: true
    },
    {
      id: 'accommodation',
      question: 'Pick your ideal place to stay: 🏨',
      type: 'select',
      options: ['🏨 Hotel', '🏠 Airbnb / Vacation Rental', '🛖 Hostel', '⛺ Camping / Glamping', '🏰 Resort', '🚐 RV / Camper'],
      required: true
    },
    {
      id: 'activities',
      question: 'What kind of activities do you enjoy? (Select all that apply)',
      type: 'multiselect',
      options: ['🖼️ Museums & Art', '🏞️ Nature & Hiking', '🍴 Food & Wine', '🏙️ City Tours & Landmarks', '🎉 Nightlife', '🏖️ Beach & Water Sports', '🛍️ Shopping', '🎭 Shows & Entertainment'],
      required: false
    },
    {
      id: 'dietary_restrictions',
      question: 'Do you have any dietary restrictions?',
      type: 'multiselect',
      options: ['🌱 Vegetarian', '🥩 Vegan', '🥜 Nut Allergy', '🥛 Lactose Intolerance', '🌾 Gluten-Free', '🍖 Halal', '🥓 No Restrictions'],
      required: false
    },
    {
      id: 'comfort_level',
      question: 'How much comfort do you prefer?',
      type: 'slider',
      min: 1,
      max: 5,
      labels: { min: 'Backpacker', max: 'Luxury' },
      required: true
    },
    {
      id: 'trip_length',
      question: 'How long is your typical trip?',
      type: 'select',
      options: ['Weekend (1-3 days)', 'Short (4-7 days)', 'Long (7+ days)', 'Extended (2+ weeks)'],
      required: true
    },
    {
      id: 'trip_vibe',
      question: 'Pick the vibe of your ideal trip:',
      type: 'multiselect',
      options: ['🌅 Relaxing & Scenic', '🎭 Cultural & Artistic', '🍹 Fun & Social', '🏔️ Adventurous & Outdoors', '🏛️ Historical & Educational', '🌃 Urban & Modern'],
      required: false
    }
  ];

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    
    // Validate required fields
    if (currentQuestion.required && !formData[currentQuestion.id]) {
      alert('This field is required');
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (value: string | string[] | number) => {
    const currentQuestion = questions[currentStep];
    setFormData({
      ...formData,
      [currentQuestion.id]: value
    });
  };

  const handleMultiSelectChange = (option: string, checked: boolean) => {
    const currentQuestion = questions[currentStep];
    const currentValues = (formData[currentQuestion.id] as string[]) || [];
    
    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(v => v !== option);
    }
    
    setFormData({
      ...formData,
      [currentQuestion.id]: newValues
    });
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-webkit-slider-track {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .slider::-moz-range-track {
          background: #e5e7eb;
          border-radius: 4px;
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to VacAI!</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {questions.length}
          </p>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h3>

          {/* Input Fields */}
          <div className="space-y-4">
            {currentQuestion.type === 'text' && (
              <input
                type="text"
                placeholder={currentQuestion.placeholder}
                value={(formData[currentQuestion.id] as string) || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
              />
            )}

            {currentQuestion.type === 'slider' && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{currentQuestion.labels?.min}</span>
                  <span>{currentQuestion.labels?.max}</span>
                </div>
                <input
                  type="range"
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  value={(formData[currentQuestion.id] as number) || currentQuestion.min || 1}
                  onChange={(e) => handleInputChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center">
                  <span className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                    {formData[currentQuestion.id] || currentQuestion.min || 1}
                  </span>
                </div>
              </div>
            )}

            {currentQuestion.type === 'select' && (
              <select
                value={(formData[currentQuestion.id] as string) || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="" className="text-gray-500">Select an option</option>
                {currentQuestion.options?.map(option => (
                  <option key={option} value={option} className="text-gray-900">{option}</option>
                ))}
              </select>
            )}

            {currentQuestion.type === 'multiselect' && (
              <div className="space-y-3">
                {currentQuestion.options?.map(option => {
                  const isChecked = ((formData[currentQuestion.id] as string[]) || []).includes(option);
                  return (
                    <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleMultiSelectChange(option, e.target.checked)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {currentStep === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;