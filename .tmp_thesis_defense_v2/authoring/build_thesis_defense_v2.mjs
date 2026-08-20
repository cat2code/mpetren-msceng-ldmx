import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/eliotmontesinopetren/src/mpetren-msceng-ldmx";
const BUILD = path.join(ROOT, ".tmp_thesis_defense_v2");
const STARTER = path.join(BUILD, "template-starter.pptx");
const FINAL = path.join(
  ROOT,
  "thesis_report/presentation/Thesis_Defense_Eliot_Montesino_Petren_v2.pptx",
);
const THESIS = path.join(ROOT, "thesis_report/overleaf_project");
const PRESENTATION_ASSETS = path.join(ROOT, "thesis_report/presentation");
const PREVIEW = path.join(BUILD, "final-preview");
const LAYOUT = path.join(BUILD, "final-layout");

const C = {
  ink: "#111111",
  gray: "#5F6672",
  rule: "#B8BCC4",
  blue: "#3D8DFF",
  paleBlue: "#DCEEFF",
  orange: "#D97706",
  paleOrange: "#FDE9D5",
  green: "#2F855A",
  paleGreen: "#E1F1E6",
  purple: "#7657B5",
  palePurple: "#EEE7F8",
  white: "#FFFFFF",
};
const FONT = "Helvetica Neue";

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  throw new Error(`Unsupported image type: ${file}`);
}

async function bytes(file) {
  return new Uint8Array(await fs.readFile(file));
}

function nthShape(slide, index) {
  const value = slide.shapes.items[index];
  if (!value) throw new Error(`Could not resolve shape ${index} on slide`);
  return value;
}

function nthImage(slide, index) {
  const value = slide.images.items[index];
  if (!value) throw new Error(`Could not resolve image ${index} on slide`);
  return value;
}

function setText(target, text, options = {}) {
  target.text = text;
  target.text.style = {
    fontSize: options.fontSize ?? 22,
    typeface: options.typeface ?? FONT,
    color: options.color ?? C.ink,
    bold: options.bold ?? false,
    italic: options.italic ?? false,
    alignment: options.alignment ?? "left",
    verticalAlignment: options.verticalAlignment ?? "top",
    autoFit: options.autoFit ?? "shrinkText",
    insets: options.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  if (options.position) target.position = options.position;
}

async function replaceImage(target, file, position, options = {}) {
  target.replace({
    blob: await bytes(file),
    contentType: mimeFor(file),
    alt: options.alt ?? path.basename(file),
    fit: options.fit ?? "contain",
  });
  target.frame = position;
  target.fit = options.fit ?? "contain";
  target.crop = options.crop ?? { left: 0, top: 0, right: 0, bottom: 0 };
  target.lockAspectRatio = false;
}

async function addImage(slide, file, position, options = {}) {
  return slide.images.add({
    blob: await bytes(file),
    contentType: mimeFor(file),
    alt: options.alt ?? path.basename(file),
    fit: options.fit ?? "contain",
    position,
  });
}

function notesText(timing, script, sources) {
  return `[Timing: ${timing}]\n\n${script}\n\n[Sources]\n${sources
    .map((source) => `- ${source}`)
    .join("\n")}`;
}

function setNotes(slide, text) {
  const visible = slide.speakerNotes.isVisible();
  slide.speakerNotes.textFrame.setText(text);
  slide.speakerNotes.setVisible(visible || true);
}

function replaceTiming(slide, timing) {
  const current = slide.speakerNotes.text;
  if (!current || !current.includes("[Sources]")) {
    throw new Error(`Slide has missing source block while setting ${timing}`);
  }
  const next = current.replace(/^\[Timing:[^\]]+\]/, `[Timing: ${timing}]`);
  setNotes(slide, next);
}

