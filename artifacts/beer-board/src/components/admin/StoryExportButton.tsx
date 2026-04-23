import { useRef, useState, useCallback, useMemo, useLayoutEffect } from "react";
import { toPng } from "html-to-image";
import { useListBeers, useGetSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Loader2, ImageDown } from "lucide-react";
import { useDynamicFonts } from "@/hooks/use-fonts";

const BOARD_W = 1080;
const BOARD_H = 1920;
const PREVIEW_W = 252;
const PREVIEW_H = Math.round(PREVIEW_W * BOARD_H / BOARD_W);
const SCALE = PREVIEW_W / BOARD_W;

type BeerRowProps = {
  beer: { id: number; brewery: string; beerName: string; style: string; abv: string; price: string };
  fonts: { breweryFont: string; beerNameFont: string; styleFont: string; abvFont: string; priceFont: string };
  colors: { breweryColor: string; beerNameColor: string; styleColor: string; abvColor: string; priceColor: string };
};

function StoryBeerRow({ beer, fonts, colors }: BeerRowProps) {
  const maxTitleSize = 36;
  const minTitleSize = 18;
  const [titleSize, setTitleSize] = useState(maxTitleSize);
  const titleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    let size = maxTitleSize;
    el.style.fontSize = `${size}px`;
    while (el.scrollWidth > el.clientWidth && size > minTitleSize) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
    setTitleSize(size);
  }, [beer.brewery, beer.beerName, fonts.breweryFont, fonts.beerNameFont]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div ref={titleRef} style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
          overflow: "hidden",
          fontSize: titleSize,
          fontWeight: 700,
          lineHeight: 1.2,
          textTransform: "uppercase",
          letterSpacing: "0.01em",
        }}>
          <span style={{ fontFamily: `"${fonts.breweryFont}", sans-serif`, color: colors.breweryColor }}>
            {beer.brewery}
          </span>
          <span style={{ fontFamily: `"${fonts.breweryFont}", sans-serif`, color: colors.breweryColor }}>-</span>
          <span style={{ fontFamily: `"${fonts.beerNameFont}", sans-serif`, color: colors.beerNameColor }}>
            {beer.beerName}
          </span>
        </div>
        <div style={{
          marginTop: 2,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}>
          <span style={{ fontFamily: `"${fonts.styleFont}", sans-serif`, fontSize: 30, color: colors.styleColor }}>
            {beer.style}
          </span>
          <span style={{ fontFamily: `"${fonts.styleFont}", sans-serif`, fontSize: 30, color: colors.styleColor }}>-</span>
          <span style={{ fontFamily: `"${fonts.abvFont}", sans-serif`, fontSize: 30, color: colors.abvColor }}>
            {beer.abv}
          </span>
        </div>
      </div>
      <div style={{
        fontFamily: `"${fonts.priceFont}", sans-serif`,
        fontSize: 56,
        fontWeight: 700,
        flexShrink: 0,
        paddingLeft: 20,
        textAlign: "right",
        color: colors.priceColor,
        lineHeight: 1,
      }}>
        {beer.price}
      </div>
    </div>
  );
}

