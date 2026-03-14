import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-8xl font-black text-primary">404</h1>
        <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Link href="/" className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
