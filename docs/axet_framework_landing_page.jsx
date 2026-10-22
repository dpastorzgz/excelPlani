{/* GENERATED-DERIVED — do not hand-edit gate data. Source: framework/rules/quality-gates.md. Legacy tables pending generation (C9). */}
import React, { useMemo, useState } from "react";

const phases = [
  {
    n: "01",
    name: "Proposal",
    desc: "Alinea objetivo, alcance y restricciones. Define el plan de aprobación.",
    artifact: "proposal.md",
    qg: "QG1.1–QG1.7",
    icon: "📄",
  },
  {
    n: "02",
    name: "Specs",
    desc: "Convierte la propuesta en requisitos claros, no ambiguos y verificables.",
    artifact: "specs.md",
    qg: "QG2.1–QG2.8",
    icon: "📘",
  },
  {
    n: "03",
    name: "Design",
    desc: "Diseña la solución: arquitectura, componentes y decisiones (ADRs) antes de construir.",
    artifact: "design.md",
    qg: "QG3.1–QG3.8",
    icon: "🏗️",
  },
  {
    n: "04",
    name: "Tasks",
    desc: "Descompone el diseño en tareas trazables con criterios de aceptación y dependencias.",
    artifact: "task-list.md",
    qg: "QG4.1–QG4.7",
    icon: "🔁",
  },
  {
    n: "05",
    name: "Build",
    desc: "Implementa el alcance siguiendo las reglas tecnológicas y registrando evidencia de build.",
    artifact: "build-log.md",
    qg: "QG5.1–QG5.5",
    icon: "💻",
  },
  {
    n: "06",
    name: "Verification",
    desc: "Valida que lo construido cumple specs/diseño y documenta desviaciones y acciones.",
    artifact: "verification-report.md",
    qg: "QG6.1–QG6.7",
    icon: "🔎",
  },
  {
    n: "07",
    name: "Testing",
    desc: "Ejecuta y reporta tests (unit/integration/e2e según aplique) y corrige fallos.",
    artifact: "test-report.md",
    qg: "QG7.1–QG7.5",
    icon: "🧪",
  },
  {
    n: "08",
    name: "Commit / PR",
    desc: "Estandariza entrega: commits limpios, PR revisada y gates de integración.",
    artifact: "pull-request.md",
    qg: "QG8.1–QG8.4",
    icon: "🔀",
  },
  {
    n: "09",
    name: "Release",
    desc: "Publica la versión con notas, checklist de despliegue y verificación post-deploy.",
    artifact: "release-notes.md",
    qg: "QG9.1–QG9.4",
    icon: "🚀",
  },
  {
    n: "10",
    name: "Archive",
    desc: "Cierra el ciclo: retrospectiva, artefactos completos y lecciones aprendidas.",
    artifact: "retrospective.md",
    qg: "QG10.1–QG10.3",
    icon: "📦",
  },
];

const goals = [
  { title: "Trazabilidad", text: "Cada decisión queda documentada como artefacto Markdown dentro del proyecto.", icon: "📄" },
  { title: "Calidad", text: "Los Quality Gates bloquean el avance hasta que la fase cumple sus criterios.", icon: "🛡️" },
  { title: "Consistencia", text: "Las reglas de tecnología se cargan automáticamente según el stack.", icon: "⚙️" },
  { title: "Control humano", text: "Aprobaciones explícitas en cada frontera de fase.", icon: "🔒" },
];

const architecture = [
  {
    title: "Axet Plugin",
    subtitle: "Agente orquestador",
    items: ["framework/rules", "framework/workflows", "framework/skills", "framework/templates"],
    icon: "🤖",
  },
  {
    title: "Technology Layer",
    subtitle: "Reglas por stack",
    items: ["technology-rules/salesforce", "technology-rules/_template", "technology-rules/[your-tech]"],
    icon: "🧱",
  },
  {
    title: "Work-items",
    subtitle: "Evidencia por work-item",
    items: ["work-item/[slug]/01-proposal", "work-item/[slug]/05-build", "work-item/[slug]/07-testing", "work-item/[slug]/10-archive"],
    icon: "✅",
  },
];

