import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import logo from "@assets/generated_images/video_platform_logo.png";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (credentialResponse.credential) {
        // Send the Google credential token to backend for verification
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: credentialResponse.credential
          })
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }

        const data = await response.json();
        const user = data.user;

        // Login with real user from MongoDB (includes MongoDB _id and isAdmin status)
        login({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isAdmin: user.isAdmin || false
        });

        toast({
          title: "Welcome back!",
          description: `Signed in as ${user.name}`,
        });

        onClose();
      }
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: "Login Failed",
        description: "Could not verify Google credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <img src={logo} alt="StreamFlow" className="h-12 w-12 rounded-lg mb-2" />
            <DialogTitle className="text-2xl font-display font-bold">Welcome Back</DialogTitle>
            <DialogDescription>
              Sign in to access your premium content and watchlist.
            </DialogDescription>
          </div>

          <div className="w-full space-y-3 flex flex-col items-center">
            {isLoading ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                    toast({
                      title: "Login Failed",
                      description: "Something went wrong with Google Sign-In.",
                      variant: "destructive"
                    });
                  }}
                  theme="filled_blue"
                  size="large"
                  width="300"
                  shape="rectangular"
                  text="continue_with"
                />
              </div>
            )}

            <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="secondary" className="w-full" disabled>
              Sign in with Email
            </Button>
          </div>

          <div className="text-xs text-muted-foreground px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}