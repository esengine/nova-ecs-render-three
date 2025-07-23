'use strict';

var novaEcs = require('@esengine/nova-ecs');
var THREE = require('three');
var BufferGeometryUtils_js = require('three/examples/jsm/utils/BufferGeometryUtils.js');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var THREE__namespace = /*#__PURE__*/_interopNamespaceDefault(THREE);

/**
 * Transform Component for Three.js Integration
 * Transform组件 - 用于Three.js集成
 */
class TransformComponent extends novaEcs.Component {
    constructor(position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 }) {
        super();
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}

/**
 * Three.js Mesh Component - holds reference to Three.js mesh
 * Three.js网格组件 - 持有Three.js网格的引用
 */
class ThreeMeshComponent extends novaEcs.Component {
    constructor(mesh) {
        super();
        this.mesh = null;
        this.needsUpdate = false;
        this.mesh = mesh || null;
    }
    dispose() {
        if (this.mesh) {
            this.mesh.geometry?.dispose();
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(material => material.dispose());
                }
                else {
                    this.mesh.material.dispose();
                }
            }
            this.mesh = null;
        }
    }
}

/**
 * Three.js Material Component - material configuration
 * Three.js材质组件 - 材质配置
 */
class ThreeMaterialComponent extends novaEcs.Component {
    constructor(config = {}) {
        super();
        this.needsUpdate = false;
        this.materialType = config.materialType || 'standard';
        this.color = config.color || '#ffffff';
        this.metalness = config.metalness || 0.0;
        this.roughness = config.roughness || 1.0;
        this.emissive = config.emissive || '#000000';
        this.emissiveIntensity = config.emissiveIntensity || 0.0;
        this.transparent = config.transparent || false;
        this.opacity = config.opacity || 1.0;
        this.wireframe = config.wireframe || false;
        this.texture = config.texture;
    }
}

/**
 * Three.js Geometry Component - geometry configuration
 * Three.js几何体组件 - 几何体配置
 */
class ThreeGeometryComponent extends novaEcs.Component {
    constructor(geometryType = 'box', parameters = {}) {
        super();
        this.needsUpdate = false;
        this.geometryType = geometryType;
        this.parameters = parameters;
    }
}

/**
 * Three.js Light Component - light configuration
 * Three.js光照组件 - 光照配置
 */
class ThreeLightComponent extends novaEcs.Component {
    constructor(config = {}) {
        super();
        this.light = null;
        this.needsUpdate = false;
        this.lightType = config.lightType || 'directional';
        this.color = config.color || '#ffffff';
        this.intensity = config.intensity || 1.0;
        this.castShadow = config.castShadow || false;
    }
}

/**
 * Three.js Camera Component - camera configuration
 * Three.js相机组件 - 相机配置
 */
