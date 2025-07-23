/**
 * Three.js Lights
 * Three.js光照系统
 */

import * as THREE from 'three';

/**
 * Light factory for creating Three.js lights
 * 光照工厂 - 用于创建Three.js光照
 */
export class LightFactory {
  /**
   * Create light from configuration
   * 根据配置创建光照
   */
  static createLight(config: LightConfig): THREE.Light {
    const color = new THREE.Color(config.color);
    
    switch (config.type) {
      case 'ambient':
        return new THREE.AmbientLight(color, config.intensity);

      case 'directional':
        const directionalLight = new THREE.DirectionalLight(color, config.intensity);
        directionalLight.castShadow = config.castShadow || false;
        
        if (config.castShadow) {
          this.setupDirectionalLightShadows(directionalLight, config);
        }
        
        if (config.target) {
          directionalLight.target.position.set(config.target.x, config.target.y, config.target.z);
        }
        
        return directionalLight;

      case 'point':
        const pointLight = new THREE.PointLight(color, config.intensity, config.distance, config.decay);
        pointLight.castShadow = config.castShadow || false;
        
        if (config.castShadow) {
          this.setupPointLightShadows(pointLight, config);
        }
        
        return pointLight;

      case 'spot':
        const spotLight = new THREE.SpotLight(
          color, 
          config.intensity, 
          config.distance, 
          config.angle, 
          config.penumbra, 
          config.decay
        );
        spotLight.castShadow = config.castShadow || false;
        
        if (config.castShadow) {
          this.setupSpotLightShadows(spotLight, config);
        }
        
        if (config.target) {
          spotLight.target.position.set(config.target.x, config.target.y, config.target.z);
        }
        
        return spotLight;

      case 'hemisphere':
        return new THREE.HemisphereLight(color, config.groundColor, config.intensity);

      case 'rectArea':
        const rectAreaLight = new THREE.RectAreaLight(color, config.intensity, config.width, config.height);
        return rectAreaLight;

      default:
        return new THREE.DirectionalLight(color, config.intensity);
    }
  }

  /**
   * Setup shadows for directional light
   * 为方向光设置阴影
   */
  private static setupDirectionalLightShadows(light: THREE.DirectionalLight, config: LightConfig): void {
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
  private static setupPointLightShadows(light: THREE.PointLight, config: LightConfig): void {
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
  private static setupSpotLightShadows(light: THREE.SpotLight, config: LightConfig): void {
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
  static createLightHelper(light: THREE.Light): THREE.Object3D | null {
    if (light instanceof THREE.DirectionalLight) {
      return new THREE.DirectionalLightHelper(light, 1);
    } else if (light instanceof THREE.PointLight) {
      return new THREE.PointLightHelper(light, 0.1);
    } else if (light instanceof THREE.SpotLight) {
      return new THREE.SpotLightHelper(light);
    } else if (light instanceof THREE.HemisphereLight) {
      return new THREE.HemisphereLightHelper(light, 1);
    } else if (light instanceof THREE.RectAreaLight) {
      // Note: RectAreaLightHelper requires RectAreaLightUniformsLib
      // return new THREE.RectAreaLightHelper(light);
      return null;
    }
    
    return null;
  }
}

/**
 * Light configuration interface
 * 光照配置接口
 */
export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rectArea';
  color: string;
  intensity: number;
  
  // Position and target
  position?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  
  // Point and spot light properties
  distance?: number;
  decay?: number;
  
  // Spot light properties
  angle?: number;
  penumbra?: number;
  
  // Hemisphere light properties
  groundColor?: string;
  
  // Rect area light properties
  width?: number;
  height?: number;
  
  // Shadow properties
  castShadow?: boolean;
  shadow?: ShadowConfig;
}

/**
 * Shadow configuration interface
 * 阴影配置接口
 */
export interface ShadowConfig {
  mapSize?: number;
  near?: number;
  far?: number;
  bias?: number;
  normalBias?: number;
  radius?: number;
  cameraSize?: number; // For directional light shadow camera
}

/**
 * Predefined light presets
 * 预定义光照预设
 */
export const LightPresets: Record<string, LightConfig> = {
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
export const LightingSetups: Record<string, LightConfig[]> = {
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
export class LightUtils {
  /**
   * Calculate light intensity for distance
   * 根据距离计算光照强度
   */
  static calculateIntensityForDistance(baseIntensity: number, distance: number, decay: number = 2): number {
    return baseIntensity / Math.pow(distance, decay);
  }

  /**
   * Convert color temperature to RGB
   * 将色温转换为RGB
   */
  static colorTemperatureToRGB(temperature: number): string {
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
      } else {
        blue = 0;
      }
    } else {
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
  static createLightingSetup(setupName: string): THREE.Light[] {
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
  static getLightingCategories(): Record<string, string[]> {
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
  static animateLightIntensity(
    light: THREE.Light, 
    targetIntensity: number, 
    duration: number = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      const startIntensity = light.intensity;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        light.intensity = startIntensity + (targetIntensity - startIntensity) * progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
}