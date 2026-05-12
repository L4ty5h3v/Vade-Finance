import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer id="docs" className="mt-24 border-t border-[#c5d8f3] bg-[#0c1b38] text-[#d8e8ff]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <BrandLogo href="/" size="lg" theme="dark" />
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#aecaef]">
              Invoice financing infrastructure for verified exporters, powered by Solana settlement.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="#marketplace-preview" className="hover:text-white">Marketplace</a></li>
              <li><a href="https://app.vade.finance" className="hover:text-white">Dashboard</a></li>
              <li><a href="#how-it-works" className="hover:text-white">Invoice Verification</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#security" className="hover:text-white">Security</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Resources</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="https://docs.vade.finance" className="hover:text-white">Docs</a></li>
              <li><a href="#" className="hover:text-white">API</a></li>
              <li><a href="#" className="hover:text-white">Legal</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Social</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="#" className="hover:text-white">X</a></li>
              <li><a href="#" className="hover:text-white">Discord</a></li>
              <li><a href="#" className="hover:text-white">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#23406f] pt-6 text-xs text-[#a5bfdc]">
          <p>Built on Solana Devnet</p>
          <p className="mt-2">
            Not financial advice. Invoice financing is subject to regulation.
          </p>
        </div>
      </div>
    </footer>
  );
}
