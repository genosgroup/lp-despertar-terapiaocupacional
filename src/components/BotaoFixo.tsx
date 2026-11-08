"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Botao fixo do celular ("Marcar primeira conversa"). Some quando o topo ou o
 * formulario estao na tela, como o script do pacote fazia. Comeca escondido
 * porque a pagina abre no topo; sem isso ele piscaria na carga.
 */
export default function BotaoFixo({ children }: { children: ReactNode }) {
  const [escondido, setEscondido] = useState(true);

  useEffect(() => {
    // Sem IntersectionObserver (navegador muito antigo) o botao fica escondido;
    // os outros botoes da pagina continuam levando ao formulario.
    if (!("IntersectionObserver" in window)) return;
    const visivel: Record<string, boolean> = {};
    const io = new IntersectionObserver(
      (entradas) => {
        for (const en of entradas) visivel[en.target.id] = en.isIntersecting;
        setEscondido(Boolean(visivel.topo || visivel.conversar));
      },
      { threshold: 0.12 },
    );
    for (const id of ["topo", "conversar"]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className={`dsp-lp-fixo${escondido ? " is-escondido" : ""}`} id="dsp-fixo">
      {children}
    </div>
  );
}