export function StoryExportButton() {
  const { data: beers = [] } = useListBeers();
  const { data: settings } = useGetSettings();
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const breweryFont = settings?.breweryFont || settings?.googleFontBody || "Open Sans";
  const beerNameFont = settings?.beerNameFont || settings?.googleFontBody || "Open Sans";
  const styleFont = settings?.styleFont || settings?.googleFontBody || "Open Sans";
  const abvFont = settings?.abvFont || settings?.googleFontBody || "Open Sans";
  const priceFont = settings?.priceFont || settings?.googleFontBody || "Open Sans";

  const breweryColor = settings?.breweryColor || settings?.textColor || "#ffffff";
  const beerNameColor = settings?.beerNameColor || settings?.textColor || "#ffffff";
  const styleColor = settings?.styleColor || settings?.textColor || "#ffffff";
  const abvColor = settings?.abvColor || settings?.textColor || "#ffffff";
  const priceColor = settings?.priceColor || settings?.textColor || "#ffffff";

  useDynamicFonts(breweryFont, beerNameFont, styleFont, abvFont, priceFont);

  const availableBeers = useMemo(() =>
    beers.filter(b => b.available).sort((a, b) => a.position - b.position),
    [beers]
  );

  const fonts = useMemo(() => ({ breweryFont, beerNameFont, styleFont, abvFont, priceFont }), [
    breweryFont, beerNameFont, styleFont, abvFont, priceFont,
  ]);
  const colors = useMemo(() => ({ breweryColor, beerNameColor, styleColor, abvColor, priceColor }), [
    breweryColor, beerNameColor, styleColor, abvColor, priceColor,
  ]);

  const bgImage = settings?.backgroundImageUrl;
  const textColor = settings?.textColor || "#ffffff";
  const logoSize = settings?.logoSizePercent ?? 100;

  const handleOpen = () => {
    setImageUrl(null);
    setOpen(true);
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      setOpen(false);
      setImageUrl(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    const el = boardRef.current;
    if (!el) return;
    setGenerating(true);

    // Wait one frame so React renders the loading overlay before we touch the DOM
    await new Promise<void>(r => requestAnimationFrame(r));

    const prevTransform = el.style.transform;
    try {
      // Remove scale so html-to-image captures at native 1080×1920
      el.style.transform = "none";

      // Wait a frame for the transform change to settle, then ensure fonts are ready
      await new Promise<void>(r => requestAnimationFrame(r));
      await document.fonts.ready;

      const url = await toPng(el, { pixelRatio: 1 });
      setImageUrl(url);
    } catch (err) {
      console.error("Story export failed:", err);
    } finally {
      if (boardRef.current) boardRef.current.style.transform = prevTransform;
      setGenerating(false);
    }
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
      >
        <Camera className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Screenshot Board</span>
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[300px] p-5">
          <DialogHeader>
            <DialogTitle>Screenshot Board</DialogTitle>
          </DialogHeader>

          {imageUrl ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Long press to save on mobile · Right-click to save on desktop
              </p>
              <img
                src={imageUrl}
                alt="Beer board Instagram story"
                className="w-full rounded-lg"
                style={{ touchAction: "manipulation" }}
              />
              <Button variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
                ← Back to preview
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center">
              {/* Scaled preview — board renders here at full 1080×1920 layout, scaled visually */}
              <div style={{
                width: PREVIEW_W,
                height: PREVIEW_H,
                overflow: "hidden",
                position: "relative",
                borderRadius: 8,
                flexShrink: 0,
              }}>
                <div
                  ref={boardRef}
                  style={{
                    width: BOARD_W,
                    height: BOARD_H,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                    background: "#000",
                    overflow: "hidden",
                    color: textColor,
                  }}
                >
                  {bgImage ? (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }} />
                  ) : (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    }} />
                  )}

                  {settings?.overlayEnabled && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 1,
                      background: "#000",
                      opacity: (settings.overlayOpacity ?? 60) / 100,
                    }} />
                  )}

                  <div style={{
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "40px 40px 40px 50px",
                  }}>
                    <div style={{ textAlign: "center", marginBottom: 32, flexShrink: 0 }}>
                      <img
                        src={settings?.logoImageUrl || "/breakwater-logo.png"}
                        alt="Logo"
                        style={{
                          width: `${logoSize * 2.5}px`,
                          height: "auto",
                          margin: "0 auto",
                          display: "block",
                          filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.8))",
                        }}
                      />
                      <div style={{
                        height: 3,
                        background: `linear-gradient(to right, transparent, ${textColor}, transparent)`,
                        marginTop: 16,
                        width: "60%",
                        marginLeft: "auto",
                        marginRight: "auto",
                        opacity: 0.4,
                      }} />
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      {availableBeers.map((beer) => (
                        <StoryBeerRow key={beer.id} beer={beer} fonts={fonts} colors={colors} />
                      ))}
                      {availableBeers.length === 0 && (
                        <div style={{ textAlign: "center", marginTop: 200, fontSize: 40, opacity: 0.5, fontWeight: 600 }}>
                          No beers currently available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loading overlay — hides the transform-removal flash during capture */}
                {generating && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                  }}>
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">1080 × 1920 · Instagram Story</p>

              <Button onClick={handleGenerate} disabled={generating} className="w-full">
                {generating
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                  : <><ImageDown className="w-4 h-4 mr-2" />Generate PNG</>
                }
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
