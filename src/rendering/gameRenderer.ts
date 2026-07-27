import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  EdgesGeometry,
  Euler,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SphereGeometry,
  TorusGeometry,
  WebGLRenderer,
  type Camera,
  type Material,
  type Object3D
} from "three";
import type {
  ColliderDefinition,
  EntityDefinition,
  LevelDefinition,
  VisualDefinition
} from "../simulation/content";
import type { CameraModel, ResourceCounts, SimulationSnapshot } from "../simulation/types";
import { LevelResourceScope } from "./levelResourceScope";

const CAMERA_HEIGHT = 5.4;
const CAMERA_DISTANCE = 11.5;
const MAXIMUM_CONTACT_LINES = 16;

function geometryForVisual(
  definition: VisualDefinition,
  scope: LevelResourceScope
): BufferGeometry {
  if (definition.shape === "sphere") {
    return scope.geometry(new SphereGeometry(definition.size.x * 0.5, 24, 16));
  }
  if (definition.shape === "cylinder") {
    return scope.geometry(
      new CylinderGeometry(definition.size.x * 0.5, definition.size.z * 0.5, definition.size.y, 20)
    );
  }
  if (definition.shape === "ring") {
    return scope.geometry(new TorusGeometry(definition.size.x * 0.5, 0.04, 8, 32));
  }
  return scope.geometry(new BoxGeometry(definition.size.x, definition.size.y, definition.size.z));
}

function geometryForCollider(
  definition: ColliderDefinition,
  scope: LevelResourceScope
): BufferGeometry {
  if (definition.shape === "ball") {
    return scope.geometry(new SphereGeometry(definition.radius ?? 0, 16, 10));
  }
  if (definition.shape === "cylinder") {
    return scope.geometry(
      new CylinderGeometry(
        definition.radius ?? 0,
        definition.radius ?? 0,
        (definition.halfHeight ?? 0) * 2,
        16
      )
    );
  }
  const size = definition.halfExtents ?? { x: 0, y: 0, z: 0 };
  return scope.geometry(new BoxGeometry(size.x * 2, size.y * 2, size.z * 2));
}

function materialForVisual(definition: VisualDefinition, scope: LevelResourceScope): Material {
  return scope.material(
    new MeshStandardMaterial({
      color: new Color(definition.color),
      transparent: definition.opacity < 1,
      opacity: definition.opacity,
      roughness: 0.7,
      metalness: 0.04,
      wireframe: definition.wireframe
    })
  );
}

function lerp(left: number, right: number, alpha: number): number {
  return left + (right - left) * alpha;
}

