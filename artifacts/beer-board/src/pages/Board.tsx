import { useMemo, useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useListBeers, useGetSettings } from "@workspace/api-client-react";
import { useDynamicFonts } from "@/hooks/use-fonts";

type BeerRowProps = {
  beer: { id: number; brewery: string; beerName: string; style: string; abv: string; price: string };
  fonts: { breweryFont: string; beerNameFont: string; styleFont: string; abvFont: string; priceFont: string };
  colors: { breweryColor: string; beerNameColor: string; styleColor: string; abvColor: string; priceColor: string };
  compact?: boolean;
};

function BeerRow({ beer, fonts, colors, compact }: BeerRowProps) {
  const maxTitleSize = 36;
  const minTitleSize = 18;
  const [titleSize, setTitleSize] = useState(maxTitleSize);
  const titleRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

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
  }, [beer.brewery, beer.beerName, fonts.breweryFont, fonts.beerNameFont, maxTitleSize, minTitleSize]);

  const priceSize = 56;
  const subSizeFinal = 30;

  return (
    <div ref={rowRef} style={{
      display: "flex",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          ref={titleRef}
          style={{
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
          }}
        >
          <span style={{
            fontFamily: `"${fonts.breweryFont}", sans-serif`,
            color: colors.breweryColor,
          }}>
            {beer.brewery}
          </span>
          <span style={{
            fontFamily: `"${fonts.breweryFont}", sans-serif`,
            color: colors.breweryColor,
          }}>
            -
          </span>
          <span style={{
            fontFamily: `"${fonts.beerNameFont}", sans-serif`,
            color: colors.beerNameColor,
          }}>
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
          <span style={{
            fontFamily: `"${fonts.styleFont}", sans-serif`,
            fontSize: subSizeFinal,
            color: colors.styleColor,
          }}>
            {beer.style}
          </span>
          <span style={{ fontFamily: `"${fonts.styleFont}", sans-serif`, fontSize: subSizeFinal, color: colors.styleColor }}>-</span>
          <span style={{
            fontFamily: `"${fonts.abvFont}", sans-serif`,
            fontSize: subSizeFinal,
            color: colors.abvColor,
          }}>
            {beer.abv}
          </span>
        </div>
      </div>
      <div style={{
        fontFamily: `"${fonts.priceFont}", sans-serif`,
        fontSize: priceSize,
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

export default function Board() {
  const { data: beers = [] } = useListBeers({
    query: { refetchInterval: 30000 }
  });

  const { data: settings } = useGetSettings({
    query: { refetchInterval: 30000 }
  });

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

  const availableBeers = useMemo(() => {
    return beers.filter(b => b.available).sort((a, b) => a.position - b.position);
  }, [beers]);

  const textColor = settings?.textColor || "#ffffff";
  const bgImage = settings?.backgroundImageUrl || undefined;
  const boardRotation = settings?.boardRotation ?? 270;

  const isLandscape = boardRotation === 0 || boardRotation === 180;
  const isRotated = boardRotation === 90 || boardRotation === 270;
  const boardW = isRotated ? 1080 : 1920;
  const boardH = isRotated ? 1920 : 1080;

  const midpoint = Math.ceil(availableBeers.length / 2);
  const leftColumn = isLandscape ? availableBeers.slice(0, midpoint) : [];
  const rightColumn = isLandscape ? availableBeers.slice(midpoint) : [];

  const [scale, setScale] = useState(1);
  const computeScale = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rotated = boardRotation === 90 || boardRotation === 270;
    const effectiveW = rotated ? boardH : boardW;
    const effectiveH = rotated ? boardW : boardH;
    setScale(Math.min(vw / effectiveW, vh / effectiveH));
  }, [boardW, boardH, boardRotation]);

  useEffect(() => {
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [computeScale]);

  const transforms = [];
  transforms.push(`scale(${scale})`);
  if (boardRotation !== 0) transforms.push(`rotate(-${boardRotation}deg)`);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {bgImage && (
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
      )}

      {!bgImage && (
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
        width: boardW,
        height: boardH,
        transform: transforms.join(" "),
        transformOrigin: "center center",
        overflow: "hidden",
        color: textColor,
        position: "relative",
        zIndex: 2,
      }}>

        <div style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 12px 20px 25px",
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: 16,
            flexShrink: 0,
          }}>
            <img
              src={settings?.logoImageUrl || `${import.meta.env.BASE_URL}breakwater-logo.png`}
              alt={settings?.headerTitle || "Logo"}
              style={{
                width: `${(settings?.logoSizePercent ?? 100) * 2.5}px`,
                height: "auto",
                margin: "0 auto",
                display: "block",
                filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.8))",
              }}
            />
            <div style={{
              height: 3,
              background: `linear-gradient(to right, transparent, ${textColor}, transparent)`,
              marginTop: 10,
              width: "60%",
              marginLeft: "auto",
              marginRight: "auto",
              opacity: 0.4,
            }} />
          </div>

          {isLandscape ? (
            <div style={{
              flex: 1,
              display: "flex",
              gap: 0,
              overflow: "hidden",
            }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                {leftColumn.map((beer) => (
                  <BeerRow key={beer.id} beer={beer} fonts={{ breweryFont, beerNameFont, styleFont, abvFont, priceFont }} colors={{ breweryColor, beerNameColor, styleColor, abvColor, priceColor }} compact />
                ))}
              </div>
              <div style={{
                width: 2,
                background: breweryColor,
                opacity: 0.35,
                flexShrink: 0,
                margin: "0 16px",
              }} />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                {rightColumn.map((beer) => (
                  <BeerRow key={beer.id} beer={beer} fonts={{ breweryFont, beerNameFont, styleFont, abvFont, priceFont }} colors={{ breweryColor, beerNameColor, styleColor, abvColor, priceColor }} compact />
                ))}
              </div>
              {availableBeers.length === 0 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  opacity: 0.5,
                  fontWeight: 600,
                }}>
                  No beers currently available
                </div>
              )}
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: 0,
            }}>
              {availableBeers.map((beer) => (
                <BeerRow key={beer.id} beer={beer} fonts={{ breweryFont, beerNameFont, styleFont, abvFont, priceFont }} colors={{ breweryColor, beerNameColor, styleColor, abvColor, priceColor }} />
              ))}

              {availableBeers.length === 0 && (
                <div style={{
                  textAlign: "center",
                  marginTop: 200,
                  fontSize: 40,
                  opacity: 0.5,
                  fontWeight: 600,
                }}>
                  No beers currently available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
