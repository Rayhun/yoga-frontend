'use client';
import { useState } from 'react';
import CertificateDocument, { PAPER_OPTIONS } from './CertificateDocument';

/**
 * Shared chrome around the certificate document: the paper-size selector and the
 * print/save-as-PDF action. Kept outside the print root so it never appears on paper.
 *
 * PDF export is intentionally the browser's own "Save as PDF" — a server-side PDF
 * renderer would re-implement the layout and drift from this CSS.
 */
const CertificateViewer = ({ data, defaultPaper = 'a4' }) => {
  const [paper, setPaper] = useState(defaultPaper);

  if (!data) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          Paper size
          <select
            value={paper}
            onChange={e => setPaper(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-boxdark dark:text-white"
          >
            {PAPER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/80"
        >
          Print or save as PDF
        </button>
      </div>

      <CertificateDocument data={data} paper={paper} />
    </div>
  );
};

export default CertificateViewer;
