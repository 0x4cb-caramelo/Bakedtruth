import { WalletButton } from "@/components/wallet-button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <span className="font-semibold tracking-tight">pred-provable</span>
        <WalletButton />
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Provable KPI Markets</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sponsors post a bounty on an on-chain goal. Doers back YES and move the metric. Resolution is a read,
          not a judgement.
        </p>
        {/* TODO: market list (getProgramAccounts on Market), create-market form, bet / resolve / claim actions. */}
      </main>
    </div>
  );
}
