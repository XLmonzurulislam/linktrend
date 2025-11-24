
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Search, Upload, ShieldCheck, Menu, LogOut, Settings, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import { useState } from "react";
import logo from "@assets/generated_images/video_platform_logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isAdmin, pendingPayments, logout } = useStore();
  const [location] = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingCount = pendingPayments.length;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-base sm:text-xl tracking-tight hover:opacity-90 transition-opacity shrink-0">
              <img src={logo} alt="LinkTrend" className="h-6 w-6 sm:h-8 sm:w-8 rounded-md" />
              <span className="hidden xs:inline">LinkTrend</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/" className={location === '/' ? "text-primary" : "hover:text-foreground transition-colors"}>Browse</Link>
              <Link href="/creators" className="hover:text-foreground transition-colors">Creators</Link>
              <Link href="/live" className="hover:text-foreground transition-colors">Live</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden xl:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search videos..."
                className="h-9 w-48 xl:w-64 rounded-md border border-input bg-secondary px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {user ? (
                <>
                  <Link href="/upload" className="hidden md:block">
                    <Button size="sm" className="gap-1 sm:gap-2">
                      <Upload className="h-4 w-4" />
                      <span className="hidden lg:inline">Upload</span>
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <Link href="/dashboard">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                      </Link>

                      {isAdmin && (
                        <Link href="/admin">
                          <DropdownMenuItem>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                            {pendingCount > 0 && (
                              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {pendingCount}
                              </span>
                            )}
                          </DropdownMenuItem>
                        </Link>
                      )}
                      
                      <DropdownMenuSeparator />
                      <Link href="/settings">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => setIsLoginOpen(true)} size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}

              {/* Mobile Menu */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                      <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/" className="w-full">Browse</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/creators" className="w-full">Creators</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/live" className="w-full">Live</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/upload" className="w-full md:hidden">Upload Video</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => setIsLoginOpen(true)}>Sign In</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
