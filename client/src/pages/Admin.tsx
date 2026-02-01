import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";

// Helper to coerce types for form
const formSchema = insertProductSchema.extend({
  price: z.coerce.number(),
});

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "course",
      imageUrl: "",
      fileUrl: "",
      features: [],
      isPopular: false,
    },
  });

  if (authLoading || productsLoading) return <div className="min-h-screen pt-20 flex justify-center items-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  function onSubmit(data: InsertProduct) {
    createProduct(data, {
      onSuccess: () => {
        toast({ title: "Product Created", description: "The product has been added to the store." });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id, {
        onSuccess: () => toast({ title: "Deleted", description: "Product removed successfully." }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    }
  }

  return (
    <div className="pt-24 min-h-screen bg-background max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-white/10" /></FormControl>
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
                      <FormControl><Textarea {...field} className="bg-background border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (in cents)</FormLabel>
                        <FormControl><Input type="number" {...field} className="bg-background border-white/10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-white/10">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-white/10">
                            <SelectItem value="note">Note</SelectItem>
                            <SelectItem value="course">Course</SelectItem>
                            <SelectItem value="coaching">Coaching</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-white/10" placeholder="https://..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-white/10 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Popular Product</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Product"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 grid grid-cols-12 gap-4 border-b border-white/10 text-muted-foreground font-mono text-sm uppercase">
          <div className="col-span-1">ID</div>
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {products?.map((product) => (
          <div key={product.id} className="p-4 grid grid-cols-12 gap-4 border-b border-white/10 items-center hover:bg-white/5 transition-colors">
            <div className="col-span-1 text-muted-foreground font-mono">#{product.id}</div>
            <div className="col-span-5 font-bold text-white">{product.title}</div>
            <div className="col-span-2 text-sm">
              <span className="bg-white/10 px-2 py-1 rounded text-xs uppercase">{product.category}</span>
            </div>
            <div className="col-span-2 font-mono text-secondary">${(product.price / 100).toFixed(2)}</div>
            <div className="col-span-2 text-right">
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => handleDelete(product.id)}
                className="hover:bg-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {products?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No products found.</div>
        )}
      </div>
    </div>
  );
}
