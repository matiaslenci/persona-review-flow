import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, CircleDashed, FileSignature, MapPin, Phone, Search,
  ShieldAlert, ShieldCheck, Trash2, UserRound, X, RotateCcw, ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { informe, personas, resultados, type Match, type Persona } from "@/lib/inhibiciones-demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inhibiciones — Procesar personas" },
      { name: "description", content: "Consultá, depurá y confirmá inhibiciones persona por persona antes del pase a firma." },
      { property: "og:title", content: "Inhibiciones — Procesar personas" },
      { property: "og:description", content: "Flujo de consulta de inhibiciones por persona con pase a firma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InhibicionesPage,
});

type Result = { informar: boolean; matches: Match[]; observacion: string };
type RowDecision = "aceptada" | "rechazada";

function InhibicionesPage() {
  const [activeId, setActiveId] = useState(personas[0]!.id);
  const [done, setDone] = useState<Record<string, Result>>({});
  const [signed, setSigned] = useState(false);
  const processed = Object.keys(done).length;
  const allDone = processed === personas.length;
  const active = personas.find((p) => p.id === activeId)!;

  const finish = (p: Persona, r: Result) => {
    setDone((d) => ({ ...d, [p.id]: r }));
    toast.success(`${p.apellido}, ${p.nombre}: ${r.informar ? "se informa" : "no se informa"}`);
    const next = personas.find((x) => x.id !== p.id && !done[x.id]);
    if (next) setActiveId(next.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar allDone={allDone} signed={signed} onSign={() => { setSigned(true); toast.success("Trámite enviado a firma"); }} />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <InformeHeader />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <PersonList activeId={activeId} done={done} onSelect={setActiveId} />
          <section className="min-w-0">
            {signed ? (
              <SignedState />
            ) : done[active.id] ? (
              <PersonSummary persona={active} result={done[active.id]!} onEdit={() => setDone((d) => { const n = { ...d }; delete n[active.id]; return n; })} />
            ) : (
              <PersonWorkspace key={active.id} persona={active} onFinish={(r) => finish(active, r)} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function TopBar({ allDone, signed, onSign }: { allDone: boolean; signed: boolean; onSign: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
        <button className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Volver"><ArrowLeft className="size-5" /></button>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Inhibiciones</p>
          <h1 className="truncate text-base font-semibold">Formulario N° {informe.formulario} · Aforo {informe.aforo}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {!allDone && <span className="hidden text-sm text-muted-foreground sm:block">Procesá todas las personas para firmar</span>}
          <button
            disabled={!allDone || signed}
            onClick={onSign}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileSignature className="size-4" /> {signed ? "Enviado a firma" : "Pasar a firma"}
          </button>
        </div>
      </div>
    </header>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-sm font-medium", mono && "font-mono")}>{value || "—"}</dd>
    </div>
  );
}

function InformeHeader() {
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-[1fr_1.4fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Informe</h2>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">{informe.estadoPago}</span>
          <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{informe.naturaleza}</span>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Últ. movimiento" value={informe.ultimoMovimiento} />
          <Field label="Fecha aforado" value={informe.fechaAforado} />
          <Field label="Cierre Santa Fe" value={informe.cierreSantaFe} />
          <Field label="Cierre Rosario" value={informe.cierreRosario} />
        </dl>
      </div>
      <div className="space-y-4 border-t pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" />
          <h2 className="font-semibold">{informe.escribano}</h2>
          <span className="text-xs text-muted-foreground">Escribano</span>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Matrícula" value={informe.matricula} />
          <Field label="Registro" value={informe.registro} />
          <Field label="Dirección" value={<span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-muted-foreground" />{informe.direccion}</span>} />
          <Field label="Teléfono" value={<span className="inline-flex items-center gap-1"><Phone className="size-3.5 text-muted-foreground" />{informe.telefono}</span>} />
        </dl>
      </div>
      <p className="text-xs text-muted-foreground md:col-span-2">Se informa únicamente de acuerdo a datos aportados por quien lo solicita.</p>
    </div>
  );
}

function PersonList({ activeId, done, onSelect }: { activeId: string; done: Record<string, Result>; onSelect: (id: string) => void }) {
  const n = Object.keys(done).length;
  return (
    <aside className="h-fit rounded-xl border bg-card lg:sticky lg:top-24">
      <div className="border-b p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Personas</h2>
          <span className="text-sm text-muted-foreground"><b className="text-foreground">{n}</b> / {personas.length}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(n / personas.length) * 100}%` }} />
        </div>
      </div>
      <ul className="p-2">
        {personas.map((p, i) => {
          const r = done[p.id];
          const isActive = p.id === activeId;
          return (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p.id)}
                className={cn("flex w-full items-center gap-3 rounded-lg p-3 text-left transition", isActive ? "bg-accent" : "hover:bg-muted")}
              >
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  r ? (r.informar ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground") : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {r ? <Check className="size-4" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.apellido}, {p.nombre}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r ? (r.informar ? `Informar · ${r.matches.length} inhibición(es)` : "No informar") : `DNI ${p.dni}`}
                  </span>
                </span>
                {isActive && <ChevronRight className="size-4 text-primary" />}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function PersonCard({ persona, children }: { persona: Persona; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {persona.apellido[0]}{persona.nombre[0]}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{persona.apellido}, {persona.nombre}</h2>
          <p className="text-sm text-muted-foreground">{persona.tipo}</p>
        </div>
        <div className="ml-auto">{children}</div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
        <Field label="D.N.I." value={persona.dni} mono />
        <Field label="CUIL" value={persona.cuil} mono />
        <Field label="Nacionalidad" value={persona.nacionalidad} />
        <Field label="Domicilio" value={persona.domicilio} />
      </dl>
    </div>
  );
}

const steps = ["Consultar", "Depurar resultados", "Confirmar"];

function PersonWorkspace({ persona, onFinish }: { persona: Persona; onFinish: (r: Result) => void }) {
  const [query, setQuery] = useState(persona.busqueda);
  const [metodo, setMetodo] = useState("Contiene");
  const [cuit, setCuit] = useState("");
  const [rows, setRows] = useState<Match[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [decisions, setDecisions] = useState<Record<number, RowDecision>>({});
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const step = rows === null ? 0 : rows.some((r) => !decisions[r.id]) ? 1 : 2;
  const accepted = useMemo(() => (rows ?? []).filter((r) => decisions[r.id] === "aceptada"), [rows, decisions]);

  const consultar = () => {
    setLoading(true);
    setTimeout(() => {
      setRows(resultados[persona.id] ?? []);
      setSelected(new Set()); setDecisions({}); setLoading(false);
    }, 500);
  };
  const allSelected = !!rows?.length && selected.size === rows.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows!.map((r) => r.id)));
  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const borrar = () => {
    setRows((r) => r!.filter((x) => !selected.has(x.id)));
    toast(`${selected.size} resultado(s) eliminados`);
    setSelected(new Set());
  };
  const decide = (id: number, d: RowDecision) => setDecisions((s) => { const n = { ...s }; if (n[id] === d) delete n[id]; else n[id] = d; return n; });
  const acceptAll = () => setDecisions(Object.fromEntries((rows ?? []).map((r) => [r.id, "aceptada" as const])));

  const pending = (rows ?? []).filter((r) => !decisions[r.id]).length;
  const informar = accepted.length > 0;

  return (
    <div className="space-y-4">
      <PersonCard persona={persona}>
        <ol className="flex items-center gap-1 text-xs">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium",
                i < step ? "bg-secondary text-secondary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {i < step ? <Check className="size-3" /> : <span>{i + 1}</span>} {s}
              </span>
              {i < steps.length - 1 && <ChevronRight className="size-3 text-muted-foreground" />}
            </li>
          ))}
        </ol>
      </PersonCard>

      <div className="rounded-xl border bg-card">
        <form onSubmit={(e) => { e.preventDefault(); consultar(); }} className="grid gap-3 border-b p-4 sm:grid-cols-[2fr_1fr_1.3fr_auto] sm:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Apellido y nombre</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Método de búsqueda</span>
            <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
              <option>Contiene</option><option>Comienza con</option><option>Exacto</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">CUIT / CUIL / Documento</span>
            <input value={cuit} onChange={(e) => setCuit(e.target.value)} placeholder="Opcional" className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </label>
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {loading ? <CircleDashed className="size-4 animate-spin" /> : rows ? <RotateCcw className="size-4" /> : <Search className="size-4" />}
            {rows ? "Volver a consultar" : "Consultar"}
          </button>
        </form>

        {rows === null ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Search className="size-8 text-muted-foreground/60" />
            <p className="font-medium">Consultá si la persona registra inhibiciones</p>
            <p className="text-sm text-muted-foreground">Ajustá los criterios y presioná Consultar.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <ShieldCheck className="size-9 text-success" />
            <p className="font-medium">Sin coincidencias</p>
            <p className="text-sm text-muted-foreground">La persona se marcará como <b>No informar</b>.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 px-4 py-2.5 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 font-medium">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-4 accent-primary" />
                Seleccionar todo
              </label>
              <span className="text-muted-foreground">· {rows.length} resultados{selected.size > 0 && `, ${selected.size} seleccionados`}</span>
              <div className="ml-auto flex gap-2">
                <button onClick={acceptAll} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-card px-3 text-xs font-medium hover:bg-accent">
                  <ListChecks className="size-3.5" /> Aceptar todas
                </button>
                <button disabled={!selected.size} onClick={borrar} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40">
                  <Trash2 className="size-3.5" /> Borrar seleccionados
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b">
                    <th className="w-10 px-4 py-2.5"></th>
                    <th className="px-2 py-2.5">Marca</th><th className="px-2 py-2.5">Nodo</th><th className="px-2 py-2.5">Fecha</th>
                    <th className="px-2 py-2.5">Aforo</th><th className="px-2 py-2.5">Apellido y nombre</th><th className="px-2 py-2.5">CUIT/CUIL</th>
                    <th className="px-2 py-2.5">Estado</th><th className="px-2 py-2.5">F. vigencia</th><th className="px-4 py-2.5 text-right">Decisión</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const d = decisions[r.id];
                    return (
                      <tr key={r.id} className={cn("border-b last:border-0 transition", d === "aceptada" && "bg-secondary/60", d === "rechazada" && "opacity-50", selected.has(r.id) && "bg-accent")}>
                        <td className="px-4 py-2.5"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="size-4 accent-primary" aria-label="Seleccionar fila" /></td>
                        <td className="px-2 py-2.5 font-mono">{r.marca || "—"}</td>
                        <td className="px-2 py-2.5 font-mono">{r.nodo}</td>
                        <td className="px-2 py-2.5 font-mono">{r.fecha}</td>
                        <td className="px-2 py-2.5 font-mono">{r.aforo}</td>
                        <td className={cn("px-2 py-2.5 font-medium", d === "rechazada" && "line-through")}>{r.nombre}</td>
                        <td className="px-2 py-2.5 font-mono text-muted-foreground">{r.cuit}</td>
                        <td className="px-2 py-2.5"><Estado e={r.estado} /></td>
                        <td className="px-2 py-2.5 font-mono">{r.vigencia}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => decide(r.id, "aceptada")} aria-label="Aceptar" title="Aceptar"
                              className={cn("inline-flex size-8 items-center justify-center rounded-md border transition", d === "aceptada" ? "border-primary bg-primary text-primary-foreground" : "text-primary hover:bg-secondary")}>
                              <Check className="size-4" />
                            </button>
                            <button onClick={() => decide(r.id, "rechazada")} aria-label="Rechazar" title="Rechazar (opcional)"
                              className={cn("inline-flex size-8 items-center justify-center rounded-md border transition", d === "rechazada" ? "border-destructive bg-destructive text-destructive-foreground" : "text-destructive hover:bg-destructive/10")}>
                              <X className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {rows !== null && (
        <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <div className={cn("flex items-center gap-3 rounded-lg p-3", informar ? "bg-warning/15" : "bg-success/10")}>
              {informar ? <ShieldAlert className="size-5 text-warning-foreground" /> : <ShieldCheck className="size-5 text-success" />}
              <div className="text-sm">
                <p className="font-semibold">{informar ? `Informar — Inhibido: SÍ (${accepted.length})` : "No informar — Inhibido: NO"}</p>
                <p className="text-muted-foreground">
                  {pending > 0 ? `${pending} resultado(s) sin decidir; los no aceptados no se agregan.` : informar ? "Se agregarán las inhibiciones aceptadas." : "No hay inhibiciones aceptadas."}
                </p>
              </div>
            </div>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observación (opcional)" rows={2}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <button onClick={() => onFinish({ informar, matches: accepted, observacion: obs })}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
            <CheckCircle2 className="size-4" /> Confirmar y siguiente
          </button>
        </div>
      )}
    </div>
  );
}

function Estado({ e }: { e: string }) {
  const tone = e.startsWith("CADUCA") ? "bg-muted text-muted-foreground" : e === "PROVISIONAL" ? "bg-warning/20 text-warning-foreground" : "bg-destructive/10 text-destructive";
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>{e}</span>;
}

function PersonSummary({ persona, result, onEdit }: { persona: Persona; result: Result; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <PersonCard persona={persona}>
        <button onClick={onEdit} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted">
          <RotateCcw className="size-4" /> Reprocesar
        </button>
      </PersonCard>
      <div className="rounded-xl border bg-card">
        <div className={cn("flex items-center gap-3 border-b p-4", result.informar ? "bg-warning/15" : "bg-success/10")}>
          {result.informar ? <ShieldAlert className="size-5 text-warning-foreground" /> : <ShieldCheck className="size-5 text-success" />}
          <p className="font-semibold">{result.informar ? "Informar · Inhibido: SÍ" : "No informar · Inhibido: NO"}</p>
        </div>
        {result.matches.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b"><th className="px-4 py-2.5">#</th><th className="px-2 py-2.5">Apellido y nombre</th><th className="px-2 py-2.5">Aforo</th><th className="px-2 py-2.5">F. vigencia</th><th className="px-4 py-2.5">Estado</th></tr>
            </thead>
            <tbody>
              {result.matches.map((m, i) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-2 py-2.5 font-medium">{m.nombre}</td>
                  <td className="px-2 py-2.5 font-mono">{m.aforo}</td>
                  <td className="px-2 py-2.5 font-mono">{m.vigencia}</td>
                  <td className="px-4 py-2.5"><Estado e={m.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">La persona no registra inhibiciones.</p>
        )}
        {result.observacion && <p className="border-t p-4 text-sm"><span className="text-muted-foreground">Observación: </span>{result.observacion}</p>}
      </div>
    </div>
  );
}

function SignedState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-12 text-center">
      <FileSignature className="size-10 text-primary" />
      <h2 className="text-lg font-semibold">Trámite enviado a firma</h2>
      <p className="max-w-sm text-sm text-muted-foreground">Las {personas.length} personas fueron procesadas y el informe quedó listo para firmar.</p>
    </div>
  );
}
