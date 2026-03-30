import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon } from "lucide-react";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400); // Wait for final animation
          return 100;
        }
        return prev + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <Hexagon className="w-20 h-20 text-primary relative z-10" strokeWidth={1.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-3xl font-bold font-display tracking-tight text-foreground mb-2"
        >
          Nexus Enterprise
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-muted-foreground text-sm uppercase tracking-widest mb-12"
        >
          Initializing Platform
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 240 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="h-1 bg-secondary rounded-full overflow-hidden"
        >
          <motion.div 
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </div>
    </div>
  );
}
