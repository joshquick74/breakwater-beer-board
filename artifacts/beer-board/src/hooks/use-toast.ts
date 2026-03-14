import { useState, useEffect } from "react";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

export interface Toast extends ToastProps {
  id: string;
  visible: boolean;
}

let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toast = (props: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { ...props, id, visible: true, duration: props.duration || 3000 };
  
  toasts = [...toasts, newToast];
  notifyListeners();

  setTimeout(() => {
    toasts = toasts.map(t => t.id === id ? { ...t, visible: false } : t);
    notifyListeners();
    
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, 300); // Wait for exit animation
  }, newToast.duration);
};

export const useToast = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  return { toasts: currentToasts, toast };
};
