import { db, beersTable, boardSettingsTable } from "@workspace/db";

async function seed() {
  const existingBeers = await db.select().from(beersTable);
  if (existingBeers.length > 0) {
    console.log("Database already has beers, skipping seed.");
    return;
  }

  console.log("Seeding database...");

  await db.insert(boardSettingsTable).values({
    headerTitle: "Breakwater Barbecue",
    googleFontHeader: "Oswald",
    googleFontBody: "Open Sans",
    accentColor: "#2d6a4f",
    overlayEnabled: true,
    overlayOpacity: 60,
  });

  const beers = [
    { tapNumber: 1, beerName: "Wild Miami Rice", brewery: "Hop Dogma/Barebottle", style: "Wild Rice IPA", abv: "7%", price: "$8", available: true, position: 0 },
    { tapNumber: 2, beerName: "Lobo", brewery: "Crow & Wolf", style: "Mexican Lager", abv: "5%", price: "$8", available: true, position: 1 },
    { tapNumber: 3, beerName: "Prickly Pearadice", brewery: "2 Towns Ciderhouse", style: "Craft Cider", abv: "5.3%", price: "$9", available: true, position: 2 },
    { tapNumber: 4, beerName: "Drop Bear", brewery: "Brix Factory Brewing", style: "New Zealand Pilsner", abv: "5.6%", price: "$8", available: true, position: 3 },
    { tapNumber: 5, beerName: "Sunny Daze", brewery: "Barrelhouse Brew Co.", style: "Blonde", abv: "5.2%", price: "$8", available: true, position: 4 },
    { tapNumber: 6, beerName: "Daisy Cutter", brewery: "Half Acre Beer Co.", style: "Pale Ale", abv: "5.2%", price: "$8", available: true, position: 5 },
  ];

  await db.insert(beersTable).values(beers);
  console.log(`Seeded ${beers.length} beers and default settings.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
