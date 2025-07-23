# @nova-engine/render-three

Three.js rendering adapter for Nova Engine - A powerful ECS-based game engine.

## 🚀 Features

- **ECS Integration**: Seamless integration with Nova ECS system
- **Advanced Materials**: Comprehensive material system with presets
- **Rich Geometries**: Support for all Three.js geometry types with presets
- **Professional Lighting**: Studio-quality lighting setups
- **Flexible Cameras**: Multiple camera types with cinematic presets
- **Editor Bridge**: Direct integration with Nova Editor
- **Performance Optimized**: Efficient rendering with caching and culling

## 📦 Installation

```bash
npm install @nova-engine/render-three three @react-three/fiber
```

## 🔧 Quick Start

### Basic Setup

```typescript
import { World } from '@esengine/nova-ecs';
import { ThreeRenderSystem, ThreeEditorBridge } from '@nova-engine/render-three';

// Create ECS world
const world = new World();

// Create Three.js canvas
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Setup Three.js rendering
const bridge = new ThreeEditorBridge(world, canvas);

// Add default lighting
bridge.addDefaultLighting();

// Create an entity with rendering
const entity = world.createEntity();
entity.addComponent('TransformComponent', {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
});

// Convert to Three.js renderable
bridge.convertEntityToThreeJS(entity, 'DefaultMaterial', 'box');

// Start the render loop
function animate() {
  world.update(16); // 60 FPS
  requestAnimationFrame(animate);
}
animate();
```

### Using Components Directly

```typescript
import {
  ThreeMeshComponent,
  ThreeMaterialComponent,
  ThreeGeometryComponent
} from '@nova-engine/render-three';

// Create entity with Three.js components
const entity = world.createEntity();
entity.addComponent('TransformComponent', { /* transform data */ });
entity.addComponent(new ThreeMeshComponent());
entity.addComponent(new ThreeMaterialComponent({
  materialType: 'standard',
  color: '#4CAF50',
  metalness: 0.8,
  roughness: 0.2
}));
entity.addComponent(new ThreeGeometryComponent('sphere', {
  radius: 0.5,
  widthSegments: 32,
  heightSegments: 16
}));
```

## 🎨 Material System

### Predefined Materials

```typescript
import { MaterialPresets, MaterialFactory } from '@nova-engine/render-three';

// Use predefined materials
const goldMaterial = MaterialFactory.createMaterial(MaterialPresets.Gold);
const glassMaterial = MaterialFactory.createMaterial(MaterialPresets.Glass);
const neonMaterial = MaterialFactory.createMaterial(MaterialPresets.Neon);

// Available categories
const categories = MaterialUtils.getMaterialsByCategory();
console.log(categories);
// {
//   'Basic': ['Default', 'White', 'Black'],
//   'Metal': ['Steel', 'Gold', 'Copper'],
//   'Glass': ['Glass', 'TintedGlass'],
//   ...
// }
```

### Custom Materials

```typescript
import { MaterialFactory, MaterialConfig } from '@nova-engine/render-three';

const customMaterial: MaterialConfig = {
  type: 'physical',
  color: '#FF6B6B',
  metalness: 0.9,
  roughness: 0.1,
  transmission: 0.8,
  thickness: 0.5,
  ior: 1.45
};

const material = MaterialFactory.createMaterial(customMaterial);
```

## 🔷 Geometry System

### Predefined Geometries

```typescript
import { GeometryPresets, GeometryFactory } from '@nova-engine/render-three';

// Use predefined geometries
const sphereGeom = GeometryFactory.createGeometry(GeometryPresets.Sphere);
const torusKnotGeom = GeometryFactory.createGeometry(GeometryPresets.TorusKnot);

// Available categories
const categories = GeometryUtils.getGeometryCategories();
console.log(categories);
// {
//   'Basic': ['Cube', 'Sphere', 'Plane', 'Cylinder', 'Cone'],
//   'Advanced': ['Torus', 'TorusKnot', 'Capsule'],
//   ...
// }
```

### Custom Geometries

