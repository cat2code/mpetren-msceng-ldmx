import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/eliotmontesinopetren/src/mpetren-msceng-ldmx";
const BUILD = path.join(ROOT, ".tmp_thesis_defense");
const THESIS = path.join(ROOT, "thesis_report/overleaf_project");
const FINAL = path.join(ROOT, "thesis_report/Thesis_Defense_Eliot_Montesino_Petren.pptx");
const RENDER = path.join(BUILD, "rendered");

const W = 1280;
const H = 720;
const C = {
  ink: "#111111",
  gray: "#5F6672",
  light: "#F1F3F5",
  rule: "#B8BCC4",
  blue: "#3D8DFF",
  paleBlue: "#DCEEFF",
  orange: "#D97706",
  paleOrange: "#FDE9D5",
  green: "#2F855A",
  paleGreen: "#E1F1E6",
  purple: "#7657B5",
  palePurple: "#EEE7F8",
  red: "#B42318",
  white: "#FFFFFF",
};
const FONT = "Helvetica Neue";

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  throw new Error(`Unsupported image type: ${file}`);
}

async function imageBytes(file) {
  return new Uint8Array(await fs.readFile(file));
}

function addText(slide, text, p, opts = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    name: opts.name,
    position: p,
    fill: opts.fill ?? "none",
    line: opts.line ?? { style: "solid", fill: "none", width: 0 },
    ...(opts.geometry ? { geometry: opts.geometry } : {}),
    ...(opts.borderRadius ? { borderRadius: opts.borderRadius } : {}),
  });
  box.text = text;
  box.text.style = {
    fontSize: opts.fontSize ?? 22,
    typeface: opts.typeface ?? FONT,
    color: opts.color ?? C.ink,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    alignment: opts.alignment ?? "left",
    verticalAlignment: opts.verticalAlignment ?? "top",
    autoFit: opts.autoFit ?? "shrinkText",
    insets: opts.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return box;
}

function addRect(slide, p, fill, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry ?? "rect",
    name: opts.name,
    position: p,
    fill,
    line: opts.line ?? { style: "solid", fill: opts.lineFill ?? "none", width: opts.lineWidth ?? 0 },
    ...(opts.borderRadius ? { borderRadius: opts.borderRadius } : {}),
  });
}

function addRule(slide, x, y, width, color = C.rule, weight = 1) {
  return slide.shapes.add({
    geometry: "straightConnector1",
    position: { left: x, top: y, width, height: 0.01 },
    fill: "none",
    line: { style: "solid", fill: color, width: weight },
  });
}

async function addImage(slide, file, p, opts = {}) {
  return slide.images.add({
    blob: await imageBytes(file),
    contentType: mimeFor(file),
    alt: opts.alt ?? path.basename(file),
    fit: opts.fit ?? "contain",
    position: p,
    ...(opts.crop ? { crop: opts.crop } : {}),
    ...(opts.geometry ? { geometry: opts.geometry } : {}),
    ...(opts.borderRadius ? { borderRadius: opts.borderRadius } : {}),
  });
}

function addSlideTitle(slide, title, number, sourceLine = "") {
  addText(slide, title, { left: 42, top: 30, width: 1160, height: 66 }, {
    fontSize: 40,
    bold: true,
    autoFit: "shrinkText",
    name: `slide-${number}-title`,
  });
  addRule(slide, 42, 102, 1196, C.ink, 1.2);
  if (sourceLine) {
    addText(slide, sourceLine, { left: 42, top: 678, width: 1050, height: 18 }, {
      fontSize: 11,
      color: C.gray,
      autoFit: "shrinkText",
      name: `slide-${number}-source`,
    });
  }
  addText(slide, String(number), { left: 1178, top: 674, width: 60, height: 22 }, {
    fontSize: 13,
    color: C.gray,
    alignment: "right",
    name: `slide-${number}-number`,
  });
}

function addNotes(slide, timing, script, sources) {
  const notes = `[Timing: ${timing}]\n\n${script}\n\n[Sources]\n${sources.map((s) => `- ${s}`).join("\n")}`;
  slide.speakerNotes.textFrame.setText(notes);
  slide.speakerNotes.setVisible(true);
}

function addMetric(slide, x, y, width, number, label, color = C.blue) {
  addText(slide, number, { left: x, top: y, width, height: 62 }, {
    fontSize: 44,
    bold: true,
    color,
    verticalAlignment: "bottom",
  });
  addText(slide, label, { left: x, top: y + 67, width, height: 52 }, {
    fontSize: 18,
    color: C.ink,
  });
}

function addPanel(slide, p, fill = C.light, lineFill = "none") {
  return addRect(slide, p, fill, {
    geometry: "roundRect",
    borderRadius: 8,
    line: { style: "solid", fill: lineFill, width: lineFill === "none" ? 0 : 1 },
  });
}

