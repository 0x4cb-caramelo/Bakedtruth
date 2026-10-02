import { MarketsExplorer } from "@/components/markets-explorer";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Provable KPI Markets</h1>
        <p className="text-zinc-400">
          Sponsors post bounties on on-chain goals: burn supply, renounce authorities, lock liquidity. Doers buy YES and
          move the metric. Resolution is a read of the chain, not a judgement: no oracle, no committee, no dispute window.
        </p>
      </section>
      <MarketsExplorer />
    </div>
  );
}
