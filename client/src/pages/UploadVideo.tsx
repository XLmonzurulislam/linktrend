
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/Navbar";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, Image as ImageIcon, Film, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Price must be a positive number"),
});

export default function UploadVideo() {
  const { user, uploadVideo: addVideoToStore } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
    },
  });

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) return null;

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Thumbnail selected:', file.name, file.size, 'bytes');
    setThumbnailFile(file);
    
    toast({
      title: "Thumbnail Selected",
      description: `${file.name} is ready to upload`,
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Video selected:', file.name, file.size, 'bytes');
    setVideoFile(file);
    
    toast({
      title: "Video Selected",
      description: `${file.name} is ready to upload`,
    });
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await fetch('/api/upload/thumbnail', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to upload thumbnail');
    }

    const data = await response.json();
    return data.url;
  };

  const uploadVideo = async (file: File): Promise<{ url: string; duration: string }> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/api/upload/video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to upload video');
    }

    const data = await response.json();
    return { url: data.url, duration: data.duration };
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate user
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload videos.",
        variant: "destructive",
      });
      return;
    }

    // Validate files
    if (!thumbnailFile) {
      toast({
        title: "Missing Thumbnail",
        description: "Please select a thumbnail image.",
        variant: "destructive",
      });
      return;
    }

    if (!videoFile) {
      toast({
        title: "Missing Video",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload thumbnail first
      toast({
        title: "Uploading Thumbnail",
        description: "Please wait...",
      });
      
      const thumbnailUrl = await uploadThumbnail(thumbnailFile);
      
      toast({
        title: "Thumbnail Uploaded",
        description: "Now uploading video...",
      });

      // Upload video
      toast({
        title: "Uploading Video",
        description: "This may take a few minutes...",
      });
      
      const videoResponse = await uploadVideo(videoFile);
      
      toast({
        title: "Video Uploaded",
        description: "Publishing your video...",
      });

      // Create video entry in database
      const videoData = {
        title: values.title,
        description: values.description,
        price: Number(values.price),
        isPremium: Number(values.price) > 0,
        creator: user.name,
        creatorId: user.id || user.email,
        thumbnail: thumbnailUrl,
        thumbnailUrl,
        videoUrl: videoResponse.url,
        views: "0",
        duration: videoResponse.duration || "00:00",
        uploadDate: new Date().toLocaleDateString(),
      };

      const createResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create video entry');
      }

      const { video } = await createResponse.json();
      
      // Add to local store for immediate UI update
      addVideoToStore(video);

      toast({
        title: "Upload Successful",
        description: "Your video has been published successfully.",
      });
      setLocation("/dashboard");

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Upload New Video</CardTitle>
            <CardDescription>
              Share your content with the world. Files will be uploaded when you click Publish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Advanced React Pattern Course" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell viewers what your video is about..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (BDT)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">৳</span>
                            <Input type="number" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Set to 0 for free videos.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 pt-2">
                    <Label>Media Assets</Label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailSelect}
                          className="hidden"
                          id="thumbnail-upload"
                          disabled={isUploading}
                        />
                        <label htmlFor="thumbnail-upload">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-24 flex-col gap-2 border-dashed"
                            disabled={isUploading}
                            asChild
                          >
                            <div>
                              {thumbnailFile ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              )}
                              <span className="text-xs">
                                {thumbnailFile ? "Selected" : "Select Thumbnail"}
                              </span>
                            </div>
                          </Button>
                        </label>
                      </div>
                      
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                          id="video-upload"
                          disabled={isUploading}
                        />
                        <label htmlFor="video-upload">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-24 flex-col gap-2 border-dashed"
                            disabled={isUploading}
                            asChild
                          >
                            <div>
                              {videoFile ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                              ) : (
                                <Film className="h-6 w-6 text-muted-foreground" />
                              )}
                              <span className="text-xs">
                                {videoFile ? "Selected" : "Select Video"}
                              </span>
                            </div>
                          </Button>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Files will be uploaded to BunnyCDN when you click Publish
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isUploading || !thumbnailFile || !videoFile}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publish Video
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
