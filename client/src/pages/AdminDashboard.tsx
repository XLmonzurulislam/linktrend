
import { Navbar } from "@/components/Navbar";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Shield, Trash2, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api";

export default function AdminDashboard() {
  const { pendingPayments, approvePayment, rejectPayment, user } = useStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions/pending', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete video');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast({
        title: "Video Deleted",
        description: "The video has been successfully deleted.",
      });
      setVideoToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      setUserToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const allVideos = (videosData?.videos || []).sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalRevenue = allVideos
    .filter((v: any) => v.isPremium)
    .reduce((sum: number, v: any) => sum + (v.price || 0), 0);

  const totalViews = allVideos.reduce((sum: number, v: any) => {
    const views = parseInt(v.views) || 0;
    return sum + views;
  }, 0);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-[1920px]">
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div className="flex items-center justify-between border-b pb-4 sm:pb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight flex items-center gap-2 sm:gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage all videos, transactions and platform content.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersData?.users?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allVideos.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionsData?.transactions?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Premium Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allVideos.filter((v: any) => v.isPremium).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all registered users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : !usersData?.users?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mb-4 opacity-20" />
                  <p>No users registered yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Unlocked Videos</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <span>{user.name || 'Unknown User'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.unlockedVideos?.length || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setUserToDelete(user.id)}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Videos</CardTitle>
              <CardDescription>
                View and manage all videos on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : allVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mb-4 opacity-20" />
                  <p>No videos uploaded yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVideos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img 
                              src={video.thumbnail || video.thumbnailUrl} 
                              className="h-12 w-20 rounded object-cover" 
                              alt={video.title}
                            />
                            <div className="max-w-[300px]">
                              <div className="font-semibold line-clamp-1">{video.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {video.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{video.creator}</TableCell>
                        <TableCell>
                          {video.isPremium ? (
                            <Badge variant="default" className="gap-1">
                              Premium • ৳{video.price}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {parseInt(video.views || '0').toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {video.uploadDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setVideoToDelete(video.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>
                Review and approve payments from users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!transactionsData?.transactions?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
                  <p>No pending transactions found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.transactions.map((transaction: any) => {
                      const video = allVideos.find((v: any) => v.id === transaction.videoId);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-xs font-bold">{transaction.trxId}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <img 
                                src={video?.thumbnail || video?.thumbnailUrl} 
                                className="h-8 w-12 rounded object-cover" 
                                alt={video?.title}
                              />
                              <span className="line-clamp-1 max-w-[200px]">{video?.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 capitalize">
                              <span 
                                className="h-2 w-2 rounded-full"
                                style={{ 
                                  backgroundColor: 
                                    transaction.method === 'bkash' ? '#E2136E' : 
                                    transaction.method === 'nagad' ? '#F7931E' : '#8C3494' 
                                }}
                              />
                              {transaction.method}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction.mobileNumber}</div>
                          </TableCell>
                          <TableCell>৳{transaction.amount}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={async () => {
                                  const res = await fetch(`/api/transactions/${transaction.id}/reject`, { method: 'POST' });
                                  if (res.ok) {
                                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                                    toast({ title: "Transaction Rejected" });
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                  const res = await fetch(`/api/transactions/${transaction.id}/approve`, { method: 'POST' });
                                  if (res.ok) {
                                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                                    toast({ title: "Transaction Approved" });
                                  }
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={videoToDelete !== null} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this video. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => videoToDelete && deleteMutation.mutate(videoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
