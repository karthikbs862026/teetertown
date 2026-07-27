export const GAME_VERSION =
  typeof __TEETERTOWN_BUILD_VERSION__ === "undefined"
    ? "0.0.1-local"
    : __TEETERTOWN_BUILD_VERSION__;
export const BUILD_COMMIT =
  typeof __TEETERTOWN_COMMIT_SHA__ === "undefined" ? "local" : __TEETERTOWN_COMMIT_SHA__;
export const RELEASE_ID =
  typeof __TEETERTOWN_RELEASE_ID__ === "undefined" ? BUILD_COMMIT : __TEETERTOWN_RELEASE_ID__;
export const RAPIER_VERSION = "0.19.3";
export const RAPIER_RUNTIME_VARIANT =
  typeof __TEETERTOWN_RAPIER_RUNTIME_VARIANT__ === "undefined"
    ? "compat-embedded-node"
    : __TEETERTOWN_RAPIER_RUNTIME_VARIANT__;
export const PHYSICS_VERSION = "phase1-physics-2";
export const REPLAY_SCHEMA_VERSION = 2;
export const LEVEL_SCHEMA_VERSION = 1;
export const MATERIAL_SCHEMA_VERSION = 1;
export const SAVE_SCHEMA_VERSION = 1;
export const ASSET_MANIFEST_VERSION = RELEASE_ID;

export const LAB_ENABLED =
  typeof __TEETERTOWN_LAB_ENABLED__ === "undefined" ? true : __TEETERTOWN_LAB_ENABLED__;
