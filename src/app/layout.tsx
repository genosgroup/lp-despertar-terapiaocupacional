import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import Tracking, { TrackingNoScript } from "@/components/Tracking";
import "../../conteudo/dsp-lp.css";
import "./globals.css";

/*
 * As duas fontes do pacote (Figtree e Newsreader), servidas pelo proprio site
 * em vez do link para o Google Fonts. O CSS do pacote continua igual: o
 * globals.css so aponta as variaveis --dsp-f-* para estas fontes.
 */
const figtree = Figtree({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--fonte-figtree",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--fonte-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://despertaresi.com.br"),
  applicationName: "Clínica Despertar",
};

export const viewport: Viewport = {
  themeColor: "#FFFBFA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${newsreader.variable}`}>
      <body>
        <Tracking />
        <TrackingNoScript />
        {children}
      </body>
    </html>
  );
}
