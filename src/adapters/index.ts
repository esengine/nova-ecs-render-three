/**
 * Three.js Editor Adapters
 * Three.js编辑器适配器 - 连接编辑器与Three.js渲染系统
 */

import { World, Entity, Component } from '@esengine/nova-ecs';
import { ThreeRenderSystem } from '../systems';
import {
  ThreeMeshComponent,
  ThreeMaterialComponent,
  ThreeGeometryComponent,
  ThreeLightComponent,
  TransformComponent
} from '../components';

// MeshRendererComponent for compatibility
export class MeshRendererComponent extends Component {
  constructor(
    public material: string = 'DefaultMaterial',
    public castShadows: boolean = true,
    public receiveShadows: boolean = true,
    public meshType: 'box' | 'sphere' | 'plane' | 'custom' = 'box'
  ) {
    super();
  }
}

/**
 * Editor Bridge for Three.js integration
 * 编辑器桥接器 - 用于Three.js集成
 */
export class ThreeEditorBridge {
  private world: World;
  private renderSystem: ThreeRenderSystem;

  constructor(world: World, canvas: HTMLCanvasElement) {
    this.world = world;
    this.renderSystem = new ThreeRenderSystem({ canvas });
    
    // Add render system to world
    this.world.addSystem(this.renderSystem);
  }

  /**
   * Convert standard ECS entity to Three.js renderable entity
   * 将标准ECS实体转换为Three.js可渲染实体
   */
  convertEntityToThreeJS(entity: Entity, materialName?: string, geometryType?: string): void {
    // Add Three.js mesh component
    const meshComponent = new ThreeMeshComponent();
    entity.addComponent(meshComponent);

    // Add material component based on material name
    if (materialName) {
      const materialComponent = this.createMaterialFromName(materialName);
      entity.addComponent(materialComponent);
    } else {
      // Default material
      const materialComponent = new ThreeMaterialComponent({
        materialType: 'standard',
        color: '#4CAF50',
        metalness: 0.2,
        roughness: 0.8
      });
      entity.addComponent(materialComponent);
    }

    // Add geometry component based on geometry type
    if (geometryType) {
      const geometryComponent = this.createGeometryFromType(geometryType);
      entity.addComponent(geometryComponent);
    } else {
      // Default geometry
      const geometryComponent = new ThreeGeometryComponent('box', {
        width: 1,
        height: 1,
        depth: 1
      });
      entity.addComponent(geometryComponent);
    }
  }

  /**
   * Create material component from material name
   * 根据材质名称创建材质组件
   */
  private createMaterialFromName(materialName: string): ThreeMaterialComponent {
    const materialConfigs: Record<string, Partial<ThreeMaterialComponent>> = {
      'DefaultMaterial': {
        materialType: 'standard',
        color: '#4CAF50',
        metalness: 0.2,
        roughness: 0.8
      },
      'MetalMaterial': {
        materialType: 'standard',
        color: '#9E9E9E',
        metalness: 0.9,
        roughness: 0.1
      },
      'PlasticMaterial': {
        materialType: 'standard',
        color: '#2196F3',
        metalness: 0.0,
        roughness: 0.9
      },
      'GlassMaterial': {
        materialType: 'physical',
        color: '#E3F2FD',
        metalness: 0.0,
        roughness: 0.0,
        transparent: true,
        opacity: 0.3
      },
      'EnemyMaterial': {
        materialType: 'standard',
        color: '#F44336',
        metalness: 0.3,
        roughness: 0.7
      },
      'GroundMaterial': {
        materialType: 'standard',
        color: '#795548',
        metalness: 0.1,
        roughness: 0.9
      },
      'WireframeMaterial': {
        materialType: 'wireframe',
        color: '#FFC107',
        wireframe: true
      },
      'EmissiveMaterial': {
        materialType: 'standard',
        color: '#000000',
        emissive: '#FF5722',
        emissiveIntensity: 0.5,
        metalness: 0.0,
        roughness: 1.0
      }
    };

    const config = materialConfigs[materialName] || materialConfigs['DefaultMaterial'];
    return new ThreeMaterialComponent(config);
  }