class ThreeCameraComponent extends novaEcs.Component {
    constructor(config = {}) {
        super();
        this.camera = null;
        this.needsUpdate = false;
        this.cameraType = config.cameraType || 'perspective';
        this.fov = config.fov || 75;
        this.aspect = config.aspect || 1;
        this.near = config.near || 0.1;
        this.far = config.far || 1000;
    }
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
 * Three.js Rendering System
 * Three.js渲染系统
 */
class ThreeRenderSystem extends novaEcs.System {
    /**
     * Initialize the Three.js rendering system
     * 初始化Three.js渲染系统
     *
     * @param options - Configuration options 配置选项
     */
    constructor(options = {}) {
        // 不指定required components，因为系统需要查询多种组件类型
        super();
        this._isInitialized = false;
        this._frameCount = 0;
        this._options = { ...ThreeRenderSystem.DEFAULT_OPTIONS, ...options };
        // Initialize Three.js scene
        this.scene = new THREE__namespace.Scene();
        this.scene.background = new THREE__namespace.Color(this._options.backgroundColor);
        // Initialize renderer
        this.renderer = new THREE__namespace.WebGLRenderer({
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
    onAddedToWorld(world) {
        super.onAddedToWorld(world);
        this._isInitialized = true;
        console.log('ThreeRenderSystem: Added to world and initialized');
    }
    /**
     * System removed from world lifecycle hook
     * 系统从世界移除的生命周期钩子
     */
    onRemovedFromWorld() {
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
    update(entities, deltaTime) {
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
        }
        catch (error) {
            console.error(`Error in ${this.constructor.name}.update:`, error);
            throw error;
        }
    }
    /**
     * Set renderer size
     * 设置渲染器大小
     */
    setSize(width, height) {
        this.renderer.setSize(width, height);
        if (this.camera instanceof THREE__namespace.PerspectiveCamera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }
    /**
     * Get render statistics
     * 获取渲染统计信息
     */
    getStatistics() {
        let meshCount = 0;
        let lightCount = 0;
        this.scene.traverse((object) => {
            if (object instanceof THREE__namespace.Mesh)
                meshCount++;
            if (object instanceof THREE__namespace.Light)
                lightCount++;
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
    _setupRenderer() {
        this.renderer.setSize(800, 600);
        if (this._options.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE__namespace.PCFSoftShadowMap;
        }
        this.renderer.outputColorSpace = THREE__namespace.SRGBColorSpace;
        this.renderer.toneMapping = THREE__namespace.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }
    /**
     * Setup default camera
     * 设置默认相机
     */
    _setupDefaultCamera() {
        this.camera = new THREE__namespace.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }
    /**
     * Setup WebGL context handlers
     * 设置WebGL上下文处理器
     */
    _setupWebGLContextHandlers() {
        if (!this.renderer.domElement)
            return;
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
    _processMeshEntities() {
        if (!this.world)
            return;
        // Query entities with required components for meshes
        const meshEntities = this.world.entities.filter(entity => entity.active &&
            entity.hasComponent(TransformComponent) &&
            entity.hasComponent(ThreeMeshComponent));
        for (const entity of meshEntities) {
            this._processMeshEntity(entity);
        }
    }
    /**
     * Process entities with light components
     * 处理具有灯光组件的实体
     */
    _processLightEntities() {
        if (!this.world)
            return;
        const lightEntities = this.world.entities.filter(entity => entity.active &&
            entity.hasComponent(TransformComponent) &&
            entity.hasComponent(ThreeLightComponent));
        for (const entity of lightEntities) {
            this._processLightEntity(entity);
        }
    }
    /**
     * Process entities with camera components
     * 处理具有相机组件的实体
     */
    _processCameraEntities() {
        if (!this.world)
            return;
        const cameraEntities = this.world.entities.filter(entity => entity.active &&
            entity.hasComponent(TransformComponent) &&
            entity.hasComponent(ThreeCameraComponent));
        // Use first active camera entity
        if (cameraEntities.length > 0) {
            this._processCameraEntity(cameraEntities[0]);
        }
    }
    /**
     * Process individual mesh entity
     * 处理单个网格实体
     */
    _processMeshEntity(entity) {
        const transform = entity.getComponent(TransformComponent);
        const meshComp = entity.getComponent(ThreeMeshComponent);
        const materialComp = entity.getComponent(ThreeMaterialComponent);
        const geometryComp = entity.getComponent(ThreeGeometryComponent);
        if (!transform || !meshComp)
            return;
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
        }
        catch (error) {
            console.error(`Error processing mesh entity ${entity.id}:`, error);
        }
    }
    /**
     * Process individual light entity
     * 处理单个灯光实体
     */
    _processLightEntity(entity) {
        const transform = entity.getComponent(TransformComponent);
        const lightComp = entity.getComponent(ThreeLightComponent);
        if (!transform || !lightComp)
            return;
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
        }
        catch (error) {
            console.error(`Error processing light entity ${entity.id}:`, error);
        }
    }
    /**
     * Process individual camera entity
     * 处理单个相机实体
     */
    _processCameraEntity(entity) {
        const transform = entity.getComponent(TransformComponent);
        const cameraComp = entity.getComponent(ThreeCameraComponent);
        if (!transform || !cameraComp)
            return;
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
        }
        catch (error) {
            console.error(`Error processing camera entity ${entity.id}:`, error);
        }
    }
    /**
     * Create Three.js mesh from components
     * 从组件创建Three.js网格
     */
    _createMesh(entity, meshComp, materialComp, geometryComp) {
        const geometry = this._createGeometry(geometryComp);
        const material = this._createMaterial(materialComp);
        meshComp.mesh = new THREE__namespace.Mesh(geometry, material);
        meshComp.mesh.castShadow = true;
        meshComp.mesh.receiveShadow = true;
        meshComp.mesh.userData = { entityId: entity.id };
        this.scene.add(meshComp.mesh);
    }
    /**
     * Create Three.js geometry from component
     * 从组件创建Three.js几何体
     */
    _createGeometry(geometryComp) {
        if (!geometryComp) {
            return new THREE__namespace.BoxGeometry(1, 1, 1);
        }
        const { geometryType, parameters } = geometryComp;
        switch (geometryType) {
            case 'box':
                return new THREE__namespace.BoxGeometry(parameters.width || 1, parameters.height || 1, parameters.depth || 1);
            case 'sphere':
                return new THREE__namespace.SphereGeometry(parameters.radius || 0.5, parameters.widthSegments || 16, parameters.heightSegments || 12);
            case 'plane':
                return new THREE__namespace.PlaneGeometry(parameters.width || 1, parameters.height || 1);
            case 'cylinder':
                return new THREE__namespace.CylinderGeometry(parameters.radiusTop || 0.5, parameters.radiusBottom || 0.5, parameters.height || 1, parameters.radialSegments || 8);
            case 'cone':
                return new THREE__namespace.ConeGeometry(parameters.radius || 0.5, parameters.height || 1, parameters.radialSegments || 8);
            case 'torus':
                return new THREE__namespace.TorusGeometry(parameters.radius || 0.4, parameters.tube || 0.2, parameters.radialSegments || 8, parameters.tubularSegments || 6);
            default:
                return new THREE__namespace.BoxGeometry(1, 1, 1);
        }
    }
    /**
     * Create Three.js material from component
     * 从组件创建Three.js材质
     */
    _createMaterial(materialComp) {
        if (!materialComp) {
            return new THREE__namespace.MeshStandardMaterial({ color: 0x4CAF50 });
        }
        const config = {
            color: new THREE__namespace.Color(materialComp.color),
            transparent: materialComp.transparent,
            opacity: materialComp.opacity,
            wireframe: materialComp.wireframe
        };
        switch (materialComp.materialType) {
            case 'standard':
                return new THREE__namespace.MeshStandardMaterial({
                    ...config,
                    metalness: materialComp.metalness,
                    roughness: materialComp.roughness,
                    emissive: new THREE__namespace.Color(materialComp.emissive),
                    emissiveIntensity: materialComp.emissiveIntensity
                });
            case 'basic':
                return new THREE__namespace.MeshBasicMaterial(config);
            case 'phong':
                return new THREE__namespace.MeshPhongMaterial({
                    ...config,
                    shininess: (1.0 - materialComp.roughness) * 100
                });
            case 'physical':
                return new THREE__namespace.MeshPhysicalMaterial({
                    ...config,
                    metalness: materialComp.metalness,
                    roughness: materialComp.roughness,
                    emissive: new THREE__namespace.Color(materialComp.emissive),
                    emissiveIntensity: materialComp.emissiveIntensity
                });
            case 'wireframe':
                return new THREE__namespace.MeshBasicMaterial({
                    ...config,
                    wireframe: true
                });
            default:
                return new THREE__namespace.MeshStandardMaterial(config);
        }
    }
    /**
     * Create Three.js light from component
     * 从组件创建Three.js灯光
     */
    _createLight(lightComp) {
        switch (lightComp.lightType) {
            case 'ambient':
                lightComp.light = new THREE__namespace.AmbientLight(lightComp.color, lightComp.intensity);
                break;
            case 'directional':
                lightComp.light = new THREE__namespace.DirectionalLight(lightComp.color, lightComp.intensity);
                if (this._options.enableShadows) {
                    lightComp.light.castShadow = lightComp.castShadow;
                }
                break;
            case 'point':
                lightComp.light = new THREE__namespace.PointLight(lightComp.color, lightComp.intensity);
                if (this._options.enableShadows) {
                    lightComp.light.castShadow = lightComp.castShadow;
                }
                break;
            case 'spot':
                lightComp.light = new THREE__namespace.SpotLight(lightComp.color, lightComp.intensity);
                if (this._options.enableShadows) {
                    lightComp.light.castShadow = lightComp.castShadow;
                }
                break;
            case 'hemisphere':
                lightComp.light = new THREE__namespace.HemisphereLight(lightComp.color, '#404040', lightComp.intensity);
                break;
            default:
                lightComp.light = new THREE__namespace.DirectionalLight(lightComp.color, lightComp.intensity);
        }
        this.scene.add(lightComp.light);
    }
    /**
     * Create Three.js camera from component
     * 从组件创建Three.js相机
     */
    _createCamera(cameraComp) {
        if (cameraComp.cameraType === 'perspective') {
            cameraComp.camera = new THREE__namespace.PerspectiveCamera(cameraComp.fov, cameraComp.aspect, cameraComp.near, cameraComp.far);
        }
        else {
            const size = 10;
            cameraComp.camera = new THREE__namespace.OrthographicCamera(-size * cameraComp.aspect, size * cameraComp.aspect, size, -size, cameraComp.near, cameraComp.far);
        }
    }
    /**
     * Update mesh transform from component
     * 从组件更新网格变换
     */
    _updateMeshTransform(mesh, transform) {
        mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
        mesh.rotation.set(transform.rotation.x * Math.PI / 180, transform.rotation.y * Math.PI / 180, transform.rotation.z * Math.PI / 180);
        mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    }
    /**
     * Update light transform from component
     * 从组件更新灯光变换
     */
    _updateLightTransform(light, transform) {
        light.position.set(transform.position.x, transform.position.y, transform.position.z);
    }
    /**
     * Update camera transform from component
     * 从组件更新相机变换
     */
    _updateCameraTransform(camera, transform) {
        camera.position.set(transform.position.x, transform.position.y, transform.position.z);
        camera.rotation.set(transform.rotation.x * Math.PI / 180, transform.rotation.y * Math.PI / 180, transform.rotation.z * Math.PI / 180);
    }
    /**
     * Update mesh material
     * 更新网格材质
     */
    _updateMeshMaterial(mesh, materialComp) {
        const newMaterial = this._createMaterial(materialComp);
        // Dispose old material
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.dispose());
            }
            else {
                mesh.material.dispose();
            }
        }
        mesh.material = newMaterial;
    }
    /**
     * Update mesh geometry
     * 更新网格几何体
     */
    _updateMeshGeometry(mesh, geometryComp) {
        const newGeometry = this._createGeometry(geometryComp);
        // Dispose old geometry
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
    }
    /**
     * Update light properties
     * 更新灯光属性
     */
    _updateLightProperties(lightComp) {
        if (!lightComp.light)
            return;
        lightComp.light.color.setHex(parseInt(lightComp.color.replace('#', '0x')));
        lightComp.light.intensity = lightComp.intensity;
        if ('castShadow' in lightComp.light) {
            lightComp.light.castShadow = lightComp.castShadow;
        }
    }
    /**
     * Render the scene
     * 渲染场景
     */
    _render() {
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
    render() {
        this._render();
    }
    /**
     * Public dispose method for external cleanup
     * 公共的清理方法供外部调用
     */
    dispose() {
        this._cleanup();
    }
    /**
     * Cleanup resources
     * 清理资源
     */
    _cleanup() {
        // Dispose of Three.js resources
        this.scene.traverse((object) => {
            if (object instanceof THREE__namespace.Mesh) {
                object.geometry?.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    }
                    else {
                        object.material.dispose();
                    }
                }
            }
        });
        // Clear scene
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        // Dispose renderer
        this.renderer.dispose();
    }
}
// 常量
ThreeRenderSystem.DEFAULT_OPTIONS = {
    canvas: undefined,
    enableShadows: true,
    shadowMapSize: 2048,
    backgroundColor: 0x1a1a1a,
    antialias: true
};

/**
 * Three.js Editor Adapters
 * Three.js编辑器适配器 - 连接编辑器与Three.js渲染系统
 */
// MeshRendererComponent for compatibility
class MeshRendererComponent extends novaEcs.Component {
    constructor(material = 'DefaultMaterial', castShadows = true, receiveShadows = true, meshType = 'box') {
        super();
        this.material = material;
        this.castShadows = castShadows;
        this.receiveShadows = receiveShadows;
        this.meshType = meshType;
    }
}
/**
 * Editor Bridge for Three.js integration
 * 编辑器桥接器 - 用于Three.js集成
 */
class ThreeEditorBridge {
    constructor(world, canvas) {
        this.world = world;
        this.renderSystem = new ThreeRenderSystem({ canvas });
        // Add render system to world
        this.world.addSystem(this.renderSystem);
    }
    /**
     * Convert standard ECS entity to Three.js renderable entity
     * 将标准ECS实体转换为Three.js可渲染实体
     */
    convertEntityToThreeJS(entity, materialName, geometryType) {
        // Add Three.js mesh component
        const meshComponent = new ThreeMeshComponent();
        entity.addComponent(meshComponent);
        // Add material component based on material name
        if (materialName) {
            const materialComponent = this.createMaterialFromName(materialName);
            entity.addComponent(materialComponent);
        }
        else {
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
        }
        else {
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
    createMaterialFromName(materialName) {
        const materialConfigs = {
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
    createGeometryFromType(geometryType) {
        const geometryConfigs = {
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
    addDefaultLighting() {
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
        mainLight.addComponent(new TransformComponent({ x: 10, y: 10, z: 5 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }));
        mainLight.addComponent(new ThreeLightComponent({
            lightType: 'directional',
            color: '#ffffff',
            intensity: 1.0,
            castShadow: true
        }));
        // Fill light
        const fillLight = this.world.createEntity();
        fillLight.addComponent(new TransformComponent({ x: -5, y: 5, z: -5 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }));
        fillLight.addComponent(new ThreeLightComponent({
            lightType: 'directional',
            color: '#4080ff',
            intensity: 0.3
        }));
        // Point light for atmosphere
        const pointLight = this.world.createEntity();
        pointLight.addComponent(new TransformComponent({ x: 0, y: 5, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }));
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
    getRenderer() {
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
    resize(width, height) {
        this.renderSystem.setSize(width, height);
    }
    /**
     * Add default test objects to the scene
     * 添加默认的测试对象到场景中
     */
    addDefaultTestObjects() {
        // Create a test cube
        const testCube = this.world.createEntity();
        testCube.addComponent(new TransformComponent({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }));
        testCube.addComponent(new ThreeMeshComponent());
        testCube.addComponent(new ThreeMaterialComponent({
            materialType: 'standard',
            color: '#4CAF50',
            metalness: 0.2,
            roughness: 0.8
        }));
        testCube.addComponent(new ThreeGeometryComponent('box', {
            width: 1,
            height: 1,
            depth: 1
        }));
        // Create a test sphere
        const testSphere = this.world.createEntity();
        testSphere.addComponent(new TransformComponent({ x: 2, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }));
        testSphere.addComponent(new ThreeMeshComponent());
        testSphere.addComponent(new ThreeMaterialComponent({
            materialType: 'standard',
            color: '#2196F3',
            metalness: 0.1,
            roughness: 0.3
        }));
        testSphere.addComponent(new ThreeGeometryComponent('sphere', {
            radius: 0.5,
            widthSegments: 32,
            heightSegments: 16
        }));
        // Create a ground plane
        const groundPlane = this.world.createEntity();
        groundPlane.addComponent(new TransformComponent({ x: 0, y: -1, z: 0 }, { x: -Math.PI / 2, y: 0, z: 0 }, { x: 10, y: 10, z: 1 }));
        groundPlane.addComponent(new ThreeMeshComponent());
        groundPlane.addComponent(new ThreeMaterialComponent({
            materialType: 'standard',
            color: '#795548',
            metalness: 0.0,
            roughness: 1.0
        }));
        groundPlane.addComponent(new ThreeGeometryComponent('plane', {
            width: 1,
            height: 1
        }));
        console.log('Added default test objects to scene');
    }
    /**
     * Dispose of resources
     * 释放资源
     */
    dispose() {
        this.renderSystem.dispose();
    }
}
/**
 * Entity conversion utilities
 * 实体转换工具
 */
class EntityConverter {
    /**
     * Convert legacy mesh renderer component to Three.js components
     * 将旧版网格渲染器组件转换为Three.js组件
     */
    static convertMeshRenderer(entity, meshRenderer) {
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
        entity.addComponent(new ThreeGeometryComponent(meshRenderer.meshType || 'box', meshRenderer.meshType === 'sphere' ? { radius: 0.5, widthSegments: 16, heightSegments: 12 } :
            meshRenderer.meshType === 'plane' ? { width: 1, height: 1 } :
                { width: 1, height: 1, depth: 1 }));
    }
    /**
     * Batch convert all entities in world
     * 批量转换世界中的所有实体
     */
    static convertAllEntities(world) {
        const entities = world.entities;
        for (const entity of entities) {
            const meshRenderer = entity.getComponent(MeshRendererComponent);
            if (meshRenderer) {
                this.convertMeshRenderer(entity, meshRenderer);
            }
        }
    }
}

/**
 * Three.js Materials
 * Three.js材质系统
 */
/**
 * Material factory for creating Three.js materials
 * 材质工厂 - 用于创建Three.js材质
 */
class MaterialFactory {
    /**
     * Create material from configuration
     * 根据配置创建材质
     */
    static createMaterial(config) {
        const baseProps = {
            color: new THREE__namespace.Color(config.color),
            transparent: config.transparent || false,
            opacity: config.opacity !== undefined ? config.opacity : 1.0,
            wireframe: config.wireframe || false,
            side: config.doubleSided ? THREE__namespace.DoubleSide : THREE__namespace.FrontSide
        };
        // Load texture if specified
        if (config.texture) {
            const texture = this.loadTexture(config.texture);
            baseProps.map = texture;
        }
        switch (config.type) {
            case 'standard':
                return new THREE__namespace.MeshStandardMaterial({
                    ...baseProps,
                    metalness: config.metalness || 0.0,
                    roughness: config.roughness || 1.0,
                    emissive: config.emissive ? new THREE__namespace.Color(config.emissive) : new THREE__namespace.Color(0x000000),
                    emissiveIntensity: config.emissiveIntensity || 0.0,
                    normalMap: config.normalMap ? this.loadTexture(config.normalMap) : undefined,
                    roughnessMap: config.roughnessMap ? this.loadTexture(config.roughnessMap) : undefined,
                    metalnessMap: config.metalnessMap ? this.loadTexture(config.metalnessMap) : undefined,
                    envMapIntensity: config.envMapIntensity || 1.0
                });
            case 'phong':
                return new THREE__namespace.MeshPhongMaterial({
                    ...baseProps,
                    shininess: config.shininess || ((1.0 - (config.roughness || 1.0)) * 100),
                    specular: config.specular ? new THREE__namespace.Color(config.specular) : new THREE__namespace.Color(0x111111),
                    emissive: config.emissive ? new THREE__namespace.Color(config.emissive) : new THREE__namespace.Color(0x000000),
                    emissiveIntensity: config.emissiveIntensity || 0.0
                });
            case 'lambert':
                return new THREE__namespace.MeshLambertMaterial({
                    ...baseProps,
                    emissive: config.emissive ? new THREE__namespace.Color(config.emissive) : new THREE__namespace.Color(0x000000),
                    emissiveIntensity: config.emissiveIntensity || 0.0
                });
            case 'basic':
                return new THREE__namespace.MeshBasicMaterial(baseProps);
            case 'physical':
                return new THREE__namespace.MeshPhysicalMaterial({
                    ...baseProps,
                    metalness: config.metalness || 0.0,
                    roughness: config.roughness || 1.0,
                    emissive: config.emissive ? new THREE__namespace.Color(config.emissive) : new THREE__namespace.Color(0x000000),
                    emissiveIntensity: config.emissiveIntensity || 0.0,
                    clearcoat: config.clearcoat || 0.0,
                    clearcoatRoughness: config.clearcoatRoughness || 0.0,
                    transmission: config.transmission || 0.0,
                    thickness: config.thickness || 0.0,
                    ior: config.ior || 1.5
                });
            case 'toon':
                return new THREE__namespace.MeshToonMaterial({
                    ...baseProps,
                    gradientMap: config.gradientMap ? this.loadTexture(config.gradientMap) : undefined
                });
            case 'matcap':
                return new THREE__namespace.MeshMatcapMaterial({
                    ...baseProps,
                    matcap: config.matcap ? this.loadTexture(config.matcap) : undefined
                });
            case 'wireframe':
                return new THREE__namespace.MeshBasicMaterial({
                    ...baseProps,
                    wireframe: true
                });
            default:
                return new THREE__namespace.MeshStandardMaterial(baseProps);
        }
    }
    /**
     * Load texture with caching
     * 带缓存的纹理加载
     */
    static loadTexture(url) {
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url);
        }
        const texture = this.textureLoader.load(url);
        texture.wrapS = THREE__namespace.RepeatWrapping;
        texture.wrapT = THREE__namespace.RepeatWrapping;
        texture.colorSpace = THREE__namespace.SRGBColorSpace;
        this.textureCache.set(url, texture);
        return texture;
    }
    /**
     * Dispose of cached textures
     * 释放缓存的纹理
     */
    static disposeCachedTextures() {
        this.textureCache.forEach(texture => texture.dispose());
        this.textureCache.clear();
    }
}
MaterialFactory.textureLoader = new THREE__namespace.TextureLoader();
MaterialFactory.textureCache = new Map();
/**
 * Predefined material presets
 * 预定义材质预设
 */
const MaterialPresets = {
    // Basic materials
    'Default': {
        type: 'standard',
        color: '#4CAF50',
        metalness: 0.2,
        roughness: 0.8
    },
    'White': {
        type: 'standard',
        color: '#FFFFFF',
        metalness: 0.1,
        roughness: 0.9
    },
    'Black': {
        type: 'standard',
        color: '#000000',
        metalness: 0.1,
        roughness: 0.9
    },
    // Metal materials
    'Steel': {
        type: 'standard',
        color: '#B0B0B0',
        metalness: 0.9,
        roughness: 0.1
    },
    'Gold': {
        type: 'standard',
        color: '#FFD700',
        metalness: 1.0,
        roughness: 0.2
    },
    'Copper': {
        type: 'standard',
        color: '#B87333',
        metalness: 1.0,
        roughness: 0.3
    },
    // Plastic materials
    'RedPlastic': {
        type: 'standard',
        color: '#F44336',
        metalness: 0.0,
        roughness: 0.9
    },
    'BluePlastic': {
        type: 'standard',
        color: '#2196F3',
        metalness: 0.0,
        roughness: 0.8
    },
    'GreenPlastic': {
        type: 'standard',
        color: '#4CAF50',
        metalness: 0.0,
        roughness: 0.9
    },
    // Glass materials
    'Glass': {
        type: 'physical',
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: 0.0,
        transparent: true,
        opacity: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        ior: 1.5
    },
    'TintedGlass': {
        type: 'physical',
        color: '#4080FF',
        metalness: 0.0,
        roughness: 0.0,
        transparent: true,
        opacity: 0.3,
        transmission: 0.7,
        thickness: 0.5,
        ior: 1.5
    },
    // Emissive materials
    'Neon': {
        type: 'standard',
        color: '#000000',
        emissive: '#00FF00',
        emissiveIntensity: 1.0,
        metalness: 0.0,
        roughness: 1.0
    },
    'Fire': {
        type: 'standard',
        color: '#000000',
        emissive: '#FF4500',
        emissiveIntensity: 0.8,
        metalness: 0.0,
        roughness: 1.0
    },
    // Special materials
    'Wireframe': {
        type: 'wireframe',
        color: '#00FF00',
        wireframe: true
    },
    'Invisible': {
        type: 'basic',
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.0
    },
    // Toon materials
    'ToonRed': {
        type: 'toon',
        color: '#FF6B6B'
    },
    'ToonBlue': {
        type: 'toon',
        color: '#4ECDC4'
    },
    'ToonYellow': {
        type: 'toon',
        color: '#FFE066'
    }
};
/**
 * Material utilities
 * 材质工具
 */
class MaterialUtils {
    /**
     * Clone a material configuration
     * 克隆材质配置
     */
    static cloneMaterialConfig(config) {
        return { ...config };
    }
    /**
     * Blend two materials
     * 混合两个材质
     */
    static blendMaterials(material1, material2, factor) {
        const blended = { ...material1 };
        // Blend colors
        const color1 = new THREE__namespace.Color(material1.color);
        const color2 = new THREE__namespace.Color(material2.color);
        color1.lerp(color2, factor);
        blended.color = '#' + color1.getHexString();
        // Blend numeric properties
        if (material1.metalness !== undefined && material2.metalness !== undefined) {
            blended.metalness = THREE__namespace.MathUtils.lerp(material1.metalness, material2.metalness, factor);
        }
        if (material1.roughness !== undefined && material2.roughness !== undefined) {
            blended.roughness = THREE__namespace.MathUtils.lerp(material1.roughness, material2.roughness, factor);
        }
        if (material1.opacity !== undefined && material2.opacity !== undefined) {
            blended.opacity = THREE__namespace.MathUtils.lerp(material1.opacity, material2.opacity, factor);
        }
        return blended;
    }
    /**
     * Get material names by category
     * 按类别获取材质名称
     */
    static getMaterialsByCategory() {
        return {
            'Basic': ['Default', 'White', 'Black'],
            'Metal': ['Steel', 'Gold', 'Copper'],
            'Plastic': ['RedPlastic', 'BluePlastic', 'GreenPlastic'],
            'Glass': ['Glass', 'TintedGlass'],
            'Emissive': ['Neon', 'Fire'],
            'Special': ['Wireframe', 'Invisible'],
            'Toon': ['ToonRed', 'ToonBlue', 'ToonYellow']
        };
    }
}

/**
 * Three.js Geometries
 * Three.js几何体系统
 */
/**
 * Geometry factory for creating Three.js geometries
 * 几何体工厂 - 用于创建Three.js几何体
 */
class GeometryFactory {
    /**
     * Create geometry from configuration
     * 根据配置创建几何体
     */
    static createGeometry(config) {
        const cacheKey = this.getCacheKey(config);
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey).clone();
        }
        let geometry;
        switch (config.type) {
            case 'box':
                geometry = new THREE__namespace.BoxGeometry(config.width || 1, config.height || 1, config.depth || 1, config.widthSegments || 1, config.heightSegments || 1, config.depthSegments || 1);
                break;
            case 'sphere':
                geometry = new THREE__namespace.SphereGeometry(config.radius || 0.5, config.widthSegments || 16, config.heightSegments || 12, config.phiStart || 0, config.phiLength || Math.PI * 2, config.thetaStart || 0, config.thetaLength || Math.PI);
                break;
            case 'plane':
                geometry = new THREE__namespace.PlaneGeometry(config.width || 1, config.height || 1, config.widthSegments || 1, config.heightSegments || 1);
                break;
            case 'cylinder':
                geometry = new THREE__namespace.CylinderGeometry(config.radiusTop || 0.5, config.radiusBottom || 0.5, config.height || 1, config.radialSegments || 8, config.heightSegments || 1, config.openEnded || false, config.thetaStart || 0, config.thetaLength || Math.PI * 2);
                break;
            case 'cone':
                geometry = new THREE__namespace.ConeGeometry(config.radius || 0.5, config.height || 1, config.radialSegments || 8, config.heightSegments || 1, config.openEnded || false, config.thetaStart || 0, config.thetaLength || Math.PI * 2);
                break;
            case 'torus':
                geometry = new THREE__namespace.TorusGeometry(config.radius || 0.4, config.tube || 0.2, config.radialSegments || 8, config.tubularSegments || 6, config.arc || Math.PI * 2);
                break;
            case 'torusKnot':
                geometry = new THREE__namespace.TorusKnotGeometry(config.radius || 0.4, config.tube || 0.1, config.tubularSegments || 64, config.radialSegments || 8, config.p || 2, config.q || 3);
                break;
            case 'dodecahedron':
                geometry = new THREE__namespace.DodecahedronGeometry(config.radius || 0.5, config.detail || 0);
                break;
            case 'icosahedron':
                geometry = new THREE__namespace.IcosahedronGeometry(config.radius || 0.5, config.detail || 0);
                break;
            case 'octahedron':
                geometry = new THREE__namespace.OctahedronGeometry(config.radius || 0.5, config.detail || 0);
                break;
            case 'tetrahedron':
                geometry = new THREE__namespace.TetrahedronGeometry(config.radius || 0.5, config.detail || 0);
                break;
            case 'capsule':
                geometry = new THREE__namespace.CapsuleGeometry(config.radius || 0.3, config.length || 0.8, config.capSegments || 4, config.radialSegments || 8);
                break;
            case 'ring':
                geometry = new THREE__namespace.RingGeometry(config.innerRadius || 0.2, config.outerRadius || 0.5, config.thetaSegments || 8, config.phiSegments || 1, config.thetaStart || 0, config.thetaLength || Math.PI * 2);
                break;
            case 'lathe':
                const points = config.points || [
                    new THREE__namespace.Vector2(0, -0.5),
                    new THREE__namespace.Vector2(0.5, 0),
                    new THREE__namespace.Vector2(0, 0.5)
                ];
                geometry = new THREE__namespace.LatheGeometry(points, config.segments || 12, config.phiStart || 0, config.phiLength || Math.PI * 2);
                break;
            case 'extrude':
                if (config.shape) {
                    const extrudeSettings = {
                        depth: config.depth || 0.2,
                        bevelEnabled: config.bevelEnabled || false,
                        bevelSegments: config.bevelSegments || 2,
                        steps: config.steps || 1,
                        bevelSize: config.bevelSize || 0.1,
                        bevelThickness: config.bevelThickness || 0.1
                    };
                    geometry = new THREE__namespace.ExtrudeGeometry(config.shape, extrudeSettings);
                }
                else {
                    // Fallback to box if no shape provided
                    geometry = new THREE__namespace.BoxGeometry(1, 1, 1);
                }
                break;
            default:
                geometry = new THREE__namespace.BoxGeometry(1, 1, 1);
        }
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry.clone());
        return geometry;
    }
    /**
     * Generate cache key for geometry configuration
     * 为几何体配置生成缓存键
     */
    static getCacheKey(config) {
        return JSON.stringify(config);
    }
    /**
     * Clear geometry cache
     * 清除几何体缓存
     */
    static clearCache() {
        this.geometryCache.forEach(geometry => geometry.dispose());
        this.geometryCache.clear();
    }
    /**
     * Create custom shape for extrusion
     * 为挤压创建自定义形状
     */
    static createShape(points) {
        const shape = new THREE__namespace.Shape();
        if (points.length > 0) {
            shape.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                shape.lineTo(points[i].x, points[i].y);
            }
        }
        return shape;
    }
}
GeometryFactory.geometryCache = new Map();
/**
 * Predefined geometry presets
 * 预定义几何体预设
 */
const GeometryPresets = {
    // Basic shapes
    'Cube': {
        type: 'box',
        width: 1,
        height: 1,
        depth: 1
    },
    'Sphere': {
        type: 'sphere',
        radius: 0.5,
        widthSegments: 16,
        heightSegments: 12
    },
    'Plane': {
        type: 'plane',
        width: 1,
        height: 1
    },
    'Cylinder': {
        type: 'cylinder',
        radiusTop: 0.5,
        radiusBottom: 0.5,
        height: 1,
        radialSegments: 8
    },
    'Cone': {
        type: 'cone',
        radius: 0.5,
        height: 1,
        radialSegments: 8
    },
    // Advanced shapes
    'Torus': {
        type: 'torus',
        radius: 0.4,
        tube: 0.2,
        radialSegments: 8,
        tubularSegments: 6
    },
    'TorusKnot': {
        type: 'torusKnot',
        radius: 0.4,
        tube: 0.1,
        tubularSegments: 64,
        radialSegments: 8
    },
    'Capsule': {
        type: 'capsule',
        radius: 0.3,
        length: 0.8,
        capSegments: 4,
        radialSegments: 8
    },
    // Polyhedra
    'Dodecahedron': {
        type: 'dodecahedron',
        radius: 0.5
    },
    'Icosahedron': {
        type: 'icosahedron',
        radius: 0.5
    },
    'Octahedron': {
        type: 'octahedron',
        radius: 0.5
    },
    'Tetrahedron': {
        type: 'tetrahedron',
        radius: 0.5
    },
    // Special shapes
    'Ring': {
        type: 'ring',
        innerRadius: 0.2,
        outerRadius: 0.5,
        thetaSegments: 8
    },
    'Wheel': {
        type: 'cylinder',
        radiusTop: 0.5,
        radiusBottom: 0.5,
        height: 0.2,
        radialSegments: 16
    },
    'Disk': {
        type: 'cylinder',
        radiusTop: 0.5,
        radiusBottom: 0.5,
        height: 0.05,
        radialSegments: 16
    }
};
/**
 * Geometry utilities
 * 几何体工具
 */
class GeometryUtils {
    /**
     * Calculate bounding box of geometry
     * 计算几何体边界框
     */
    static calculateBoundingBox(geometry) {
        geometry.computeBoundingBox();
        return geometry.boundingBox || new THREE__namespace.Box3();
    }
    /**
     * Calculate bounding sphere of geometry
     * 计算几何体边界球
     */
    static calculateBoundingSphere(geometry) {
        geometry.computeBoundingSphere();
        return geometry.boundingSphere || new THREE__namespace.Sphere();
    }
    /**
     * Merge multiple geometries
     * 合并多个几何体
     */
    static mergeGeometries(geometries) {
        return BufferGeometryUtils_js.mergeGeometries(geometries);
    }
    /**
     * Create wireframe geometry
     * 创建线框几何体
     */
    static createWireframe(geometry) {
        return new THREE__namespace.WireframeGeometry(geometry);
    }
    /**
     * Create edges geometry
     * 创建边缘几何体
     */
    static createEdges(geometry, thresholdAngle = 1) {
        return new THREE__namespace.EdgesGeometry(geometry, thresholdAngle);
    }
    /**
     * Get geometry categories
     * 获取几何体分类
     */
    static getGeometryCategories() {
        return {
            'Basic': ['Cube', 'Sphere', 'Plane', 'Cylinder', 'Cone'],
            'Advanced': ['Torus', 'TorusKnot', 'Capsule'],
            'Polyhedra': ['Dodecahedron', 'Icosahedron', 'Octahedron', 'Tetrahedron'],
            'Special': ['Ring', 'Wheel', 'Disk']
        };
    }
    /**
     * Optimize geometry for rendering
     * 优化几何体以提高渲染性能
     */
    static optimizeGeometry(geometry) {
        // Remove duplicate vertices
        geometry = BufferGeometryUtils_js.mergeVertices(geometry);
        // Compute normals if they don't exist
        if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
        }
        // Compute tangents for normal mapping
        if (geometry.attributes.uv && !geometry.attributes.tangent) {
            geometry.computeTangents();
        }
        return geometry;
    }
}

/**
 * Three.js Lights
 * Three.js光照系统
 */
/**
 * Light factory for creating Three.js lights
 * 光照工厂 - 用于创建Three.js光照
 */
class LightFactory {
    /**
     * Create light from configuration
     * 根据配置创建光照
     */
    static createLight(config) {
        const color = new THREE__namespace.Color(config.color);
        switch (config.type) {
            case 'ambient':
                return new THREE__namespace.AmbientLight(color, config.intensity);
            case 'directional':
                const directionalLight = new THREE__namespace.DirectionalLight(color, config.intensity);
                directionalLight.castShadow = config.castShadow || false;
                if (config.castShadow) {
                    this.setupDirectionalLightShadows(directionalLight, config);
                }
                if (config.target) {
                    directionalLight.target.position.set(config.target.x, config.target.y, config.target.z);
                }
                return directionalLight;
            case 'point':
                const pointLight = new THREE__namespace.PointLight(color, config.intensity, config.distance, config.decay);
                pointLight.castShadow = config.castShadow || false;
                if (config.castShadow) {
                    this.setupPointLightShadows(pointLight, config);
                }
                return pointLight;
            case 'spot':
                const spotLight = new THREE__namespace.SpotLight(color, config.intensity, config.distance, config.angle, config.penumbra, config.decay);
                spotLight.castShadow = config.castShadow || false;
                if (config.castShadow) {
                    this.setupSpotLightShadows(spotLight, config);
                }
                if (config.target) {
                    spotLight.target.position.set(config.target.x, config.target.y, config.target.z);
                }
                return spotLight;
            case 'hemisphere':
                return new THREE__namespace.HemisphereLight(color, config.groundColor, config.intensity);
            case 'rectArea':
                const rectAreaLight = new THREE__namespace.RectAreaLight(color, config.intensity, config.width, config.height);
                return rectAreaLight;
            default:
                return new THREE__namespace.DirectionalLight(color, config.intensity);
        }
    }
    /**
     * Setup shadows for directional light
     * 为方向光设置阴影
     */
    static setupDirectionalLightShadows(light, config) {
        const shadowConfig = config.shadow || {};
        light.shadow.mapSize.width = shadowConfig.mapSize || 2048;
        light.shadow.mapSize.height = shadowConfig.mapSize || 2048;
        light.shadow.camera.near = shadowConfig.near || 0.5;
        light.shadow.camera.far = shadowConfig.far || 500;
        // Set shadow camera bounds
        const size = shadowConfig.cameraSize || 10;
        light.shadow.camera.left = -size;
        light.shadow.camera.right = size;
        light.shadow.camera.top = size;
        light.shadow.camera.bottom = -size;
        light.shadow.bias = shadowConfig.bias || 0;
        light.shadow.normalBias = shadowConfig.normalBias || 0;
        light.shadow.radius = shadowConfig.radius || 1;
    }
    /**
     * Setup shadows for point light
     * 为点光源设置阴影
     */
    static setupPointLightShadows(light, config) {
        const shadowConfig = config.shadow || {};
        light.shadow.mapSize.width = shadowConfig.mapSize || 1024;
        light.shadow.mapSize.height = shadowConfig.mapSize || 1024;
        light.shadow.camera.near = shadowConfig.near || 0.1;
        light.shadow.camera.far = shadowConfig.far || 100;
        light.shadow.bias = shadowConfig.bias || 0;
        light.shadow.normalBias = shadowConfig.normalBias || 0;
        light.shadow.radius = shadowConfig.radius || 1;
    }
    /**
     * Setup shadows for spot light
     * 为聚光灯设置阴影
     */
    static setupSpotLightShadows(light, config) {
        const shadowConfig = config.shadow || {};
        light.shadow.mapSize.width = shadowConfig.mapSize || 1024;
        light.shadow.mapSize.height = shadowConfig.mapSize || 1024;
        light.shadow.camera.near = shadowConfig.near || 0.1;
        light.shadow.camera.far = shadowConfig.far || 100;
        light.shadow.bias = shadowConfig.bias || 0;
        light.shadow.normalBias = shadowConfig.normalBias || 0;
        light.shadow.radius = shadowConfig.radius || 1;
    }
    /**
     * Create light helper for visualization
     * 创建光照辅助器用于可视化
     */
    static createLightHelper(light) {
        if (light instanceof THREE__namespace.DirectionalLight) {
            return new THREE__namespace.DirectionalLightHelper(light, 1);
        }
        else if (light instanceof THREE__namespace.PointLight) {
            return new THREE__namespace.PointLightHelper(light, 0.1);
        }
        else if (light instanceof THREE__namespace.SpotLight) {
            return new THREE__namespace.SpotLightHelper(light);
        }
        else if (light instanceof THREE__namespace.HemisphereLight) {
            return new THREE__namespace.HemisphereLightHelper(light, 1);
        }
        else if (light instanceof THREE__namespace.RectAreaLight) {
            // Note: RectAreaLightHelper requires RectAreaLightUniformsLib
            // return new THREE.RectAreaLightHelper(light);
            return null;
        }
        return null;
    }
}
/**
 * Predefined light presets
 * 预定义光照预设
 */
const LightPresets = {
    // Basic lighting setups
    'DefaultAmbient': {
        type: 'ambient',
        color: '#404040',
        intensity: 0.4
    },
    'DefaultDirectional': {
        type: 'directional',
        color: '#ffffff',
        intensity: 1.0,
        position: { x: 10, y: 10, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        castShadow: true,
        shadow: {
            mapSize: 2048,
            cameraSize: 10
        }
    },
    // Studio lighting
    'StudioKeyLight': {
        type: 'directional',
        color: '#ffffff',
        intensity: 1.2,
        position: { x: 5, y: 10, z: 5 },
        castShadow: true,
        shadow: {
            mapSize: 2048,
            cameraSize: 15
        }
    },
    'StudioFillLight': {
        type: 'directional',
        color: '#87ceeb',
        intensity: 0.4,
        position: { x: -5, y: 5, z: 5 }
    },
    'StudioBackLight': {
        type: 'directional',
        color: '#ffd700',
        intensity: 0.6,
        position: { x: 0, y: 5, z: -5 }
    },
    // Natural lighting
    'Sunlight': {
        type: 'directional',
        color: '#fff8dc',
        intensity: 1.5,
        position: { x: 20, y: 20, z: 10 },
        castShadow: true,
        shadow: {
            mapSize: 4096,
            cameraSize: 20
        }
    },
    'Moonlight': {
        type: 'directional',
        color: '#b0c4de',
        intensity: 0.5,
        position: { x: -10, y: 15, z: -10 },
        castShadow: true
    },
    'SkyAmbient': {
        type: 'hemisphere',
        color: '#87ceeb',
        groundColor: '#8b7355',
        intensity: 0.6
    },
    // Colored lighting
    'WarmSpot': {
        type: 'spot',
        color: '#ffa500',
        intensity: 1.0,
        position: { x: 0, y: 5, z: 0 },
        target: { x: 0, y: 0, z: 0 },
        angle: Math.PI / 4,
        penumbra: 0.3,
        distance: 20,
        castShadow: true
    },
    'CoolPoint': {
        type: 'point',
        color: '#4169e1',
        intensity: 1.0,
        position: { x: 2, y: 3, z: 2 },
        distance: 15,
        decay: 2,
        castShadow: true
    },
    // Atmospheric lighting
    'FireGlow': {
        type: 'point',
        color: '#ff4500',
        intensity: 2.0,
        position: { x: 0, y: 1, z: 0 },
        distance: 10,
        decay: 2
    },
    'NeonBlue': {
        type: 'point',
        color: '#00ffff',
        intensity: 1.5,
        position: { x: 0, y: 2, z: 0 },
        distance: 8,
        decay: 1
    },
    'NeonPink': {
        type: 'point',
        color: '#ff1493',
        intensity: 1.5,
        position: { x: 0, y: 2, z: 0 },
        distance: 8,
        decay: 1
    }
};
/**
 * Lighting setup presets
 * 光照设置预设
 */
const LightingSetups = {
    'ThreePoint': [
        LightPresets.StudioKeyLight,
        LightPresets.StudioFillLight,
        LightPresets.StudioBackLight,
        LightPresets.DefaultAmbient
    ],
    'Natural': [
        LightPresets.Sunlight,
        LightPresets.SkyAmbient
    ],
    'Night': [
        LightPresets.Moonlight,
        {
            type: 'ambient',
            color: '#191970',
            intensity: 0.1
        }
    ],
    'Indoor': [
        {
            type: 'ambient',
            color: '#f5f5dc',
            intensity: 0.3
        },
        {
            type: 'point',
            color: '#ffffff',
            intensity: 1.0,
            position: { x: 0, y: 4, z: 0 },
            distance: 20,
            decay: 2,
            castShadow: true
        }
    ],
    'Dramatic': [
        {
            type: 'directional',
            color: '#ffffff',
            intensity: 2.0,
            position: { x: 10, y: 20, z: -5 },
            castShadow: true,
            shadow: {
                mapSize: 4096,
                cameraSize: 20
            }
        },
        {
            type: 'ambient',
            color: '#000000',
            intensity: 0.1
        }
    ]
};
/**
 * Light utilities
 * 光照工具
 */
class LightUtils {
    /**
     * Calculate light intensity for distance
     * 根据距离计算光照强度
     */
    static calculateIntensityForDistance(baseIntensity, distance, decay = 2) {
        return baseIntensity / Math.pow(distance, decay);
    }
    /**
     * Convert color temperature to RGB
     * 将色温转换为RGB
     */
    static colorTemperatureToRGB(temperature) {
        // Simplified color temperature to RGB conversion
        let red, green, blue;
        temperature = temperature / 100;
        if (temperature <= 66) {
            red = 255;
            green = temperature;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;
            if (temperature >= 19) {
                blue = temperature - 10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            }
            else {
                blue = 0;
            }
        }
        else {
            red = temperature - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);
            green = temperature - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);
            blue = 255;
        }
        red = Math.max(0, Math.min(255, red));
        green = Math.max(0, Math.min(255, green));
        blue = Math.max(0, Math.min(255, blue));
        return `#${Math.round(red).toString(16).padStart(2, '0')}${Math.round(green).toString(16).padStart(2, '0')}${Math.round(blue).toString(16).padStart(2, '0')}`;
    }
    /**
     * Create lighting setup from preset
     * 从预设创建光照设置
     */
    static createLightingSetup(setupName) {
        const configs = LightingSetups[setupName];
        if (!configs) {
            console.warn(`Lighting setup '${setupName}' not found`);
            return [];
        }
        return configs.map(config => LightFactory.createLight(config));
    }
    /**
     * Get available lighting categories
     * 获取可用的光照分类
     */
    static getLightingCategories() {
        return {
            'Basic': ['DefaultAmbient', 'DefaultDirectional'],
            'Studio': ['StudioKeyLight', 'StudioFillLight', 'StudioBackLight'],
            'Natural': ['Sunlight', 'Moonlight', 'SkyAmbient'],
            'Colored': ['WarmSpot', 'CoolPoint'],
            'Atmospheric': ['FireGlow', 'NeonBlue', 'NeonPink']
        };
    }
    /**
     * Animate light intensity
     * 动画光照强度
     */
    static animateLightIntensity(light, targetIntensity, duration = 1000) {
        return new Promise((resolve) => {
            const startIntensity = light.intensity;
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                light.intensity = startIntensity + (targetIntensity - startIntensity) * progress;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    resolve();
                }
            };
            animate();
        });
    }
}

