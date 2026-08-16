'use client';
import { FiAlertCircle } from 'react-icons/fi';

const formatDate = value => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const ProfessionalLearnerPanel = ({ block }) => {
  const credentialHours = block?.credential_hours ?? 0;
  const renewals = block?.renewals || [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-lg p-6 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Credential hours earned</h3>
        <p className="text-2xl font-bold text-green-600">{credentialHours}h</p>
      </div>

      {renewals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Certificate renewals</h3>
          <div className="flex flex-col gap-2">
            {renewals.map(renewal => (
              <div
                key={renewal.program_id}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm ${
                  renewal.renewal_reminder ? 'border-amber-200 bg-amber-50' : 'border-gray-100'
                }`}
              >
                <span className="font-medium text-gray-700">{renewal.program_title}</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  {renewal.renewal_reminder && <FiAlertCircle className="text-amber-500" />}
                  Expires {formatDate(renewal.expiry_date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalLearnerPanel;
