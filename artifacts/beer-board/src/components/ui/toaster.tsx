import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => t.visible && (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
              "p-4 rounded-xl shadow-lg border pointer-events-auto flex items-start gap-3",
              t.variant === "destructive" 
                ? "bg-destructive text-destructive-foreground border-destructive/20" 
                : t.variant === "success"
                ? "bg-green-600 text-white border-green-700"
                : "bg-card text-card-foreground border-border"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.variant === "destructive" ? (
                <AlertCircle className="w-5 h-5 opacity-90" />
              ) : t.variant === "success" ? (
                <CheckCircle className="w-5 h-5 opacity-90" />
              ) : (
                <Info className="w-5 h-5 text-primary opacity-90" />
              )}
            </div>
            <div className="flex-1">
              {t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}
              {t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
