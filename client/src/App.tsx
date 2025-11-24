import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import Home from "@/pages/Home";
import VideoPlayer from "@/pages/VideoPlayer";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import UserDashboard from "@/pages/UserDashboard";
import UploadVideo from "@/pages/UploadVideo";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/watch/:id" component={VideoPlayer} />
      <Route path="/sys-root-xs" component={AdminLogin} />
      <Route path="/sys-root-xs/dashboard">
        <AdminProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/upload" component={UploadVideo} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { login, logout } = useStore();

  useEffect(() => {
    // Verify session with backend on app mount
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            login(data.user);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        logout();
      }
    };

    verifySession();
  }, [login, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;