/**
 * Three.js Cameras
 * Three.js相机系统
 */
/**
 * Camera factory for creating Three.js cameras
 * 相机工厂 - 用于创建Three.js相机
 */
class CameraFactory {
    /**
     * Create camera from configuration
     * 根据配置创建相机
     */
    static createCamera(config) {
        switch (config.type) {
            case 'perspective':
                return new THREE__namespace.PerspectiveCamera(config.fov || 75, config.aspect || 1, config.near || 0.1, config.far || 1000);
            case 'orthographic':
                const size = config.size || 10;
                const aspect = config.aspect || 1;
                return new THREE__namespace.OrthographicCamera(-size * aspect, size * aspect, size, -size, config.near || 0.1, config.far || 1000);
            case 'stereo':
                const stereoCamera = new THREE__namespace.StereoCamera();
                stereoCamera.aspect = config.aspect || 1;
                stereoCamera.eyeSep = config.eyeSeparation || 0.064;
                return stereoCamera; // Cast needed due to StereoCamera not extending Camera
            default:
                return new THREE__namespace.PerspectiveCamera(75, 1, 0.1, 1000);
        }
    }
    /**
     * Create camera controls
     * 创建相机控制器
     */
    static createCameraControls(camera, domElement, type = 'orbit') {
        // Note: This would require importing control libraries
        // For now, we'll return a mock object
        switch (type) {
            case 'orbit':
                // return new OrbitControls(camera, domElement);
                return { type: 'orbit', camera, domElement };
            case 'fly':
                // return new FlyControls(camera, domElement);
                return { type: 'fly', camera, domElement };
            case 'first-person':
                // return new FirstPersonControls(camera, domElement);
                return { type: 'first-person', camera, domElement };
            case 'trackball':
                // return new TrackballControls(camera, domElement);
                return { type: 'trackball', camera, domElement };
            default:
                return { type: 'orbit', camera, domElement };
        }
    }
    /**
     * Create camera helper for visualization
     * 创建相机辅助器用于可视化
     */
    static createCameraHelper(camera) {
        return new THREE__namespace.CameraHelper(camera);
    }
}
/**
 * Predefined camera presets
 * 预定义相机预设
 */
