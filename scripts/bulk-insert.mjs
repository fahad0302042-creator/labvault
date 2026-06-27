/**
 * Bulk insert chemicals + apparatus into Supabase.
 *
 * Signs in with the user's credentials, then inserts all items.
 * Each chemical gets an auto-generated QR code (UUID).
 * Each item gets a "created" log entry.
 *
 * Usage: node scripts/bulk-insert.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://umijltkqeuzddjdfgutm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaWpsdGtxZXV6ZGRqZGZndXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTIzMjcsImV4cCI6MjA5Nzk4ODMyN30.6VLyeeq766Nt3n9XEWrbRpyQ0JJg1gh3LlbiHNPJags";
const EMAIL = "redc42087@gmail.com";
const PASSWORD = "g03217703";

// ---------- Chemical data ----------
// Format: [Name, Formula, Unit, Quantity]
const CHEMICALS = [
  ["Aluminium Nitrate", "Al(NO3)3", "g", 0],
  ["Aluminium Powder", "Al", "g", 0],
  ["Aluminium Oxide", "Al2O3", "g", 0],
  ["Ammonium Sulphate", "(NH4)2SO4", "g", 0],
  ["Ammonium Carbonate", "(NH4)2CO3", "g", 0],
  ["Ammonium Persulphate", "(NH4)2S2O8", "g", 0],
  ["Ammonium Iron(III) Sulphate", "NH4Fe(SO4)2", "g", 0],
  ["Animal Charcoal", "C", "g", 0],
  ["Barium Carbonate", "BaCO3", "g", 0],
  ["Barium Sulphate", "BaSO4", "g", 0],
  ["Boric Acid", "H3BO3", "g", 0],
  ["Bismuth Trichloride", "BiCl3", "g", 0],
  ["Bromine Water", "Br2", "mL", 0],
  ["Bromocresol Green", "C21H14Br4O5S", "g", 0],
  ["Bromocresol Purple", "C21H16Br2O5S", "g", 0],
  ["Bromophenol Blue", "C19H10Br4O5S", "g", 0],
  ["Buffer Solution (pH 5, 7, 7.5)", "Mixture", "g", 0],
  ["Benzene (Pure)", "C6H6", "mL", 0],
  ["Benzoic Acid", "C7H6O2", "g", 0],
  ["Copper(II) Chloride", "CuCl2", "g", 0],
  ["Copper(II) Nitrate", "Cu(NO3)2", "g", 0],
  ["Copper(II) Oxide Powder", "CuO", "g", 0],
  ["Calcium Carbonate", "CaCO3", "g", 0],
  ["Calcium Chloride", "CaCl2", "g", 0],
  ["Calcium Nitrate", "Ca(NO3)2", "g", 0],
  ["Calcium Sulphate", "CaSO4", "g", 0],
  ["Calcium Oxide", "CaO", "g", 0],
  ["Calcium Acetate", "Ca(CH3COO)2", "g", 0],
  ["Chromium(III) Sulphate", "Cr2(SO4)3", "g", 0],
  ["Cobalt(II) Sulphate", "CoSO4", "g", 0],
  ["Citric Acid", "C6H8O7", "g", 0],
  ["Cobalt(II) Nitrate", "Co(NO3)2", "g", 0],
  ["2,4-Dinitrophenylhydrazine", "C6H6N4O4", "g", 0],
  ["Gelatine Powder", "Protein mixture", "g", 0],
  ["Hydrogen Peroxide (110 Vol)", "H2O2", "mL", 0],
  ["Iron(III) Nitrate", "Fe(NO3)3", "g", 0],
  ["Lead(II) Acetate", "Pb(CH3COO)2", "g", 0],
  ["Lead(II) Nitrate", "Pb(NO3)2", "g", 0],
  ["Lead(II) Chloride", "PbCl2", "g", 0],
  ["Lead(II) Carbonate", "PbCO3", "g", 0],
  ["Lead(II) Oxide", "PbO", "g", 0],
  ["Magnesium Powder", "Mg", "g", 0],
  ["Aluminium Sulphate", "Al2(SO4)3", "g", 0],
  ["Iron(II) Sulphate", "FeSO4", "g", 0],
  ["Magnesium Ribbon", "Mg", "packets", 0],
  ["Acetone", "C3H6O", "mL", 0],
  ["Ammonium Bromide", "NH4Br", "g", 0],
  ["Magnesium Sulphate", "MgSO4", "g", 0],
  ["Ammonium Iron(II) Sulphate", "(NH4)2Fe(SO4)2", "g", 0],
  ["Ammonium Nitrate", "NH4NO3", "g", 0],
  ["Barium Nitrate", "Ba(NO3)2", "g", 0],
  ["Ethanol", "C2H6O", "mL", 0],
  ["Chromium(II) Carbonate", "CrCO3", "g", 0],
  ["Chromium(III) Chloride", "CrCl3", "g", 0],
  ["Chromium(III) Potassium Sulphate", "KCr(SO4)2", "g", 0],
  ["Copper Turnings", "Cu", "g", 0],
  ["Hydrochloric Acid", "HCl", "mL", 0],
  ["Hydrogen Peroxide (20 Vol)", "H2O2", "mL", 0],
  ["EDTA (Disodium Salt)", "Na2C10H14N2O8", "g", 0],
  ["Acetic Acid (Glacial)", "CH3COOH", "mL", 0],
  ["Filter Paper", "Cellulose", "packets", 0],
  ["Ammonium Chloride", "NH4Cl", "g", 0],
  ["Copper(II) Sulphate", "CuSO4", "g", 0],
  ["Glucose (Dextrose)", "C6H12O6", "g", 0],
  ["Copper(II) Carbonate", "CuCO3", "g", 0],
  ["Iron(III) Chloride", "FeCl3", "g", 0],
  ["Iron(III) Sulphate", "Fe2(SO4)3", "g", 0],
  ["Aluminium Foil", "Al", "rolls", 0],
  ["Magnesium Nitrate", "Mg(NO3)2", "g", 0],
  ["Litmus Paper (Red & Blue)", "Dye mixture", "packets", 0],
  ["Cobalt(II) Chloride", "CoCl2", "g", 0],
  ["Iodine", "I2", "g", 0],
  ["Aluminium Chloride", "AlCl3", "g", 0],
  ["Manganese(II) Sulphate", "MnSO4", "g", 0],
  ["Manganese(II) Carbonate", "MnCO3", "g", 0],
  ["Methyl Orange", "C14H14N3NaO3S", "g", 0],
  ["Nickel(II) Sulphate", "NiSO4", "g", 0],
  ["Oxalic Acid", "C2H2O4", "g", 0],
  ["Potassium Thiocyanate", "KSCN", "g", 0],
  ["Potassium Nitrate", "KNO3", "g", 0],
  ["Potassium Chromate", "K2CrO4", "g", 0],
  ["Potassium Chloride", "KCl", "g", 0],
  ["Potassium Aluminium Sulphate", "KAl(SO4)2", "g", 0],
  ["Potassium Chlorate", "KClO3", "g", 0],
  ["Potassium Sulphate", "K2SO4", "g", 0],
  ["Potassium Bromate", "KBrO3", "g", 0],
  ["Potassium Periodate", "KIO4", "g", 0],
  ["Phenolphthalein", "C20H14O4", "g", 0],
  ["Pyrogallic Acid", "C6H6O3", "g", 0],
  ["pH Paper", "Indicator mixture", "packets", 0],
  ["Phosphoric Acid", "H3PO4", "mL", 0],
  ["Liquid Paraffin", "Mixture", "mL", 0],
  ["Red Lead", "Pb3O4", "g", 0],
  ["Sodium Chromate", "Na2CrO4", "g", 0],
  ["Sodium Acetate (Anhydrous)", "NaCH3COO", "g", 0],
  ["Sodium Bromide", "NaBr", "g", 0],
  ["Sodium Chlorate", "NaClO3", "g", 0],
  ["Soda Lime", "NaOH + CaO", "g", 0],
  ["Sulfur", "S", "g", 0],
  ["Turmeric Paper", "Mixture", "packets", 0],
  ["Chloroform", "CHCl3", "g", 0],
  ["p-Toluenesulfonic Acid", "C7H8O3S", "g", 0],
  ["Urea", "CH4N2O", "g", 0],
  ["Wax", "Mixture", "g", 0],
  ["Zinc Powder", "Zn", "g", 0],
  ["Zinc Chloride", "ZnCl2", "g", 0],
  ["Zinc Iodide", "ZnI2", "g", 0],
  ["Zinc Oxide", "ZnO", "g", 0],
  ["Ammonium Oxalate", "(NH4)2C2O4", "g", 0],
  ["Propionic Acid", "C3H6O2", "mL", 0],
  ["Charcoal Powder (Carbon)", "C", "g", 0],
  ["Lead(II) Oxide", "PbO", "g", 0],
  ["N-Propanol", "C3H8O", "mL", 0],
  ["Propanone (Acetone)", "C3H6O", "mL", 0],
  ["Iron Powder", "Fe", "g", 0],
  ["Thymolphthalein", "C28H30O4", "g", 0],
  ["Sucrose", "C12H22O11", "g", 0],
  ["Aluminium Ammonium Sulphate", "NH4Al(SO4)2", "g", 0],
  ["Sodium Nitrite", "NaNO2", "g", 0],
  ["Magnesium Chloride", "MgCl2", "g", 0],
  ["Magnesium Oxide", "MgO", "g", 0],
  ["Sodium Tetraborate (Borax)", "Na2B4O7.10H2O", "g", 0],
  ["Manganese(IV) Oxide", "MnO2", "g", 0],
  ["Methanoic Acid (Formic Acid)", "HCOOH", "mL", 0],
  ["Nitric Acid", "HNO3", "mL", 0],
  ["Potassium Bromide", "KBr", "g", 0],
  ["Potassium Dichromate", "K2Cr2O7", "g", 0],
  ["Potassium Iodate", "KIO3", "g", 0],
  ["Zinc Carbonate", "ZnCO3", "g", 0],
  ["Sodium Hydroxide", "NaOH", "g", 0],
  ["Manganese(II) Chloride", "MnCl2", "g", 0],
  ["Sodium Chloride", "NaCl", "g", 0],
  ["Sodium Hydrogen Carbonate", "NaHCO3", "g", 0],
  ["Sulphuric Acid", "H2SO4", "mL", 0],
  ["Sodium Nitrate", "NaNO3", "g", 0],
  ["Sodium Thiosulphate", "Na2S2O3", "g", 0],
  ["Sodium Oxalate", "Na2C2O4", "g", 0],
  ["Sodium Carbonate (Decahydrate)", "Na2CO3.10H2O", "g", 0],
  ["Starch", "(C6H10O5)n", "g", 0],
  ["Universal Indicator", "Mixture", "mL", 0],
  ["Potassium Permanganate", "KMnO4", "g", 0],
  ["Zinc Nitrate", "Zn(NO3)2", "g", 0],
  ["Zinc Sulphate", "ZnSO4", "g", 0],
  ["Silver Nitrate", "AgNO3", "g", 0],
  ["Potassium Persulphate", "K2S2O8", "g", 0],
  ["Sodium Sulphite", "Na2SO3", "g", 0],
  ["Potassium Iodide", "KI", "g", 0],
  ["Sodium Sulphate (Decahydrate)", "Na2SO4.10H2O", "g", 0],
  ["Magnesium Carbonate", "MgCO3", "g", 0],
  ["Propanal", "C3H6O", "mL", 0],
  ["Bleach", "NaClO", "g", 0],
  ["2-Butanol", "C4H10O", "mL", 0],
  ["Ammonium Metavanadate", "NH4VO3", "g", 0],
  ["Ethanal (Aldehyde-free)", "C2H4O", "mL", 0],
  ["Sodium Hydrogen Sulphate", "NaHSO4", "g", 0],
  ["Thymol Blue", "C27H30O5S", "g", 0],
  ["Copper(II) Sulphate", "CuSO4", "g", 0],
  ["Ammonia (aq.)", "NH3", "mL", 0],
  ["Barium Chloride", "BaCl2", "g", 0],
  ["Sodium Carbonate (Anhydrous)", "Na2CO3", "g", 0],
];

// ---------- Apparatus data ----------
// Format: [Name, Category, Quantity]
// Categories: glassware, balances, heating, measurement, other
const APPARATUS = [
  ["Beaker 300ml", "glassware", 0],
  ["Burette Stand", "other", 0],
  ["Bunsen Burner", "heating", 0],
  ["Conical Flask 100ml", "glassware", 0],
  ["Crucible Tongs", "other", 0],
  ["Copper Strips", "other", 0],
  ["Cork with Holes", "other", 0],
  ["Cork For Boiling Tube", "other", 0],
  ["Cork For Conical Flask", "other", 0],
  ["Delivery Tubes", "glassware", 0],
  ["Distillation Apparatus Electric", "other", 0],
  ["Distillation Apparatus Gas", "heating", 0],
  ["Desiccator", "other", 0],
  ["Electric Leads", "other", 0],
  ["Electronic Balance", "balances", 0],
  ["Evaporating Basin", "glassware", 0],
  ["Fumes Resistant Mask", "other", 0],
  ["Safety Goggles", "other", 0],
  ["Rubber Gloves", "other", 0],
  ["Heat Proof Mat", "other", 0],
  ["Indicator Bottles", "glassware", 0],
  ["Lid Glass", "glassware", 0],
  ["Measuring Cylinder 1000ml", "measurement", 0],
  ["Measuring Cylinder 500ml", "measurement", 0],
  ["Measuring Cylinder 10ml", "measurement", 0],
  ["Measuring Flask 500ml", "measurement", 0],
  ["Measuring Flask 250ml", "measurement", 0],
  ["Measuring Flask 100ml", "measurement", 0],
  ["Molecular Model Set", "other", 0],
  ["Mortar Pestle", "other", 0],
  ["Magnetic Stirrer Machine", "other", 0],
  ["Pipette 1ml", "measurement", 0],
  ["Pipette 20ml", "measurement", 0],
  ["Plastic Cups", "other", 0],
  ["Plastic Jug 5L", "other", 0],
  ["Plastic Jug 2L", "other", 0],
  ["Plastic Jug 1L", "other", 0],
  ["Plastic Tub Large", "other", 0],
  ["Plastic Tub Small", "other", 0],
  ["Plastic Trays", "other", 0],
  ["Plastic Cane 30L", "other", 0],
  ["Plastic Cane 20L", "other", 0],
  ["Plastic Cane 10L", "other", 0],
  ["Plastic Cane 5L", "other", 0],
  ["Plastic Bucket 50L", "other", 0],
  ["Room Temperature Thermometer", "measurement", 0],
  ["Digital Room Thermometer", "measurement", 0],
  ["Tripod Stand", "other", 0],
  ["Burette 50ml", "measurement", 0],
  ["Droppers", "measurement", 0],
  ["Beaker 1000ml", "glassware", 0],
  ["Beaker 100ml", "glassware", 0],
  ["Thermometer -10-110°C", "measurement", 0],
  ["Boiling Tube", "glassware", 0],
  ["Measuring Cylinder 100ml", "measurement", 0],
  ["Crucible", "glassware", 0],
  ["Glass Rods", "glassware", 0],
  ["Rubber Delivery Tubes", "other", 0],
  ["Measuring Cylinder 50ml", "measurement", 0],
  ["Conical Flask 250ml", "glassware", 0],
  ["Beaker 250ml", "glassware", 0],
  ["Measuring Cylinder 25ml", "measurement", 0],
  ["Measuring Flask 1000ml", "measurement", 0],
  ["Measuring Flask 6000ml", "measurement", 0],
  ["Pipette 10ml", "measurement", 0],
  ["Cork For Test Tubes", "other", 0],
  ["Pipette Filler", "measurement", 0],
  ["Reagent Bottle 250ml", "glassware", 0],
  ["Reagent Bottle 125ml", "glassware", 0],
  ["Thermometer 0.2°C", "measurement", 0],
  ["Plastic Keef", "other", 0],
  ["Funnels", "glassware", 0],
  ["Pipette 25ml", "measurement", 0],
  ["Measuring Cylinder 250ml", "measurement", 0],
  ["Triangular Pipe Clay", "other", 0],
  ["Test Tubes Graduated", "glassware", 0],
  ["Test Tube Holders", "other", 0],
  ["Test Tube Stand Wooden", "other", 0],
  ["Test Tube Stand Iron", "other", 0],
  ["Spirit Lamp", "heating", 0],
  ["Stopwatch", "measurement", 0],
  ["Stew Spot", "other", 0],
  ["Wash Bottle", "other", 0],
  ["White Tile", "other", 0],
  ["Water Trough with Glass Plates", "other", 0],
  ["Beaker 500ml", "glassware", 0],
  ["Measuring Flask 2000ml", "measurement", 0],
  ["pH Meter", "measurement", 0],
  ["Spatula", "other", 0],
  ["Thermometer 0.1°C", "measurement", 0],
  ["Wire Gauze", "other", 0],
  ["Water Taps", "other", 0],
  ["Gas Valve", "other", 0],
  ["Tissue Rolls", "other", 0],
  ["Permanent Markers", "other", 0],
  ["Stopwatch Cells", "other", 0],
  ["Electric Grinder", "other", 0],
  ["Test Tube Brush", "other", 0],
  ["Thermopol Cups", "other", 0],
  ["Face Mask", "other", 0],
  ["Latex Gloves", "other", 0],
  ["Weighing Bottles", "glassware", 0],
  ["Wooden Splints", "other", 0],
  ["Petri Dish", "glassware", 0],
  ["Test Tubes", "glassware", 0],
];

// ---------- Main ----------
async function main() {
  console.log(`📋 Data to insert:
   • ${CHEMICALS.length} chemicals
   • ${APPARATUS.length} apparatus
   • Total: ${CHEMICALS.length + APPARATUS.length} items
`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Sign in
  console.log("🔐 Signing in as", EMAIL, "...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (authError) {
    console.error("❌ Auth failed:", authError.message);
    process.exit(1);
  }
  console.log("✅ Signed in. User ID:", authData.user.id);
  const userId = authData.user.id;
  const userName = EMAIL.split("@")[0];

  // 2. Insert chemicals in batches of 50
  console.log(`\n🧪 Inserting ${CHEMICALS.length} chemicals...`);
  const chemicalRows = CHEMICALS.map(([name, formula, unit, qty]) => ({
    name,
    formula: formula === "N/A" ? null : formula,
    quantity: qty,
    initial_quantity: qty,
    unit,
    qr_code: crypto.randomUUID(),
    created_by: userId,
  }));

  let chemInserted = 0;
  for (let i = 0; i < chemicalRows.length; i += 50) {
    const batch = chemicalRows.slice(i, i + 50);
    const { data, error } = await supabase.from("chemicals").insert(batch).select("id,name");
    if (error) {
      console.error(`❌ Chemical batch ${i / 50 + 1} failed:`, error.message);
      console.error("First row in batch:", batch[0]);
    } else {
      chemInserted += data.length;
      console.log(`   ✓ Batch ${Math.floor(i / 50) + 1}: inserted ${data.length} chemicals (${chemInserted} total)`);

      // Insert "created" log entries for this batch
      const logRows = data.map((c) => ({
        item_id: c.id,
        item_type: "chemical",
        item_name: c.name,
        action: "created",
        quantity: 0,
        unit: chemicalRows.find((r) => r.name === c.name)?.unit || null,
        logged_by: userId,
        logged_by_name: userName,
        note: "Bulk import",
      }));
      const { error: logError } = await supabase.from("consumption_logs").insert(logRows);
      if (logError) console.error("   ⚠ Log insert failed:", logError.message);
    }
  }
  console.log(`✅ Inserted ${chemInserted} chemicals`);

  // 3. Insert apparatus in batches of 50
  console.log(`\n⚗️ Inserting ${APPARATUS.length} apparatus...`);
  const apparatusRows = APPARATUS.map(([name, category, qty]) => ({
    name,
    category,
    quantity: qty,
    initial_quantity: qty,
    created_by: userId,
  }));

  let appInserted = 0;
  for (let i = 0; i < apparatusRows.length; i += 50) {
    const batch = apparatusRows.slice(i, i + 50);
    const { data, error } = await supabase.from("apparatus").insert(batch).select("id,name");
    if (error) {
      console.error(`❌ Apparatus batch ${i / 50 + 1} failed:`, error.message);
      console.error("First row in batch:", batch[0]);
    } else {
      appInserted += data.length;
      console.log(`   ✓ Batch ${Math.floor(i / 50) + 1}: inserted ${data.length} apparatus (${appInserted} total)`);

      // Insert "created" log entries
      const logRows = data.map((a) => ({
        item_id: a.id,
        item_type: "apparatus",
        item_name: a.name,
        action: "created",
        quantity: 0,
        unit: null,
        logged_by: userId,
        logged_by_name: userName,
        note: "Bulk import",
      }));
      const { error: logError } = await supabase.from("consumption_logs").insert(logRows);
      if (logError) console.error("   ⚠ Log insert failed:", logError.message);
    }
  }
  console.log(`✅ Inserted ${appInserted} apparatus`);

  // 4. Summary
  console.log(`\n🎉 Done!
   • ${chemInserted} chemicals added (each with a unique QR code)
   • ${appInserted} apparatus added
   • ${chemInserted + appInserted} "created" log entries added
   • All items have quantity 0 — update them with real stock via the app

   Next steps:
   1. Open your app and refresh — all items will appear
   2. Go to each item → Edit → set the real quantity
   3. Or use the bulk-update script to set quantities from a spreadsheet
   4. Print QR labels for all chemicals (Scanner → Print chemical QR labels)
`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
