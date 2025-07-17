import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

// Example category and exam types
export type ExamCategory = {
  name: string;
  icon: React.ReactNode;
  exams: Exam[];
};

export type Exam = {
  name: string;
  icon: React.ReactNode;
};

interface ExamSidebarGridProps {
  categories: ExamCategory[];
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export const ExamSidebarGrid: React.FC<ExamSidebarGridProps> = ({ categories, onCategorySelect, selectedCategory }) => {
  const currentCategory =
    categories.find((cat) => cat.name === selectedCategory) || categories[0];

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col gap-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors text-base font-medium hover:bg-blue-50 ${
              selectedCategory === cat.name ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
            onClick={() => onCategorySelect?.(cat.name)}
          >
            <span className="w-6 h-6 flex items-center justify-center">{
              (typeof cat.icon === 'string' || typeof cat.icon === 'number' || React.isValidElement(cat.icon))
                ? cat.icon
                : <span title="Invalid icon">🛈</span>
            }</span>
            {cat.name}
          </button>
        ))}
      </aside>
      {/* Exam Grid */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentCategory.exams.map((exam) => (
            <Card key={exam.name} className="flex items-center gap-4 p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <span className="w-10 h-10 flex items-center justify-center">{
                (typeof exam.icon === 'string' || typeof exam.icon === 'number' || React.isValidElement(exam.icon))
                  ? exam.icon
                  : <span title="Invalid icon">🛈</span>
              }</span>
              <span className="font-semibold text-lg">{exam.name}</span>
              <Button className="ml-auto" variant="outline">View</Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExamSidebarGrid; 