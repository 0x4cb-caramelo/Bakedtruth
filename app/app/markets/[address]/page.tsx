import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicKey } from "@solana/web3.js";

import { MarketView } from "@/components/market/market-view";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ side?: string }>;
};

function isAddress(value: string) {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  return { title: `Market ${address.slice(0, 4)}…${address.slice(-4)} · Provable` };
}

export default async function MarketPage({ params, searchParams }: Props) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  // `?side=no` comes from the No box on a market card.
  const side = (await searchParams).side === "no" ? "no" : "yes";
  return <MarketView address={address} initialSide={side} />;
}
