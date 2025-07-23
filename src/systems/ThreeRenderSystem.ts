/**
 * Three.js Rendering System
 * Three.js渲染系统 - 基于ECS架构的Three.js渲染管理
 * 
 * This system manages the rendering of 3D objects using Three.js library.
 * It processes entities with Transform and Three.js components to create
 * and update 3D meshes, lights, and cameras in the scene.
 * 
 * 该系统使用Three.js库管理3D对象的渲染。
 * 它处理具有Transform和Three.js组件的实体，在场景中创建和更新3D网格、灯光和相机。
 * 
 * @example
 * ```typescript
 * const renderSystem = new ThreeRenderSystem(canvas);
 * world.addSystem(renderSystem);
 * 
 * const entity = world.createEntity()
 *   .addComponent(new TransformComponent())
 *   .addComponent(new ThreeMeshComponent())
 *   .addComponent(new ThreeMaterialComponent());
 * ```
 */

import { System, World, Entity } from '@esengine/nova-ecs';
import * as THREE from 'three';
import {
  ThreeMeshComponent,
  ThreeMaterialComponent,
  ThreeGeometryComponent,
  ThreeLightComponent,
  ThreeCameraComponent,
  TransformComponent
} from '../components';

/**
 * Three.js渲染系统配置选项
 * Three.js rendering system configuration options
 */
export interface ThreeRenderSystemOptions {
  /** Canvas element for rendering 用于渲染的Canvas元素 */
  canvas?: HTMLCanvasElement;
  /** Enable shadows 启用阴影 */
  enableShadows?: boolean;
  /** Shadow map size 阴影贴图大小 */
  shadowMapSize?: number;
  /** Background color 背景颜色 */
  backgroundColor?: number;
  /** Enable antialiasing 启用抗锯齿 */
  antialias?: boolean;
}

/**
 * Three.js Rendering System
 * Three.js渲染系统
 */
export class ThreeRenderSystem extends System {
  // 公共属性
  public readonly scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public camera!: THREE.Camera;

  // 私有属性
  private readonly _options: Required<ThreeRenderSystemOptions>;
  private _isInitialized = false;
  private _frameCount = 0;

  // 常量
  private static readonly DEFAULT_OPTIONS: Required<ThreeRenderSystemOptions> = {
    canvas: undefined as any,
    enableShadows: true,
    shadowMapSize: 2048,
    backgroundColor: 0x1a1a1a,
    antialias: true
  };

