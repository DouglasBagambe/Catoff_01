// pages/_app.tsx
import { AppProps } from "next/app";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import Layout from "@/components/common/Layout";
import "@/styles/global.css";
require("@solana/wallet-adapter-react-ui/styles.css");

const wallets = [new PhantomWalletAdapter()];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WalletModalProvider>
    </WalletProvider>
  );
}

export default MyApp;
