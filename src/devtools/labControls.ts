import type { RuntimeExperimentOptions, SceneId } from "../simulation/types";

export interface LabSelection {
  readonly sceneId: SceneId;
  readonly options: RuntimeExperimentOptions;
}

export function mountLabControls(
  panel: HTMLElement,
  initial: LabSelection,
  onChange: (selection: LabSelection) => void,
  onExport: () => void
): () => void {
  panel.innerHTML = `
    <div><span>Fixture</span><select data-lab="scene">
      <option value="tutorial-graybox">Tutorial graybox</option>
      <option value="adversarial-lab">Adversarial lab</option>
    </select></div>
    <div><span>Input</span><select data-lab="input">
      <option value="one_axis_raw">One-axis raw</option>
      <option value="two_axis_raw">Two-axis raw</option>
      <option value="one_axis_track">One-axis track</option>
      <option value="two_axis_track">Two-axis track</option>
    </select></div>
    <div><span>Tilt</span><select data-lab="tilt">
      <option value="gravity_vector">Gravity vector</option>
      <option value="kinematic_support">Kinematic support</option>
    </select></div>
    <div><span>Capture</span><select data-lab="capture">
      <option value="constrained">Constrained</option>
      <option value="raw">Raw</option>
      <option value="felt_assist">Felt assist</option>
    </select></div>
    <div><span>Camera</span><select data-lab="camera">
      <option value="orthographic_fixed">Orthographic</option>
      <option value="perspective_fixed">Perspective</option>
      <option value="bounded_event">Bounded event</option>
    </select></div>
    <button type="button" data-lab-action="export">Export diagnostics</button>
  `;
  const selects = [...panel.querySelectorAll<HTMLSelectElement>("select")];
  for (const select of selects) {
    const kind = select.dataset.lab;
    select.value =
      kind === "scene"
        ? initial.sceneId
        : kind === "input"
          ? initial.options.inputModel
          : kind === "tilt"
            ? initial.options.tiltImplementation
            : kind === "capture"
              ? initial.options.captureAuthority
              : initial.options.cameraModel;
  }

  let selection = initial;
  const handleChange = (event: Event): void => {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }
    const kind = event.target.dataset.lab;
    const value = event.target.value;
    if (kind === "scene" && (value === "tutorial-graybox" || value === "adversarial-lab")) {
      selection = { ...selection, sceneId: value };
    } else if (
      kind === "input" &&
      (value === "one_axis_raw" ||
        value === "two_axis_raw" ||
        value === "one_axis_track" ||
        value === "two_axis_track")
    ) {
      selection = { ...selection, options: { ...selection.options, inputModel: value } };
    } else if (kind === "tilt" && (value === "gravity_vector" || value === "kinematic_support")) {
      selection = {
        ...selection,
        options: { ...selection.options, tiltImplementation: value }
      };
    } else if (
      kind === "capture" &&
      (value === "constrained" || value === "raw" || value === "felt_assist")
    ) {
      selection = {
        ...selection,
        options: { ...selection.options, captureAuthority: value }
      };
    } else if (
      kind === "camera" &&
      (value === "orthographic_fixed" || value === "perspective_fixed" || value === "bounded_event")
    ) {
      selection = { ...selection, options: { ...selection.options, cameraModel: value } };
    }
    onChange(selection);
  };
  panel.addEventListener("change", handleChange);
  const exportButton = panel.querySelector<HTMLButtonElement>('[data-lab-action="export"]');
  exportButton?.addEventListener("click", onExport);
  return () => {
    panel.removeEventListener("change", handleChange);
    exportButton?.removeEventListener("click", onExport);
    panel.replaceChildren();
  };
}
