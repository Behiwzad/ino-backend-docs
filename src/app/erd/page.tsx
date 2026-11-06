import { ErdCanvas } from "@/components/erd/ErdCanvas";
import { getSeed } from "@/schema/seed";

export const metadata = { title: "ERD Canvas · Ino Backend" };

export default function ErdPage() {
  const seed = getSeed();
  const counts = Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.length]));
  const sample = Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.slice(0, 6)]));
  return <ErdCanvas seedCounts={counts} sample={sample} />;
}