export class GameRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly #renderer: WebGLRenderer;
  readonly #scene = new Scene();
  readonly #presentationRoot = new Group();
  readonly #meshById = new Map<string, Object3D>();
  readonly #colliderOverlays: Object3D[] = [];
  #contactLines: LineSegments | null = null;
  #camera: Camera;
  #scope = new LevelResourceScope();
  #debugVisible = false;
  #disposed = false;

  public constructor(container: HTMLElement, cameraModel: CameraModel) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "game-canvas";
    this.canvas.setAttribute("aria-label", "Teetertown physics graybox");
    container.append(this.canvas);
    this.#renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.#renderer.setClearColor(new Color("#10182b"), 1);
    this.#renderer.outputColorSpace = "srgb";
    this.#camera = this.#createCamera(cameraModel);
    this.#scene.add(this.#presentationRoot);
    this.#scene.add(new AmbientLight("#b9d8ff", 1.35));
    const key = new DirectionalLight("#fff1d5", 2.2);
    key.position.set(-4, 8, 7);
    this.#scene.add(key);
    this.resize();
  }

  public loadLevel(level: LevelDefinition, cameraModel: CameraModel): void {
    this.#assertOpen();
    this.#scope.dispose(this.#presentationRoot);
    this.#scope = new LevelResourceScope();
    this.#meshById.clear();
    this.#colliderOverlays.length = 0;
    this.#contactLines = null;
    this.#camera = this.#createCamera(cameraModel);

    for (const entity of level.entities) {
      this.#createEntity(entity);
    }
    this.#createGoal(level);
    this.#createJointMarkers(level);
    this.#createContactLines();
    this.#applyDebugVisibility();
    this.resize();
  }

  public setCameraModel(model: CameraModel): void {
    this.#camera = this.#createCamera(model);
    this.resize();
  }

  public setDebugVisible(visible: boolean): void {
    this.#debugVisible = visible;
    this.#applyDebugVisibility();
  }

  public render(previous: SimulationSnapshot, current: SimulationSnapshot, alpha: number): void {
    this.#assertOpen();
    const previousById = new Map(previous.bodies.map((body) => [body.id, body]));
    for (const body of current.bodies) {
      const object = this.#meshById.get(body.id);
      if (object === undefined) {
        continue;
      }
      const prior = previousById.get(body.id) ?? body;
      object.position.set(
        lerp(prior.translation.x, body.translation.x, alpha),
        lerp(prior.translation.y, body.translation.y, alpha),
        lerp(prior.translation.z, body.translation.z, alpha)
      );
      const previousRotation = new Quaternion(
        prior.rotation.x,
        prior.rotation.y,
        prior.rotation.z,
        prior.rotation.w
      );
      const currentRotation = new Quaternion(
        body.rotation.x,
        body.rotation.y,
        body.rotation.z,
        body.rotation.w
      );
      object.quaternion.slerpQuaternions(previousRotation, currentRotation, alpha);
    }
    this.#presentationRoot.rotation.copy(
      new Euler(current.tilt.x * 0.18, 0, current.tilt.z * 0.18)
    );
    this.#updateContactLines(current);
    this.#renderer.render(this.#scene, this.#camera);
  }

  public resize(): void {
    this.#assertOpen();
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.#renderer.setSize(width, height, false);
    const aspect = width / height;
    if (this.#camera instanceof OrthographicCamera) {
      const vertical = 5.3;
      this.#camera.left = -vertical * aspect;
      this.#camera.right = vertical * aspect;
      this.#camera.top = vertical;
      this.#camera.bottom = -vertical;
      this.#camera.updateProjectionMatrix();
    } else if (this.#camera instanceof PerspectiveCamera) {
      this.#camera.aspect = aspect;
      this.#camera.updateProjectionMatrix();
    }
  }

  public resourceCounts(simulation: ResourceCounts): ResourceCounts {
    const render = this.#scope.counts();
    return {
      ...simulation,
      geometries: render.geometries,
      materials: render.materials,
      textures: render.textures,
      renderTargets: render.renderTargets,
      listeners: render.listeners
    };
  }

  public dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#scope.dispose(this.#presentationRoot);
    this.#renderer.dispose();
    this.canvas.remove();
    this.#disposed = true;
  }

  #createCamera(model: CameraModel): Camera {
    if (model === "orthographic_fixed") {
      const camera = new OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
      camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
      camera.lookAt(0, 0.35, 0);
      return camera;
    }
    const camera = new PerspectiveCamera(model === "bounded_event" ? 42 : 38, 1, 0.1, 100);
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
    camera.lookAt(0, 0.35, 0);
    return camera;
  }

  #createEntity(entity: EntityDefinition): void {
    const group = new Group();
    group.name = entity.id;
    if (entity.visual !== undefined) {
      const mesh = new Mesh(
        geometryForVisual(entity.visual, this.#scope),
        materialForVisual(entity.visual, this.#scope)
      );
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      group.add(mesh);
    }
    if (entity.collider !== undefined) {
      const overlay = new Mesh(
        geometryForCollider(entity.collider, this.#scope),
        this.#scope.material(
          new MeshBasicMaterial({
            color: entity.intentionallyMismatched
              ? "#ff477e"
              : entity.authority === "dynamic"
                ? "#32e6ff"
                : entity.authority === "assist"
                  ? "#68f5aa"
                  : "#ffe08a",
            wireframe: true,
            transparent: true,
            opacity: entity.intentionallyMismatched ? 0.9 : 0.3,
            depthTest: false
          })
        )
      );
      overlay.renderOrder = 10;
      group.add(overlay);
      this.#colliderOverlays.push(overlay);
    }
    if (entity.body.kind === "dynamic") {
      const centerOfMass = new Mesh(
        this.#scope.geometry(new SphereGeometry(0.07, 10, 6)),
        this.#scope.material(
          new MeshBasicMaterial({
            color: "#fff06a",
            wireframe: true,
            depthTest: false
          })
        )
      );
      centerOfMass.renderOrder = 11;
      group.add(centerOfMass);
      this.#colliderOverlays.push(centerOfMass);
    }
    group.position.set(
      entity.body.translation.x,
      entity.body.translation.y,
      entity.body.translation.z
    );
    group.quaternion.set(
      entity.body.rotation.x,
      entity.body.rotation.y,
      entity.body.rotation.z,
      entity.body.rotation.w
    );
    this.#presentationRoot.add(group);
    this.#meshById.set(entity.id, group);
  }

  #createGoal(level: LevelDefinition): void {
    if (level.goal === null) {
      return;
    }
    const goal = level.goal;
    const geometry = this.#scope.geometry(
      new BoxGeometry(goal.halfExtents.x * 2, goal.halfExtents.y * 2, goal.halfExtents.z * 2)
    );
    const edges = new LineSegments(
      this.#scope.geometry(new EdgesGeometry(geometry)),
      this.#scope.material(
        new LineBasicMaterial({ color: "#68f5aa", transparent: true, opacity: 0.75 })
      )
    );
    edges.position.set(goal.center.x, goal.center.y, goal.center.z);
    this.#presentationRoot.add(edges);
  }

  #createJointMarkers(level: LevelDefinition): void {
    const entities = new Map(level.entities.map((entity) => [entity.id, entity]));
    for (const joint of level.joints) {
      const entity = entities.get(joint.bodyA);
      if (entity === undefined) {
        continue;
      }
      const marker = new Mesh(
        this.#scope.geometry(new TorusGeometry(0.22, 0.045, 8, 24)),
        this.#scope.material(new MeshBasicMaterial({ color: "#ffe08a" }))
      );
      marker.position.set(
        entity.body.translation.x + joint.anchorA.x,
        entity.body.translation.y + joint.anchorA.y,
        entity.body.translation.z + joint.anchorA.z
      );
      this.#presentationRoot.add(marker);
    }
  }

  #applyDebugVisibility(): void {
    for (const overlay of this.#colliderOverlays) {
      overlay.visible = this.#debugVisible;
    }
  }

  #createContactLines(): void {
    const geometry = this.#scope.geometry(new BufferGeometry());
    const positions = new BufferAttribute(new Float32Array(MAXIMUM_CONTACT_LINES * 2 * 3), 3);
    positions.setUsage(DynamicDrawUsage);
    geometry.setAttribute("position", positions);
    geometry.setDrawRange(0, 0);
    this.#contactLines = new LineSegments(
      geometry,
      this.#scope.material(
        new LineBasicMaterial({
          color: "#ff9c66",
          transparent: true,
          opacity: 0.95,
          depthTest: false
        })
      )
    );
    this.#contactLines.renderOrder = 12;
    this.#presentationRoot.add(this.#contactLines);
    this.#colliderOverlays.push(this.#contactLines);
  }

  #updateContactLines(snapshot: SimulationSnapshot): void {
    if (this.#contactLines === null) {
      return;
    }
    const attribute = this.#contactLines.geometry.getAttribute("position");
    if (!(attribute instanceof BufferAttribute)) {
      return;
    }
    const bodies = new Map(snapshot.bodies.map((body) => [body.id, body]));
    let lineCount = 0;
    for (const contact of snapshot.debugContacts.slice(0, MAXIMUM_CONTACT_LINES)) {
      const body = bodies.get(contact.entityA);
      if (body === undefined) {
        continue;
      }
      const length = Math.min(1.2, 0.18 + contact.impulse * 0.08);
      const offset = lineCount * 6;
      attribute.array[offset] = body.translation.x;
      attribute.array[offset + 1] = body.translation.y;
      attribute.array[offset + 2] = body.translation.z;
      attribute.array[offset + 3] = body.translation.x + contact.direction.x * length;
      attribute.array[offset + 4] = body.translation.y + contact.direction.y * length;
      attribute.array[offset + 5] = body.translation.z + contact.direction.z * length;
      lineCount += 1;
    }
    attribute.needsUpdate = true;
    this.#contactLines.geometry.setDrawRange(0, lineCount * 2);
    this.#contactLines.visible = this.#debugVisible && lineCount > 0;
  }

  #assertOpen(): void {
    if (this.#disposed) {
      throw new Error("Renderer is disposed.");
    }
  }
}
