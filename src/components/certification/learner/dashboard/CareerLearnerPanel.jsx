'use client';
import { useRouter } from 'next/navigation';

const CareerLearnerPanel = ({ block }) => {
  const router = useRouter();
  const skills = block?.skills || [];
  const suggestedNext = block?.suggested_next || [];

  if (skills.length === 0 && suggestedNext.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-lg p-6 flex flex-col gap-5">
      {skills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Skills you&apos;ve gained</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestedNext.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Suggested next</h3>
          <div className="flex flex-col gap-2">
            {suggestedNext.map(program => (
              <button
                key={program.id}
                onClick={() => router.push(`/portal/customer/certification/${program.id}`)}
                className="text-left px-4 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                {program.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerLearnerPanel;
