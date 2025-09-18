import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Signup(){
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to unified auth page
    router.replace('/auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A9E0] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}

 
