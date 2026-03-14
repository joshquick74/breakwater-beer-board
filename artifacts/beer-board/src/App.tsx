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
  const base = import.meta.env.BASE_URL;
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center text-white relative overflow-hidden"
      style={{
        backgroundImage: `url(${base}charred-wood-bg.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-8">
        <img
          src={`${base}breakwater-logo.png`}
          alt="Breakwater Logo"
          className="w-48 h-48 object-contain drop-shadow-2xl"
        />

        <div className="space-y-3">
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight uppercase"
            style={{
              textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(245,158,11,0.3)",
            }}
          >
            Breakwater's
          </h1>
          <h2
            className="text-4xl md:text-5xl font-extrabold tracking-widest uppercase text-amber-400"
            style={{
              textShadow: "0 2px 15px rgba(245,158,11,0.5), 0 0 30px rgba(245,158,11,0.2)",
            }}
          >
            Bad Ass Beer Board
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="/board"
            className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-xl shadow-lg hover:-translate-y-1 transition-all uppercase tracking-wide"
          >
            View Board
          </a>
          <a
            href="/admin"
            className="px-10 py-4 border-2 border-amber-500/60 hover:border-amber-400 text-amber-400 hover:text-amber-300 font-bold text-lg rounded-xl shadow-lg hover:-translate-y-1 transition-all uppercase tracking-wide backdrop-blur-sm"
          >
            Admin Login
          </a>
        </div>
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
