import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMessageSchema } from "@shared/schema";
import { useCreateMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = insertMessageSchema.extend({
  email: z.string().email("Invalid email address"),
});

export default function Contact() {
  const { mutate, isPending } = useCreateMessage();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Message sent!",
          description: "We'll get back to you shortly.",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="pt-20 min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-display font-bold text-white mb-6">Get In <span className="text-primary">Touch</span></h1>
            <p className="text-muted-foreground text-lg mb-12">
              Have questions about our courses or want to collaborate? Reach out to us. We build futures, and yours starts here.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Visit Us</h3>
                  <p className="text-muted-foreground">Kolkata, West Bengal<br />India</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Email Us</h3>
                  <p className="text-muted-foreground">info@5even.edu</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Call Us</h3>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card p-8 rounded-2xl border border-white/10 shadow-2xl"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-background border-white/10 text-white placeholder:text-white/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} className="bg-background border-white/10 text-white placeholder:text-white/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us what you need..." 
                          className="min-h-[150px] bg-background border-white/10 text-white placeholder:text-white/20 resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6 text-lg"
                >
                  {isPending ? "Sending..." : (
                    <>
                      Send Message <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