async function main() {
  await fs.mkdir(RENDER, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // 1 — Title
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addText(s, "MASTER’S THESIS DEFENCE", { left: 42, top: 40, width: 500, height: 30 }, {
      fontSize: 18, bold: true, color: C.blue,
    });
    addText(s, "Learning to Separate", { left: 42, top: 160, width: 1080, height: 95 }, {
      fontSize: 72, bold: true, verticalAlignment: "bottom", autoFit: "none",
    });
    addText(s, "Neural hit assignment for overlapping electron showers in LDMX", { left: 44, top: 270, width: 1010, height: 105 }, {
      fontSize: 36, color: C.ink,
    });
    addRule(s, 44, 414, 720, C.blue, 5);
    addText(s, "Eliot Montesino Petrén", { left: 44, top: 466, width: 520, height: 42 }, {
      fontSize: 28, bold: true,
    });
    addText(s, "Lund University · Faculty of Engineering (LTH)\nSupervisor: Lene-Kristian Bryngemark · Co-supervisor: Ruth Pöttgen", { left: 44, top: 518, width: 720, height: 84 }, {
      fontSize: 19, color: C.gray,
    });
    addRect(s, { left: 1138, top: 0, width: 142, height: 720 }, C.paleBlue);
    addRect(s, { left: 1188, top: 0, width: 92, height: 720 }, C.blue);
    addNotes(s, "0:00–0:20",
      "Good morning. My thesis is called ‘Learning to Separate’. The problem is very concrete: when several beam electrons arrive in the same LDMX readout window, their electromagnetic showers overlap. I ask whether set-based neural networks can recover which electron produced each calorimeter hit, and whether a richer model can also identify shared deposits and infer the electron multiplicity. I will begin with the physics motivation, then describe the reconstruction task and models, and spend most of the talk on what succeeds, what fails, and why.",
      [
        "Thesis title page and abstract: main.tex and sections/00abstract.tex.",
      ]);
  }

  // 2 — DM frontier
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "The missing-momentum search opens the sub-GeV frontier", 2,
      "Thesis §2.1 · Cirelli (2026) · Battaglieri et al. (2017)");
    addText(s, "Dark matter shapes the Universe, but its particle identity remains unknown.", { left: 44, top: 132, width: 560, height: 88 }, {
      fontSize: 30, bold: true,
    });
    addText(s, "Below roughly a GeV, conventional nuclear-recoil searches lose sensitivity. Accelerator experiments can instead produce light dark-sector states and infer them from momentum imbalance.", { left: 44, top: 244, width: 540, height: 150 }, {
      fontSize: 22, color: C.gray,
    });
    addText(s, "MeV → GeV", { left: 44, top: 444, width: 330, height: 56 }, {
      fontSize: 42, bold: true, color: C.blue,
    });
    addText(s, "the LDMX target range", { left: 44, top: 505, width: 360, height: 36 }, {
      fontSize: 20, color: C.gray,
    });
    await addImage(s, path.join(THESIS, "config/fig/dm_range.jpeg"), { left: 638, top: 154, width: 570, height: 370 }, {
      fit: "contain", alt: "Representative dark-matter candidate mass ranges with the light-dark-matter region highlighted",
    });
    addText(s, "Benchmark motivation—not a model-independent claim", { left: 638, top: 552, width: 570, height: 42 }, {
      fontSize: 18, color: C.gray, alignment: "center",
    });
    addNotes(s, "0:20–1:25",
      "The broad motivation is that dark matter is strongly supported by gravitational evidence, but no particle identity or non-gravitational interaction has been established. In the standard cosmological accounting, most matter is dark rather than baryonic. The traditional WIMP programme is powerful at higher masses, but nuclear-recoil kinematics become increasingly difficult below the GeV scale. LDMX therefore targets light dark matter, roughly in the MeV-to-GeV regime, using an accelerator. The dark-photon thermal-relic picture is a useful benchmark because it connects a target interaction strength to the abundance, but it is important not to overstate the scope: this thesis does not test the dark-photon model itself. It studies one reconstruction problem that affects the experiment’s ability to use high-rate data.",
      [
        "Thesis sections/2theory.tex, ‘Dark Matter Particle Physics’ and ‘Thermal Relics and the Sub-GeV Frontier’.",
        "Figure asset config/fig/dm_range.jpeg; thesis provenance: gajdan2025-hcal-thesis, inspired by battaglieri2017-cosmic-visions.",
        "Non-trivial claims: bibliography keys cirelli2026-darkmatter and battaglieri2017-cosmic-visions.",
      ]);
  }

  // 3 — LDMX detector
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "LDMX asks whether the 8 GeV electron left invisibly", 3,
      "Thesis §2.2 · Åkesson et al. (2018) · LDMX Collaboration (2025)");
    await addImage(s, path.join(THESIS, "config/fig/beam_electron_schematic.jpg"), { left: 42, top: 126, width: 610, height: 430 }, {
      fit: "contain", alt: "Conceptual LDMX missing-momentum signature",
    });
    await addImage(s, path.join(THESIS, "config/fig/ldmx_detector_cutaway.jpg"), { left: 690, top: 126, width: 548, height: 360 }, {
      fit: "contain", alt: "Cutaway view of the LDMX detector",
    });
    addText(s, "e⁻Z → e⁻ZA′,  A′ → χχ̄", { left: 706, top: 506, width: 500, height: 52 }, {
      fontSize: 30, bold: true, color: C.blue, alignment: "center",
    });
    addText(s, "Measure the incoming and recoil electron; veto visible activity; infer what is missing.", { left: 694, top: 566, width: 530, height: 62 }, {
      fontSize: 21, alignment: "center", color: C.gray,
    });
    addNotes(s, "1:25–2:45",
      "LDMX is a fixed-target missing-momentum experiment. An 8 GeV electron is measured before it reaches a thin tungsten target. In the invisible dark-photon benchmark, the electron radiates an A-prime, which decays to dark matter. The recoil electron then carries less energy and a transverse kick, while no visible particle accounts for the missing momentum. The tagging and recoil trackers measure the electron trajectory. The electromagnetic and hadronic calorimeters test whether visible energy escaped the tracker picture. This is not a resonance search: the signature is an imbalance between the known incoming state and the reconstructed visible final state. The calorimeter is therefore not only a veto. Its detailed pattern must remain interpretable when more than one ordinary beam electron enters a readout window—which is where the thesis problem begins.",
      [
        "Thesis sections/2theory.tex, ‘Search Strategy and Physics Goal’ and ‘Detector Layout’.",
        "config/fig/beam_electron_schematic.jpg, from thesis citation akesson2018-ldmx.",
        "config/fig/ldmx_detector_cutaway.jpg, from thesis citation ldmx2025-overview.",
      ]);
  }

  // 4 — Pile-up and event displays
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Pile-up converts exposure into overlapping showers", 4,
      "Thesis §§2.2.6, 4.2 · event display uses simulation truth");
    addText(s, "26.4%", { left: 44, top: 154, width: 310, height: 90 }, {
      fontSize: 66, bold: true, color: C.blue,
    });
    addText(s, "of beam buckets contain at least two electrons when μ = 1", { left: 46, top: 252, width: 330, height: 90 }, {
      fontSize: 24,
    });
    addText(s, "P(N=m) = μᵐ exp(−μ) / m!", { left: 46, top: 382, width: 330, height: 44 }, {
      fontSize: 25, color: C.gray,
    });
    addRule(s, 46, 450, 310, C.rule, 1);
    addText(s, "More electrons per bucket increase usable exposure—but several showers can occupy the same cells.", { left: 46, top: 474, width: 330, height: 120 }, {
      fontSize: 22, color: C.ink,
    });
    await addImage(s, path.join(THESIS, "config/fig/ecal_truth_event_displays.png"), { left: 416, top: 144, width: 816, height: 410 }, {
      fit: "contain", alt: "One-, two-, and three-electron ECal events colored by truth origin",
    });
    addPanel(s, { left: 710, top: 556, width: 380, height: 64 }, C.paleBlue);
    addText(s, "Truth colours are unavailable to the model", { left: 730, top: 575, width: 340, height: 28 }, {
      fontSize: 19, bold: true, color: C.blue, alignment: "center",
    });
    addNotes(s, "2:45–4:05",
      "At a mean occupancy of one electron per bucket, multi-electron buckets are not rare: 26.4 percent contain at least two electrons. Lowering the occupancy reduces pile-up, but it also reduces electrons on target per unit time. The potential gain is therefore to reconstruct, rather than automatically discard, multi-electron readouts. The right-hand figure shows simulated one-, two-, and three-electron ECal events. Every marker is a selected reconstructed hit, and the colours indicate the truth electron with the largest deposited-energy contribution. Those colours are available only in simulation. In real inference the network sees positions, energies and trigger-pad context. The electromagnetic cascades overlap over many layers, and multiple electrons may contribute energy to the same cell. That makes this an information-losing inverse problem, not simply a matter of drawing a geometric boundary between clean clusters.",
      [
        "Thesis sections/2theory.tex, ‘Pile-Up and Reconstruction’; Poisson calculation at μ=1.",
        "Thesis sections/4Methodology.tex, ‘Multi-Electron Event Simulation’.",
        "Figure asset config/fig/ecal_truth_event_displays.png, thesis-authored from simulated truth.",
      ]);
  }

  // 5 — Inputs vs truth
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "The network sees detector readout—not simulation truth", 5,
      "Thesis §4.3 · reconstructed inputs; truth only defines targets and metrics");
    await addImage(s, path.join(THESIS, "config/fig/readout_vs_truth.jpg"), { left: 74, top: 122, width: 1130, height: 430 }, {
      fit: "contain", alt: "Boundary between reconstructed detector inputs and simulation-truth supervision",
    });
    addPanel(s, { left: 84, top: 568, width: 1112, height: 72 }, C.paleBlue);
    addText(s, "Input set: ECal (x, y, z, E) + TPad (centroid, photoelectrons)   →   Targets: dominant origin, contributor set, energy fractions", { left: 110, top: 588, width: 1060, height: 34 }, {
      fontSize: 20, bold: true, color: C.ink, alignment: "center",
    });
    addNotes(s, "4:05–5:20",
      "The supervised boundary is important. The model receives only reconstructed detector quantities: for each ECal hit, its cell position and reconstructed energy; for each trigger-pad track, a centroid and photoelectron count. Detector-type flags place both object types in one variable-sized eight-column set. Reconstructed and simulated hits are matched by cell identifier during conversion. Simulation truth then supplies the deposited energy from each overlay origin, which defines the hard dominant-origin label and, for TRACE, the exact contributor subset and continuous fractions. Truth never enters the feature tensor. Trigger-pad tokens have no per-electron target, but they can provide event context; an ECal mask removes their outputs from the loss. The rows remain unordered. This clean separation between detector inputs and truth-derived supervision is also what makes the data-conversion framework reusable for future models.",
      [
        "Thesis sections/4Methodology.tex, ‘Selected Detector Data and Simulation Truth’, ‘Target Definition’, and ‘Combined Event Tensor’.",
        "Figure asset config/fig/readout_vs_truth.jpg, thesis-authored.",
        "Tensor index correction used in notes: continuous columns are 3–8; the prose statement 3–6 is an apparent typo.",
      ]);
  }

  // 6 — Data pipeline
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Ten million overlays per multiplicity anchor the study", 6,
      "Thesis §§4.1–4.4 · ldmx-sw v4.7.3 · 8 GeV beam");
    await addImage(s, path.join(THESIS, "config/fig/data_pipeline.jpg"), { left: 54, top: 126, width: 560, height: 520 }, {
      fit: "contain", alt: "High-level LDMX simulation, tensorization, and training pipeline",
    });
    addMetric(s, 686, 145, 230, "10⁷", "two-electron events produced", C.blue);
    addMetric(s, 960, 145, 230, "10⁷", "three-electron events produced", C.orange);
    addRule(s, 686, 286, 504, C.rule, 1);
    addMetric(s, 686, 320, 230, "10⁶", "events in each final baseline campaign", C.ink);
    addMetric(s, 960, 320, 230, "80/10/10", "train / validation / held-out test", C.ink);
    addRule(s, 686, 464, 504, C.rule, 1);
    addText(s, "Independent 1e histories are overlaid by detector channel before digitisation and reconstruction. No dark-sector signal is injected.", { left: 686, top: 500, width: 504, height: 112 }, {
      fontSize: 21, color: C.gray,
    });
    addNotes(s, "5:20–6:35",
      "The samples are built from inclusive, non-signal 8 GeV single-electron simulations. Two-electron events contain one main and one overlaid electron; three-electron events contain one main and two overlays. The particle histories are independent, which is reasonable because direct electron–electron interactions are negligible, but their detector deposits are combined by channel before digitisation and reconstruction. Shared cells and reconstruction effects are therefore treated jointly. Ten million events of each multiplicity were produced, using disjoint source inputs so an electron was not reused. Each reported fixed-multiplicity model uses one million events, split 80, 10 and 10 percent, with the test set held out until the final comparison. This scale supports detailed failure analysis, but it is not a demonstration of the experiment-level background rejection requirement and contains no injected dark-matter signal.",
      [
        "Thesis sections/4Methodology.tex, ‘Simulation and Data Pipeline Overview’, ‘Single Electron Event Simulations’, and ‘Multi-Electron Event Simulation’.",
        "Figure asset config/fig/data_pipeline.jpg, thesis-authored.",
        "Dataset versions and sizes from Tables tab:version_summary and tab:dataset_summary.",
      ]);
  }

  // 7 — Baselines
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Two set encoders test local and global interaction", 7,
      "Thesis §§2.3, 4.5 · Qasim et al. (2019) · Vaswani et al. (2017)");
    addPanel(s, { left: 42, top: 132, width: 570, height: 420 }, C.paleGreen, C.green);
    addText(s, "GravNet", { left: 72, top: 160, width: 250, height: 48 }, {
      fontSize: 34, bold: true, color: C.green,
    });
    addText(s, "Sparse learned neighbourhoods", { left: 72, top: 216, width: 470, height: 38 }, {
      fontSize: 23, bold: true,
    });
    addText(s, "• 8 → 128 input projection\n• 4 residual GravNet blocks\n• learned space dₛ = 4, k = 16\n• local propagation after neighbour search\n• 0.268 M parameters", { left: 72, top: 274, width: 470, height: 220 }, {
      fontSize: 22,
    });
    addPanel(s, { left: 656, top: 132, width: 582, height: 420 }, C.paleOrange, C.orange);
    addText(s, "Transformer", { left: 688, top: 160, width: 300, height: 48 }, {
      fontSize: 34, bold: true, color: C.orange,
    });
    addText(s, "Global self-attention", { left: 688, top: 216, width: 470, height: 38 }, {
      fontSize: 23, bold: true,
    });
    addText(s, "• 8 → 128 → 128 projection\n• 3 pre-LN encoder blocks\n• 4 heads, FFN 128 → 256 → 128\n• every valid token can attend to every other\n• 0.416 M parameters", { left: 688, top: 274, width: 490, height: 220 }, {
      fontSize: 22,
    });
    addText(s, "Same task: one class per ECal hit · separate 2e and 3e models · TPad tokens provide context only", { left: 92, top: 590, width: 1096, height: 42 }, {
      fontSize: 21, bold: true, alignment: "center", color: C.blue,
    });
    addNotes(s, "6:35–7:55",
      "The controlled baseline comparison uses the same eight input features and the same hit-assignment task. GravNet embeds each detector object and constructs sparse neighbourhoods in a learned coordinate space. Four residual blocks propagate information among sixteen learned neighbours. The Transformer instead applies three pre-layer-normalised encoder blocks with full self-attention, so every valid object can interact with every other object in the event. There is no sequence positional encoding: storage order has no physical meaning, and x, y and z are already features. Both networks are permutation equivariant and emit one class prediction per ECal hit. The fixed-count formulation trains separate two- and three-electron classifiers. The Transformer has more parameters, but this is not a capacity-minimisation study or a universal architecture benchmark. It asks whether sparse learned locality or global attention offers a clear advantage for this simulated reconstruction task.",
      [
        "Thesis sections/2theory.tex, ‘Graph Neural Networks and GravNet’, ‘Transformer Encoders and Self-Attention’, and ‘GravNet–Transformer Analogy’.",
        "Thesis sections/4Methodology.tex, ‘GravNet Baseline’ and ‘Transformer Baseline’.",
        "Architecture references: qasim2019-gravnet and vaswani2017attention.",
      ]);
  }

  // 8 — TRACE architecture
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "TRACE predicts a coherent 2e/3e event description", 8,
      "Thesis §4.5.3 · MLPF-inspired multi-task reconstruction");
    addText(s, "Shared Transformer · 1.16 M parameters · width 192 · 3 layers · 8 heads", { left: 72, top: 118, width: 1136, height: 34 }, {
      fontSize: 20, color: C.purple, bold: true, alignment: "center",
    });
    await addImage(s, path.join(BUILD, "trace_architecture.png"), { left: 70, top: 164, width: 1140, height: 440 }, {
      fit: "contain", crop: { left: 0, top: 0, right: 0, bottom: 0.17 }, alt: "TRACE multi-task contributor reconstruction architecture",
    });
    addText(s, "Contributor subset + energy fractions per hit   |   valid electron slots per event   →   count, dominant origin, pure/mixed", { left: 92, top: 618, width: 1096, height: 34 }, {
      fontSize: 19, bold: true, color: C.blue, alignment: "center",
    });
    addNotes(s, "7:55–9:15",
      "TRACE stands for Transformer for Reconstruction and Attribution of Calorimeter Energy. It removes the assumption that the electron count is known. One shared Transformer is trained on a balanced mixture of two- and three-electron events. At hit level, one head predicts one of the eight possible subsets of three electron slots, including the empty background set, and another predicts four energy fractions: background plus three slots. In parallel, a mask-aware event summary predicts which electron slots are valid. Post-processing enforces a legal slot prefix and gates the fractions, so the electron count, dominant origin and pure-versus-mixed label are derived coherently rather than learned by unrelated heads. The three supervised losses—contributor set, fractions and slot validity—have equal weight. This tests whether richer physical structure can be added without sacrificing the simpler dominant-origin assignment.",
      [
        "Thesis sections/4Methodology.tex, ‘TRACE: Multi-Task Contributor Reconstruction’ and ‘Training Objectives’.",
        "Raster asset .tmp_thesis_defense/trace_architecture.png, rendered from thesis TikZ source config/fig/model_architecture_contributor_slot.tex.",
        "Conceptual reference in thesis: MLPF, bibliography keys pata2021-mlpf and pata2026-mlpf.",
      ]);
  }

  // 9 — Evaluation and permutation
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Evaluation must ignore arbitrary shower labels", 9,
      "Thesis §4.7.1 · 3,000-event validation illustration");
    await addImage(s, path.join(THESIS, "config/fig/results/shower_label_swap_recovery_3e.png"), { left: 42, top: 126, width: 680, height: 490 }, {
      fit: "contain", alt: "Canonical versus permutation-aligned event accuracy",
    });
    addText(s, "aligned A = maxπ A(π)", { left: 748, top: 184, width: 456, height: 58 }, {
      fontSize: 36, bold: true, color: C.blue, alignment: "center",
    });
    addText(s, "2! mappings for 2e\n3! mappings for 3e", { left: 796, top: 274, width: 360, height: 90 }, {
      fontSize: 26, alignment: "center",
    });
    addRule(s, 792, 388, 368, C.rule, 1);
    addText(s, "One global permutation must apply to every hit. It can repair a complete label swap—but never a local mistake.", { left: 790, top: 420, width: 372, height: 120 }, {
      fontSize: 22, color: C.gray, alignment: "center",
    });
    addText(s, "9.9% of the illustrated 3e validation scores change after alignment", { left: 774, top: 570, width: 404, height: 62 }, {
      fontSize: 19, bold: true, color: C.ink, alignment: "center",
    });
    addNotes(s, "9:15–10:25",
      "Electron slot numbers are a bookkeeping convention, not a physical observable. A model can produce the correct partition of hits while exchanging two complete shower labels. Ordinary class accuracy would count that as wrong. For evaluation, I therefore test every global permutation of the predicted labels—two mappings for two electrons and six for three—and retain the one with the highest event accuracy. The same mapping applies to every hit, so alignment cannot hide individual errors or merge incorrectly separated showers. In this validation illustration, 9.9 percent of three-electron event scores change and the mean increases from 0.722 to 0.737. I report both pooled hit accuracy and event-wise distributions. I also use an energy-weighted accuracy, which weights correct assignment by the raw reconstructed hit energy; it is not a calorimeter energy-resolution metric.",
      [
        "Thesis sections/4Methodology.tex, ‘Hit-Assignment Accuracy’.",
        "Figure asset config/fig/results/shower_label_swap_recovery_3e.png, thesis-authored validation diagnostic.",
        "Formula and 9.9% / 0.722→0.737 values from thesis Figure fig:results_label_swap_recovery.",
      ]);
  }

  // 10 — Baseline performance
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Both baselines recover most of the shower energy", 10,
      "Thesis §5.2 · 100,000 held-out events per multiplicity");
    await addImage(s, path.join(THESIS, "config/fig/results/event_accuracy_distribution.png"), { left: 42, top: 122, width: 744, height: 510 }, {
      fit: "contain", alt: "Distribution of permutation-aligned event accuracy for two- and three-electron events",
    });
    addText(s, "Transformer", { left: 846, top: 132, width: 330, height: 34 }, {
      fontSize: 21, bold: true, color: C.gray, alignment: "center",
    });
    addMetric(s, 828, 182, 180, "84.20%", "2e pooled hit", C.blue);
    addMetric(s, 1030, 182, 180, "89.76%", "2e energy-weighted", C.blue);
    addRule(s, 828, 318, 382, C.rule, 1);
    addMetric(s, 828, 350, 180, "74.84%", "3e pooled hit", C.orange);
    addMetric(s, 1030, 350, 180, "83.18%", "3e energy-weighted", C.orange);
    addRule(s, 828, 488, 382, C.rule, 1);
    addText(s, "GravNet is within 1.05 percentage points on every paired event metric.", { left: 842, top: 520, width: 356, height: 78 }, {
      fontSize: 20, bold: true, alignment: "center",
    });
    addText(s, "Energy weighting lifts accuracy by +5.56 pp (2e) and +8.34 pp (3e): errors carry less energy on average.", { left: 830, top: 602, width: 380, height: 54 }, {
      fontSize: 17, color: C.gray, alignment: "center",
    });
    addNotes(s, "10:25–11:55",
      "These are the headline held-out results. The Transformer reaches 84.20 percent pooled hit accuracy for two-electron events and 74.84 percent for three-electron events. Energy-weighted accuracy is higher—89.76 and 83.18 percent—so the incorrectly assigned hits carry less reconstructed energy on average. GravNet is close. The paired Transformer-minus-GravNet differences range from about 0.42 to 1.05 percentage points and their event-bootstrap intervals exclude zero for these fixed checkpoints. That is a small observed advantage, not evidence that Transformers are universally superior: there is one selected training instance per configuration and the intervals do not include retraining or seed variation. The distributions are broad, which is equally important. Multiplicity shifts the average, but both samples contain easy events and strongly ambiguous tails.",
      [
        "Thesis sections/5Results.tex, ‘Baseline Architecture and Performance Comparison’ and ‘ECal Hit Assignment Performance’.",
        "Figure asset config/fig/results/shower_label_swap_recovery_3e.png, thesis-authored.",
        "Exact values from config/tables/results_baseline_performance.tex and results_baseline_paired.tex.",
      ]);
  }

  // 11 — Geometry and overlap
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Three-electron events are more crowded—not wider", 11,
      "Thesis §5.1 · truth-assisted geometry · effective Rₘ = 25 mm");
    await addImage(s, path.join(BUILD, "shower_widths_bottom.png"), { left: 42, top: 126, width: 1196, height: 430 }, {
      fit: "contain",
      alt: "Width-normalized separation and radial shower width for two- and three-electron events",
    });
    addMetric(s, 130, 562, 260, "≈ 0.96 Rₘ", "median radial shower width in both samples", C.blue);
    addMetric(s, 820, 562, 260, "0.724 → 0.353", "median closest-pair separation / combined width", C.orange);
    addText(s, "A 3e event also has three pairs, so the minimum is statistically biased downward; the shift is still physically consistent with stronger overlap.", { left: 430, top: 583, width: 410, height: 68 }, {
      fontSize: 17, color: C.gray, alignment: "center",
    });
    addNotes(s, "11:55–13:10",
      "To understand the multiplicity gap, I use simulation truth to project each shower into the transverse plane. For each pair, the centroid distance is divided by the quadrature sum of the shower widths; the event takes the closest pair. Individual shower widths are nearly unchanged between the two samples: the median radial width is about 0.96 Molière radii in both. What changes is crowding. The median closest-pair separation falls from 0.724 combined widths for two electrons to 0.353 for three. That supports overlap, rather than a change in the intrinsic shower size, as the main reason the three-electron task is harder. One nuance is combinatorial: three electrons create three possible pairs, so taking the minimum mechanically shifts the distribution downward. The metric also uses truth energy fractions, so it diagnoses difficulty but is not available on detector data.",
      [
        "Thesis sections/5Results.tex, ‘Truth-Level Transverse Shower Geometry’ and ‘Implications of the Event Characteristics’.",
        "Figure asset config/fig/results/shower_widths_and_normalized_separation.png, thesis-authored; slide crops its radial-width and width-normalized-separation panels.",
        "Definitions from sections/4Methodology.tex, ‘Projected Shower Geometry’.",
      ]);
  }

  // 12 — confidence
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Confidence ranks difficult events—but is not calibrated", 12,
      "Thesis §5.2.5 · maximum softmax probability and normalized entropy");
    await addImage(s, path.join(THESIS, "config/fig/results/accuracy_coverage.png"), { left: 42, top: 122, width: 700, height: 520 }, {
      fit: "contain", alt: "Accuracy-coverage trade-off from confidence selection",
    });
    addText(s, "Retain the most confident predictions", { left: 792, top: 164, width: 390, height: 46 }, {
      fontSize: 27, bold: true,
    });
    addText(s, "Accuracy increases as low-confidence hits or events are removed.", { left: 794, top: 238, width: 390, height: 78 }, {
      fontSize: 23,
    });
    addRule(s, 794, 342, 380, C.rule, 1);
    addText(s, "Interpretation", { left: 794, top: 372, width: 230, height: 34 }, {
      fontSize: 21, bold: true, color: C.blue,
    });
    addText(s, "• useful for ranking and selective reconstruction\n• strong correlation with event accuracy\n• not yet a calibrated probability\n• selection changes acceptance and must be propagated", { left: 794, top: 420, width: 400, height: 180 }, {
      fontSize: 21, color: C.gray,
    });
    addNotes(s, "13:10–14:15",
      "The network’s maximum softmax probability and normalized entropy both track difficulty. This plot orders predictions by confidence and shows the usual accuracy–coverage trade-off: retaining only the most confident fraction raises the accuracy, while adding lower-confidence predictions reduces it. That makes confidence potentially useful for selective reconstruction, quality flags or downstream weighting. But I deliberately call it a ranking signal, not a calibrated probability. No reliability diagram, temperature scaling or detector-level calibration study was performed. Event selection based on confidence would also change acceptance and could bias a physics analysis, so it must be propagated into efficiency and uncertainty studies. The result is therefore diagnostic: the model has useful internal information about its errors, but the conversion from score to trustworthy probability remains future work.",
      [
        "Thesis sections/5Results.tex, ‘Confidence, Entropy and Selective Performance’.",
        "Figure asset config/fig/results/accuracy_coverage.png, thesis-authored.",
        "Confidence terminology corrected in notes: maximum softmax probability, not a raw logit.",
      ]);
  }

  // 13 — TRACE count and assignment
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "TRACE adds structure with almost no assignment penalty", 13,
      "Thesis §5.3 · balanced mixed-multiplicity test set");
    await addImage(s, path.join(THESIS, "config/fig/results/contributor_count_neural_1m.png"), { left: 60, top: 124, width: 590, height: 510 }, {
      fit: "contain", alt: "TRACE electron-count confusion matrix",
    });
    addMetric(s, 716, 142, 450, "99.983%", "2e-versus-3e count accuracy · 17 errors / 100,000 events", C.purple);
    addRule(s, 716, 278, 450, C.rule, 1);
    addMetric(s, 716, 310, 210, "84.13%", "TRACE 2e pooled assignment", C.blue);
    addMetric(s, 956, 310, 210, "74.39%", "TRACE 3e pooled assignment", C.orange);
    addText(s, "Fixed-count Transformer: 84.20% and 74.84%", { left: 716, top: 448, width: 450, height: 42 }, {
      fontSize: 19, color: C.gray, alignment: "center",
    });
    addRule(s, 716, 510, 450, C.rule, 1);
    addText(s, "The count result is a restricted binary distinction in simulation—not general electron counting.", { left: 726, top: 548, width: 430, height: 76 }, {
      fontSize: 21, bold: true, alignment: "center",
    });
    addNotes(s, "14:15–15:30",
      "TRACE uses one model for both multiplicities. On its balanced 100,000-event test set, it derives the correct electron count in 99.983 percent of events—only seventeen errors. That number needs a strong qualification: the task is the binary distinction between two and three electrons under the same simulated distribution and a three-slot valid-prefix design. It is not unrestricted counting. The more useful comparison is whether the richer model preserves hit assignment. After removing truth-noise hits and applying the same event-wise label alignment, TRACE reaches 84.13 percent for two-electron events and 74.39 percent for three. The fixed-count Transformer reaches 84.20 and 74.84. The penalties are therefore only 0.07 and 0.45 percentage points while TRACE adds contributor subsets, fractions and event-level slot validity. The shared multi-task representation is feasible; the remaining question is which of those richer targets are actually learned well.",
      [
        "Thesis sections/5Results.tex, ‘TRACE Multi-Task Reconstruction’ and ‘Comparison with Fixed-Multiplicity Hit Assignment’.",
        "Figure asset config/fig/results/contributor_count_neural_1m.png, thesis-authored.",
        "Exact values from config/tables/results_contributor_performance.tex and results_contributor_baseline_comparison.tex.",
      ]);
  }

  // 14 — Mixed hits
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Mixed deposits remain the central reconstruction challenge", 14,
      "Thesis §5.3.1 · final TRACE test set: 30.08 million ECal hits");
    await addImage(s, path.join(THESIS, "config/fig/results/contributor_hit_task_confusions.png"), { left: 66, top: 124, width: 1148, height: 402 }, {
      fit: "contain", alt: "TRACE dominant-origin and pure-versus-mixed hit confusion matrices",
    });
    addMetric(s, 104, 534, 250, "72.41%", "exact contributor-set accuracy", C.purple);
    addMetric(s, 514, 534, 250, "48.08% / 64.41%", "mixed-hit precision / recall", C.orange);
    addMetric(s, 924, 534, 250, "0.115", "fraction MAE after invalid-slot masking", C.blue);
    addNotes(s, "15:30–16:45",
      "Counting is nearly saturated, but sharing one hit among several showers is not. Exact contributor-set accuracy is 72.41 percent. Because pure hits are much more common, that aggregate must be read together with the mixed-hit metrics: precision is 48.08 percent, recall is 64.41 percent and F1 is 0.551. The model finds a majority of true mixed hits, but almost half of its mixed predictions are false positives. For the continuous fractions, the mean absolute error is 0.141 before post-processing and 0.115 after invalid electron slots are masked. That improvement shows useful coupling between event- and hit-level tasks. The remaining ambiguity is physically plausible: if two showers deposit energy in the same readout cell, the measured aggregate may not uniquely encode the separate contributions. This study does not quantify an irreducible lower bound, but mixed cells are clearly the central unsolved target.",
      [
        "Thesis sections/5Results.tex, ‘Multi-Task Reconstruction Performance’ and ‘Overall Interpretation and Limitations’.",
        "Figure asset config/fig/results/contributor_hit_task_confusions.png, thesis-authored.",
        "Exact metrics from config/tables/results_contributor_performance.tex.",
      ]);
  }

  // 15 — TPad ablation
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "TPad carries a small, confounded assignment signal", 15,
      "Thesis §5.2.6 · paired inference-time ablation · 2,000 event bootstraps");
    addText(s, "ECal+TPad minus TPad removed", { left: 74, top: 148, width: 560, height: 30 }, {
      fontSize: 17, color: C.gray,
    });
    const ablationRows = [
      { label: "Energy-weighted", value: 0.243, y: 206 },
      { label: "Mean event", value: 0.125, y: 340 },
      { label: "Pooled hit", value: 0.119, y: 474 },
    ];
    const ablationMax = 0.28;
    const barLeft = 200;
    const barWidth = 450;
    for (const row of ablationRows) {
      addText(s, row.label, { left: 42, top: row.y + 18, width: 146, height: 30 }, {
        fontSize: 15, bold: true, alignment: "right",
      });
      addRect(s, { left: barLeft, top: row.y, width: barWidth, height: 64 }, "#E7EEF8", {
        geometry: "roundRect", borderRadius: 5,
      });
      const filled = barWidth * row.value / ablationMax;
      addRect(s, { left: barLeft, top: row.y, width: filled, height: 64 }, C.blue, {
        geometry: "roundRect", borderRadius: 5,
      });
      addText(s, row.value.toFixed(3), { left: barLeft + filled + 10, top: row.y + 17, width: 70, height: 30 }, {
        fontSize: 17, bold: true,
      });
    }
    addText(s, "paired difference in hit-assignment accuracy (percentage points) · common 0–0.28 scale", { left: 116, top: 570, width: 540, height: 42 }, {
      fontSize: 15, color: C.gray, alignment: "center",
    });
    addText(s, "All three paired intervals exclude zero", { left: 780, top: 170, width: 390, height: 48 }, {
      fontSize: 27, bold: true, color: C.blue,
    });
    addText(s, "The effect is statistically resolved but practically small when the true count is already supplied.", { left: 780, top: 250, width: 390, height: 100 }, {
      fontSize: 23,
    });
    addRule(s, 780, 384, 390, C.rule, 1);
    addText(s, "Why the claim is limited", { left: 780, top: 414, width: 300, height: 36 }, {
      fontSize: 22, bold: true, color: C.orange,
    });
    addText(s, "Removing an entire modality only at inference changes the input distribution. A causal detector-value test requires separately trained ECal-only and ECal+TPad models across multiple seeds.", { left: 780, top: 466, width: 400, height: 144 }, {
      fontSize: 21, color: C.gray,
    });
    addNotes(s, "16:45–17:50",
      "Trigger-pad tracks provide upstream position and multiplicity context. In the final fixed-count three-electron Transformer, removing all TPad tokens at inference reduces pooled accuracy by 0.119 percentage points, mean event accuracy by 0.125 and energy-weighted accuracy by 0.243. Paired bootstrap intervals exclude zero, so the trained network is sensitive to the modality. The practical effect is nevertheless small when the correct electron count is already provided. More importantly, this is not a clean causal ablation: the network was trained with TPad tokens, and deleting the whole modality only at inference creates a distribution shift. The correct follow-up is to train matched ECal-only and ECal-plus-TPad models on identical splits, repeat across seeds, and then compare. I show only the paired differences here because the thesis TPad table and headline baseline table contain inconsistent absolute three-electron energy-weighted values.",
      [
        "Thesis sections/5Results.tex, ‘Trigger-Pad Ablation’.",
        "Exact paired differences and intervals from config/tables/results_baseline_tpad_ablation.tex.",
        "Consistency decision: absolute intact energy-weighted value omitted because 83.274% in the ablation table conflicts with 83.18% in the baseline table.",
      ]);
  }

  // 16 — Conclusions
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Set-based learning is feasible; detector ambiguity is the limit", 16,
      "Thesis §§5.4, 7 · conclusions and outlook");
    addText(s, "01", { left: 52, top: 154, width: 90, height: 64 }, { fontSize: 46, bold: true, color: C.blue });
    addText(s, "Useful per-electron structure is recoverable", { left: 160, top: 154, width: 520, height: 48 }, { fontSize: 28, bold: true });
    addText(s, "Transformer and GravNet reconstruct most hits—and an even larger share of the energy—in simulated 2e/3e pile-up.", { left: 160, top: 214, width: 960, height: 58 }, { fontSize: 21, color: C.gray });
    addRule(s, 52, 296, 1140, C.rule, 1);
    addText(s, "02", { left: 52, top: 326, width: 90, height: 64 }, { fontSize: 46, bold: true, color: C.orange });
    addText(s, "Overlap matters more than model family", { left: 160, top: 326, width: 520, height: 48 }, { fontSize: 28, bold: true });
    addText(s, "Three-electron showers are closer, while widths are unchanged; the Transformer edge over GravNet stays around one point or less.", { left: 160, top: 386, width: 960, height: 58 }, { fontSize: 21, color: C.gray });
    addRule(s, 52, 468, 1140, C.rule, 1);
    addText(s, "03", { left: 52, top: 498, width: 90, height: 64 }, { fontSize: 46, bold: true, color: C.purple });
    addText(s, "Richer reconstruction is possible—but mixed cells remain hard", { left: 160, top: 498, width: 860, height: 48 }, { fontSize: 28, bold: true });
    addText(s, "TRACE nearly preserves assignment and counts 2e/3e events, yet exact contributors and energy sharing remain the open problem.", { left: 160, top: 558, width: 960, height: 58 }, { fontSize: 21, color: C.gray });
    addPanel(s, { left: 160, top: 630, width: 960, height: 38 }, C.paleBlue);
    addText(s, "Next: matched modality retraining · multiple seeds · broader multiplicities · detector/systematic and physics-level validation", { left: 180, top: 640, width: 920, height: 20 }, { fontSize: 16, bold: true, color: C.blue, alignment: "center" });
    addNotes(s, "17:50–19:30",
      "I draw three conclusions. First, set-based neural reconstruction is feasible for simulated LDMX pile-up. Both interaction mechanisms recover useful per-electron structure, particularly the energy-carrying hits. Second, the dominant trend is physical ambiguity rather than architecture choice. Three-electron events contain a much closer shower pair, while the shower widths remain essentially unchanged, and the observed Transformer advantage is small. Third, richer reconstruction is possible. TRACE nearly preserves dominant-origin assignment and very accurately distinguishes two from three electrons in its restricted domain, but contributor sets and mixed-cell fractions remain substantially harder. The next experiments should therefore be controlled rather than merely larger: matched ECal-only and multimodal retraining, multiple seeds, permutation-invariant training, broader multiplicities, trigger-cell and latency studies, detector systematic variations, and finally downstream physics metrics. This work establishes a reusable offline simulation platform and a credible starting point—not production reconstruction or a sensitivity result.",
      [
        "Thesis sections/5Results.tex, ‘Overall Interpretation and Limitations’.",
        "Thesis sections/7Conclusion.tex, ‘Conclusions’ and ‘Outlook’.",
        "Headline values and scope also cross-checked against sections/00abstract.tex.",
      ]);
  }

  // 17 — Closing
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addText(s, "QUESTIONS", { left: 42, top: 42, width: 300, height: 32 }, {
      fontSize: 18, bold: true, color: C.blue,
    });
    addText(s, "Set-based learning can recover useful shower structure from LDMX pile-up.", { left: 42, top: 178, width: 1050, height: 190 }, {
      fontSize: 56, bold: true, verticalAlignment: "bottom",
    });
    addRule(s, 42, 404, 760, C.blue, 5);
    addText(s, "84.20% 2e hit assignment   ·   74.84% 3e   ·   99.983% restricted 2e/3e counting", { left: 44, top: 450, width: 1040, height: 58 }, {
      fontSize: 24, color: C.gray,
    });
    addText(s, "Eliot Montesino Petrén · Lund University", { left: 44, top: 596, width: 620, height: 34 }, {
      fontSize: 19, color: C.gray,
    });
    addRect(s, { left: 1138, top: 0, width: 142, height: 720 }, C.paleBlue);
    addRect(s, { left: 1188, top: 0, width: 92, height: 720 }, C.blue);
    addNotes(s, "19:30–20:00",
      "The one-sentence answer to the thesis question is yes: set-based networks can recover useful per-electron shower structure from simulated LDMX pile-up. The main remaining limit is not simply choosing a larger network; it is the ambiguity created by strongly overlapping and genuinely shared detector deposits. Thank you. I am happy to take questions.",
      [
        "Thesis abstract and sections/7Conclusion.tex.",
        "Headline values from config/tables/results_baseline_performance.tex and results_contributor_performance.tex.",
      ]);
  }

  // 18 — Backup: data/training
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Backup — data, features and training configuration", 18,
      "Thesis Chapter 4 and Appendix");
    const values = [
      ["Item", "Configuration"],
      ["Simulation", "ldmx-sw v4.7.3 · ldmx-det-v15-8gev · 8 GeV e⁻"],
      ["Event input", "Variable-size 8-column heterogeneous ECal + TPad set"],
      ["Final baseline split", "800k train · 100k validation · 100k test, per multiplicity"],
      ["Optimiser", "AdamW · learning rate 3×10⁻⁴ · weight decay 10⁻⁴"],
      ["Regularisation", "Dropout 0.1 · global gradient L2 clip 1.0"],
      ["Stopping", "max 15 epochs · min 5 · patience 3 · Δloss ≥ 10⁻⁴"],
      ["TRACE objective", "contributor-set CE + fraction CE + slot-validity BCE; equal weights"],
    ];
    const t = s.tables.add({ rows: values.length, columns: 2, left: 68, top: 132, width: 1144, height: 470, values, columnTracks: [{ mode: "fixed", value: 255 }, { mode: "fr", value: 1 }] });
    t.styleOptions = { headerRow: true, bandedRows: false };
    t.borders.assign({ style: "solid", fill: C.rule, width: 1 });
    for (let c = 0; c < 2; c++) {
      t.getCell(0, c).fill = C.ink;
      t.getCell(0, c).text.style = { fontSize: 18, bold: true, color: C.white, typeface: FONT };
    }
    for (let r = 1; r < values.length; r++) {
      t.getCell(r, 0).fill = r % 2 ? C.light : C.white;
      t.getCell(r, 1).fill = r % 2 ? C.light : C.white;
      t.getCell(r, 0).text.style = { fontSize: 17, bold: true, color: C.ink, typeface: FONT };
      t.getCell(r, 1).text.style = { fontSize: 17, color: C.ink, typeface: FONT };
    }
    addText(s, "Baseline simplifications: true multiplicity supplied · truth-noise hits removed · hard dominant-origin target", { left: 88, top: 624, width: 1104, height: 34 }, {
      fontSize: 18, bold: true, color: C.orange, alignment: "center",
    });
    addNotes(s, "Backup",
      "Use this slide if asked about reproducibility or training. Emphasise that the held-out test set never selected a checkpoint, that all standardisation statistics came from the training split only, and that the baseline task deliberately simplifies the reconstruction problem by supplying multiplicity, removing truth-flagged noise and using a hard dominant-origin label. TRACE relaxes those assumptions only partially: it handles a balanced two-versus-three mixture and retains background, but does not cover arbitrary multiplicity or real detector noise.",
      [
        "Thesis sections/4Methodology.tex and sections/8Appendix.tex.",
        "Training values from ‘Optimizer and Regularization’, ‘Early Stopping’, and ‘Training Objectives’.",
      ]);
  }

  // 19 — Backup: full architecture
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Backup — full baseline architectures", 19,
      "Thesis Figure fig:baseline_architectures");
    await addImage(s, path.join(BUILD, "baseline_architecture.png"), { left: 54, top: 120, width: 1172, height: 520 }, {
      fit: "contain", crop: { left: 0, top: 0, right: 0, bottom: 0.14 }, alt: "Detailed GravNet and Transformer baseline architectures",
    });
    addNotes(s, "Backup",
      "The exact configurations are shown here. GravNet uses four residual GravNetConv blocks with learned-space dimension four, propagated width 128 and sixteen neighbours. The Transformer uses three pre-layer-normalised blocks, width 128, four heads and a 256-unit feed-forward layer. Exact parameter counts differ only in the final classifier width: approximately 268 thousand for GravNet and 416 thousand for the Transformer. Trigger-pad nodes or tokens provide context, while only ECal outputs are supervised.",
      [
        "Raster asset .tmp_thesis_defense/baseline_architecture.png, rendered from thesis TikZ source config/fig/model_architecture_baselines.tex.",
        "Thesis sections/4Methodology.tex, ‘Model Architectures’.",
      ]);
  }

  // 20 — Backup: exact table
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Backup — exact baseline performance", 20,
      "Thesis Tables tab:results_baseline_performance and tab:results_baseline_paired");
    const values = [
      ["Multiplicity", "Model", "Pooled hit", "Mean event", "Median event", "Energy-weighted"],
      ["2e", "Transformer", "84.20", "83.73", "85.90", "89.76"],
      ["2e", "GravNet", "83.79", "83.32", "85.77", "89.26"],
      ["3e", "Transformer", "74.84", "74.40", "75.82", "83.18"],
      ["3e", "GravNet", "74.01", "73.55", "75.14", "82.13"],
    ];
    const t = s.tables.add({ rows: 5, columns: 6, left: 48, top: 144, width: 1184, height: 300, values, columnTracks: [{ mode: "fixed", value: 150 }, { mode: "fixed", value: 190 }, { mode: "fr", value: 1 }, { mode: "fr", value: 1 }, { mode: "fr", value: 1 }, { mode: "fr", value: 1.2 }] });
    t.styleOptions = { headerRow: true, bandedRows: false };
    t.borders.assign({ style: "solid", fill: C.rule, width: 1 });
    for (let c = 0; c < 6; c++) {
      t.getCell(0, c).fill = C.ink;
      t.getCell(0, c).text.style = { fontSize: 16, bold: true, color: C.white, typeface: FONT };
    }
    for (let r = 1; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        t.getCell(r, c).fill = r % 2 ? C.paleBlue : C.white;
        t.getCell(r, c).text.style = { fontSize: 17, bold: c >= 2 && values[r][1] === "Transformer", color: C.ink, typeface: FONT };
      }
    }
    addText(s, "Paired Transformer − GravNet mean-event differences", { left: 100, top: 492, width: 520, height: 38 }, {
      fontSize: 23, bold: true,
    });
    addText(s, "2e hit +0.417 pp  [0.403, 0.431]\n2e energy +0.505 pp  [0.484, 0.525]", { left: 100, top: 548, width: 490, height: 82 }, {
      fontSize: 20, color: C.gray,
    });
    addText(s, "3e hit +0.850 pp  [0.834, 0.866]\n3e energy +1.048 pp  [1.023, 1.072]", { left: 682, top: 548, width: 490, height: 82 }, {
      fontSize: 20, color: C.gray,
    });
    addNotes(s, "Backup",
      "This table gives all headline baseline metrics. The paired intervals resample complete held-out events and quantify finite-test-sample uncertainty for fixed trained checkpoints. They do not include training-seed variation, alternative hyperparameters, simulation production uncertainty or detector systematics. The energy-weighted metric uses reconstructed hit energy as a weight for assignment correctness; it is not an energy-response measurement.",
      [
        "Thesis config/tables/results_baseline_performance.tex.",
        "Thesis config/tables/results_baseline_paired.tex.",
      ]);
  }

  // 21 — Backup: depth
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    addSlideTitle(s, "Backup — assignment accuracy falls in the ECal tail", 21,
      "Thesis §5.2.3 · layers 21–32 contain only ≈1.5% of hits");
    await addImage(s, path.join(THESIS, "config/fig/results/hit_accuracy_by_layer_2e.png"), { left: 42, top: 132, width: 580, height: 420 }, {
      fit: "contain", alt: "Two-electron hit accuracy by ECal layer",
    });
    await addImage(s, path.join(THESIS, "config/fig/results/hit_accuracy_by_layer_3e.png"), { left: 658, top: 132, width: 580, height: 420 }, {
      fit: "contain", alt: "Three-electron hit accuracy by ECal layer",
    });
    addMetric(s, 118, 560, 300, "84.4 → 70.5%", "2e: layers 1–20 → layers 21–32", C.blue);
    addMetric(s, 790, 560, 300, "75.1 → 56.5%", "3e: layers 1–20 → layers 21–32", C.orange);
    addNotes(s, "Backup",
      "Performance falls in the late calorimeter layers, where deposits are sparse and showers have broadened. Pooled accuracy drops from 84.4 to 70.5 percent for two electrons and from 75.1 to 56.5 percent for three. Only about 1.5 percent of retained hits occur in layers 21 through 32, so this behaviour is physically informative but contributes little to the global average. The three-electron middle canonical group is especially difficult, consistent with its position between the other showers under the y-ordering convention.",
      [
        "Thesis sections/5Results.tex, ‘Performance Across the Electron Shower Depth’.",
        "Figure assets config/fig/results/hit_accuracy_by_layer_2e.png and hit_accuracy_by_layer_3e.png, thesis-authored.",
      ]);
  }

  // Render, inspect, and export.
  const snapshot = await deck.inspect({ kind: "slide,textbox,shape,image,chart,table,notes", maxChars: 50000 });
  await fs.writeFile(path.join(BUILD, "deck-inspect.ndjson"), snapshot.ndjson);

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(path.join(RENDER, `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(RENDER, `${stem}.layout.json`), await layout.text());
  }
  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(path.join(BUILD, "deck-montage.webp"), new Uint8Array(await montage.arrayBuffer()));

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL);
  console.log(FINAL);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
