import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/eliotmontesinopetren/src/mpetren-msceng-ldmx";
const BUILD = path.join(ROOT, ".tmp_thesis_defense_v3");
const STARTER = path.join(BUILD, "template-starter.pptx");
const GIF = path.join(BUILD, "galaxy_rotation_dark_matter_8fps.gif");
const FINAL = path.join(
  ROOT,
  "thesis_report/presentation/Thesis_Defense_Eliot_Montesino_Petren_v3.pptx",
);
const PREVIEW = path.join(BUILD, "final-preview");
const LAYOUT = path.join(BUILD, "final-layout");

const C = {
  ink: "#111111",
  gray: "#5F6672",
  blue: "#3D8DFF",
  orange: "#D97706",
};
const FONT = "Helvetica Neue";

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
    typeface: FONT,
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

function setNotes(slide, text) {
  slide.speakerNotes.textFrame.setText(text);
  slide.speakerNotes.setVisible(true);
}

function notesText(timing, script, sources) {
  return `[Timing: ${timing}]\n\n${script}\n\n[Sources]\n${sources
    .map((source) => `- ${source}`)
    .join("\n")}`;
}

async function main() {
  await fs.mkdir(PREVIEW, { recursive: true });
  await fs.mkdir(LAYOUT, { recursive: true });

  const deck = await PresentationFile.importPptx(await FileBlob.load(STARTER));
  if (deck.slides.items.length !== 25) {
    throw new Error(`Expected 25 starter slides, found ${deck.slides.items.length}`);
  }

  // Slide 2 — replace the Einstein-ring hook while retaining the established
  // v2 slide grammar and editing only inherited objects.
  {
    const s = deck.slides.getItem(1);

    setText(nthShape(s, 0), "Galaxy rotation reveals what visible matter cannot explain", {
      fontSize: 40,
      bold: true,
      position: { left: 42, top: 30, width: 1160, height: 66 },
    });

    setText(
      nthShape(s, 2),
      "Animation: Ingo Berg / Wikimedia Commons · CC BY-SA 3.0",
      {
        fontSize: 11,
        color: C.gray,
        position: { left: 42, top: 678, width: 1050, height: 18 },
      },
    );

    setText(nthShape(s, 4), "≈84%", {
      fontSize: 58,
      bold: true,
      color: C.blue,
      position: { left: 44, top: 146, width: 360, height: 78 },
    });
    setText(nthShape(s, 5), "of all matter is estimated\nto be dark matter", {
      fontSize: 23,
      bold: true,
      position: { left: 44, top: 228, width: 370, height: 80 },
    });

    setText(nthShape(s, 6), "≈16%", {
      fontSize: 52,
      bold: true,
      color: C.orange,
      position: { left: 44, top: 376, width: 360, height: 70 },
    });
    setText(nthShape(s, 7), "is ordinary (baryonic) matter", {
      fontSize: 23,
      bold: true,
      color: C.ink,
      position: { left: 44, top: 452, width: 370, height: 62 },
    });

    const animation = nthImage(s, 0);
    animation.replace({
      blob: await bytes(GIF),
      contentType: "image/gif",
      alt: "Animated comparison of galaxy rotation: visible matter alone on the left and a flat rotation curve explained by dark matter on the right",
      fit: "contain",
    });
    animation.frame = { left: 458, top: 146, width: 750, height: 375 };
    animation.fit = "contain";
    animation.crop = { left: 0, top: 0, right: 0, bottom: 0 };
    animation.lockAspectRatio = false;

    setText(
      nthShape(s, 8),
      "Left: visible-matter prediction · Right: flat rotation curve explained by dark matter",
      {
        fontSize: 16,
        color: C.gray,
        alignment: "center",
        verticalAlignment: "middle",
        position: { left: 458, top: 538, width: 750, height: 58 },
      },
    );

    setNotes(
      s,
      notesText(
        "0:15–1:00",
        "Here is one of the classic qualitative clues. If the visible matter concentrated toward the centre were all the mass, orbital speeds should fall with distance, as illustrated on the left. Instead, observed spiral-galaxy rotation curves remain roughly flat, as on the right. In the standard cosmological matter budget, about 84 percent of matter is dark matter and only about 16 percent is ordinary baryonic matter. This animation is a simplified illustration, and the gravitational discrepancy does not identify a particle by itself. It tells us that something is missing from the visible-matter account. Dark matter shapes galaxies and the Universe, but its particle identity remains unknown.",
        [
          "Ingo Berg, ‘Galaxy rotation under the influence of dark matter.ogv’ (2012), Wikimedia Commons, CC BY-SA 3.0: https://commons.wikimedia.org/wiki/File:Galaxy_rotation_under_the_influence_of_dark_matter.ogv. Local MOV converted to an embedded 8 fps animated GIF without changing the scientific content.",
          "Thesis sections/2theory.tex, ‘Dark Matter Particle Physics’; bibliography key cirelli2026-darkmatter for the approximate 84% dark-matter / 16% baryonic-matter share of matter.",
          "The percentages describe the matter budget, not the total mass–energy content of the Universe.",
        ],
      ),
    );
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
