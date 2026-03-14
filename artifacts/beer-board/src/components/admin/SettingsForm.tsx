import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon } from "lucide-react";

const settingsSchema = z.object({
  headerTitle: z.string().min(1, "Header title is required"),
  googleFontHeader: z.string().min(1, "Header font is required"),
  googleFontBody: z.string().min(1, "Body font is required"),
  accentColor: z.string().min(1, "Accent color is required"),
  overlayEnabled: z.boolean(),
  overlayOpacity: z.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutateAsync: updateSettings } = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      headerTitle: "",
      googleFontHeader: "Oswald",
      googleFontBody: "Open Sans",
      accentColor: "#f59e0b",
      overlayEnabled: true,
      overlayOpacity: 60,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        headerTitle: settings.headerTitle,
        googleFontHeader: settings.googleFontHeader,
        googleFontBody: settings.googleFontBody,
        accentColor: settings.accentColor,
        overlayEnabled: settings.overlayEnabled,
        overlayOpacity: settings.overlayOpacity,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await updateSettings({ data }, { request: { headers: getAuthHeaders() } });
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Success", description: "Settings updated successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const headers = getAuthHeaders();
      const res = await fetch("/api/upload/background", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Success", description: "Background uploaded successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload background", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Board Background
        </h3>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3 aspect-video bg-secondary rounded-xl overflow-hidden relative border border-border shadow-inner">
            {settings?.backgroundImageUrl ? (
              <img src={settings.backgroundImageUrl} alt="Board background" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-black/40">
                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-sm font-medium">No Background Set</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <p className="text-sm text-muted-foreground">
              Upload a high-resolution portrait image (1080x1920 recommended) to use as the board's background.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload New Background"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-border/50 pb-4">Typography & Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="headerTitle">Header Title (Restaurant Name)</Label>
                <Input id="headerTitle" {...form.register("headerTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-3">
                  <Input 
                    id="accentColor" 
                    type="color" 
                    className="w-14 p-1 cursor-pointer h-12" 
                    {...form.register("accentColor")} 
                  />
                  <Input 
                    type="text" 
                    className="flex-1" 
                    {...form.register("accentColor")} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleFontHeader">Header Google Font Name</Label>
                <Input id="googleFontHeader" {...form.register("googleFontHeader")} placeholder="e.g. Oswald" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleFontBody">Body Google Font Name</Label>
                <Input id="googleFontBody" {...form.register("googleFontBody")} placeholder="e.g. Open Sans" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-border/50 pb-4">Background Overlay</h3>
            <p className="text-sm text-muted-foreground -mt-2">
              A dark overlay helps text stand out against busy background images.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Label htmlFor="overlayEnabled" className="text-base">Enable Dark Overlay</Label>
                <Switch
                  id="overlayEnabled"
                  checked={form.watch("overlayEnabled")}
                  onCheckedChange={(checked) => form.setValue("overlayEnabled", checked)}
                />
              </div>

              <div className={form.watch("overlayEnabled") ? "opacity-100" : "opacity-40 pointer-events-none"}>
                <div className="flex justify-between mb-4">
                  <Label>Overlay Opacity</Label>
                  <span className="font-mono">{form.watch("overlayOpacity")}%</span>
                </div>
                <Slider
                  value={[form.watch("overlayOpacity")]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([val]) => form.setValue("overlayOpacity", val)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-border/50">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
