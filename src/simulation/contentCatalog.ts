import tutorialGrayboxSource from "../../content/levels/tutorial-graybox.json";
import materialLibrarySource from "../../content/materials/physics-materials.json";
import {
  validateLevelDefinition,
  validateMaterialLibrary,
  type LevelDefinition,
  type MaterialLibrary,
  type ValidationResult
} from "./content";
import type { SceneId } from "./types";

function unwrap<T>(result: ValidationResult<T>, label: string): T {
  if (result.ok) {
    return result.value;
  }
  const detail = result.issues.map(({ path, message }) => `${path}: ${message}`).join("\n");
  throw new Error(`Invalid ${label}:\n${detail}`);
}

export const MATERIAL_LIBRARY: MaterialLibrary = unwrap(
  validateMaterialLibrary(materialLibrarySource),
  "physics material library"
);

const TUTORIAL_GRAYBOX = unwrap(validateLevelDefinition(tutorialGrayboxSource), "tutorial graybox");

export async function loadLevelDefinition(id: SceneId): Promise<LevelDefinition> {
  if (id === "tutorial-graybox") {
    return TUTORIAL_GRAYBOX;
  }
  const labContentEnabled =
    typeof __TEETERTOWN_LAB_ENABLED__ === "undefined" ? true : __TEETERTOWN_LAB_ENABLED__;
  if (!labContentEnabled) {
    throw new Error("The adversarial laboratory is unavailable in production builds.");
  }
  const { default: adversarialLabSource } =
    await import("../../content/levels/adversarial-lab.json");
  return unwrap(validateLevelDefinition(adversarialLabSource), "adversarial lab");
}
