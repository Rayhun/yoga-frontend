import { checkZoomConnection } from '@/services/private/expert/groupCoaching';
import { toastApiError } from '@/utils/helpers';
import { useMutation } from '@tanstack/react-query';
import OAuthPopup from 'react-oauth-popup';
import { toast } from 'react-toastify';
import { TbBrandZoom } from 'react-icons/tb';
import { usePathname, useRouter } from 'next/navigation';

const ZoomMeetingConnectionButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: checkConnection } = useMutation({
    mutationFn: checkZoomConnection,
  });

  const handleLoginSuccess = async code => {
    try {
      await checkConnection({ code });
      router.replace(`${pathname}?is_zoom_connected=true`);
      toast.success('Zoom connection successful');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleLoginError = error => {
    console.error('Zoom connection error:', error);
  };

  const clientId = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;
  const redirectUri = `${window.location.origin}/portal/teacher/group_coaching/add`;
  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
  return (
    <div>
      <OAuthPopup
        url={zoomAuthUrl}
        onCode={handleLoginSuccess}
        onClose={handleLoginError}
        width={600}
        height={600}
      >
        <button className="px-4 py-1 border-primary bg-primary text-white transition hover:bg-opacity-90 rounded-lg border flex justify-center items-center gap-2 disabled:opacity-[0.5] disabled:bg-initial disabled:cursor-not-allowed">
          <TbBrandZoom size={18} className="text-white" /> Connect with Zoom
        </button>
      </OAuthPopup>
    </div>
  );
};

export default ZoomMeetingConnectionButton;
