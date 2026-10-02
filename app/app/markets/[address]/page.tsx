import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicKey } from "@solana/web3.js";

import { MarketDetail } from "@/components/market-detail";

type Props = { params: Promise<{ address: string }> };

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
  return { title: `Market ${address.slice(0, 4)}…${address.slice(-4)} · pred-provable` };
}

export default async function MarketPage({ params }: Props) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  return <MarketDetail address={address} />;
}
