import { readFile } from "node:fs/promises";
import { loadLevelDefinition, MATERIAL_LIBRARY } from "../src/simulation/contentCatalog";
import { validateLevelDefinition, validateMaterialLibrary } from "../src/simulation/content";

const levelPaths = [
  "content/levels/tutorial-graybox.json",
  "content/levels/adversarial-lab.json"
] as const;

for (const path of levelPaths) {
  const source: unknown = JSON.parse(await readFile(path, "utf8"));
  const result = validateLevelDefinition(source);
  if (!result.ok) {
    throw new Error(
      `${path}\n${result.issues.map(({ path: issuePath, message }) => `${issuePath}: ${message}`).join("\n")}`
    );
  }
  if (result.value.contentHash === "GENERATE") {
    throw new Error(`${path} contains an unresolved content hash.`);
  }
  if (result.value.entities.length > result.value.budget.maximumBodies) {
    throw new Error(`${path} exceeds its body budget.`);
  }
  const colliderCount = result.value.entities.filter(
    (entity) => entity.collider !== undefined
  ).length;
  if (colliderCount > result.value.budget.maximumColliders) {
    throw new Error(`${path} exceeds its collider budget.`);
  }
  if (result.value.joints.length > result.value.budget.maximumJoints) {
    throw new Error(`${path} exceeds its joint budget.`);
  }
  if (
    result.value.kind !== "laboratory" &&
    result.value.entities.some((entity) => entity.intentionallyMismatched)
  ) {
    throw new Error(`${path} contains a collider mismatch outside the laboratory.`);
  }
  console.log(
    `${result.value.id}: ${result.value.entities.length} bodies, ${colliderCount} colliders, ${result.value.joints.length} joints, hash ${result.value.contentHash}`
  );
}

const materialSource: unknown = JSON.parse(
  await readFile("content/materials/physics-materials.json", "utf8")
);
const materials = validateMaterialLibrary(materialSource);
if (!materials.ok) {
  throw new Error(materials.issues.map(({ path, message }) => `${path}: ${message}`).join("\n"));
}
if (materials.value.hash !== MATERIAL_LIBRARY.hash) {
  throw new Error("Material catalog hash differs from the runtime catalog.");
}

await Promise.all([
  loadLevelDefinition("tutorial-graybox"),
  loadLevelDefinition("adversarial-lab")
]);
console.log(
  `physics materials: ${MATERIAL_LIBRARY.materials.length}, hash ${MATERIAL_LIBRARY.hash}`
);
