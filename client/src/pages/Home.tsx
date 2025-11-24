
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { VideoCard } from "@/components/VideoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  const allVideos = (videosData?.videos || []).sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const premiumVideos = allVideos.filter((v: any) => v.isPremium === true);
  const freeVideos = allVideos.filter((v: any) => v.isPremium === false);
  
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-8 sm:space-y-10 md:space-y-12 max-w-[1920px]">
        <section>
          <Hero />
        </section>

        <section className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">Trending Now</h2>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({allVideos.length})</TabsTrigger>
              <TabsTrigger value="premium">Premium ({premiumVideos.length})</TabsTrigger>
              <TabsTrigger value="free">Free ({freeVideos.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 sm:mt-5 md:mt-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : allVideos.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No videos available. Upload your first video!
                  </div>
                ) : (
                  allVideos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="premium" className="mt-4 sm:mt-5 md:mt-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : premiumVideos.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No premium videos available.
                  </div>
                ) : (
                  premiumVideos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="free" className="mt-4 sm:mt-5 md:mt-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : freeVideos.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No free videos available.
                  </div>
                ) : (
                  freeVideos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
