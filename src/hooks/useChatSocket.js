'use client';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Cookies from 'js-cookie';

function useChatSocket(url) {
  const socketUrl = url ? `${process.env.NEXT_PUBLIC_SOCKET_BASE_URL}/${url}/` : null;

  const socket = useWebSocket(socketUrl, {
    queryParams: {
      token: Cookies.get('token'),
    },
    shouldConnect: !!url,
  });

  const { readyState } = socket;

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return { ...socket, connection: { isConnected: readyState === ReadyState.OPEN, status: connectionStatus } };
}

export default useChatSocket;
