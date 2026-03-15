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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, ImagePlus, Monitor, RotateCw } from "lucide-react";
import { useDynamicFonts } from "@/hooks/use-fonts";

const ROTATION_OPTIONS = [
  { value: 0, label: "0° — Landscape", description: "Standard widescreen (HDMI default)" },
  { value: 90, label: "90° — Portrait Right", description: "TV rotated clockwise" },
  { value: 180, label: "180° — Landscape Flipped", description: "TV mounted upside-down" },
  { value: 270, label: "270° — Portrait Left", description: "TV rotated counter-clockwise" },
] as const;

const COMMON_FONTS = [
  "Oswald",
  "Open Sans",
  "Roboto",
  "Bebas Neue",
  "Montserrat",
  "Lato",
  "Poppins",
  "Raleway",
  "Playfair Display",
  "Anton",
  "Barlow Condensed",
  "Russo One",
  "Teko",
  "Black Ops One",
  "Permanent Marker",
];

const CUSTOM_FONT_VALUE = "__custom__";

const ELEMENTS = [
  { key: "brewery", label: "Brewery" },
  { key: "beerName", label: "Beer Name" },
  { key: "style", label: "Style" },
  { key: "abv", label: "ABV" },
  { key: "price", label: "Price" },
] as const;

type ElementKey = typeof ELEMENTS[number]["key"];

const elementStyleSchema = z.object({
  font: z.string().min(1),
  color: z.string().min(1),
});

