import React from 'react';
import JournalForm from './Form';
import PastDiaries from './Diaries';
import { LiaBookSolid } from 'react-icons/lia';
import { PiTarget } from 'react-icons/pi';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const Journal = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center text-xl gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <LiaBookSolid size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl">My Wellness Journey</h1>
              <p className="text-green-100 text-sm">Document your thoughts and experiences</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="flex items-center gap-2 text-yellow-300 text-sm font-bold">
                <PiTarget size={18} />
                <span>May Goal: Active Mindfulness</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8">
        <Section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✍️</span>
              </div>
              Write Your Journal Entry
            </h2>
            <p className="text-gray-600">Share your thoughts, feelings, and experiences from today.</p>
          </div>
          <JournalForm />
        </Section>
        
        <Section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">📚</span>
              </div>
              Past Journal Entries
            </h2>
            <p className="text-gray-600">Review your previous entries and track your progress.</p>
          </div>
          <PastDiaries />
        </Section>
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">💭</span>
            </div>
            <h3 className="font-bold text-gray-800">Reflect Daily</h3>
          </div>
          <p className="text-gray-600 text-sm">Take time each day to reflect on your experiences and emotions to build self-awareness.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg">🎯</span>
            </div>
            <h3 className="font-bold text-gray-800">Track Progress</h3>
          </div>
          <p className="text-gray-600 text-sm">Monitor your wellness journey and celebrate milestones along the way.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 text-lg">🌟</span>
            </div>
            <h3 className="font-bold text-gray-800">Build Habits</h3>
          </div>
          <p className="text-gray-600 text-sm">Develop consistent journaling habits to support your mental and emotional well-being.</p>
        </div>
      </div>
    </div>
  );
};

export default Journal;
