import { Button, Logo } from "@/components/ui";

const FEATURES = [
  ["Navegador de verdade", "Chromium real abre seu site, clica, preenche formulários e abre o WhatsApp como um cliente faria."],
  ["Desktop e celular", "Cada etapa vem com print nos dois formatos. Layout estourado no mobile aparece no relatório."],
  ["Nota de clareza", "Em 5 segundos dá pra entender o que o site vende? Você recebe uma nota de 0 a 10 com o motivo."],
  ["Problemas priorizados", "Do crítico ao detalhe, cada item com onde ocorre e como corrigir."],
];

const STEPS = [
  ["1", "Cole a URL", "Qualquer site ou sistema público."],
  ["2", "Acompanhe ao vivo", "Veja cada etapa e print enquanto o teste roda."],
  ["3", "Envie o relatório", "Link público ou PDF, pronto pro cliente."],
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="glow pointer-events-none absolute inset-x-0 top-0 h-[620px]" />
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[620px]" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost">Entrar</Button>
          <Button href="/login?modo=cadastro" className="hidden sm:inline-flex">Começar grátis</Button>
        </div>
      </nav>

      <header className="relative mx-auto max-w-4xl px-5 pb-24 pt-20 text-center sm:pt-28">
        <p className="mx-auto w-fit rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted">
          Para freelancers e agências web
        </p>
        <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Seu cliente não deveria achar o bug <span className="text-accent">antes de você</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted">
          Cole a URL. Uma IA testa o site como um usuário real e entrega um relatório com prints, nota e problemas
          priorizados.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/login?modo=cadastro" className="h-12 px-6">Testar meu site grátis</Button>
          <span className="text-sm text-muted">3 testes grátis por mês, sem cartão</span>
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-line bg-surface/80 p-4 text-left shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <span className="size-2.5 rounded-full bg-danger/70" />
            <span className="size-2.5 rounded-full bg-warn/70" />
            <span className="size-2.5 rounded-full bg-accent/70" />
            <span className="ml-3 font-mono text-xs text-muted">smoke-tester · relatório</span>
          </div>
          <ul className="space-y-3 pt-4 text-sm">
            <li className="flex items-center justify-between"><span>Página inicial carrega</span><span className="text-accent">OK</span></li>
            <li className="flex items-center justify-between"><span>Layout no celular</span><span className="text-danger">Falhou — scroll horizontal</span></li>
            <li className="flex items-center justify-between"><span>Botão do WhatsApp abre a conversa</span><span className="text-accent">OK</span></li>
            <li className="flex items-center justify-between"><span>Formulário de contato envia</span><span className="text-danger">Falhou — sem resposta</span></li>
            <li className="flex items-center justify-between border-t border-line pt-3"><span className="text-muted">Clareza em 5 segundos</span><span className="font-semibold text-warn">6.5 / 10</span></li>
          </ul>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Do link ao relatório em minutos</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-line p-6">
              <span className="font-mono text-sm text-accent">{n}</span>
              <h3 className="mt-3 font-medium">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-5 pb-28 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Entregue com a certeza de que funciona.
        </h2>
        <div className="mt-8 flex justify-center">
          <Button href="/login?modo=cadastro" className="h-12 px-6">Criar conta grátis</Button>
        </div>
      </section>

      <footer className="relative border-t border-line py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Smoke Tester
      </footer>
    </div>
  );
}