function updatePageNumber(slide, number) {
  const numberShape = slide.shapes.items.find((item) =>
    typeof item.name === "string" && item.name.endsWith("-number"),
  );
  if (!numberShape) return;
  numberShape.text = String(number);
  numberShape.text.style = {
    fontSize: 13,
    typeface: FONT,
    color: C.gray,
    alignment: "right",
    verticalAlignment: "top",
    autoFit: "shrinkText",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

async function main() {
  await fs.mkdir(PREVIEW, { recursive: true });
  await fs.mkdir(LAYOUT, { recursive: true });

  // Template-following workflow: import the prepared starter deck and edit its
  // inherited slide-local objects. The original presentation is never touched.
  const deck = await PresentationFile.importPptx(await FileBlob.load(STARTER));
  if (deck.slides.items.length !== 25) {
    throw new Error(`Expected 25 starter slides, found ${deck.slides.items.length}`);
  }

  // 2 — popular-science curiosity hook.
  {
    const s = deck.slides.getItem(1);
    setText(nthShape(s, 0), "Gravity reveals missing mass—but not its particle identity", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(nthShape(s, 2), "Euclid NGC 6505 · O’Riordan et al. (2025) · arXiv:2502.06505", {
      fontSize: 11,
      color: C.gray,
      position: { left: 42, top: 678, width: 1050, height: 18 },
    });
    await replaceImage(
      nthImage(s, 0),
      path.join(PRESENTATION_ASSETS, "euclid_dark_matter_einstein_ring.jpg"),
      { left: 458, top: 132, width: 750, height: 494 },
      {
        fit: "cover",
        alt: "Euclid false-colour image of the Einstein ring around NGC 6505",
      },
    );
    setText(nthShape(s, 4), "≈11%", {
      fontSize: 58,
      bold: true,
      color: C.blue,
      position: { left: 44, top: 146, width: 360, height: 78 },
    });
    setText(nthShape(s, 5), "dark-matter fraction inferred\ninside the Einstein radius", {
      fontSize: 23,
      bold: true,
      position: { left: 44, top: 228, width: 370, height: 80 },
    });
    setText(nthShape(s, 6), "Gravity maps unseen mass.", {
      fontSize: 27,
      bold: true,
      position: { left: 44, top: 398, width: 370, height: 70 },
    });
    setText(nthShape(s, 7), "Particle identity: unknown.", {
      fontSize: 24,
      color: C.gray,
      position: { left: 44, top: 486, width: 370, height: 38 },
    });
    setText(nthShape(s, 8), "Strong lensing constrains total projected mass—not dark matter alone.", {
      fontSize: 15,
      color: C.gray,
      position: { left: 44, top: 558, width: 370, height: 54 },
    });
    setNotes(
      s,
      notesText(
        "0:15–1:00",
        "This Euclid image shows the foreground galaxy NGC 6505 bending light from a more distant galaxy into an almost complete Einstein ring. Lensing constrains the total projected mass; it is not a direct image of dark matter. Combining lensing and spectroscopic modelling, the paper infers a dark-matter fraction of about eleven percent inside the Einstein radius. Across astronomy and cosmology, gravitational effects require far more mass than visible baryons provide, but no dark-matter particle or non-gravitational interaction has been confirmed. That is the gap between knowing that dark matter shapes the Universe and knowing what it is made of. Dark matter shapes the Universe, but its particle identity remains unknown.",
        [
          "Local image thesis_report/presentation/euclid_dark_matter_einstein_ring.jpg, extracted from Figure 1 of C. M. O’Riordan et al. (Euclid Collaboration), ‘Euclid: A complete Einstein ring in NGC 6505’, Astronomy & Astrophysics 694, A145 (2025), arXiv:2502.06505, DOI 10.1051/0004-6361/202453014.",
          "Figure data credit: ESA/Euclid/Euclid Consortium/NASA; the paper reports an inferred dark-matter fraction 11.1^{+5.4}_{-3.5}% inside the Einstein radius.",
          "Thesis sections/2theory.tex, ‘Dark Matter Particle Physics’; bibliography keys cirelli2026-darkmatter and battaglieri2017-cosmic-visions.",
        ],
      ),
    );
  }

  // 3 — sub-GeV motivation, now with active-thesis Figure 3.
  {
    const s = deck.slides.getItem(2);
    setText(nthShape(s, 0), "The missing-momentum search opens the sub-GeV frontier", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(nthShape(s, 2), "Thesis §§2.1–2.2 · active thesis Figure 3 · Battaglieri et al. (2017)", {
      fontSize: 11,
      color: C.gray,
      position: { left: 42, top: 678, width: 1050, height: 18 },
    });
    // Slide 3 and slide 4 inherit duplicated image relationships from the same
    // source slide. Keep those linked images off-canvas here and add independent
    // images so later slide-4 replacements cannot mutate this slide.
    nthImage(s, 0).frame = { left: -2000, top: 0, width: 1, height: 1 };
    nthImage(s, 1).frame = { left: -2000, top: 0, width: 1, height: 1 };
    await addImage(
      s,
      path.join(THESIS, "config/fig/dark_bremsstrahlung_feynman.jpg"),
      { left: 42, top: 142, width: 610, height: 350 },
      { fit: "contain", alt: "Thesis Figure 3 dark-bremsstrahlung sketch" },
    );
    await addImage(
      s,
      path.join(THESIS, "config/fig/dm_range.jpeg"),
      { left: 700, top: 180, width: 500, height: 110 },
      { fit: "contain", alt: "Representative dark-matter mass ranges" },
    );
    setText(nthShape(s, 4), "MeV → GeV", {
      fontSize: 42,
      bold: true,
      color: C.blue,
      position: { left: 720, top: 342, width: 420, height: 58 },
    });
    setText(
      nthShape(s, 5),
      "Accelerators can produce light dark-sector states where conventional nuclear-recoil searches lose sensitivity—and infer them from momentum imbalance.",
      {
        fontSize: 22,
        color: C.gray,
        position: { left: 716, top: 422, width: 466, height: 142 },
      },
    );
    setNotes(
      s,
      notesText(
        "1:00–2:00",
        "Below roughly a GeV, nuclear-recoil searches become increasingly limited by kinematics and detector thresholds. Accelerator experiments can instead produce light dark-sector states. The active thesis Figure 3 sketches the benchmark used here: an electron scatters in the target field and radiates a dark photon, A-prime, which decays to an invisible chi–anti-chi pair. The outgoing electron provides the visible recoil needed to infer the imbalance. The mass strip places the LDMX motivation in the MeV-to-GeV range. This dark-photon picture is a concrete benchmark, not a claim that the thesis tests every possible dark-matter model. The thesis itself addresses the reconstruction problem that appears when LDMX operates at useful beam intensity.",
        [
          "Thesis sections/2theory.tex, ‘Thermal Relics and the Sub-GeV Frontier’ and ‘Dark Photons as Benchmark Mediators’.",
          "config/fig/dark_bremsstrahlung_feynman.jpg is active-thesis Figure 3; thesis-authored sketch inspired by bibliography key helgstrand2025veto_power.",
          "config/fig/dm_range.jpeg; thesis provenance: gajdan2025-hcal-thesis, inspired by battaglieri2017-cosmic-visions.",
          "Physics context: bibliography keys battaglieri2017-cosmic-visions, akesson2018-ldmx and ldmx2025-overview.",
        ],
      ),
    );
  }

  // 4 — missing momentum plus the supplied ECal cell image. The reaction
  // equation from the previous version is intentionally absent here.
  {
    const s = deck.slides.getItem(3);
    setText(nthShape(s, 0), "LDMX searches for invisible particles through missing momentum", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(nthShape(s, 2), "Thesis §2.2 · Åkesson et al. (2018) · LDMX Collaboration (2025)", {
      fontSize: 11,
      color: C.gray,
      position: { left: 42, top: 678, width: 1050, height: 18 },
    });
    await replaceImage(
      nthImage(s, 0),
      path.join(THESIS, "config/fig/beam_electron_schematic.jpg"),
      { left: 42, top: 142, width: 640, height: 426 },
      { fit: "contain", alt: "Conceptual LDMX missing-momentum signature" },
    );
    await replaceImage(
      nthImage(s, 1),
      path.join(PRESENTATION_ASSETS, "ecal_hexagonal_cells.jpg"),
      { left: 730, top: 142, width: 460, height: 294 },
      { fit: "contain", alt: "Hexagonal silicon-cell geometry of an LDMX ECal module" },
    );
    setText(nthShape(s, 4), "Fine granularity matters", {
      fontSize: 28,
      bold: true,
      color: C.blue,
      position: { left: 730, top: 470, width: 460, height: 44 },
    });
    setText(
      nthShape(s, 5),
      "7 silicon modules per sampling plane\n432 full-resolution cells per module\n32 simulated hit-layer positions",
      {
        fontSize: 19,
        color: C.gray,
        position: { left: 730, top: 526, width: 460, height: 94 },
      },
    );
    setNotes(
      s,
      notesText(
        "2:00–3:05",
        "LDMX is a fixed-target missing-momentum experiment. An 8 GeV electron is measured before it reaches a thin tungsten target. If it produces invisible particles, the recoil electron carries less energy and a transverse kick, while no visible particle accounts for the imbalance. The tagging and recoil trackers measure the electron, and the electromagnetic and hadronic calorimeters test whether visible activity explains what is missing. The ECal is a high-granularity silicon–tungsten sampling calorimeter. Each sampling plane contains seven hexagonal modules, and each module contains 432 full-resolution silicon cells. In the simulation geometry used for this thesis, reconstructed hits occur at 32 layer positions. That segmentation gives the reconstruction useful three-dimensional structure—but it also means one electron shower becomes a large set of cell measurements rather than one isolated object.",
        [
          "config/fig/beam_electron_schematic.jpg, from thesis citation akesson2018-ldmx.",
          "Local crop thesis_report/presentation/ecal_hexagonal_cells.jpg, derived from config/fig/ecal_cells_and_layers.jpg and Figure 3.60 of the LDMX design report, bibliography key ldmx2025-overview.",
          "Seven modules per plane, 432 cells per module and 32 reconstructed-hit layer positions: thesis sections/2theory.tex, ‘Electromagnetic Calorimeter’.",
        ],
      ),
    );
  }

  // 6 — inverse-problem bridge before the supervision/data slide.
  {
    const s = deck.slides.getItem(5);
    setText(nthShape(s, 0), "Reconstruction is an inverse problem with information loss", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(nthShape(s, 2), "Thesis §§2.2.6, 2.3, 4.2 · inverse-map framing adapted from MLPF", {
      fontSize: 11,
      color: C.gray,
      position: { left: 42, top: 678, width: 1050, height: 18 },
    });
    const leftPanel = nthShape(s, 4);
    leftPanel.fill = C.paleBlue;
    leftPanel.line = { style: "solid", fill: C.blue, width: 1 };
    const rightPanel = nthShape(s, 8);
    rightPanel.fill = C.palePurple;
    rightPanel.line = { style: "solid", fill: C.purple, width: 1 };
    setText(nthShape(s, 5), "Forward detector response", {
      fontSize: 31,
      bold: true,
      color: C.blue,
      position: { left: 72, top: 160, width: 450, height: 48 },
    });
    setText(nthShape(s, 6), "Particles become detector objects", {
      fontSize: 23,
      bold: true,
      position: { left: 72, top: 216, width: 470, height: 38 },
    });
    setText(
      nthShape(s, 7),
      "Underlying event   Y\n              ↓\nDetector response   S\n              ↓\nObserved objects   X",
      {
        fontSize: 27,
        alignment: "center",
        verticalAlignment: "middle",
        position: { left: 86, top: 274, width: 482, height: 220 },
      },
    );
    setText(nthShape(s, 9), "Learned reconstruction", {
      fontSize: 31,
      bold: true,
      color: C.purple,
      position: { left: 688, top: 160, width: 450, height: 48 },
    });
    setText(nthShape(s, 10), "Objects become task estimates", {
      fontSize: 23,
      bold: true,
      position: { left: 688, top: 216, width: 470, height: 38 },
    });
    setText(
      nthShape(s, 11),
      "Observed objects   X\n              ↓\nLearned model   Rθ\n              ↓\nHit origin · fractions · count",
      {
        fontSize: 27,
        alignment: "center",
        verticalAlignment: "middle",
        position: { left: 702, top: 274, width: 482, height: 220 },
      },
    );
    setText(
      nthShape(s, 12),
      "Finite granularity, thresholds, noise and shared cells make the inverse non-unique.",
      {
        fontSize: 22,
        bold: true,
        color: C.blue,
        alignment: "center",
        verticalAlignment: "middle",
        position: { left: 92, top: 590, width: 1096, height: 42 },
      },
    );
    setNotes(
      s,
      notesText(
        "4:05–4:55",
        "Let me frame the problem more generally. The detector simulation maps an underlying particle event, Y, to reconstructed detector objects, X. Reconstruction would like to go in the opposite direction—but this is not a literal inverse. Finite cell size, thresholds, noise and overlapping deposits lose information, so several underlying events can be compatible with the same observed response. A learned model therefore approximates a task-specific inverse: from X, it estimates only the quantities needed here. Those are which electron dominates each ECal hit, which electrons share it and with what fractions, and—later in TRACE—whether two or three electron slots are valid. Simulation is useful because it supplies paired X and task targets. The next slide shows how those pairs are constructed while keeping truth out of the model input.",
        [
          "Thesis sections/2theory.tex, ‘Pile-Up and Reconstruction’ and ‘Learning a Reconstruction Mapping’.",
          "Thesis sections/4Methodology.tex, ‘Reconstruction Formulation’.",
          "Inverse-map framing adapted in the thesis from J. Pata et al., ‘MLPF: Efficient machine-learned particle-flow reconstruction using graph neural networks’, EPJC 81 (2021) 381, bibliography key pata2021-mlpf.",
        ],
      ),
    );
  }

  // 14 — event accuracy versus truth-assisted shower separation.
  {
    const s = deck.slides.getItem(13);
    setText(nthShape(s, 0), "Separation predicts difficulty—but does not determine it", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(
      nthShape(s, 2),
      "Thesis §5.2.4 · truth-assisted overlap diagnostic · 10,000 events per decile",
      {
        fontSize: 11,
        color: C.gray,
        position: { left: 42, top: 678, width: 1050, height: 18 },
      },
    );
    // Slide 14 and the later confidence slide inherit the same source image
    // relationship. Add an independent diagnostic here so the confidence plot
    // remains unchanged on slide 16.
    nthImage(s, 0).frame = { left: -2000, top: 0, width: 1, height: 1 };
    await addImage(
      s,
      path.join(BUILD, "width_sep_small.png"),
      { left: 70, top: 126, width: 650, height: 516 },
      { fit: "contain", alt: "Event accuracy versus width-normalized shower separation for 2e and 3e events" },
    );
    setText(nthShape(s, 4), "Least → most separated decile", {
      fontSize: 24,
      bold: true,
      position: { left: 770, top: 154, width: 430, height: 46 },
    });
    setText(nthShape(s, 5), "2e   66.6% → 94.6%\n3e   64.3% → 84.3%", {
      fontSize: 31,
      bold: true,
      color: C.blue,
      position: { left: 772, top: 225, width: 420, height: 92 },
    });
    nthShape(s, 6).position = { left: 772, top: 342, width: 400, height: 0.01 };
    setText(nthShape(s, 7), "What it means", {
      fontSize: 23,
      bold: true,
      color: C.blue,
      position: { left: 772, top: 374, width: 300, height: 34 },
    });
    setText(
      nthShape(s, 8),
      "• overlap strongly predicts difficulty\n• broad spread remains at fixed separation\n• truth-assisted diagnostic—not a model input",
      {
        fontSize: 21,
        color: C.gray,
        position: { left: 772, top: 424, width: 420, height: 150 },
      },
    );
    setNotes(
      s,
      notesText(
        "10:30–11:20",
        "This plot connects physical shower overlap directly to reconstruction performance. The horizontal coordinate is the closest truth-centroid distance divided by the combined radial widths of that shower pair. Events are divided into ten equal-population bins, so each white point summarizes ten thousand test events. From the least- to the most-separated decile, mean accuracy rises from 66.6 to 94.6 percent for two electrons and from 64.3 to 84.3 percent for three. Separation is therefore a strong predictor of difficulty. However, the broad vertical distribution at fixed separation remains important: this single geometric quantity does not completely describe an event. The measure also uses simulated origin fractions and is therefore an interpretation tool, not an inference-time observable. The apparent 50 and 33 percent lower floors arise from choosing the best global label permutation; they are not detector-resolution boundaries.",
        [
          "Thesis sections/5Results.tex, ‘Performance as a Function of Shower Separation’.",
          "Figure asset config/fig/results/width_normalized_separation.png, thesis-authored; slide uses the presentation-sized copy .tmp_thesis_defense_v2/width_sep_small.png.",
          "Definition and truth-dependence from sections/4Methodology.tex, ‘Projected Shower Geometry’; exact decile means cross-checked against the final run-020 analysis outputs.",
        ],
      ),
    );
  }

  // 15 — promote the layer result from backup to the main narrative.
  {
    const s = deck.slides.getItem(14);
    setText(nthShape(s, 0), "Assignment accuracy falls with ECal depth", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(
      nthShape(s, 2),
      "Thesis §5.2.3 · event-balanced means · pooled layers 21–32: 70.5% / 56.5%",
      {
        fontSize: 11,
        color: C.gray,
        position: { left: 42, top: 678, width: 1050, height: 18 },
      },
    );
    setText(nthShape(s, 4), "92.4 → 71.4%", {
      fontSize: 43,
      bold: true,
      color: C.blue,
      position: { left: 118, top: 560, width: 350, height: 62 },
    });
    setText(nthShape(s, 5), "2e mean event accuracy: layer 1 → layer 20", {
      fontSize: 17,
      position: { left: 118, top: 628, width: 420, height: 32 },
    });
    setText(nthShape(s, 6), "87.5 → 57.9%", {
      fontSize: 43,
      bold: true,
      color: C.orange,
      position: { left: 790, top: 560, width: 350, height: 62 },
    });
    setText(nthShape(s, 7), "3e mean event accuracy: layer 1 → layer 20", {
      fontSize: 17,
      position: { left: 790, top: 628, width: 420, height: 32 },
    });
    setNotes(
      s,
      notesText(
        "11:20–12:10",
        "Each white point is an event-balanced mean after applying the same globally optimal event permutation used for the headline metrics. Assignment becomes steadily more difficult through the shower: between layers 1 and 20, the mean falls from 92.4 to 71.4 percent for two electrons and from 87.5 to 57.9 percent for three. Energy weighting improves early-layer accuracy but does not remove the depth dependence. The final twelve layers reach pooled accuracies of 70.5 and 56.5 percent, although they contain only about 1.5 percent of all hits. Their low occupancy also explains the discrete zero, 50, 67 and 100 percent bands and the broader late-layer intervals. This is consistent with later, wider and sparser shower deposits becoming more ambiguous.",
        [
          "Thesis sections/5Results.tex, ‘Performance Across the Electron Shower Depth’.",
          "Figure assets config/fig/results/hit_accuracy_by_layer_2e.png and hit_accuracy_by_layer_3e.png, thesis-authored.",
          "Layer-1-to-layer-20 values and pooled tail values cross-checked against the final run-020 analysis outputs.",
        ],
      ),
    );
  }

  // 20 — dedicated prioritized outlook and ml_ldmx handover.
  {
    const s = deck.slides.getItem(19);
    setText(nthShape(s, 0), "The next step is controlled validation—not a larger network", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
    setText(nthShape(s, 2), "Thesis §7.1 · prioritized outlook · ml_ldmx handover", {
      fontSize: 11,
      color: C.gray,
      position: { left: 42, top: 678, width: 1050, height: 18 },
    });
    setText(nthShape(s, 4), "01", { fontSize: 44, bold: true, color: C.blue });
    setText(nthShape(s, 5), "Isolate detector value", {
      fontSize: 28,
      bold: true,
      position: { left: 160, top: 154, width: 640, height: 48 },
    });
    setText(
      nthShape(s, 6),
      "Matched ECal-only versus ECal+TPad retraining · identical splits · multiple seeds · separate complete, missing and merged TPad candidates.",
      {
        fontSize: 19,
        color: C.gray,
        position: { left: 160, top: 214, width: 1010, height: 58 },
      },
    );
    setText(nthShape(s, 8), "02", { fontSize: 44, bold: true, color: C.orange });
    setText(nthShape(s, 9), "Make reconstruction permutation-robust", {
      fontSize: 28,
      bold: true,
      position: { left: 160, top: 326, width: 760, height: 48 },
    });
    setText(
      nthShape(s, 10),
      "Event-wise slot matching · tune TRACE loss balance · broaden multiplicities, beam conditions and detector systematics.",
      {
        fontSize: 19,
        color: C.gray,
        position: { left: 160, top: 386, width: 1010, height: 58 },
      },
    );
    setText(nthShape(s, 12), "03", { fontSize: 44, bold: true, color: C.purple });
    setText(nthShape(s, 13), "Prove deployability and physics value", {
      fontSize: 28,
      bold: true,
      position: { left: 160, top: 498, width: 760, height: 48 },
    });
    setText(
      nthShape(s, 14),
      "Trigger-cell inputs · target-hardware latency and memory · compression only if needed · downstream missing-momentum metrics.",
      {
        fontSize: 19,
        color: C.gray,
        position: { left: 160, top: 558, width: 1010, height: 58 },
      },
    );
    setText(
      nthShape(s, 16),
      "ml_ldmx: reusable ROOT → tensors → training → evaluation workflow",
      {
        fontSize: 17,
        bold: true,
        color: C.blue,
        alignment: "center",
        verticalAlignment: "middle",
        position: { left: 180, top: 638, width: 920, height: 22 },
      },
    );
    setNotes(
      s,
      notesText(
        "16:05–17:25",
        "The first priority is not to scale the architecture but to remove the largest ambiguity in the present evidence. ECal-only and ECal-plus-TPad models should first be retrained on identical events across several seeds. That separates genuine detector value from the input-distribution shift introduced by removing an entire modality only at inference. Second, TRACE should reduce its dependence on canonical y-ordering through event-wise matching, while its losses and broader multiplicity domain are studied systematically. Only after those controls should the model move to realistic trigger-cell inputs and target hardware, where accuracy, memory and latency can be measured and compression considered. The final test is physics-level value and robustness, not another offline accuracy increment. The ml_ldmx pipeline is the practical handover: it already connects ROOT conversion, tensor building, training and evaluation, so these studies can be added without rebuilding the workflow.",
        [
          "Thesis sections/7Conclusion.tex, ‘Outlook’.",
          "Thesis sections/4Methodology.tex, ‘Software and Reproducibility’; repository ml_ldmx workflow.",
          "TPad causal limitation from sections/5Results.tex, ‘Trigger-Pad Ablation’.",
        ],
      ),
    );
  }

  // 22 — TPad moves to backup in the revised pacing.
  {
    const s = deck.slides.getItem(21);
    setText(nthShape(s, 0), "Backup — TPad carries a small, confounded assignment signal", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });
  }

  // Update all pacing lines while retaining the detailed inherited scripts and
  // source blocks on slides that were not substantively rewritten above.
  const timings = {
    1: "0:00–0:15",
    5: "3:05–4:05",
    7: "4:55–5:40",
    8: "5:40–6:20",
    9: "6:20–7:10",
    10: "7:10–8:00",
    11: "8:00–8:45",
    12: "8:45–9:45",
    13: "9:45–10:30",
    16: "12:10–12:55",
    17: "12:55–14:00",
    18: "14:00–15:05",
    19: "15:05–16:05",
    21: "17:25–18:00; retain ≈2 min contingency",
    22: "Backup",
    23: "Backup",
    24: "Backup",
    25: "Backup",
  };
  for (const [slideNumber, timing] of Object.entries(timings)) {
    replaceTiming(deck.slides.getItem(Number(slideNumber) - 1), timing);
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    updatePageNumber(slide, index + 1);
  }

  const snapshot = await deck.inspect({
    kind: "slide,textbox,shape,image,chart,table,notes",
    maxChars: 100000,
  });
  await fs.writeFile(path.join(BUILD, "final-inspect.ndjson"), snapshot.ndjson);

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `final-slide-${String(index + 1).padStart(2, "0")}`;
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(
      path.join(PREVIEW, `${stem}.png`),
      new Uint8Array(await png.arrayBuffer()),
    );
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(LAYOUT, `${stem}.layout.json`), await layout.text());
  }

  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(
    path.join(BUILD, "final-montage.webp"),
    new Uint8Array(await montage.arrayBuffer()),
  );

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL);
  console.log(FINAL);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