const gates = [
  ["1", "QG1.7", "Aprobación del usuario"],
  ["2", "QG2.5", "Sin ambigüedades"],
  ["3", "QG3.1", "Diagrama de arquitectura"],
  ["4", "QG4.3", "100% cobertura del diseño"],
  ["5", "QG5.2", "Cumple reglas tecnológicas"],
  ["6", "QG6.4", "Sin desviaciones críticas"],
  ["7", "QG7.4", "Sin tests fallando"],
  ["8", "QG8.4", "PR aprobado"],
  ["9", "QG9.3", "Post-deploy verificado"],
  ["10", "QG10.2", "Todos los artefactos presentes"],
];

const prohibitions = [
  "Generar código sin cargar reglas de tecnología",
  "Saltar la verificación de Fase 6",
  "Commitear sin pasar testing",
  "Merge directo a main/master sin PR revisada",
  "Avanzar con Quality Gates fallando",
];

function SectionTitle({ eyebrow, title, text, dark = false }) {
  return (
    <div className="section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={dark ? "title dark-title" : "title"}>{title}</h2>
      {text && <p className={dark ? "section-text dark-text" : "section-text"}>{text}</p>}
    </div>
  );
}

function Button({ children, variant = "primary", onClick }) {
  return (
    <button type="button" onClick={onClick} className={`btn ${variant === "outline" ? "btn-outline" : "btn-primary"}`}>
      {children}
    </button>
  );
}

