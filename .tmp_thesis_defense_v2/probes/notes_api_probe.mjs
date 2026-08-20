import os from "node:os";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const INPUT = new URL("../template-starter.pptx", import.meta.url).pathname;

const deck = await PresentationFile.importPptx(await FileBlob.load(INPUT));
const slide = deck.slides.getItem(0);
const notes = slide.speakerNotes;
const textFrame = notes.textFrame;

function describe(label, value) {
  const proto = value && Object.getPrototypeOf(value);
  console.log(`\n${label}`);
  console.log("type:", typeof value);
  console.log("constructor:", value?.constructor?.name);
  console.log("own keys:", value ? Reflect.ownKeys(value) : []);
  console.log("prototype keys:", proto ? Reflect.ownKeys(proto) : []);
}

describe("speakerNotes", notes);
describe("speakerNotes.textFrame", textFrame);
describe("speakerNotes.textFrame.paragraphs", textFrame?.paragraphs);

for (const key of ["text", "slideId"]) {
  try {
    console.log(`speakerNotes.${key}:`, JSON.stringify(notes?.[key]));
  } catch (error) {
    console.log(`speakerNotes.${key}: threw`, error?.message ?? error);
  }
}
for (const method of ["isVisible", "toSnapshot"]) {
  try {
    if (typeof notes?.[method] === "function") {
      console.log(`speakerNotes.${method}():`, await notes[method]());
    }
  } catch (error) {
    console.log(`speakerNotes.${method}(): threw`, error?.stack ?? error);
  }
}

for (const key of ["text", "plainText", "value", "content"]) {
  try {
    console.log(`textFrame.${key}:`, JSON.stringify(textFrame?.[key]));
  } catch (error) {
    console.log(`textFrame.${key}: threw`, error?.message ?? error);
  }
}

const paras = textFrame?.paragraphs;
if (paras) {
  for (const key of ["items", "length", "count"]) {
    try {
      console.log(`paragraphs.${key}:`, paras[key]);
    } catch (error) {
      console.log(`paragraphs.${key}: threw`, error?.message ?? error);
    }
  }
  try {
    console.log("paragraphs.toPlainText():", JSON.stringify(paras.toPlainText()));
  } catch (error) {
    console.log("paragraphs.toPlainText(): threw", error?.stack ?? error);
  }
  try {
    const first = typeof paras.getItem === "function" ? paras.getItem(0) : undefined;
    describe("first paragraph", first);
    for (const key of ["text", "plainText", "value", "content", "runs"]) {
      try {
        console.log(`first.${key}:`, first?.[key]);
      } catch (error) {
        console.log(`first.${key}: threw`, error?.message ?? error);
      }
    }
  } catch (error) {
    console.log("first paragraph probe threw:", error?.stack ?? error);
  }
}

if (process.argv.includes("--roundtrip")) {
  const before = deck.slides.items.map((s) => ({
    text: s.speakerNotes.text,
    visible: s.speakerNotes.isVisible(),
  }));
  const replacement = before[0].text.replace(
    /^\[Timing:[^\]]+\]/,
    "[Timing: probe-only]",
  );
  notes.textFrame.setText(replacement);
  notes.setVisible(before[0].visible);

  const output = path.join(os.tmpdir(), "artifact-notes-probe.pptx");
  await (await PresentationFile.exportPptx(deck)).save(output);
  const roundtripped = await PresentationFile.importPptx(await FileBlob.load(output));
  const after = roundtripped.slides.items.map((s) => ({
    text: s.speakerNotes.text,
    visible: s.speakerNotes.isVisible(),
  }));

  console.log("\nROUNDTRIP");
  console.log("output:", output);
  console.log("slide 1 changed exactly:", after[0].text === replacement);
  console.log(
    "all other notes byte-for-byte unchanged:",
    before.slice(1).every((entry, index) => (
      entry.text === after[index + 1].text && entry.visible === after[index + 1].visible
    )),
  );
  console.log("slide 1 visible preserved:", before[0].visible === after[0].visible);
  console.log("slide 1 after:", JSON.stringify(after[0].text));
}

for (const method of ["toJSON", "getText", "getPlainText", "getRuns", "getRange"]) {
  try {
    if (typeof textFrame?.[method] === "function") {
      console.log(`textFrame.${method}():`, await textFrame[method]());
    }
  } catch (error) {
    console.log(`textFrame.${method}(): threw`, error?.stack ?? error);
  }
}
