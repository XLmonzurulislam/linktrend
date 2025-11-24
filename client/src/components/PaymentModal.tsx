import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PAYMENT_METHODS, Video } from "@/lib/mockData";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";

const formSchema = z.object({
  method: z.string().min(1, "Please select a payment method"),
  mobileNumber: z.string().regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi mobile number"),
  trxId: z.string().min(6, "Transaction ID must be at least 6 characters"),
});

interface PaymentModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ video, isOpen, onClose }: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestAccess, user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "bkash",
      mobileNumber: "",
      trxId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !user.id) {
      alert('Please login first to make a payment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          userId: user.id,
          amount: video.price,
          method: values.method,
          mobileNumber: values.mobileNumber,
          trxId: values.trxId.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment');
      }

      requestAccess({
        videoId: video.id,
        userId: user.id,
        amount: video.price,
        method: values.method,
        mobileNumber: values.mobileNumber,
        trxId: values.trxId.toUpperCase(),
      });

      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] gap-0 p-0 overflow-hidden">
        <div className="bg-primary/10 p-6 flex flex-col items-center text-center border-b border-border/50">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Unlock Premium Content</DialogTitle>
            <DialogDescription className="text-center text-foreground/80">
              You are about to unlock <span className="font-semibold text-primary">"{video.title}"</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-3xl font-bold tracking-tight">
            ৳{video.price}
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem className="space-y-2 sm:space-y-3">
                    <FormLabel className="text-sm">Select Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {PAYMENT_METHODS.map((method) => (
                          <FormItem key={method.id}>
                            <FormControl>
                              <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                            </FormControl>
                            <Label
                              htmlFor={method.id}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1.5 sm:p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              style={{
                                borderColor: field.value === method.id ? method.color : undefined,
                                color: field.value === method.id ? method.color : undefined,
                              }}
                            >
                              <span className="text-[10px] sm:text-xs font-bold">{method.name}</span>
                            </Label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-md bg-muted/50 p-2.5 sm:p-3 text-[11px] sm:text-xs text-muted-foreground">
                  <p>1. Send ৳{video.price} to <strong>01700000000</strong> (Personal)</p>
                  <p>2. Enter your mobile number and Transaction ID below.</p>
                </div>

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="017XXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder="8JHS72..." {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}