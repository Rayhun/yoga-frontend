import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateUser } from '@/services/public/auth';

async function ServerProtectedRoute({ redirectTo = '/auth/login', children }) {
  const token = cookies().get('token')?.value;
  let data = null;

  try {
    const result = await authenticateUser({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = result.data.data;
  } catch (error) {
    console.log(error?.message, 'auth-error');
  }

  if (!data) {
    return redirect(redirectTo);
  }

  return children;
}

export default ServerProtectedRoute;
