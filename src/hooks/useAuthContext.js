import { useContext } from 'react';
import { AuthContext } from '@/context/AuthProvider';

function useAuthContext() {
  return useContext(AuthContext);
}

export default useAuthContext;