const CameraPresets = {
    // Basic cameras
    'DefaultPerspective': {
        type: 'perspective',
        fov: 75,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000,
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
    },
    'DefaultOrthographic': {
        type: 'orthographic',
        size: 10,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000,
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
    },
    // Perspective variations
    'WideFOV': {
        type: 'perspective',
        fov: 90,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000
    },
    'NarrowFOV': {
        type: 'perspective',
        fov: 45,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000
    },
    'TelephotoLens': {
        type: 'perspective',
        fov: 30,
        aspect: 16 / 9,
        near: 1,
        far: 2000
    },
    'WideAngleLens': {
        type: 'perspective',
        fov: 100,
        aspect: 16 / 9,
        near: 0.01,
        far: 500
    },
    // Orthographic variations
    'TopDown': {
        type: 'orthographic',
        size: 10,
        aspect: 1,
        near: 0.1,
        far: 100,
        position: { x: 0, y: 20, z: 0 },
        rotation: { x: -90, y: 0, z: 0 }
    },
    'SideView': {
        type: 'orthographic',
        size: 10,
        aspect: 16 / 9,
        near: 0.1,
        far: 100,
        position: { x: 20, y: 0, z: 0 },
        rotation: { x: 0, y: 90, z: 0 }
    },
    'FrontView': {
        type: 'orthographic',
        size: 10,
        aspect: 16 / 9,
        near: 0.1,
        far: 100,
        position: { x: 0, y: 0, z: 20 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    // Cinematic cameras
    'CinematicWide': {
        type: 'perspective',
        fov: 85,
        aspect: 21 / 9, // Ultra-wide cinematic aspect
        near: 0.1,
        far: 1000
    },
    'CinematicStandard': {
        type: 'perspective',
        fov: 50,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000
    },
    'Portrait': {
        type: 'perspective',
        fov: 75,
        aspect: 9 / 16,
        near: 0.1,
        far: 1000
    },
    // Game-style cameras
    'ThirdPerson': {
        type: 'perspective',
        fov: 75,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 5, z: 10 },
        target: { x: 0, y: 0, z: 0 }
    },
    'FirstPerson': {
        type: 'perspective',
        fov: 90,
        aspect: 16 / 9,
        near: 0.01,
        far: 1000,
        position: { x: 0, y: 1.8, z: 0 }
    },
    'IsometricGame': {
        type: 'orthographic',
        size: 15,
        aspect: 16 / 9,
        near: 0.1,
        far: 1000,
        position: { x: 10, y: 10, z: 10 },
        target: { x: 0, y: 0, z: 0 }
    },
    // Architectural cameras
    'ArchViz': {
        type: 'perspective',
        fov: 60,
        aspect: 16 / 9,
        near: 0.1,
        far: 2000,
        position: { x: 15, y: 8, z: 15 }
    },
    'Interior': {
        type: 'perspective',
        fov: 75,
        aspect: 16 / 9,
        near: 0.01,
        far: 100,
        position: { x: 0, y: 1.6, z: 5 }
    }
};
const CameraAnimations = {
    'OrbitAround': {
        name: 'Orbit Around',
        duration: 10000,
        easing: 'linear',
        keyframes: [
            { time: 0, position: { x: 10, y: 5, z: 0 }, target: { x: 0, y: 0, z: 0 } },
            { time: 0.25, position: { x: 0, y: 5, z: 10 }, target: { x: 0, y: 0, z: 0 } },
            { time: 0.5, position: { x: -10, y: 5, z: 0 }, target: { x: 0, y: 0, z: 0 } },
            { time: 0.75, position: { x: 0, y: 5, z: -10 }, target: { x: 0, y: 0, z: 0 } },
            { time: 1, position: { x: 10, y: 5, z: 0 }, target: { x: 0, y: 0, z: 0 } }
        ]
    },
    'ZoomIn': {
        name: 'Zoom In',
        duration: 3000,
        easing: 'ease-in-out',
        keyframes: [
            { time: 0, position: { x: 20, y: 20, z: 20 }, target: { x: 0, y: 0, z: 0 }, fov: 75 },
            { time: 1, position: { x: 5, y: 5, z: 5 }, target: { x: 0, y: 0, z: 0 }, fov: 50 }
        ]
    },
    'Flythrough': {
        name: 'Flythrough',
        duration: 8000,
        easing: 'ease-in-out',
        keyframes: [
            { time: 0, position: { x: -20, y: 2, z: 0 }, target: { x: 0, y: 0, z: 0 } },
            { time: 0.3, position: { x: -5, y: 8, z: 5 }, target: { x: 5, y: 0, z: 0 } },
            { time: 0.7, position: { x: 5, y: 12, z: -5 }, target: { x: 0, y: 0, z: -10 } },
            { time: 1, position: { x: 20, y: 2, z: 0 }, target: { x: 0, y: 0, z: 0 } }
        ]
    },
    'Reveal': {
        name: 'Reveal',
        duration: 5000,
        easing: 'ease-out',
        keyframes: [
            { time: 0, position: { x: 0, y: 0.5, z: 0 }, target: { x: 1, y: 0, z: 0 }, fov: 120 },
            { time: 1, position: { x: 8, y: 6, z: 8 }, target: { x: 0, y: 0, z: 0 }, fov: 75 }
        ]
    }
};
/**
 * Camera utilities
 * 相机工具
 */
class CameraUtils {
    /**
     * Update camera aspect ratio
     * 更新相机宽高比
     */
    static updateAspectRatio(camera, width, height) {
        const aspect = width / height;
        if (camera instanceof THREE__namespace.PerspectiveCamera) {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        }
        else if (camera instanceof THREE__namespace.OrthographicCamera) {
            const size = Math.abs(camera.top);
            camera.left = -size * aspect;
            camera.right = size * aspect;
            camera.updateProjectionMatrix();
        }
    }
    /**
     * Position camera to look at target
     * 定位相机以查看目标
     */
    static lookAt(camera, target) {
        camera.lookAt(target);
    }
    /**
     * Calculate camera distance from target
     * 计算相机到目标的距离
     */
    static getDistanceToTarget(camera, target) {
        return camera.position.distanceTo(target);
    }
    /**
     * Frame object in camera view
     * 在相机视图中框架对象
     */
    static frameObject(camera, object, fitRatio = 1.2) {
        const box = new THREE__namespace.Box3().setFromObject(object);
        const size = box.getSize(new THREE__namespace.Vector3());
        const center = box.getCenter(new THREE__namespace.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        if (camera instanceof THREE__namespace.PerspectiveCamera) {
            const distance = maxSize / (2 * Math.tan(THREE__namespace.MathUtils.degToRad(camera.fov) / 2)) * fitRatio;
            const direction = camera.position.clone().sub(center).normalize();
            camera.position.copy(center).add(direction.multiplyScalar(distance));
        }
        else if (camera instanceof THREE__namespace.OrthographicCamera) {
            camera.zoom = 1 / fitRatio;
            camera.updateProjectionMatrix();
        }
        camera.lookAt(center);
    }
    /**
     * Create camera from preset
     * 从预设创建相机
     */
    static createFromPreset(presetName) {
        const config = CameraPresets[presetName];
        if (!config) {
            console.warn(`Camera preset '${presetName}' not found`);
            return CameraFactory.createCamera(CameraPresets.DefaultPerspective);
        }
        const camera = CameraFactory.createCamera(config);
        if (config.position) {
            camera.position.set(config.position.x, config.position.y, config.position.z);
        }
        if (config.rotation) {
            camera.rotation.set(THREE__namespace.MathUtils.degToRad(config.rotation.x), THREE__namespace.MathUtils.degToRad(config.rotation.y), THREE__namespace.MathUtils.degToRad(config.rotation.z));
        }
        if (config.target) {
            camera.lookAt(new THREE__namespace.Vector3(config.target.x, config.target.y, config.target.z));
        }
        return camera;
    }
    /**
     * Animate camera between two positions
     * 在两个位置之间动画相机
     */
    static animateCamera(camera, fromConfig, toConfig, duration = 1000, onComplete) {
        const startTime = Date.now();
        const startPos = camera.position.clone();
        const endPos = new THREE__namespace.Vector3(toConfig.position?.x || 0, toConfig.position?.y || 0, toConfig.position?.z || 0);
        let startFOV = 75;
        let endFOV = 75;
        if (camera instanceof THREE__namespace.PerspectiveCamera) {
            startFOV = camera.fov;
            endFOV = toConfig.fov || camera.fov;
        }
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease in-out function
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            // Interpolate position
            camera.position.lerpVectors(startPos, endPos, eased);
            // Interpolate FOV for perspective cameras
            if (camera instanceof THREE__namespace.PerspectiveCamera) {
                camera.fov = THREE__namespace.MathUtils.lerp(startFOV, endFOV, eased);
                camera.updateProjectionMatrix();
            }
            // Look at target if specified
            if (toConfig.target) {
                camera.lookAt(new THREE__namespace.Vector3(toConfig.target.x, toConfig.target.y, toConfig.target.z));
            }
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else if (onComplete) {
                onComplete();
            }
        };
        animate();
    }
    /**
     * Get camera categories
     * 获取相机分类
     */
    static getCameraCategories() {
        return {
            'Basic': ['DefaultPerspective', 'DefaultOrthographic'],
            'Perspective': ['WideFOV', 'NarrowFOV', 'TelephotoLens', 'WideAngleLens'],
            'Orthographic': ['TopDown', 'SideView', 'FrontView'],
            'Cinematic': ['CinematicWide', 'CinematicStandard', 'Portrait'],
            'Game': ['ThirdPerson', 'FirstPerson', 'IsometricGame'],
            'Architectural': ['ArchViz', 'Interior']
        };
    }
    /**
     * Export camera configuration
     * 导出相机配置
     */
    static exportCameraConfig(camera) {
        const config = {
            type: camera instanceof THREE__namespace.PerspectiveCamera ? 'perspective' : 'orthographic',
            position: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            },
            rotation: {
                x: THREE__namespace.MathUtils.radToDeg(camera.rotation.x),
                y: THREE__namespace.MathUtils.radToDeg(camera.rotation.y),
                z: THREE__namespace.MathUtils.radToDeg(camera.rotation.z)
            }
        };
        if (camera instanceof THREE__namespace.PerspectiveCamera) {
            config.fov = camera.fov;
            config.aspect = camera.aspect;
            config.near = camera.near;
            config.far = camera.far;
        }
        else if (camera instanceof THREE__namespace.OrthographicCamera) {
            config.size = Math.abs(camera.top);
            config.aspect = Math.abs(camera.right / camera.top);
            config.near = camera.near;
            config.far = camera.far;
        }
        return config;
    }
}