export default function AxetFrameworkLandingPage() {
  const [activePhase, setActivePhase] = useState("05");
  const selected = useMemo(() => phases.find((p) => p.n === activePhase) ?? phases[4], [activePhase]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="axet-page">
      <style>{css}</style>

      <nav className="nav">
        <div className="container nav-inner">
          <div className="brand">
            <div className="brand-icon">🤖</div>
            <div>
              <p className="brand-title">Axet Framework</p>
              <p className="brand-subtitle">Agentic Development Lifecycle</p>
            </div>
          </div>
          <div className="nav-actions">
            <span className="pill">10 fases</span>
            <span className="pill">Quality Gates</span>
            <Button onClick={() => scrollToSection("lifecycle")}>Ver lifecycle</Button>
            <Button variant="outline" onClick={() => scrollToSection("quick-start")}>Quick Start</Button>
          </div>
        </div>
      </nav>

      <section className="container hero">
        <div>
          <div className="version-badge">✨ Framework version 1.1 · Updated 2026-05-14</div>
          <h1>Desarrollo agentic con control, calidad y trazabilidad.</h1>
          <p className="hero-text">
            Axet estructura cualquier proyecto software en un ciclo de vida de 10 fases, gobernado por un agente IA, con artefactos obligatorios, reglas por tecnología y checkpoints de aprobación humana.
          </p>
          <div className="hero-actions">
            <Button onClick={() => scrollToSection("lifecycle")}>Ver ciclo de vida →</Button>
            <Button variant="outline" onClick={() => scrollToSection("quick-start")}>Quick Start</Button>
          </div>
        </div>

        <div className="hero-card card">
          <div className="card-header">
            <div>
              <p className="muted-label">Phase execution</p>
              <h3>Gate-controlled workflow</h3>
            </div>
            <div className="status-icon">✅</div>
          </div>
          <div className="mini-phase-grid">
            {phases.slice(0, 6).map((phase) => (
              <button
                key={phase.n}
                type="button"
                onClick={() => setActivePhase(phase.n)}
                className={`mini-phase ${activePhase === phase.n ? "active" : ""}`}
              >
                <span>PHASE {phase.n}</span>
                <strong>{phase.name}</strong>
                <small>{phase.artifact}</small>
              </button>
            ))}
          </div>
          <div className="selected-phase">
            <span className="selected-icon">{selected.icon}</span>
            <div>
              <strong>Selected: Phase {selected.n} · {selected.name}</strong>
              <p>Artifact: {selected.artifact} · Gates: {selected.qg}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Diseño del framework"
          title="Una metodología opinada para que la IA no improvise"
          text="El agente no solo genera código: carga reglas, produce evidencia, ejecuta workflows por fase y bloquea el avance cuando faltan criterios críticos."
        />
        <div className="goal-grid">
          {goals.map((goal) => (
            <div className="card goal-card" key={goal.title}>
              <div className="soft-icon">{goal.icon}</div>
              <h3>{goal.title}</h3>
              <p>{goal.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="lifecycle" className="section band">
        <div className="container">
          <SectionTitle
            eyebrow="Lifecycle"
            title="10 fases secuenciales, 10 artefactos obligatorios"
            text="Cada fase genera un Markdown concreto y solo avanza tras pasar sus Quality Gates y, si aplica, la aprobación humana."
          />
          <div className="phase-grid">
            {phases.map((phase) => (
              <button
                key={phase.n}
                type="button"
                onClick={() => setActivePhase(phase.n)}
                className={`phase-card ${activePhase === phase.n ? "active" : ""}`}
              >
                <div className="phase-top">
                  <span>{phase.n}</span>
                  <b>{phase.icon}</b>
                </div>
                <h3>{phase.name}</h3>
                <p>{phase.artifact}</p>
                <p className="phase-desc">{phase.desc}</p>
                <small>{phase.qg}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Arquitectura"
          title="Separación clara entre agente, tecnología y proyecto"
          text="Axet mantiene el framework central limpio, carga reglas tecnológicas bajo demanda y escribe artefactos en carpetas de proyecto versionables."
        />
        <div className="arch-grid">
          {architecture.map((block, index) => (
            <div className="card arch-card" key={block.title}>
              <div className="arch-top">
                <div className="arch-icon">{block.icon}</div>
                {index < architecture.length - 1 && <span className="arrow">→</span>}
              </div>
              <p className="eyebrow compact">{block.subtitle}</p>
              <h3>{block.title}</h3>
              <div className="code-list">
                {block.items.map((item) => <code key={item}>{item}</code>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section dark-section">
        <div className="container">
          <SectionTitle
            dark
            eyebrow="Quality Gates"
            title="El avance se gana, no se asume"
            text="Los gates se reportan por ID para mantener la comunicación compacta, pero bloquean decisiones críticas de calidad, revisión, cobertura y despliegue."
          />
          <div className="gate-grid">
            {gates.map(([phase, gate, label]) => (
              <div className="gate-card" key={gate}>
                <p>Phase {phase}</p>
                <strong>{gate}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quick-start" className="container section quick-start">
        <div>
          <p className="eyebrow">Quick Start</p>
          <h2 className="title left">Arranca un proyecto con una instrucción clara</h2>
          <p className="section-text left">
            Crea la carpeta del proyecto, indica el slug, la tecnología y una descripción. Axet empezará en Phase 1 y pedirá aprobación antes de continuar.
          </p>
          <div className="warning-box">
            <span>⚠️</span>
            <p>En Phases 3, 4, 5, 7 y 9 el agente debe resolver la tecnología y cargar sus reglas antes de diseñar, planificar tareas, construir, testear o desplegar.</p>
          </div>
        </div>
        <div className="terminal-card">
          <div className="terminal-title">⌘ Terminal / Axet prompt</div>
          <pre>{`mkdir -p work-item/my-project-slug

Start Phase 1 — Proposal
Work-item: my-project-slug
Technology: salesforce
Description: <what you are building>

# Later
Resume Phase 5 for work-item: my-project-slug`}</pre>
        </div>
      </section>

      <section className="section band white-band">
        <div className="container">
          <SectionTitle
            eyebrow="Extensibilidad"
            title="Añade cualquier tecnología desde una plantilla"
            text="El directorio technology-rules/_template define el contrato mínimo: rules.md, context.md y tech-config.yml. Después puedes añadir guías específicas, pipelines y templates propios."
          />
          <div className="steps-grid">
            {["Copy _template", "Fill rules.md", "Fill context.md", "Fill tech-config.yml", "Add guidelines", "Validate routing"].map((step, index) => (
              <div className="step-card" key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section two-col">
        <div className="card info-card">
          <div className="soft-icon green">🌿</div>
          <h2>Gestión de cambios</h2>
          <p>Los cambios menores continúan inline y se anotan. Los cambios significativos hacen rollback a la fase afectada, actualizan artefactos, re-ejecutan gates y requieren nueva aprobación.</p>
        </div>
        <div className="card danger-card">
          <div className="soft-icon red">⚠️</div>
          <h2>Hard Prohibitions</h2>
          <div className="prohibition-list">
            {prohibitions.map((item) => (
              <p key={item}><strong>×</strong>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <div className="mobile-bar">
        <Button onClick={() => scrollToSection("lifecycle")}>Lifecycle</Button>
        <Button variant="outline" onClick={() => scrollToSection("quick-start")}>Quick Start</Button>
      </div>

      <footer className="footer">
        <div className="container footer-inner">
            <div>
              <strong>
                Selected: Phase {selected.n} · {selected.name}
              </strong>
              <p>Artifact: {selected.artifact} · Gates: {selected.qg}</p>
              <p className="selected-desc">{selected.desc}</p>
            </div>
          <p>🛡️ Built for controlled AI-assisted delivery</p>
        </div>
      </footer>
    </main>
  );
}

const css = `
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; }
  .axet-page {
    min-height: 100vh;
    color: #0f172a;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: radial-gradient(circle at top left, #dbeafe, transparent 32%), linear-gradient(to bottom, #ffffff, #f8fafc);
  }
  .container { width: min(1180px, calc(100% - 48px)); margin: 0 auto; }
  .nav { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid rgba(255,255,255,.7); background: rgba(255,255,255,.86); backdrop-filter: blur(18px); }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; gap: 24px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 18px; background: #020617; color: #fff; box-shadow: 0 12px 28px rgba(148,163,184,.65); }
  .brand-title { margin: 0; font-size: 14px; font-weight: 800; }
  .brand-subtitle { margin: 3px 0 0; font-size: 12px; color: #64748b; }
  .nav-actions { display: flex; align-items: center; gap: 10px; }
  .pill { display: inline-flex; padding: 7px 12px; border-radius: 999px; border: 1px solid #e2e8f0; background: rgba(255,255,255,.8); font-size: 12px; font-weight: 700; color: #334155; box-shadow: 0 3px 10px rgba(15,23,42,.05); }
  .btn { min-height: 42px; border: 0; border-radius: 16px; padding: 0 18px; cursor: pointer; font-weight: 800; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
  .btn:hover { transform: translateY(-1px); }
  .btn-primary { background: #020617; color: #fff; box-shadow: 0 10px 24px rgba(30,64,175,.16); }
  .btn-primary:hover { background: #1e293b; }
  .btn-outline { background: #fff; color: #0f172a; border: 1px solid #cbd5e1; }
  .btn-outline:hover { background: #f8fafc; }
  .hero { display: grid; grid-template-columns: 1.05fr .95fr; gap: 48px; align-items: center; padding: 86px 0 92px; }
  .version-badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #dbeafe; background: #eff6ff; color: #1d4ed8; padding: 9px 15px; border-radius: 999px; font-size: 14px; font-weight: 700; margin-bottom: 24px; }
  h1 { margin: 0; font-size: clamp(42px, 6vw, 72px); line-height: .96; letter-spacing: -0.055em; font-weight: 950; }
  .hero-text { margin: 26px 0 0; max-width: 680px; color: #475569; font-size: 18px; line-height: 1.75; }
  .hero-actions { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
  .card { border: 1px solid #e2e8f0; background: rgba(255,255,255,.92); border-radius: 30px; box-shadow: 0 16px 45px rgba(148,163,184,.18); }
  .hero-card { padding: 24px; overflow: hidden; backdrop-filter: blur(12px); }
  .card-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
  .muted-label { margin: 0 0 4px; color: #64748b; font-size: 14px; font-weight: 700; }
  .card-header h3 { margin: 0; font-size: 24px; }
  .status-icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 18px; background: #dcfce7; }
  .mini-phase-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
  .mini-phase { border: 1px solid #e2e8f0; background: #fff; border-radius: 18px; padding: 16px; text-align: left; cursor: pointer; transition: .2s ease; }
  .mini-phase:hover, .phase-card:hover { transform: translateY(-4px); box-shadow: 0 18px 34px rgba(15,23,42,.09); }
  .mini-phase.active { border-color: #93c5fd; background: #eff6ff; }
  .mini-phase span { display: block; font-size: 11px; color: #2563eb; font-weight: 900; }
  .mini-phase strong { display: block; margin-top: 6px; }
  .mini-phase small { display: block; margin-top: 5px; color: #64748b; }
  .selected-phase { margin-top: 16px; border: 1px solid #1e293b; background: #020617; color: #fff; border-radius: 24px; padding: 18px; display: flex; gap: 14px; align-items: center; }
  .selected-icon { font-size: 26px; }
  .selected-phase p { margin: 5px 0 0; color: #cbd5e1; font-size: 14px; }
  .section { padding: 80px 0; }
  .section-title { max-width: 760px; margin: 0 auto 42px; text-align: center; }
  .eyebrow { margin: 0 0 12px; color: #2563eb; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: .2em; }
  .compact { letter-spacing: .14em; font-size: 12px; }
  .title { margin: 0; color: #020617; font-size: clamp(30px, 4vw, 44px); line-height: 1.08; letter-spacing: -0.035em; font-weight: 900; }
  .title.left, .section-text.left { text-align: left; margin-left: 0; }
  .section-text { max-width: 730px; margin: 18px auto 0; color: #475569; font-size: 16px; line-height: 1.75; }
  .goal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .goal-card, .arch-card, .info-card, .danger-card { padding: 26px; }
  .goal-card h3, .arch-card h3 { margin: 14px 0 0; font-size: 20px; }
  .goal-card p, .info-card p { color: #475569; line-height: 1.65; }
  .soft-icon { width: 52px; height: 52px; display: grid; place-items: center; background: #eff6ff; color: #1d4ed8; border-radius: 18px; font-size: 24px; }
  .soft-icon.green { background: #dcfce7; }
  .soft-icon.red { background: #fff; color: #b91c1c; }
  .band { border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; background: rgba(255,255,255,.72); scroll-margin-top: 96px; }
  .white-band { background: #fff; }
  .phase-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
  .phase-card { min-height: 220px; text-align: left; padding: 20px; border-radius: 24px; border: 1px solid #e2e8f0; cursor: pointer; background: linear-gradient(135deg, #eff6ff, #fff); transition: .2s ease; }
  .phase-desc { margin: 10px 0 0; color: #475569; font-size: 13px; line-height: 1.5; font-weight: 600; }
  .selected-desc { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.55; }
  .phase-card.active { border-color: #60a5fa; box-shadow: 0 0 0 4px #dbeafe, 0 16px 35px rgba(37,99,235,.12); }
  .phase-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .phase-top span { background: #fff; border-radius: 999px; padding: 6px 11px; font-size: 12px; font-weight: 950; box-shadow: 0 4px 12px rgba(15,23,42,.06); }
  .phase-top b { font-size: 22px; }
  .phase-card h3 { margin: 0; font-size: 18px; }
  .phase-card p { margin: 8px 0 0; color: #64748b; font-size: 13px; font-weight: 700; }
  .phase-card small { display: block; margin-top: 12px; color: #1d4ed8; font-size: 12px; }
  .arch-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  .arch-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .arch-icon { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 22px; color: #fff; background: #020617; font-size: 28px; }
  .arrow { color: #cbd5e1; font-size: 24px; }
  .code-list { display: grid; gap: 9px; margin-top: 20px; }
  code { display: block; border-radius: 15px; background: #f8fafc; padding: 12px 14px; color: #334155; font-size: 12px; }
  .dark-section { background: #020617; color: #fff; }
  .dark-title { color: #fff; }
  .dark-text { color: #cbd5e1; }
  .gate-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
  .gate-card { border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.06); border-radius: 24px; padding: 20px; }
  .gate-card p { margin: 0; color: #93c5fd; font-size: 12px; text-transform: uppercase; letter-spacing: .14em; font-weight: 900; }
  .gate-card strong { display: block; margin-top: 10px; color: #fff; font-size: 22px; }
  .gate-card span { display: block; margin-top: 10px; color: #cbd5e1; line-height: 1.55; font-size: 14px; }
  .quick-start { display: grid; grid-template-columns: .9fr 1.1fr; gap: 36px; align-items: center; scroll-margin-top: 96px; }
  .warning-box { display: flex; gap: 12px; align-items: flex-start; margin-top: 30px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e; border-radius: 24px; padding: 20px; }
  .warning-box p { margin: 0; line-height: 1.65; }
  .terminal-card { border-radius: 30px; background: #020617; padding: 24px; color: #e2e8f0; box-shadow: 0 24px 55px rgba(15,23,42,.2); }
  .terminal-title { color: #cbd5e1; font-weight: 700; margin-bottom: 16px; }
  pre { margin: 0; overflow-x: auto; border-radius: 24px; background: rgba(0,0,0,.35); padding: 22px; color: #f8fafc; line-height: 1.75; font-size: 14px; }
  .steps-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 14px; }
  .step-card { border: 1px solid #e2e8f0; background: linear-gradient(135deg, #fff, #f8fafc); border-radius: 24px; padding: 20px 14px; text-align: center; }
  .step-card span { display: grid; place-items: center; width: 42px; height: 42px; margin: 0 auto 13px; border-radius: 999px; background: #2563eb; color: #fff; font-weight: 950; }
  .step-card strong { font-size: 14px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .info-card h2, .danger-card h2 { margin: 18px 0 10px; font-size: 26px; }
  .danger-card { background: #fef2f2; border-color: #fecaca; }
  .prohibition-list { display: grid; gap: 10px; margin-top: 18px; }
  .prohibition-list p { display: flex; gap: 11px; margin: 0; border-radius: 16px; background: rgba(255,255,255,.78); padding: 12px; color: #334155; }
  .prohibition-list strong { color: #dc2626; }
  .mobile-bar { display: none; position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 70; gap: 10px; border: 1px solid #e2e8f0; background: rgba(255,255,255,.96); padding: 8px; border-radius: 20px; box-shadow: 0 20px 45px rgba(15,23,42,.18); backdrop-filter: blur(16px); }
  .footer { border-top: 1px solid #e2e8f0; background: #fff; padding: 36px 0; }
  .footer-inner { display: flex; justify-content: space-between; gap: 20px; align-items: center; color: #475569; }
  .footer strong { color: #0f172a; }
  .footer p { margin: 5px 0 0; }

  @media (max-width: 980px) {
    .hero, .quick-start, .two-col { grid-template-columns: 1fr; }
    .goal-grid, .arch-grid { grid-template-columns: repeat(2,1fr); }
    .phase-grid, .gate-grid { grid-template-columns: repeat(2,1fr); }
    .steps-grid { grid-template-columns: repeat(2,1fr); }
    .nav-actions { display: none; }
    .mobile-bar { display: flex; }
    .footer { padding-bottom: 100px; }
  }
  @media (max-width: 640px) {
    .container { width: min(100% - 32px, 1180px); }
    .hero { padding: 56px 0 66px; }
    h1 { font-size: 42px; }
    .goal-grid, .arch-grid, .phase-grid, .gate-grid, .steps-grid { grid-template-columns: 1fr; }
    .mini-phase-grid { grid-template-columns: 1fr; }
    .section { padding: 62px 0; }
    .btn { padding: 0 14px; }
  }
`;
