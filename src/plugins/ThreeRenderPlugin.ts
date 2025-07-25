/**
 * Three.js Render Plugin for Nova ECS
 * Nova ECS的Three.js渲染插件
 */

import { BasePlugin, PluginPriority, type World } from '@esengine/nova-ecs';
import { ThreeRenderSystem } from '../systems/ThreeRenderSystem';
import { TransformComponent } from '@esengine/nova-ecs-core';
import { 
  ThreeLightComponent,
  ThreeMeshComponent,
  ThreeMaterialComponent,
  ThreeGeometryComponent,
  ThreeCameraComponent 
} from '../components';
import type { PluginMetadata } from '@esengine/nova-ecs';

/**
 * Configuration for Three.js Render Plugin
 * Three.js渲染插件配置
 */
export interface ThreeRenderPluginConfig extends Record<string, unknown> {
  /** Canvas element to render to | 渲染目标画布元素 */
  canvas?: HTMLCanvasElement;
  /** Enable shadows | 启用阴影 */
  enableShadows?: boolean;
  /** Enable anti-aliasing | 启用抗锯齿 */
  enableAntialiasing?: boolean;
  /** Background color | 背景颜色 */
  backgroundColor?: string;
  /** Auto-create default scene entities | 自动创建默认场景实体 */
  createDefaultEntities?: boolean;
  /** Debug mode | 调试模式 */
  debug?: boolean;
}

/**
 * Three.js Render Plugin
 * Three.js渲染插件
 */
export class ThreeRenderPlugin extends BasePlugin {
  private _renderSystem?: ThreeRenderSystem;

  constructor(config: ThreeRenderPluginConfig = {}) {
    super({
      name: 'three-render',
      version: '1.0.0',
      description: 'Three.js rendering plugin for Nova ECS',
      author: 'Nova Editor Team',
      priority: PluginPriority.High,
      dependencies: [],
      keywords: ['three.js', 'rendering', '3d', 'graphics']
    });

    // Set initial configuration
    this.setConfig({
      enableShadows: true,
      enableAntialiasing: true,
      backgroundColor: '#2c2c2c',
      createDefaultEntities: true,
      debug: false,
      ...config
    });
  }

  /**
   * Install the plugin
   * 安装插件
   */
  async install(world: World): Promise<void> {
    this._world = world;
    

    try {

      // Create and add render system
      this._renderSystem = new ThreeRenderSystem();
      world.addSystem(this._renderSystem);

      // Create default scene entities if enabled
      const config = this.getConfig() as ThreeRenderPluginConfig;
      if (config.createDefaultEntities) {
        this.createDefaultEntities(world);
      }
      
      // Set canvas if provided
      if (config.canvas) {
        this._renderSystem.setCanvas(config.canvas);
      }

    } catch (error) {
      this.error('Failed to install Three.js render plugin');
      throw error;
    }
  }

  /**
   * Uninstall the plugin
   * 卸载插件
   */
  async uninstall(world: World): Promise<void> {

    try {
      // Remove render system
      if (this._renderSystem) {
        world.removeSystem(this._renderSystem);
        this._renderSystem = undefined;
      }


    } catch (error) {
      this.error('Failed to uninstall Three.js render plugin');
      throw error;
    }
  }

  /**
   * Get the render system instance
   * 获取渲染系统实例
   */
  public getRenderSystem(): ThreeRenderSystem | undefined {
    return this._renderSystem;
  }


  /**
   * Update plugin configuration
   * 更新插件配置
   */
  public updateConfig(config: Partial<ThreeRenderPluginConfig>): void {
    const oldConfig = this.getConfig() as ThreeRenderPluginConfig;
    this.setConfig({ ...oldConfig, ...config });
    
    const newConfig = this.getConfig() as ThreeRenderPluginConfig;
    
    // Handle canvas update
    if (config.canvas && config.canvas !== oldConfig.canvas && this._renderSystem) {
      this._renderSystem.setCanvas(config.canvas);
    }
    
    if (newConfig.debug) {
      this.log('Configuration updated');
    }
  }

  /**
   * Create default scene entities without bridge
   * 创建默认场景实体（不使用桥接）
   */
  private createDefaultEntities(world: World): void {
    try {
      // Create main directional light
      let mainLight;
      if ((world as any).createNamedEntity) {
        mainLight = (world as any).createNamedEntity('Directional Light');
      } else {
        mainLight = world.createEntity();
      }

      // Add transform and light components
      const lightTransform = new TransformComponent();
      lightTransform.position = { x: 10, y: 10, z: 5 };
      lightTransform.rotation = { x: -45, y: 45, z: 0 };
      lightTransform.scale = { x: 1, y: 1, z: 1 };
      mainLight.addComponent(lightTransform);

      mainLight.addComponent(new ThreeLightComponent({
        lightType: 'directional',
        color: '#ffffff',
        intensity: 1.0,
        castShadow: true
      }));

      // Create main camera entity
      let mainCamera;
      if ((world as any).createNamedEntity) {
        mainCamera = (world as any).createNamedEntity('MainCamera');
      } else {
        mainCamera = world.createEntity();
      }

      const cameraTransform = new TransformComponent();
      cameraTransform.position = { x: 0, y: 5, z: 10 };
      cameraTransform.rotation = { x: -15, y: 0, z: 0 };
      cameraTransform.scale = { x: 1, y: 1, z: 1 };
      mainCamera.addComponent(cameraTransform);

      this.log('Default scene entities created');
    } catch (error) {
      this.error('Failed to create default entities');
    }
  }

  /**
   * Get typed plugin configuration
   * 获取类型化的插件配置
   */
  public getTypedConfig(): ThreeRenderPluginConfig {
    return this.getConfig() as ThreeRenderPluginConfig;
  }
}