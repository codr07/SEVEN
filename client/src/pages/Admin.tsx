import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Message } from "@shared/schema";
import { Trash2, Plus, Loader2, Edit, Mail, Package, LayoutDashboard, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Helper to coerce types for form
const formSchema = insertProductSchema.extend({
  price: z.coerce.number(),
});

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: messages } = useQuery<Message[]>({
    queryKey: [api.messages.list.path],
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", buildUrl(api.messages.delete.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
      toast({ title: "Deleted", description: "Message removed" });
    }
  });

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
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, ...data }, {
        onSuccess: () => {
          toast({ title: "Product Updated", description: "The product has been updated." });
          setOpen(false);
          setEditingProduct(null);
          form.reset();
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        },
      });
    } else {
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
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id, {
        onSuccess: () => toast({ title: "Deleted", description: "Product removed successfully." }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      fileUrl: product.fileUrl || "",
      features: product.features || [],
      isPopular: product.isPopular,
    });
    setOpen(true);
  };

  return (
    <div className="pt-24 min-h-screen bg-background max-w-7xl mx-auto px-4 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="text-primary" /> Admin <span className="text-secondary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage products and customer inquiries.</p>
        </div>
        
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditingProduct(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
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
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF File URL (for Notes)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} className="bg-background border-white/10" placeholder="Link to PDF" /></FormControl>
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
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Create Product"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-card border border-white/10 mb-8 p-1">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary">
            <Package className="w-4 h-4 mr-2" /> Products
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-secondary">
            <Mail className="w-4 h-4 mr-2" /> Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 grid grid-cols-12 gap-4 border-b border-white/10 text-muted-foreground font-mono text-sm uppercase bg-black/20">
              <div className="col-span-1">ID</div>
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {products?.map((product) => (
              <div key={product.id} className="p-4 grid grid-cols-12 gap-4 border-b border-white/10 items-center hover:bg-white/5 transition-colors">
                <div className="col-span-1 text-muted-foreground font-mono">#{product.id}</div>
                <div className="col-span-5 font-bold text-white flex items-center gap-2">
                  {product.title}
                  {product.fileUrl && <FileText className="w-4 h-4 text-secondary" />}
                </div>
                <div className="col-span-2 text-sm">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs uppercase">{product.category}</span>
                </div>
                <div className="col-span-2 font-mono text-secondary">${(product.price / 100).toFixed(2)}</div>
                <div className="col-span-2 text-right flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(product)}
                    className="hover:text-primary"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(product.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {products?.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">No products found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="space-y-4">
            {messages?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No messages yet.</div>
            ) : (
              messages?.map((msg) => (
                <Card key={msg.id} className="bg-card border-white/10">
                  <CardHeader className="flex flex-row justify-between items-start p-4">
                    <div>
                      <CardTitle className="text-lg text-white">{msg.name}</CardTitle>
                      <CardDescription className="text-primary">{msg.email}</CardDescription>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-destructive" onClick={() => deleteMessageMutation.mutate(msg.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-white bg-background/30 p-4 rounded-lg border border-white/5">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-4">{new Date(msg.createdAt!).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

