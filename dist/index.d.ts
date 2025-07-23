import { Component, System, World, Entity } from '@esengine/nova-ecs';
import * as THREE from 'three';

/**
 * Transform Component for Three.js Integration
 * Transform组件 - 用于Three.js集成
 */

declare class TransformComponent extends Component {
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    constructor(position?: {
        x: number;
        y: number;
        z: number;
    }, rotation?: {
        x: number;
        y: number;
        z: number;
    }, scale?: {
        x: number;
        y: number;
        z: number;
    });
}

/**
 * Three.js Mesh Component - holds reference to Three.js mesh
 * Three.js网格组件 - 持有Three.js网格的引用
 */

declare class ThreeMeshComponent extends Component {
    mesh: THREE.Mesh | null;
    needsUpdate: boolean;
    constructor(mesh?: THREE.Mesh);
    dispose(): void;
}

/**
 * Three.js Material Component - material configuration
 * Three.js材质组件 - 材质配置
 */

declare class ThreeMaterialComponent extends Component {
    materialType: 'standard' | 'basic' | 'phong' | 'physical' | 'wireframe';
    color: string;
    metalness: number;
    roughness: number;
    emissive: string;
    emissiveIntensity: number;
    transparent: boolean;
    opacity: number;
    wireframe: boolean;
    texture?: string;
    needsUpdate: boolean;
    constructor(config?: Partial<ThreeMaterialComponent>);
}

/**
 * Three.js Geometry Component - geometry configuration
 * Three.js几何体组件 - 几何体配置
 */

declare class ThreeGeometryComponent extends Component {
    geometryType: 'box' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus' | 'custom';
    parameters: Record<string, number>;
    needsUpdate: boolean;
    constructor(geometryType?: string, parameters?: Record<string, number>);
}

/**
 * Three.js Light Component - light configuration
 * Three.js光照组件 - 光照配置
 */

declare class ThreeLightComponent extends Component {
    lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
    color: string;
    intensity: number;
    castShadow: boolean;
    light: THREE.Light | null;
    needsUpdate: boolean;
    constructor(config?: Partial<ThreeLightComponent>);
}

/**
 * Three.js Camera Component - camera configuration
 * Three.js相机组件 - 相机配置
 */

declare class ThreeCameraComponent extends Component {
    cameraType: 'perspective' | 'orthographic';
    fov: number;
    aspect: number;
    near: number;
    far: number;
    camera: THREE.Camera | null;
    needsUpdate: boolean;
    constructor(config?: Partial<ThreeCameraComponent>);
}

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

/**
 * Three.js渲染系统配置选项
 * Three.js rendering system configuration options
 */
