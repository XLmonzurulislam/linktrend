import { useStore } from "@/lib/store";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

interface AdminProtectedRouteProps {
  component: React.ComponentType;
}

export function AdminProtectedRoute({ component: Component }: AdminProtectedRouteProps) {
  const { user } = useStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give time for session verification to complete
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user is the admin system user
  if (!user || user.email !== 'admin@system.local') {
    return <NotFound />;
  }
  
  return <Component />;
}
