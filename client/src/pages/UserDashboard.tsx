
import { Navbar } from "@/components/Navbar";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoCard } from "@/components/VideoCard";
import { Play, Upload, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

export default function UserDashboard() {
  const { user, unlockedVideos, watchHistory } = useStore();
  
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to view your dashboard</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allVideos = (videosData?.videos || []).sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Filter videos uploaded by the current user (match against both id and email)
  const myVideos = allVideos.filter((v: any) => 
    v.creatorId === user.id || v.creatorId === user.email
  );
  
  // Filter unlocked videos - check both store and user unlocked videos
  const myUnlockedVideos = allVideos.filter((v: any) => 
    unlockedVideos.includes(v.id) || user.unlockedVideos?.includes(v.id)
  );

  // Get history videos sorted by watch time
  const historyVideos = watchHistory
    .map(h => allVideos.find((v: any) => v.id === h.videoId))
    .filter(Boolean); // Filter out any undefined videos

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 max-w-[1920px]">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-card border border-border shadow-sm">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-display font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm bg-secondary px-3 py-1 rounded-full">
                <Play className="h-4 w-4 text-primary" />
                <span className="font-bold">{unlockedVideos.length}</span> Unlocked Videos
              </div>
              <div className="flex items-center gap-2 text-sm bg-secondary px-3 py-1 rounded-full">
                <Upload className="h-4 w-4 text-primary" />
                <span className="font-bold">{myVideos.length}</span> Uploads
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/upload">
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload New Video
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Edit Profile</Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="library">My Library</TabsTrigger>
            <TabsTrigger value="uploads">My Uploads</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Purchased & Unlocked Content
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : myUnlockedVideos.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {myUnlockedVideos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">You haven't unlocked any videos yet.</p>
                  <Link href="/">
                    <Button variant="link" className="mt-2">Browse Premium Content</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="uploads" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  My Uploads
                </h2>
                <Link href="/upload">
                  <Button size="sm" variant="outline">Upload New</Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : myVideos.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {myVideos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">You haven't uploaded any videos yet.</p>
                  <Link href="/upload">
                    <Button className="mt-4">Start Uploading</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Watch History
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : historyVideos.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {historyVideos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No watch history yet. Start watching videos!</p>
                  <Link href="/">
                    <Button variant="link" className="mt-2">Browse Videos</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
