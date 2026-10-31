"use client";

import { Check } from "lucide-react";

export type FocusId = "Formulários" | "WhatsApp" | "Checkout" | "Navegação";

export const CAPTION: Record<FocusId | "inicio", { title: string; text: string }> = {
  inicio: { title: "Página inicial", text: "A IA abre o site e confere se tudo carrega." },
  Formulários: { title: "Formulário de contato", text: "Preenche os campos, envia e espera a confirmação." },
  WhatsApp: { title: "Botão do WhatsApp", text: "Clica no botão e confere se a conversa abre com o número certo." },
  Checkout: { title: "Carrinho e checkout", text: "Adiciona um item e segue até o pagamento, sem pagar." },
  Navegação: { title: "Menu e links", text: "Percorre o menu e os links em busca de páginas quebradas." },
};

const bar = "rounded bg-white/10";
const ring = "ring-2 ring-accent ring-offset-2 ring-offset-surface-2 animate-pulse";

function Ok({ children }: { children: string }) {
  return (
    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] text-accent">
      <Check className="size-3" strokeWidth={3} />
      {children}
    </span>
  );
}

function Screen({ id }: { id: FocusId | "inicio" }) {
  switch (id) {
    case "Formulários":
      return (
        <div className="space-y-2.5">
          <div className={`h-3 w-1/3 ${bar}`} />
          <div className="h-8 rounded-[8px] border border-line bg-bg/60 px-3 text-[11px] leading-8 text-muted">Maria Souza</div>
          <div className="h-8 rounded-[8px] border border-line bg-bg/60 px-3 text-[11px] leading-8 text-muted">maria@email.com</div>
          <div className="h-16 rounded-[8px] border border-accent/40 bg-bg/60 p-3 text-[11px] text-muted">
            Quero um orçamento<span className="ml-px inline-block h-3 w-px animate-pulse bg-accent align-middle" />
          </div>
          <div className={`grid h-9 w-28 place-items-center rounded-[8px] bg-accent/80 text-xs font-medium text-accent-ink ${ring}`}>Enviar</div>
          <Ok>Formulário envia</Ok>
        </div>
      );
    case "WhatsApp":
      return (
        <div className="relative h-full min-h-[210px]">
          <div className={`h-3 w-2/5 ${bar}`} />
          <div className={`mt-4 h-6 w-4/5 ${bar}`} />
          <div className={`mt-2 h-2.5 w-3/5 ${bar}`} />
          <div className="absolute bottom-0 right-0 flex flex-col items-end gap-2">
            <div className="max-w-[170px] rounded-[10px] rounded-br-[2px] bg-surface p-2.5 text-[11px] leading-snug text-fg ring-1 ring-line-strong">
              Olá! Vim pelo site e quero saber mais.
            </div>
            <div className={`grid size-11 place-items-center rounded-full bg-accent text-accent-ink ${ring}`}>
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0">
            <Ok>Conversa abre</Ok>
          </div>
        </div>
      );
    case "Checkout":
      return (
        <div className="space-y-2.5">
          <div className={`h-3 w-1/3 ${bar}`} />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-[8px] border border-line bg-bg/60 p-2.5">
              <div className="size-9 shrink-0 rounded-[6px] bg-white/10" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className={`h-2.5 w-3/4 ${bar}`} />
                <div className={`h-2 w-1/3 ${bar}`} />
              </div>
              <span className="text-[11px] text-muted">R$ {i ? "59" : "129"}</span>
            </div>
          ))}
          <div className="flex justify-between text-[11px] text-muted">
            <span>Total</span>
            <span className="text-fg">R$ 188</span>
          </div>
          <div className={`grid h-9 place-items-center rounded-[8px] bg-accent/80 text-xs font-medium text-accent-ink ${ring}`}>Finalizar compra</div>
          <Ok>Chega ao pagamento</Ok>
        </div>
      );
    case "Navegação":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 border-b border-line pb-2.5 text-[11px] text-muted">
            <span className="size-4 rounded bg-white/15" />
            <span>Início</span>
            <span className={`rounded px-1.5 py-0.5 text-fg ${ring}`}>Serviços</span>
            <span>Sobre</span>
            <span>Contato</span>
          </div>
          <div className={`h-5 w-2/3 ${bar}`} />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 rounded-[8px] bg-white/6" />
            <div className="h-14 rounded-[8px] bg-white/6" />
          </div>
          <Ok>Links sem erro 404</Ok>
        </div>
      );
    default:
      return (
        <div>
          <div className={`h-3 w-2/5 ${bar}`} />
          <div className={`mt-5 h-6 w-4/5 ${bar}`} />
          <div className="mt-2 h-6 w-3/5 rounded bg-white/15" />
          <div className={`mt-4 h-2.5 w-11/12 ${bar}`} />
          <div className="mt-6 h-9 w-32 rounded-[8px] bg-accent/30" />
          <Ok>Página carrega</Ok>
        </div>
      );
  }
}

/** Uma tela por vez, dentro de uma moldura de navegador (desktop) ou de celular. */
export function ScreenPreview({ id, host, mobile }: { id: FocusId | "inicio"; host: string; mobile: boolean }) {
  return (
    <div className={`mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-[16px] border border-line bg-surface-2 ${mobile ? "max-w-[260px]" : ""}`}>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        {!mobile && (
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
          </div>
        )}
        <div className="flex h-7 min-w-0 flex-1 items-center rounded-[8px] bg-bg px-3 font-mono text-xs text-muted">
          <span className="truncate">{host || "seusite.com.br"}</span>
        </div>
      </div>
      <div key={`${id}-${mobile}`} className={`screen-in flex-1 p-5 ${mobile ? "min-h-[360px]" : "min-h-[300px]"}`}>
        <Screen id={id} />
      </div>
    </div>
  );
}
