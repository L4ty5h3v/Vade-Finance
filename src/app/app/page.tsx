import { AppShell } from "@/components/app/AppShell";
import { SolanaWalletProvider } from "@/components/app/SolanaWalletProvider";

export default function AppPage() {
  return (
    <SolanaWalletProvider>
      <AppShell />
    </SolanaWalletProvider>
  );
}
