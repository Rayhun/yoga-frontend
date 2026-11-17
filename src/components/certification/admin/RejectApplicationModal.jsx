import { Modal } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getRejectionReasons } from '@/services/private/certification/applications';
import RejectReasonForm from '@/components/certification/admin/RejectReasonForm';

/**
 * Admin "Disapprove Application" (QTE and Institution). The reason is a category dropdown plus optional details
 * (required for Other); `onSubmit` gets { reason_category, reason_details? }. The dropdown options come from the
 * backend (Certification/rejection_reasons.py), fetched when the modal first opens and cached.
 */
const RejectApplicationModal = ({ show, onClose, onSubmit }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.certificationRejectionReasons],
    queryFn: getRejectionReasons,
    enabled: Boolean(show),
    staleTime: Infinity,
  });
  const config = data?.data?.data;

  return (
    <Modal open={show} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
          <h2 className="text-center text-2xl font-semibold mb-6">Disapprove Application</h2>

          <RejectReasonForm config={config} isLoading={isLoading} loadError={isError} onSubmit={onSubmit} onClose={onClose} />
        </div>
      </div>
    </Modal>
  );
};

export default RejectApplicationModal;