```typescript
import { GeometryFactory, GeometryConfig } from '@nova-engine/render-three';

const customGeometry: GeometryConfig = {
  type: 'cylinder',
  radiusTop: 0.3,
  radiusBottom: 0.7,
  height: 2.0,
  radialSegments: 16,
  heightSegments: 4
};

const geometry = GeometryFactory.createGeometry(customGeometry);
```

## 💡 Lighting System

### Lighting Setups

```typescript
import { LightUtils, LightingSetups } from '@nova-engine/render-three';

// Create complete lighting setup
const lights = LightUtils.createLightingSetup('ThreePoint');
lights.forEach(light => scene.add(light));

// Available setups
console.log(Object.keys(LightingSetups));
// ['ThreePoint', 'Natural', 'Night', 'Indoor', 'Dramatic']
```

### Custom Lighting

```typescript
import { LightFactory, LightConfig } from '@nova-engine/render-three';

const studioLight: LightConfig = {
  type: 'directional',
  color: '#ffffff',
  intensity: 1.2,
  position: { x: 5, y: 10, z: 5 },
  castShadow: true,
  shadow: {
    mapSize: 2048,
    cameraSize: 15
  }
};

const light = LightFactory.createLight(studioLight);
```

## 📷 Camera System

### Camera Presets

```typescript
import { CameraUtils, CameraPresets } from '@nova-engine/render-three';

// Create camera from preset
const camera = CameraUtils.createFromPreset('ThirdPerson');

// Animate between camera positions
CameraUtils.animateCamera(
  camera,
  CameraPresets.DefaultPerspective,
  CameraPresets.ThirdPerson,
  2000,
  () => console.log('Animation complete')
);
```

### Camera Animations

```typescript
import { CameraAnimations } from '@nova-engine/render-three';

// Available animations
console.log(Object.keys(CameraAnimations));
// ['OrbitAround', 'ZoomIn', 'Flythrough', 'Reveal']
```

## 🔧 Editor Integration

### With Nova Editor

```typescript
import { ThreeEditorBridge, EntityConverter } from '@nova-engine/render-three';

// Convert legacy entities to Three.js components
EntityConverter.convertAllEntities(world);

// Create editor bridge
const bridge = new ThreeEditorBridge(world, canvas);

// Access Three.js objects directly
const scene = bridge.getScene();
const renderer = bridge.getRenderer();
const camera = bridge.getCamera();

// Handle resize
bridge.resize(window.innerWidth, window.innerHeight);
```

## 📋 Component Reference

### ThreeMeshComponent
- `mesh: THREE.Mesh | null` - Three.js mesh instance
- `needsUpdate: boolean` - Update flag

### ThreeMaterialComponent
- `materialType: string` - Material type (standard, basic, phong, etc.)
- `color: string` - Base color
- `metalness: number` - Metalness value (0-1)
- `roughness: number` - Roughness value (0-1)
- `emissive: string` - Emissive color
- `transparent: boolean` - Transparency flag
- `opacity: number` - Opacity value (0-1)

### ThreeGeometryComponent
- `geometryType: string` - Geometry type
- `parameters: Record<string, number>` - Geometry parameters

### ThreeLightComponent
- `lightType: string` - Light type (ambient, directional, point, etc.)
- `color: string` - Light color
- `intensity: number` - Light intensity
- `castShadow: boolean` - Shadow casting flag

### ThreeCameraComponent
- `cameraType: string` - Camera type (perspective, orthographic)
- `fov: number` - Field of view (perspective)
- `aspect: number` - Aspect ratio
- `near: number` - Near clipping plane
- `far: number` - Far clipping plane

## 🎯 Performance Tips

1. **Use Geometry Caching**: The system automatically caches geometries
2. **Optimize Materials**: Use simple materials for distant objects
3. **Shadow Management**: Limit shadow-casting lights
4. **LOD System**: Implement level-of-detail for complex scenes
5. **Frustum Culling**: The system automatically culls off-screen objects

## 🔗 Related Packages

- `@nova-engine/core` - Core ECS system
- `@nova-engine/math` - Mathematical utilities
- `@nova-engine/physics-core` - Physics abstraction
- `@nova-engine/audio-core` - Audio system

## 📄 License

MIT - See LICENSE file for details.

---

**Built with ❤️ for the Nova Engine ecosystem**