const settingsSchema = z.object({
  overlayEnabled: z.boolean(),
  overlayOpacity: z.number().min(0).max(100),
  logoSizePercent: z.number().min(10).max(200),
  boardRotation: z.number(),
  brewery: elementStyleSchema,
  beerName: elementStyleSchema,
  style: elementStyleSchema,
  abv: elementStyleSchema,
  price: elementStyleSchema,
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function FontColorPicker({
  label,
  fontValue,
  colorValue,
  onFontChange,
  onColorChange,
}: {
  label: string;
  fontValue: string;
  colorValue: string;
  onFontChange: (font: string) => void;
  onColorChange: (color: string) => void;
}) {
  const isCommonFont = COMMON_FONTS.includes(fontValue);
  const [manualCustom, setManualCustom] = useState(false);

  useEffect(() => {
    if (isCommonFont) setManualCustom(false);
  }, [fontValue, isCommonFont]);

  const showCustom = manualCustom || (fontValue !== "" && !isCommonFont);
  const selectValue = showCustom ? CUSTOM_FONT_VALUE : (isCommonFont ? fontValue : "");

  return (
    <div className="border border-border/50 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-sm">{label}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Font</Label>
          <Select
            value={selectValue}
            onValueChange={(val) => {
              if (val === CUSTOM_FONT_VALUE) {
                setManualCustom(true);
                onFontChange("");
              } else {
                setManualCustom(false);
                onFontChange(val);
              }
            }}
          >
            <SelectTrigger className="h-9" style={fontValue && !showCustom ? { fontFamily: `"${fontValue}", sans-serif` } : undefined}>
              <SelectValue placeholder="Choose font" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: `"${font}", sans-serif` }}>{font}</span>
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_FONT_VALUE}>Custom...</SelectItem>
            </SelectContent>
          </Select>
          {showCustom && (
            <Input
              placeholder="Google Font name"
              value={fontValue}
              onChange={(e) => onFontChange(e.target.value)}
              className="h-9 text-sm"
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              className="w-12 p-1 cursor-pointer h-9"
              value={colorValue}
              onChange={(e) => onColorChange(e.target.value)}
            />
            <Input
              type="text"
              className="flex-1 h-9 text-sm"
              value={colorValue}
              onChange={(e) => onColorChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsForm() {
  useDynamicFonts(...COMMON_FONTS);
  const { data: settings, isLoading } = useGetSettings();
  const { mutateAsync: updateSettings } = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const defaultColor = "#ffffff";
  const defaultFont = "Open Sans";

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      overlayEnabled: true,
      overlayOpacity: 60,
      logoSizePercent: 100,
      boardRotation: 270,
      brewery: { font: defaultFont, color: defaultColor },
      beerName: { font: defaultFont, color: defaultColor },
      style: { font: defaultFont, color: defaultColor },
      abv: { font: defaultFont, color: defaultColor },
      price: { font: defaultFont, color: defaultColor },
    },
  });

  useEffect(() => {
    if (settings) {
      const fallbackFont = settings.googleFontBody || defaultFont;
      const fallbackColor = settings.textColor || defaultColor;
      form.reset({
        overlayEnabled: settings.overlayEnabled,
        overlayOpacity: settings.overlayOpacity,
        logoSizePercent: settings.logoSizePercent,
        boardRotation: settings.boardRotation ?? 270,
        brewery: { font: settings.breweryFont || fallbackFont, color: settings.breweryColor || fallbackColor },
        beerName: { font: settings.beerNameFont || fallbackFont, color: settings.beerNameColor || fallbackColor },
        style: { font: settings.styleFont || fallbackFont, color: settings.styleColor || fallbackColor },
        abv: { font: settings.abvFont || fallbackFont, color: settings.abvColor || fallbackColor },
        price: { font: settings.priceFont || fallbackFont, color: settings.priceColor || fallbackColor },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings?.overlayEnabled, settings?.overlayOpacity, settings?.logoSizePercent, settings?.boardRotation,
    settings?.breweryFont, settings?.breweryColor,
    settings?.beerNameFont, settings?.beerNameColor,
    settings?.styleFont, settings?.styleColor,
    settings?.abvFont, settings?.abvColor,
    settings?.priceFont, settings?.priceColor,
    settings?.googleFontBody, settings?.textColor,
  ]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await updateSettings({
        data: {
          overlayEnabled: data.overlayEnabled,
          overlayOpacity: data.overlayOpacity,
          logoSizePercent: data.logoSizePercent,
          boardRotation: data.boardRotation,
          breweryFont: data.brewery.font,
          breweryColor: data.brewery.color,
          beerNameFont: data.beerName.font,
          beerNameColor: data.beerName.color,
          styleFont: data.style.font,
          styleColor: data.style.color,
          abvFont: data.abv.font,
          abvColor: data.abv.color,
          priceFont: data.price.font,
          priceColor: data.price.color,
        },
      });
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const headers = getAuthHeaders();
      const res = await fetch("/api/upload/logo", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Success", description: "Logo uploaded successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload logo", variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const applyToAll = (key: "font" | "color") => {
    const breweryVal = form.getValues(`brewery.${key}`);
    ELEMENTS.forEach(({ key: elKey }) => {
      form.setValue(`${elKey}.${key}` as any, breweryVal);
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-primary" />
          Board Logo
        </h3>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3 aspect-square bg-secondary rounded-xl overflow-hidden relative border border-border shadow-inner flex items-center justify-center">
            {settings?.logoImageUrl ? (
              <img src={settings.logoImageUrl} alt="Board logo" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImagePlus className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-sm font-medium">No Logo Set</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <p className="text-sm text-muted-foreground">
              Upload your restaurant logo (PNG with transparent background recommended). This replaces the header text on the board.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={logoInputRef}
              onChange={handleLogoUpload}
            />
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploadingLogo ? "Uploading..." : "Upload Logo"}
            </Button>
          </div>
        </div>
      </Card>

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
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-xl font-bold">Beer Text Styles</h3>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => applyToAll("font")}>
                  Apply Brewery Font to All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyToAll("color")}>
                  Apply Brewery Color to All
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize the font and color for each element displayed on the board.
            </p>
            <div className="space-y-3">
              {ELEMENTS.map(({ key, label }) => (
                <FontColorPicker
                  key={key}
                  label={label}
                  fontValue={form.watch(`${key}.font` as any)}
                  colorValue={form.watch(`${key}.color` as any)}
                  onFontChange={(font) => form.setValue(`${key}.font` as any, font)}
                  onColorChange={(color) => form.setValue(`${key}.color` as any, color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-border/50 pb-4 flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-primary" />
              Board Orientation
            </h3>
            <p className="text-sm text-muted-foreground -mt-2">
              Set how the board content is rotated to match your TV's physical mounting orientation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROTATION_OPTIONS.map((opt) => {
                const isSelected = form.watch("boardRotation") === opt.value;
                const isPortrait = opt.value === 90 || opt.value === 270;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setValue("boardRotation", opt.value)}
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div
                        className={`border-2 rounded-sm flex items-center justify-center transition-all ${
                          isSelected ? "border-primary bg-primary/20" : "border-muted-foreground/40 bg-muted/30"
                        }`}
                        style={{
                          width: isPortrait ? 28 : 48,
                          height: isPortrait ? 48 : 28,
                        }}
                      >
                        <div className="flex flex-col items-center gap-[2px]">
                          {(isPortrait ? [16, 12, 14, 10] : [20, 16]).map((w, i) => (
                            <div
                              key={i}
                              className={`rounded-sm ${isSelected ? "bg-primary" : "bg-muted-foreground/40"}`}
                              style={{ width: w, height: 2 }}
                            />
                          ))}
                        </div>
                      </div>
                      {opt.value === 180 && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-muted-foreground/60">▼</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {opt.value}°
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-border/50 pb-4">Logo Size</h3>
            <p className="text-sm text-muted-foreground -mt-2">
              Adjust the size of the logo displayed on the board header.
            </p>
            <div>
              <div className="flex justify-between mb-4">
                <Label>Logo Size</Label>
                <span className="font-mono">{form.watch("logoSizePercent")}%</span>
              </div>
              <Slider
                value={[form.watch("logoSizePercent")]}
                min={10}
                max={200}
                step={5}
                onValueChange={([val]) => form.setValue("logoSizePercent", val)}
              />
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
