import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuthToken, clearAuthToken } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeerList } from "@/components/admin/BeerList";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Button } from "@/components/ui/button";
import { MonitorPlay, LogOut, Beer, Settings } from "lucide-react";

export default function Admin() {
  const [_, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLocation("/login");
    } else {
      setIsReady(true);
    }
  }, [setLocation]);

  const handleLogout = () => {
    clearAuthToken();
    setLocation("/login");
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Beer className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Beer Board Admin</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:flex"
              onClick={() => window.open("/board", "_blank")}
            >
              <MonitorPlay className="w-4 h-4 mr-2" />
              Preview Board
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="beers" className="w-full space-y-8">
          <div className="flex justify-center sm:justify-start">
            <TabsList>
              <TabsTrigger value="beers" className="gap-2">
                <Beer className="w-4 h-4" />
                Tap List
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Board Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="beers" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <BeerList />
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <SettingsForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