  /**
   * Initialize the Three.js rendering system
   * 初始化Three.js渲染系统
   * 
   * @param options - Configuration options 配置选项
   */
  constructor(options: ThreeRenderSystemOptions = {}) {
    // 不指定required components，因为系统需要查询多种组件类型
    super();
    
    this._options = { ...ThreeRenderSystem.DEFAULT_OPTIONS, ...options };
    
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this._options.backgroundColor);
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this._options.canvas,
      antialias: this._options.antialias,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    });
    
    this._setupRenderer();
    this._setupDefaultCamera();
    this._setupWebGLContextHandlers();
  }

  /**
   * System added to world lifecycle hook
   * 系统添加到世界的生命周期钩子
   */
  onAddedToWorld(world: World): void {
    super.onAddedToWorld(world);
    
    this._isInitialized = true;
    console.log('ThreeRenderSystem: Added to world and initialized');
  }

  /**
   * Set canvas for the renderer
   * 为渲染器设置画布
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    if (this.renderer && this.renderer.domElement !== canvas) {
      // Dispose old renderer and create new one with the new canvas
      this.renderer.dispose();
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: this._options.antialias,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
      });
      this._setupRenderer();
      this._setupWebGLContextHandlers();
    }
  }

  /**
   * System removed from world lifecycle hook
   * 系统从世界移除的生命周期钩子
   */
  onRemovedFromWorld(): void {
    this._cleanup();
    this._isInitialized = false;
    
    super.onRemovedFromWorld();
    console.log('ThreeRenderSystem: Removed from world and cleaned up');
  }

  /**
   * Update all renderable entities
   * 更新所有可渲染实体
   * 
   * @param entities - Entities passed by the ECS framework (unused in this system)
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  update(entities: Entity[], deltaTime: number): void {
    if (!this._isInitialized || !this.world) {
      return;
    }

    try {
      this._frameCount++;
      
      // Process different types of entities
      this._processMeshEntities();
      this._processLightEntities();
      this._processCameraEntities();
      
      // Render the scene
      this._render();
      
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.update:`, error);
      throw error;
    }
  }

  /**
   * Set renderer size
   * 设置渲染器大小
   */
  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Get render statistics
   * 获取渲染统计信息
   */
  getStatistics(): { frameCount: number; meshCount: number; lightCount: number } {
    let meshCount = 0;
    let lightCount = 0;
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) meshCount++;
      if (object instanceof THREE.Light) lightCount++;
    });

    return {
      frameCount: this._frameCount,
      meshCount,
      lightCount
    };
  }

  // Private methods

  /**
   * Setup renderer configuration
   * 设置渲染器配置
   */
  private _setupRenderer(): void {
    this.renderer.setSize(800, 600);
    
    if (this._options.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  /**
   * Setup default camera
   * 设置默认相机
   */
  private _setupDefaultCamera(): void {
    this.camera = new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Setup WebGL context handlers
   * 设置WebGL上下文处理器
   */
  private _setupWebGLContextHandlers(): void {
    if (!this.renderer.domElement) return;

    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      console.warn('WebGL context lost');
      event.preventDefault();
    });

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // Reinitialize if needed
    });
  }

  /**
   * Process entities with mesh components
   * 处理具有网格组件的实体
   */
  private _processMeshEntities(): void {
    if (!this.world) return;

    // Query entities with required components for meshes
    const meshEntities = this.world.entities.filter(entity => 
      entity.active && 
      entity.hasComponent(TransformComponent) && 
      entity.hasComponent(ThreeMeshComponent)
    );

    for (const entity of meshEntities) {
      this._processMeshEntity(entity);
    }
  }

  /**
   * Process entities with light components
   * 处理具有灯光组件的实体
   */
  private _processLightEntities(): void {
    if (!this.world) return;

    const lightEntities = this.world.entities.filter(entity => 
      entity.active && 
      entity.hasComponent(TransformComponent) && 
      entity.hasComponent(ThreeLightComponent)
    );

    for (const entity of lightEntities) {
      this._processLightEntity(entity);
    }
  }

  /**
   * Process entities with camera components
   * 处理具有相机组件的实体
   */
  private _processCameraEntities(): void {
    if (!this.world) return;

    const cameraEntities = this.world.entities.filter(entity => 
      entity.active && 
      entity.hasComponent(TransformComponent) && 
      entity.hasComponent(ThreeCameraComponent)
    );

    // Use first active camera entity
    if (cameraEntities.length > 0) {
      this._processCameraEntity(cameraEntities[0]);
    }
  }

  /**
   * Process individual mesh entity
   * 处理单个网格实体
   */
  private _processMeshEntity(entity: Entity): void {
    const transform = entity.getComponent(TransformComponent);
    const meshComp = entity.getComponent(ThreeMeshComponent);
    const materialComp = entity.getComponent(ThreeMaterialComponent);
    const geometryComp = entity.getComponent(ThreeGeometryComponent);

    if (!transform || !meshComp) return;

    try {
      // Create mesh if it doesn't exist
      if (!meshComp.mesh) {
        this._createMesh(entity, meshComp, materialComp, geometryComp);
      }

      // Update mesh transform
      if (meshComp.mesh) {
        this._updateMeshTransform(meshComp.mesh, transform);
        
        // Update material if needed
        if (materialComp?.needsUpdate) {
          this._updateMeshMaterial(meshComp.mesh, materialComp);
          materialComp.needsUpdate = false;
        }
        
        // Update geometry if needed
        if (geometryComp?.needsUpdate) {
          this._updateMeshGeometry(meshComp.mesh, geometryComp);
          geometryComp.needsUpdate = false;
        }
      }
    } catch (error) {
      console.error(`Error processing mesh entity ${entity.id}:`, error);
    }
  }

  /**
   * Process individual light entity
   * 处理单个灯光实体
   */
  private _processLightEntity(entity: Entity): void {
    const transform = entity.getComponent(TransformComponent);
    const lightComp = entity.getComponent(ThreeLightComponent);

    if (!transform || !lightComp) return;

    try {
      // Create light if it doesn't exist
      if (!lightComp.light) {
        this._createLight(lightComp);
      }

      // Update light transform and properties
      if (lightComp.light) {
        this._updateLightTransform(lightComp.light, transform);
        
        if (lightComp.needsUpdate) {
          this._updateLightProperties(lightComp);
          lightComp.needsUpdate = false;
        }
      }
    } catch (error) {
      console.error(`Error processing light entity ${entity.id}:`, error);
    }
  }

  /**
   * Process individual camera entity
   * 处理单个相机实体
   */
  private _processCameraEntity(entity: Entity): void {
    const transform = entity.getComponent(TransformComponent);
    const cameraComp = entity.getComponent(ThreeCameraComponent);

    if (!transform || !cameraComp) return;

    try {
      // Create camera if it doesn't exist
      if (!cameraComp.camera) {
        this._createCamera(cameraComp);
      }

      // Update camera transform
      if (cameraComp.camera) {
        this._updateCameraTransform(cameraComp.camera, transform);
        
        // Use this camera for rendering
        this.camera = cameraComp.camera;
      }
    } catch (error) {
      console.error(`Error processing camera entity ${entity.id}:`, error);
    }
  }

  /**
   * Create Three.js mesh from components
   * 从组件创建Three.js网格
   */
  private _createMesh(
    entity: Entity, 
    meshComp: ThreeMeshComponent,
    materialComp?: ThreeMaterialComponent,
    geometryComp?: ThreeGeometryComponent
  ): void {
    const geometry = this._createGeometry(geometryComp);
    const material = this._createMaterial(materialComp);
    
    meshComp.mesh = new THREE.Mesh(geometry, material);
    meshComp.mesh.castShadow = true;
    meshComp.mesh.receiveShadow = true;
    meshComp.mesh.userData = { entityId: entity.id };
    
    this.scene.add(meshComp.mesh);
  }

  /**
   * Create Three.js geometry from component
   * 从组件创建Three.js几何体
   */
  private _createGeometry(geometryComp?: ThreeGeometryComponent): THREE.BufferGeometry {
    if (!geometryComp) {
      return new THREE.BoxGeometry(1, 1, 1);
    }

    const { geometryType, parameters } = geometryComp;
    
    switch (geometryType) {
      case 'box':
        return new THREE.BoxGeometry(
          parameters.width || 1,
          parameters.height || 1,
          parameters.depth || 1
        );
      case 'sphere':
        return new THREE.SphereGeometry(
          parameters.radius || 0.5,
          parameters.widthSegments || 16,
          parameters.heightSegments || 12
        );
      case 'plane':
        return new THREE.PlaneGeometry(
          parameters.width || 1,
          parameters.height || 1
        );
      case 'cylinder':
        return new THREE.CylinderGeometry(
          parameters.radiusTop || 0.5,
          parameters.radiusBottom || 0.5,
          parameters.height || 1,
          parameters.radialSegments || 8
        );
      case 'cone':
        return new THREE.ConeGeometry(
          parameters.radius || 0.5,
          parameters.height || 1,
          parameters.radialSegments || 8
        );
      case 'torus':
        return new THREE.TorusGeometry(
          parameters.radius || 0.4,
          parameters.tube || 0.2,
          parameters.radialSegments || 8,
          parameters.tubularSegments || 6
        );
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  /**
   * Create Three.js material from component
   * 从组件创建Three.js材质
   */
  private _createMaterial(materialComp?: ThreeMaterialComponent): THREE.Material {
    if (!materialComp) {
      return new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    }

    const config = {
      color: new THREE.Color(materialComp.color),
      transparent: materialComp.transparent,
      opacity: materialComp.opacity,
      wireframe: materialComp.wireframe
    };

    switch (materialComp.materialType) {
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...config,
          metalness: materialComp.metalness,
          roughness: materialComp.roughness,
          emissive: new THREE.Color(materialComp.emissive),
          emissiveIntensity: materialComp.emissiveIntensity
        });
      case 'basic':
        return new THREE.MeshBasicMaterial(config);
      case 'phong':
        return new THREE.MeshPhongMaterial({
          ...config,
          shininess: (1.0 - materialComp.roughness) * 100
        });
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          ...config,
          metalness: materialComp.metalness,
          roughness: materialComp.roughness,
          emissive: new THREE.Color(materialComp.emissive),
          emissiveIntensity: materialComp.emissiveIntensity
        });
      case 'wireframe':
        return new THREE.MeshBasicMaterial({
          ...config,
          wireframe: true
        });
      default:
        return new THREE.MeshStandardMaterial(config);
    }
  }

  /**
   * Create Three.js light from component
   * 从组件创建Three.js灯光
   */
  private _createLight(lightComp: ThreeLightComponent): void {
    switch (lightComp.lightType) {
      case 'ambient':
        lightComp.light = new THREE.AmbientLight(lightComp.color, lightComp.intensity);
        break;
      case 'directional':
        lightComp.light = new THREE.DirectionalLight(lightComp.color, lightComp.intensity);
        if (this._options.enableShadows) {
          (lightComp.light as THREE.DirectionalLight).castShadow = lightComp.castShadow;
        }
        break;
      case 'point':
        lightComp.light = new THREE.PointLight(lightComp.color, lightComp.intensity);
        if (this._options.enableShadows) {
          (lightComp.light as THREE.PointLight).castShadow = lightComp.castShadow;
        }
        break;
      case 'spot':
        lightComp.light = new THREE.SpotLight(lightComp.color, lightComp.intensity);
        if (this._options.enableShadows) {
          (lightComp.light as THREE.SpotLight).castShadow = lightComp.castShadow;
        }
        break;
      case 'hemisphere':
        lightComp.light = new THREE.HemisphereLight(lightComp.color, '#404040', lightComp.intensity);
        break;
      default:
        lightComp.light = new THREE.DirectionalLight(lightComp.color, lightComp.intensity);
    }
    
    this.scene.add(lightComp.light);
  }

  /**
   * Create Three.js camera from component
   * 从组件创建Three.js相机
   */
  private _createCamera(cameraComp: ThreeCameraComponent): void {
    if (cameraComp.cameraType === 'perspective') {
      cameraComp.camera = new THREE.PerspectiveCamera(
        cameraComp.fov,
        cameraComp.aspect,
        cameraComp.near,
        cameraComp.far
      );
    } else {
      const size = 10;
      cameraComp.camera = new THREE.OrthographicCamera(
        -size * cameraComp.aspect,
        size * cameraComp.aspect,
        size,
        -size,
        cameraComp.near,
        cameraComp.far
      );
    }
  }

  /**
   * Update mesh transform from component
   * 从组件更新网格变换
   */
  private _updateMeshTransform(mesh: THREE.Mesh, transform: TransformComponent): void {
    mesh.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );
    mesh.rotation.set(
      transform.rotation.x * Math.PI / 180,
      transform.rotation.y * Math.PI / 180,
      transform.rotation.z * Math.PI / 180
    );
    mesh.scale.set(
      transform.scale.x,
      transform.scale.y,
      transform.scale.z
    );
  }

  /**
   * Update light transform from component
   * 从组件更新灯光变换
   */
  private _updateLightTransform(light: THREE.Light, transform: TransformComponent): void {
    light.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );
  }

  /**
   * Update camera transform from component
   * 从组件更新相机变换
   */
  private _updateCameraTransform(camera: THREE.Camera, transform: TransformComponent): void {
    camera.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );
    camera.rotation.set(
      transform.rotation.x * Math.PI / 180,
      transform.rotation.y * Math.PI / 180,
      transform.rotation.z * Math.PI / 180
    );
  }

  /**
   * Update mesh material
   * 更新网格材质
   */
  private _updateMeshMaterial(mesh: THREE.Mesh, materialComp: ThreeMaterialComponent): void {
    const newMaterial = this._createMaterial(materialComp);
    
    // Dispose old material
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    
    mesh.material = newMaterial;
  }

  /**
   * Update mesh geometry
   * 更新网格几何体
   */
  private _updateMeshGeometry(mesh: THREE.Mesh, geometryComp: ThreeGeometryComponent): void {
    const newGeometry = this._createGeometry(geometryComp);
    
    // Dispose old geometry
    mesh.geometry.dispose();
    mesh.geometry = newGeometry;
  }

  /**
   * Update light properties
   * 更新灯光属性
   */
  private _updateLightProperties(lightComp: ThreeLightComponent): void {
    if (!lightComp.light) return;

    lightComp.light.color.setHex(parseInt(lightComp.color.replace('#', '0x')));
    lightComp.light.intensity = lightComp.intensity;
    
    if ('castShadow' in lightComp.light) {
      (lightComp.light as any).castShadow = lightComp.castShadow;
    }
  }

  /**
   * Render the scene
   * 渲染场景
   */
  private _render(): void {
    if (!this.renderer || !this.scene || !this.camera) {
      console.warn('ThreeRenderSystem: Missing renderer, scene, or camera');
      return;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Public render method for external use
   * 公共的渲染方法供外部调用
   */
  render(): void {
    this._render();
  }

  /**
   * Public dispose method for external cleanup
   * 公共的清理方法供外部调用
   */
  dispose(): void {
    this._cleanup();
  }

  /**
   * Cleanup resources
   * 清理资源
   */
  private _cleanup(): void {
    // Dispose of Three.js resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    
    // Clear scene
    while(this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    
    // Dispose renderer
    this.renderer.dispose();
  }
}