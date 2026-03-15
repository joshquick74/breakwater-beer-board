import { useMemo } from "react";
import { useListBeers, useGetSettings } from "@workspace/api-client-react";
import { useDynamicFonts } from "@/hooks/use-fonts";

export default function Board() {
  const { data: beers = [] } = useListBeers({
    query: { refetchInterval: 30000 }
  });

  const { data: settings } = useGetSettings({
    query: { refetchInterval: 30000 }
  });

  useDynamicFonts(settings?.googleFontHeader, settings?.googleFontBody);

  const availableBeers = useMemo(() => {
    return beers.filter(b => b.available).sort((a, b) => a.position - b.position);
  }, [beers]);

  const headerFont = settings?.googleFontHeader ? `"${settings.googleFontHeader}", sans-serif` : '"Oswald", sans-serif';
  const bodyFont = settings?.googleFontBody ? `"${settings.googleFontBody}", sans-serif` : '"Open Sans", sans-serif';
  const accentColor = settings?.accentColor || "#2d6a4f";
  const bgImage = settings?.backgroundImageUrl || undefined;

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
      <div style={{
        width: 1080,
        height: 1920,
        transform: "rotate(-90deg)",
        transformOrigin: "center center",
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -960,
        marginLeft: -540,
        overflow: "hidden",
        color: "#fff",
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
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "50px 60px",
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: 30,
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
              background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
              marginTop: 16,
              width: "60%",
              marginLeft: "auto",
              marginRight: "auto",
              opacity: 0.7,
            }} />
          </div>

          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 0,
            fontFamily: bodyFont,
          }}>
            {availableBeers.map((beer) => (
              <div
                key={beer.id}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  padding: "18px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontFamily: headerFont,
                      fontSize: 38,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textTransform: "uppercase",
                      letterSpacing: "0.01em",
                    }}>
                      {beer.brewery} - {beer.beerName}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 24,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 2,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}>
                    {beer.style} - {beer.abv}
                  </div>
                </div>

                <div style={{
                  fontFamily: headerFont,
                  fontSize: 38,
                  fontWeight: 700,
                  flexShrink: 0,
                  paddingLeft: 20,
                  textAlign: "right",
                }}>
                  {beer.price}
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
}
