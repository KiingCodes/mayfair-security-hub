import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { id: "all", label: "All" },
  { id: "guards", label: "Guards on Duty" },
  { id: "vehicles", label: "Patrol Vehicles" },
  { id: "training", label: "Training" },
  { id: "cctv", label: "CCTV & Alarms" },
  { id: "fencing", label: "Electric Fencing" },
];

const fallbackItems = [
  { id: "f1", image_url: guardsOnDutyFallback, category: "guards", title: "Guard on Night Duty", description: "Our officers maintain vigilance around the clock" },
  { id: "f2", image_url: patrolVehiclesFallback, category: "vehicles", title: "Patrol Vehicle", description: "Fully equipped patrol units for mobile security" },
  { id: "f3", image_url: trainingFallback, category: "training", title: "Self-Defence Training", description: "Rigorous hands-on combat training for all officers" },
  { id: "f4", image_url: cctvAlarmsFallback, category: "cctv", title: "CCTV & Alarm Installation", description: "Professional surveillance and alarm systems" },
  { id: "f5", image_url: electricFencingFallback, category: "fencing", title: "Electric Fencing", description: "High-voltage perimeter protection installations" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from("gallery_items").select("*").order("sort_order");
      setGalleryItems(data || []);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const filtered = activeCategory === "all"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  const lightboxItem = galleryItems.find((i) => i.id === lightbox);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Camera className="w-4 h-4" />
              Our Work in Action
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              Gallery
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              See our team, equipment, and installations in action. Real work, real protection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-card border shadow-sm hover:shadow-lg transition-shadow"
                    onClick={() => setLightbox(item.id)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                        <div>
                          <h3 className="text-white font-heading font-bold text-lg">{item.title}</h3>
                          <p className="text-white/80 text-sm">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && lightboxItem && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-accent transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              src={lightboxItem.image_url}
              alt={lightboxItem.title}
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Gallery;
