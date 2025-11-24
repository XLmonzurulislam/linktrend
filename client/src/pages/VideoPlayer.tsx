import { useParams, useLocation, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useStore } from "@/lib/store";
import { PaymentModal } from "@/components/PaymentModal";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Lock, Play, Clock, ShieldAlert, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

export default function VideoPlayer() {
  const { id } = useParams();
  const [location] = useLocation();
  const { isUnlocked, hasPendingRequest, user, login, updateUser, unlockedVideos, addToHistory } = useStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const hasAddedToHistory = useRef<string | null>(null);

  // Reset history tracking when video ID changes
  useEffect(() => {
    hasAddedToHistory.current = null;
  }, [id]);

  // Fetch the specific video from API
  const { data: videoData, isLoading: isLoadingVideo } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${id}`);
      if (!response.ok) throw new Error('Failed to fetch video');
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch all videos for "Up Next" section
  const { data: allVideosData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  // Refresh user data to check if video was unlocked
  const { data: userData } = useQuery({
    queryKey: ['currentUser', user?.id],
    queryFn: async () => {
      if (!user?.email) return null;
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.name, avatar: user.avatar }),
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      // Update user in store
      if (data.user) {
        updateUser(data.user);
      }
      return data.user;
    },
    enabled: !!user?.email,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Check for pending transaction from server
  const { data: transactionData } = useQuery({
    queryKey: ['userTransaction', user?.id, videoData?.video?.id],
    queryFn: async () => {
      const currentVideoId = videoData?.video?.id;
      if (!user?.id || !currentVideoId) return null;
      const response = await fetch('/api/transactions');
      if (!response.ok) return null;
      const data = await response.json();
      // Find pending transaction for this user and video
      const userTransaction = data.transactions?.find(
        (t: any) => t.userId === user.id && t.videoId === currentVideoId && t.status === 'pending'
      );
      return userTransaction;
    },
    enabled: !!user?.id && !!videoData?.video?.id && videoData?.video?.isPremium === true,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const video = videoData?.video;

  // Always use the refreshed user data from server
  const currentUser = userData || user;
  const hasAccess = !video?.isPremium || (currentUser && video && currentUser.unlockedVideos?.includes(video.id));
  const hasPendingPayment = !!transactionData;

  // Increment view count and add to history on mount (only once per video)
  useEffect(() => {
    if (id && video && hasAccess && hasAddedToHistory.current !== id && user) {
      fetch(`/api/videos/${id}/view`, { method: 'POST' }).catch(console.error);
      // Add to watch history only once for this video (only for authenticated users)
      addToHistory(id);
      // Only mark as added if user is authenticated (so it can retry after login)
      hasAddedToHistory.current = id;
    }
  }, [id, video, hasAccess, addToHistory, user]);

  if (isLoadingVideo || isLoadingAll) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20 flex justify-center">
          <Spinner className="h-12 w-12" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold">Video not found</h1>
          <Link href="/">
            <Button className="mt-4">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-[1920px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-3 sm:space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg sm:rounded-xl bg-black border border-border shadow-xl sm:shadow-2xl">
              {hasAccess ? (
                // Unlocked State - Real Video Player
                <video
                  controls
                  className="w-full h-full"
                  poster={video.thumbnail}
                  src={video.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                // Locked / Pending State
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-3 sm:p-4 md:p-6 text-center">
                  <img
                    src={video.thumbnail}
                    alt="Locked"
                    className="absolute inset-0 h-full w-full object-cover opacity-10 blur-xl"
                  />

                  <div className="relative z-10 w-full max-w-[90%] sm:max-w-md mx-auto space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
                    {hasPendingPayment ? (
                      <>
                        <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 mb-1 sm:mb-2 md:mb-4">
                          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin" />
                        </div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">Payment Under Review</h2>
                        <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed">
                          Your payment is currently being verified by our admins. You will be notified once access is granted.
                        </p>
                        <Button variant="secondary" disabled className="w-full gap-2 text-xs sm:text-sm md:text-base py-2 sm:py-2.5">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          Verification Pending
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-1 sm:mb-2 md:mb-4">
                          <Lock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                        </div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">Premium Content</h2>
                        <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed">
                          This video is locked. Pay a one-time fee to get unlimited access to this masterclass.
                        </p>
                        <div className="py-1 sm:py-2 md:py-4">
                           <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">৳{video.price}</span>
                        </div>
                        <Button
                          size="lg"
                          className="w-full gap-2 text-xs sm:text-sm md:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all py-2.5 sm:py-3 md:py-4"
                          onClick={() => {
                            if (!user) {
                              setIsLoginModalOpen(true);
                            } else {
                              setIsPaymentModalOpen(true);
                            }
                          }}
                        >
                          Unlock Now
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground">{video.title}</h1>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <span>{video.views} views</span>
                <span>•</span>
                <span>{video.uploadDate}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pt-2">
                {video.description}
              </p>
            </div>
          </div>

          {/* Sidebar (Up Next) */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <h3 className="font-display font-semibold text-base sm:text-lg">Up Next</h3>
            <div className="space-y-3 sm:space-y-4">
              {isLoadingAll ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                allVideosData?.videos
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .filter((v: any) => v.id !== parseInt(id!))
                  .slice(0, 8)
                  .map((v: any) => (
                  <Link key={v.id} href={`/watch/${v.id}`}>
                    <div className="group flex gap-2 sm:gap-3 cursor-pointer hover:bg-accent/50 p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors">
                      <div className="relative w-28 sm:w-32 md:w-36 lg:w-40 shrink-0 rounded-md overflow-hidden aspect-video bg-muted">
                        <img src={v.thumbnail} className="w-full h-full object-cover" alt={v.title} />
                        {v.isPremium && !currentUser?.unlockedVideos?.includes(v.id) && !unlockedVideos.includes(v.id) && (
                          <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 rounded text-[10px] font-bold text-primary">PRO</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.title}</h4>
                        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{v.creator}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{v.views} views</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <PaymentModal
        video={video}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Login Required Modal - Now includes LoginModal component */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}