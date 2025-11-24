import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-background border border-border shadow-xl sm:shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      <div className="relative flex flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:py-28 xl:py-32">
        <div className="max-w-full sm:max-w-xl md:max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-primary backdrop-blur-sm">
            Featured Premiere
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight text-foreground leading-tight">
            LinkTrend: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Trending Content Hub</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-full sm:max-w-lg">
            Explore trending videos and exclusive content. Secure payments through bKash, Nagad, and Rocket.
          </p>

          <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Link href="/watch/1">
              <Button size="lg" className="w-full xs:w-auto gap-2 text-sm sm:text-base shadow-lg shadow-primary/20">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full xs:w-auto gap-2 text-sm sm:text-base bg-background/50 backdrop-blur-sm">
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}