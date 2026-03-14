import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Board from "@/pages/Board";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Digital Beer Board</h1>
        <p className="text-lg text-muted-foreground">Select a destination to continue</p>
      </div>
      <div className="flex gap-4">
        <a 
          href="/board" 
          className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
        >
          View Board
        </a>
        <a 
          href="/admin" 
          className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
        >
          Admin Login
        </a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/board" component={Board} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