  /**
   * Create geometry component from geometry type
   * 根据几何体类型创建几何体组件
   */
  private createGeometryFromType(geometryType: string): ThreeGeometryComponent {
    const geometryConfigs: Record<string, { type: string; parameters: Record<string, number> }> = {
      'box': {
        type: 'box',
        parameters: { width: 1, height: 1, depth: 1 }
      },
      'sphere': {
        type: 'sphere',
        parameters: { radius: 0.5, widthSegments: 16, heightSegments: 12 }
      },
      'plane': {
        type: 'plane',
        parameters: { width: 1, height: 1 }
      },
      'cylinder': {
        type: 'cylinder',
        parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 8 }
      },
      'cone': {
        type: 'cone',
        parameters: { radius: 0.5, height: 1, radialSegments: 8 }
      },
      'torus': {
        type: 'torus',
        parameters: { radius: 0.4, tube: 0.2, radialSegments: 8, tubularSegments: 6 }
      }
    };

    const config = geometryConfigs[geometryType] || geometryConfigs['box'];
    return new ThreeGeometryComponent(config.type, config.parameters);
  }

  /**
   * Add default lighting to scene
   * 为场景添加默认光照
   */
  addDefaultLighting(): void {
    // Ambient light
    const ambientLight = this.world.createEntity();
    ambientLight.addComponent(new TransformComponent());
    ambientLight.addComponent(new ThreeLightComponent({
      lightType: 'ambient',
      color: '#404040',
      intensity: 0.3
    }));

    // Main directional light
    const mainLight = this.world.createEntity();
    mainLight.addComponent(new TransformComponent(
      { x: 10, y: 10, z: 5 },
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    ));
    mainLight.addComponent(new ThreeLightComponent({
      lightType: 'directional',
      color: '#ffffff',
      intensity: 1.0,
      castShadow: true
    }));

    // Fill light
    const fillLight = this.world.createEntity();
    fillLight.addComponent(new TransformComponent(
      { x: -5, y: 5, z: -5 },
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    ));
    fillLight.addComponent(new ThreeLightComponent({
      lightType: 'directional',
      color: '#4080ff',
      intensity: 0.3
    }));

    // Point light for atmosphere
    const pointLight = this.world.createEntity();
    pointLight.addComponent(new TransformComponent(
      { x: 0, y: 5, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    ));
    pointLight.addComponent(new ThreeLightComponent({
      lightType: 'point',
      color: '#ff8040',
      intensity: 0.2
    }));
  }

  /**
   * Get the Three.js renderer for external use
   * 获取Three.js渲染器供外部使用
   */
  getRenderer(): ThreeRenderSystem {
    return this.renderSystem;
  }

  /**
   * Get the Three.js scene for external access
   * 获取Three.js场景供外部访问
   */
  getScene() {
    return this.renderSystem.scene;
  }

  /**
   * Get the Three.js camera
   * 获取Three.js相机
   */
  getCamera() {
    return this.renderSystem.camera;
  }

  /**
   * Resize the renderer
   * 调整渲染器大小
   */
  resize(width: number, height: number): void {
    this.renderSystem.setSize(width, height);
  }


  /**
   * Dispose of resources
   * 释放资源
   */
  dispose(): void {
    this.renderSystem.dispose();
  }
}

/**
 * Entity conversion utilities
 * 实体转换工具
 */
export class EntityConverter {
  /**
   * Convert legacy mesh renderer component to Three.js components
   * 将旧版网格渲染器组件转换为Three.js组件
   */
  static convertMeshRenderer(entity: Entity, meshRenderer: any): void {
    // Remove old component
    entity.removeComponent(MeshRendererComponent);

    // Add Three.js components
    entity.addComponent(new ThreeMeshComponent());
    
    entity.addComponent(new ThreeMaterialComponent({
      materialType: 'standard',
      color: meshRenderer.material === 'EnemyMaterial' ? '#F44336' : 
             meshRenderer.material === 'GroundMaterial' ? '#795548' : '#4CAF50',
      metalness: 0.2,
      roughness: 0.8
    }));

    entity.addComponent(new ThreeGeometryComponent(
      meshRenderer.meshType || 'box',
      meshRenderer.meshType === 'sphere' ? { radius: 0.5, widthSegments: 16, heightSegments: 12 } :
      meshRenderer.meshType === 'plane' ? { width: 1, height: 1 } :
      { width: 1, height: 1, depth: 1 }
    ));
  }

  /**
   * Batch convert all entities in world
   * 批量转换世界中的所有实体
   */
  static convertAllEntities(world: World): void {
    const entities = world.entities;
    
    for (const entity of entities) {
      const meshRenderer = entity.getComponent(MeshRendererComponent);
      if (meshRenderer) {
        this.convertMeshRenderer(entity, meshRenderer);
      }
    }
  }
}