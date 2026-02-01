import { useProducts } from "@/hooks/use-products";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Download, Book, Video, Loader2, FileText, X } from "lucide-react";
import { PDFPreview } from "@/components/PDFPreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const categories = ["All", "Notes", "Courses", "Coaching"];

export default function Services() {
  const { data: products, isLoading, error } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewProduct, setPreviewProduct] = useState<any>(null);

  const filteredProducts = products?.filter(p => 
    activeCategory === "All" || p.category.toLowerCase().includes(activeCategory.toLowerCase().slice(0, -1))
  );

  return (
    <div className="pt-20 min-h-screen bg-background">
      <section className="py-12 bg-card/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold text-white mb-6">Educational <span className="text-secondary">Store</span></h1>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                className={`
                  font-mono uppercase tracking-wider
                  ${activeCategory === cat ? "bg-secondary text-background hover:bg-secondary/90" : "border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"}
                `}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive">Failed to load products. Please try again later.</div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No products found in this category.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts?.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group bg-card rounded-xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.isPopular && (
                      <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-mono text-primary uppercase tracking-wider">{product.category}</span>
                        <h3 className="text-xl font-bold text-white mt-1 group-hover:text-primary transition-colors">{product.title}</h3>
                      </div>
                      <div className="text-lg font-mono font-bold text-white">
                        ${(product.price / 100).toFixed(2)}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {product.features?.map((feature, i) => (
                        <div key={i} className="flex items-center text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="flex-1 bg-white/5 hover:bg-primary hover:text-white border-0 transition-colors group-hover:bg-primary"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    {product.fileUrl && (
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="border-white/10 hover:bg-secondary hover:text-background"
                        onClick={() => setPreviewProduct(product)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!previewProduct} onOpenChange={() => setPreviewProduct(null)}>
        <DialogContent className="max-w-4xl bg-card border-white/10 p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-black/40 border-b border-white/10">
            <DialogTitle className="flex items-center gap-2 text-white">
              <FileText className="text-secondary" />
              {previewProduct?.title} - <span className="text-muted-foreground text-sm font-normal italic">Preview Mode</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-background/50">
            {previewProduct?.fileUrl && (
              <PDFPreview fileUrl={previewProduct.fileUrl} isPurchased={false} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