/**
 * @nova-engine/render-three - Three.js Rendering Adapter
 * Three.js渲染适配器 - 用于Nova引擎的Three.js渲染支持
 */
const VERSION = '1.0.0';
const MODULE_NAME = 'nova-ecs-render-three';

exports.CameraAnimations = CameraAnimations;
exports.CameraFactory = CameraFactory;
exports.CameraPresets = CameraPresets;
exports.CameraUtils = CameraUtils;
exports.EntityConverter = EntityConverter;
exports.GeometryFactory = GeometryFactory;
exports.GeometryPresets = GeometryPresets;
exports.GeometryUtils = GeometryUtils;
exports.LightFactory = LightFactory;
exports.LightPresets = LightPresets;
exports.LightUtils = LightUtils;
exports.LightingSetups = LightingSetups;
exports.MODULE_NAME = MODULE_NAME;
exports.MaterialFactory = MaterialFactory;
exports.MaterialPresets = MaterialPresets;
exports.MaterialUtils = MaterialUtils;
exports.MeshRendererComponent = MeshRendererComponent;
exports.ThreeCameraComponent = ThreeCameraComponent;
exports.ThreeEditorBridge = ThreeEditorBridge;
exports.ThreeGeometryComponent = ThreeGeometryComponent;
exports.ThreeLightComponent = ThreeLightComponent;
exports.ThreeMaterialComponent = ThreeMaterialComponent;
exports.ThreeMeshComponent = ThreeMeshComponent;
exports.ThreeRenderSystem = ThreeRenderSystem;
exports.TransformComponent = TransformComponent;
exports.VERSION = VERSION;
//# sourceMappingURL=index.js.map
