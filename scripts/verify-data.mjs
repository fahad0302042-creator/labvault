import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://umijltkqeuzddjdfgutm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaWpsdGtxZXV6ZGRqZGZndXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTIzMjcsImV4cCI6MjA5Nzk4ODMyN30.6VLyeeq766Nt3n9XEWrbRpyQ0JJg1gh3LlbiHNPJags"
);

const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
  email: "redc42087@gmail.com",
  password: "g03217703",
});
if (authErr) { console.error("Auth failed:", authErr.message); process.exit(1); }
console.log("✅ Signed in as:", auth.user.email);

const { count: chemCount } = await supabase.from("chemicals").select("*", { count: "exact", head: true });
console.log("🧪 Chemicals in DB:", chemCount);

const { count: appCount } = await supabase.from("apparatus").select("*", { count: "exact", head: true });
console.log("⚗️ Apparatus in DB:", appCount);

const { count: logCount } = await supabase.from("consumption_logs").select("*", { count: "exact", head: true });
console.log("📝 Logs in DB:", logCount);

// Sample a few chemicals
const { data: sample } = await supabase.from("chemicals").select("name,formula,unit,quantity").limit(5);
console.log("\n📋 Sample chemicals:");
sample?.forEach((c, i) => console.log(`  ${i + 1}. ${c.name} (${c.formula}) — ${c.quantity} ${c.unit}`));
