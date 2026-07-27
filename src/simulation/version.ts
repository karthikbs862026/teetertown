export const GAME_VERSION =
  typeof __TEETERTOWN_BUILD_VERSION__ === "undefined"
    ? "0.0.1-local"
    : __TEETERTOWN_BUILD_VERSION__;
export const BUILD_COMMIT =
  typeof __TEETERTOWN_COMMIT_SHA__ === "undefined" ? "local" : __TEETERTOWN_COMMIT_SHA__;
export const RAPIER_VERSION = "0.19.3";
export const PHYSICS_VERSION = "phase1-physics-1";
export const REPLAY_SCHEMA_VERSION = 1;
export const LEVEL_SCHEMA_VERSION = 1;
export const MATERIAL_SCHEMA_VERSION = 1;
export const SAVE_SCHEMA_VERSION = 1;
export const ASSET_MANIFEST_VERSION = "graybox-1";

export const LAB_ENABLED =
  typeof __TEETERTOWN_LAB_ENABLED__ === "undefined" ? true : __TEETERTOWN_LAB_ENABLED__;
