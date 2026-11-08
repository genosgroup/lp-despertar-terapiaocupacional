import type { Metadata } from "next";
import PaginaDoPacote from "@/components/PaginaDoPacote";
import { URL_DA_PAGINA } from "@/lib/site";

// Title e description do LEIA-ME do pacote (tabela "Páginas, endereços e SEO").
const TITULO = "Terapia ocupacional em Salvador para crianças · Despertar";
const DESCRICAO =
  "Terapia ocupacional para crianças na Pituba, Salvador. Uma primeira conversa para entender a rotina do seu filho, com calma. Particular, com recibo para reembolso.";

// URLs absolutas: o basePath nao entra sozinho nos metadados.
const IMAGEM_DE_COMPARTILHAMENTO = `${URL_DA_PAGINA}og-despertar-to.jpg`;

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: URL_DA_PAGINA },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_DA_PAGINA,
    siteName: "Clínica Despertar",
    title: TITULO,
    description: DESCRICAO,
    images: [
      {
        url: IMAGEM_DE_COMPARTILHAMENTO,
        width: 1200,
        height: 630,
        alt: "Terapia ocupacional infantil na Clínica Despertar, Pituba, Salvador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
    images: [IMAGEM_DE_COMPARTILHAMENTO],
  },
};

/** Dados da clinica para a busca local (os mesmos do rodape da pagina). */
const DADOS_DA_CLINICA = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Clínica Despertar · Espaço de Saúde Integrada",
  url: "https://despertaresi.com.br/",
  image: IMAGEM_DE_COMPARTILHAMENTO,
  logo: `${URL_DA_PAGINA}imagens/dsp-lp-logo.webp`,
  telephone: "+55 71 99399-6613",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Alameda Benevento, 72, sala 401, Pituba",
    addressLocality: "Salvador",
    addressRegion: "BA",
    addressCountry: "BR",
  },
  sameAs: ["https://www.instagram.com/clinica.despertaresi/"],
};

export default function TerapiaOcupacional() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(DADOS_DA_CLINICA).replace(/</g, "\\u003c"),
        }}
      />
      <PaginaDoPacote />
    </>
  );
}