interface ThreeRenderSystemOptions {
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
declare class ThreeRenderSystem extends System {
    readonly scene: THREE.Scene;
    readonly renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    private readonly _options;
    private _isInitialized;
    private _frameCount;
    private static readonly DEFAULT_OPTIONS;
    /**
     * Initialize the Three.js rendering system
     * 初始化Three.js渲染系统
     *
     * @param options - Configuration options 配置选项
     */
    constructor(options?: ThreeRenderSystemOptions);
    /**
     * System added to world lifecycle hook
     * 系统添加到世界的生命周期钩子
     */
    onAddedToWorld(world: World): void;
    /**
     * System removed from world lifecycle hook
     * 系统从世界移除的生命周期钩子
     */
    onRemovedFromWorld(): void;
    /**
     * Update all renderable entities
     * 更新所有可渲染实体
     *
     * @param entities - Entities passed by the ECS framework (unused in this system)
     * @param deltaTime - Time elapsed since last update in milliseconds
     */
    update(entities: Entity[], deltaTime: number): void;
    /**
     * Set renderer size
     * 设置渲染器大小
     */
    setSize(width: number, height: number): void;
    /**
     * Get render statistics
     * 获取渲染统计信息
     */
    getStatistics(): {
        frameCount: number;
        meshCount: number;
        lightCount: number;
    };
    /**
     * Setup renderer configuration
     * 设置渲染器配置
     */
    private _setupRenderer;
    /**
     * Setup default camera
     * 设置默认相机
     */
    private _setupDefaultCamera;
    /**
     * Setup WebGL context handlers
     * 设置WebGL上下文处理器
     */
    private _setupWebGLContextHandlers;
    /**
     * Process entities with mesh components
     * 处理具有网格组件的实体
     */
    private _processMeshEntities;
    /**
     * Process entities with light components
     * 处理具有灯光组件的实体
     */
    private _processLightEntities;
    /**
     * Process entities with camera components
     * 处理具有相机组件的实体
     */
    private _processCameraEntities;
    /**
     * Process individual mesh entity
     * 处理单个网格实体
     */
    private _processMeshEntity;
    /**
     * Process individual light entity
     * 处理单个灯光实体
     */
    private _processLightEntity;
    /**
     * Process individual camera entity
     * 处理单个相机实体
     */
    private _processCameraEntity;
    /**
     * Create Three.js mesh from components
     * 从组件创建Three.js网格
     */
    private _createMesh;
    /**
     * Create Three.js geometry from component
     * 从组件创建Three.js几何体
     */
    private _createGeometry;
    /**
     * Create Three.js material from component
     * 从组件创建Three.js材质
     */
    private _createMaterial;
    /**
     * Create Three.js light from component
     * 从组件创建Three.js灯光
     */
    private _createLight;
    /**
     * Create Three.js camera from component
     * 从组件创建Three.js相机
     */
    private _createCamera;
    /**
     * Update mesh transform from component
     * 从组件更新网格变换
     */
    private _updateMeshTransform;
    /**
     * Update light transform from component
     * 从组件更新灯光变换
     */
    private _updateLightTransform;
    /**
     * Update camera transform from component
     * 从组件更新相机变换
     */
    private _updateCameraTransform;
    /**
     * Update mesh material
     * 更新网格材质
     */
    private _updateMeshMaterial;
    /**
     * Update mesh geometry
     * 更新网格几何体
     */
    private _updateMeshGeometry;
    /**
     * Update light properties
     * 更新灯光属性
     */
    private _updateLightProperties;
    /**
     * Render the scene
     * 渲染场景
     */
    private _render;
    /**
     * Public render method for external use
     * 公共的渲染方法供外部调用
     */
    render(): void;
    /**
     * Public dispose method for external cleanup
     * 公共的清理方法供外部调用
     */
    dispose(): void;
    /**
     * Cleanup resources
     * 清理资源
     */
    private _cleanup;
}

declare class MeshRendererComponent extends Component {
    material: string;
    castShadows: boolean;
    receiveShadows: boolean;
    meshType: 'box' | 'sphere' | 'plane' | 'custom';
    constructor(material?: string, castShadows?: boolean, receiveShadows?: boolean, meshType?: 'box' | 'sphere' | 'plane' | 'custom');
}
/**
 * Editor Bridge for Three.js integration
 * 编辑器桥接器 - 用于Three.js集成
 */
declare class ThreeEditorBridge {
    private world;
    private renderSystem;
    constructor(world: World, canvas: HTMLCanvasElement);
    /**
     * Convert standard ECS entity to Three.js renderable entity
     * 将标准ECS实体转换为Three.js可渲染实体
     */
    convertEntityToThreeJS(entity: Entity, materialName?: string, geometryType?: string): void;
    /**
     * Create material component from material name
     * 根据材质名称创建材质组件
     */
    private createMaterialFromName;
    /**
     * Create geometry component from geometry type
     * 根据几何体类型创建几何体组件
     */
    private createGeometryFromType;
    /**
     * Add default lighting to scene
     * 为场景添加默认光照
     */
    addDefaultLighting(): void;
    /**
     * Get the Three.js renderer for external use
     * 获取Three.js渲染器供外部使用
     */
    getRenderer(): ThreeRenderSystem;
    /**
     * Get the Three.js scene for external access
     * 获取Three.js场景供外部访问
     */
    getScene(): THREE.Scene;
    /**
     * Get the Three.js camera
     * 获取Three.js相机
     */
    getCamera(): THREE.Camera;
    /**
     * Resize the renderer
     * 调整渲染器大小
     */
    resize(width: number, height: number): void;
    /**
     * Add default test objects to the scene
     * 添加默认的测试对象到场景中
     */
    addDefaultTestObjects(): void;
    /**
     * Dispose of resources
     * 释放资源
     */
    dispose(): void;
}
/**
 * Entity conversion utilities
 * 实体转换工具
 */
declare class EntityConverter {
    /**
     * Convert legacy mesh renderer component to Three.js components
     * 将旧版网格渲染器组件转换为Three.js组件
     */
    static convertMeshRenderer(entity: Entity, meshRenderer: any): void;
    /**
     * Batch convert all entities in world
     * 批量转换世界中的所有实体
     */
    static convertAllEntities(world: World): void;
}

/**
 * Three.js Materials
 * Three.js材质系统
 */

/**
 * Material factory for creating Three.js materials
 * 材质工厂 - 用于创建Three.js材质
 */
declare class MaterialFactory {
    private static textureLoader;
    private static textureCache;
    /**
     * Create material from configuration
     * 根据配置创建材质
     */
    static createMaterial(config: MaterialConfig): THREE.Material;
    /**
     * Load texture with caching
     * 带缓存的纹理加载
     */
    private static loadTexture;
    /**
     * Dispose of cached textures
     * 释放缓存的纹理
     */
    static disposeCachedTextures(): void;
}
/**
 * Material configuration interface
 * 材质配置接口
 */
interface MaterialConfig {
    type: 'standard' | 'phong' | 'lambert' | 'basic' | 'physical' | 'toon' | 'matcap' | 'wireframe';
    color: string;
    metalness?: number;
    roughness?: number;
    emissive?: string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
    doubleSided?: boolean;
    texture?: string;
    normalMap?: string;
    roughnessMap?: string;
    metalnessMap?: string;
    envMapIntensity?: number;
    shininess?: number;
    specular?: string;
    clearcoat?: number;
    clearcoatRoughness?: number;
    transmission?: number;
    thickness?: number;
    ior?: number;
    gradientMap?: string;
    matcap?: string;
}
/**
 * Predefined material presets
 * 预定义材质预设
 */
declare const MaterialPresets: Record<string, MaterialConfig>;
/**
 * Material utilities
 * 材质工具
 */
declare class MaterialUtils {
    /**
     * Clone a material configuration
     * 克隆材质配置
     */
    static cloneMaterialConfig(config: MaterialConfig): MaterialConfig;
    /**
     * Blend two materials
     * 混合两个材质
     */
    static blendMaterials(material1: MaterialConfig, material2: MaterialConfig, factor: number): MaterialConfig;
    /**
     * Get material names by category
     * 按类别获取材质名称
     */
    static getMaterialsByCategory(): Record<string, string[]>;
}

/**
 * Three.js Geometries
 * Three.js几何体系统
 */

/**
 * Geometry factory for creating Three.js geometries
 * 几何体工厂 - 用于创建Three.js几何体
 */
declare class GeometryFactory {
    private static geometryCache;
    /**
     * Create geometry from configuration
     * 根据配置创建几何体
     */
    static createGeometry(config: GeometryConfig): THREE.BufferGeometry;
    /**
     * Generate cache key for geometry configuration
     * 为几何体配置生成缓存键
     */
    private static getCacheKey;
    /**
     * Clear geometry cache
     * 清除几何体缓存
     */
    static clearCache(): void;
    /**
     * Create custom shape for extrusion
     * 为挤压创建自定义形状
     */
    static createShape(points: THREE.Vector2[]): THREE.Shape;
}
/**
 * Geometry configuration interface
 * 几何体配置接口
 */
interface GeometryConfig {
    type: 'box' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus' | 'torusKnot' | 'dodecahedron' | 'icosahedron' | 'octahedron' | 'tetrahedron' | 'capsule' | 'ring' | 'lathe' | 'extrude';
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    widthSegments?: number;
    heightSegments?: number;
    depthSegments?: number;
    radialSegments?: number;
    tubularSegments?: number;
    phiStart?: number;
    phiLength?: number;
    thetaStart?: number;
    thetaLength?: number;
    radiusTop?: number;
    radiusBottom?: number;
    openEnded?: boolean;
    tube?: number;
    arc?: number;
    p?: number;
    q?: number;
    detail?: number;
    capSegments?: number;
    length?: number;
    innerRadius?: number;
    outerRadius?: number;
    thetaSegments?: number;
    phiSegments?: number;
    points?: THREE.Vector2[];
    segments?: number;
    shape?: THREE.Shape;
    steps?: number;
    bevelEnabled?: boolean;
    bevelSegments?: number;
    bevelSize?: number;
    bevelThickness?: number;
}
/**
 * Predefined geometry presets
 * 预定义几何体预设
 */
declare const GeometryPresets: Record<string, GeometryConfig>;
/**
 * Geometry utilities
 * 几何体工具
 */
declare class GeometryUtils {
    /**
     * Calculate bounding box of geometry
     * 计算几何体边界框
     */
    static calculateBoundingBox(geometry: THREE.BufferGeometry): THREE.Box3;
    /**
     * Calculate bounding sphere of geometry
     * 计算几何体边界球
     */
    static calculateBoundingSphere(geometry: THREE.BufferGeometry): THREE.Sphere;
    /**
     * Merge multiple geometries
     * 合并多个几何体
     */
    static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry;
    /**
     * Create wireframe geometry
     * 创建线框几何体
     */
    static createWireframe(geometry: THREE.BufferGeometry): THREE.WireframeGeometry;
    /**
     * Create edges geometry
     * 创建边缘几何体
     */
    static createEdges(geometry: THREE.BufferGeometry, thresholdAngle?: number): THREE.EdgesGeometry;
    /**
     * Get geometry categories
     * 获取几何体分类
     */
    static getGeometryCategories(): Record<string, string[]>;
    /**
     * Optimize geometry for rendering
     * 优化几何体以提高渲染性能
     */
    static optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry;
}

/**
 * Three.js Lights
 * Three.js光照系统
 */

/**
 * Light factory for creating Three.js lights
 * 光照工厂 - 用于创建Three.js光照
 */
declare class LightFactory {
    /**
     * Create light from configuration
     * 根据配置创建光照
     */
    static createLight(config: LightConfig): THREE.Light;
    /**
     * Setup shadows for directional light
     * 为方向光设置阴影
     */
    private static setupDirectionalLightShadows;
    /**
     * Setup shadows for point light
     * 为点光源设置阴影
     */
    private static setupPointLightShadows;
    /**
     * Setup shadows for spot light
     * 为聚光灯设置阴影
     */
    private static setupSpotLightShadows;
    /**
     * Create light helper for visualization
     * 创建光照辅助器用于可视化
     */
    static createLightHelper(light: THREE.Light): THREE.Object3D | null;
}
/**
 * Light configuration interface
 * 光照配置接口
 */
interface LightConfig {
    type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rectArea';
    color: string;
    intensity: number;
    position?: {
        x: number;
        y: number;
        z: number;
    };
    target?: {
        x: number;
        y: number;
        z: number;
    };
    distance?: number;
    decay?: number;
    angle?: number;
    penumbra?: number;
    groundColor?: string;
    width?: number;
    height?: number;
    castShadow?: boolean;
    shadow?: ShadowConfig;
}
/**
 * Shadow configuration interface
 * 阴影配置接口
 */
interface ShadowConfig {
    mapSize?: number;
    near?: number;
    far?: number;
    bias?: number;
    normalBias?: number;
    radius?: number;
    cameraSize?: number;
}
/**
 * Predefined light presets
 * 预定义光照预设
 */
declare const LightPresets: Record<string, LightConfig>;
/**
 * Lighting setup presets
 * 光照设置预设
 */
declare const LightingSetups: Record<string, LightConfig[]>;
/**
 * Light utilities
 * 光照工具
 */
declare class LightUtils {
    /**
     * Calculate light intensity for distance
     * 根据距离计算光照强度
     */
    static calculateIntensityForDistance(baseIntensity: number, distance: number, decay?: number): number;
    /**
     * Convert color temperature to RGB
     * 将色温转换为RGB
     */
    static colorTemperatureToRGB(temperature: number): string;
    /**
     * Create lighting setup from preset
     * 从预设创建光照设置
     */
    static createLightingSetup(setupName: string): THREE.Light[];
    /**
     * Get available lighting categories
     * 获取可用的光照分类
     */
    static getLightingCategories(): Record<string, string[]>;
    /**
     * Animate light intensity
     * 动画光照强度
     */
    static animateLightIntensity(light: THREE.Light, targetIntensity: number, duration?: number): Promise<void>;
}

/**
 * Three.js Cameras
 * Three.js相机系统
 */

/**
 * Camera factory for creating Three.js cameras
 * 相机工厂 - 用于创建Three.js相机
 */
declare class CameraFactory {
    /**
     * Create camera from configuration
     * 根据配置创建相机
     */
    static createCamera(config: CameraConfig): THREE.Camera;
    /**
     * Create camera controls
     * 创建相机控制器
     */
    static createCameraControls(camera: THREE.Camera, domElement: HTMLElement, type?: CameraControlType): any;
    /**
     * Create camera helper for visualization
     * 创建相机辅助器用于可视化
     */
    static createCameraHelper(camera: THREE.Camera): THREE.CameraHelper;
}
/**
 * Camera configuration interface
 * 相机配置接口
 */
interface CameraConfig {
    type: 'perspective' | 'orthographic' | 'stereo';
    aspect?: number;
    near?: number;
    far?: number;
    fov?: number;
    size?: number;
    eyeSeparation?: number;
    position?: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
    target?: {
        x: number;
        y: number;
        z: number;
    };
}
/**
 * Camera control types
 * 相机控制类型
 */
type CameraControlType = 'orbit' | 'fly' | 'first-person' | 'trackball';
/**
 * Predefined camera presets
 * 预定义相机预设
 */
declare const CameraPresets: Record<string, CameraConfig>;
/**
 * Camera animation presets
 * 相机动画预设
 */
interface CameraAnimation {
    name: string;
    keyframes: CameraKeyframe[];
    duration: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}
interface CameraKeyframe {
    time: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    target?: {
        x: number;
        y: number;
        z: number;
    };
    fov?: number;
}
declare const CameraAnimations: Record<string, CameraAnimation>;
/**
 * Camera utilities
 * 相机工具
 */
declare class CameraUtils {
    /**
     * Update camera aspect ratio
     * 更新相机宽高比
     */
    static updateAspectRatio(camera: THREE.Camera, width: number, height: number): void;
    /**
     * Position camera to look at target
     * 定位相机以查看目标
     */
    static lookAt(camera: THREE.Camera, target: THREE.Vector3): void;
    /**
     * Calculate camera distance from target
     * 计算相机到目标的距离
     */
    static getDistanceToTarget(camera: THREE.Camera, target: THREE.Vector3): number;
    /**
     * Frame object in camera view
     * 在相机视图中框架对象
     */
    static frameObject(camera: THREE.Camera, object: THREE.Object3D, fitRatio?: number): void;
    /**
     * Create camera from preset
     * 从预设创建相机
     */
    static createFromPreset(presetName: string): THREE.Camera;
    /**
     * Animate camera between two positions
     * 在两个位置之间动画相机
     */
    static animateCamera(camera: THREE.Camera, fromConfig: CameraConfig, toConfig: CameraConfig, duration?: number, onComplete?: () => void): void;
    /**
     * Get camera categories
     * 获取相机分类
     */
    static getCameraCategories(): Record<string, string[]>;
    /**
     * Export camera configuration
     * 导出相机配置
     */
    static exportCameraConfig(camera: THREE.Camera): CameraConfig;
}

/**
 * @nova-engine/render-three - Three.js Rendering Adapter
 * Three.js渲染适配器 - 用于Nova引擎的Three.js渲染支持
 */
declare const VERSION = "1.0.0";
declare const MODULE_NAME = "nova-ecs-render-three";

export { CameraAnimations, CameraFactory, CameraPresets, CameraUtils, EntityConverter, GeometryFactory, GeometryPresets, GeometryUtils, LightFactory, LightPresets, LightUtils, LightingSetups, MODULE_NAME, MaterialFactory, MaterialPresets, MaterialUtils, MeshRendererComponent, ThreeCameraComponent, ThreeEditorBridge, ThreeGeometryComponent, ThreeLightComponent, ThreeMaterialComponent, ThreeMeshComponent, ThreeRenderSystem, TransformComponent, VERSION };
export type { CameraAnimation, CameraConfig, CameraControlType, CameraKeyframe, GeometryConfig, LightConfig, MaterialConfig, ShadowConfig };
