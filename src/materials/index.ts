/**
 * Three.js Materials
 * Three.js材质系统
 */

import * as THREE from 'three';

/**
 * Material factory for creating Three.js materials
 * 材质工厂 - 用于创建Three.js材质
 */
export class MaterialFactory {
  private static textureLoader = new THREE.TextureLoader();
  private static textureCache = new Map<string, THREE.Texture>();

  /**
   * Create material from configuration
   * 根据配置创建材质
   */
  static createMaterial(config: MaterialConfig): THREE.Material {
    const baseProps = {
      color: new THREE.Color(config.color),
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      wireframe: config.wireframe || false,
      side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide
    };

    // Load texture if specified
    if (config.texture) {
      const texture = this.loadTexture(config.texture);
      (baseProps as any).map = texture;
    }

    switch (config.type) {
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...baseProps,
          metalness: config.metalness || 0.0,
          roughness: config.roughness || 1.0,
          emissive: config.emissive ? new THREE.Color(config.emissive) : new THREE.Color(0x000000),
          emissiveIntensity: config.emissiveIntensity || 0.0,
          normalMap: config.normalMap ? this.loadTexture(config.normalMap) : undefined,
          roughnessMap: config.roughnessMap ? this.loadTexture(config.roughnessMap) : undefined,
          metalnessMap: config.metalnessMap ? this.loadTexture(config.metalnessMap) : undefined,
          envMapIntensity: config.envMapIntensity || 1.0
        });

      case 'phong':
        return new THREE.MeshPhongMaterial({
          ...baseProps,
          shininess: config.shininess || ((1.0 - (config.roughness || 1.0)) * 100),
          specular: config.specular ? new THREE.Color(config.specular) : new THREE.Color(0x111111),
          emissive: config.emissive ? new THREE.Color(config.emissive) : new THREE.Color(0x000000),
          emissiveIntensity: config.emissiveIntensity || 0.0
        });

      case 'lambert':
        return new THREE.MeshLambertMaterial({
          ...baseProps,
          emissive: config.emissive ? new THREE.Color(config.emissive) : new THREE.Color(0x000000),
          emissiveIntensity: config.emissiveIntensity || 0.0
        });

      case 'basic':
        return new THREE.MeshBasicMaterial(baseProps);

      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          metalness: config.metalness || 0.0,
          roughness: config.roughness || 1.0,
          emissive: config.emissive ? new THREE.Color(config.emissive) : new THREE.Color(0x000000),
          emissiveIntensity: config.emissiveIntensity || 0.0,
          clearcoat: config.clearcoat || 0.0,
          clearcoatRoughness: config.clearcoatRoughness || 0.0,
          transmission: config.transmission || 0.0,
          thickness: config.thickness || 0.0,
          ior: config.ior || 1.5
        });

      case 'toon':
        return new THREE.MeshToonMaterial({
          ...baseProps,
          gradientMap: config.gradientMap ? this.loadTexture(config.gradientMap) : undefined
        });

      case 'matcap':
        return new THREE.MeshMatcapMaterial({
          ...baseProps,
          matcap: config.matcap ? this.loadTexture(config.matcap) : undefined
        });

      case 'wireframe':
        return new THREE.MeshBasicMaterial({
          ...baseProps,
          wireframe: true
        });

      default:
        return new THREE.MeshStandardMaterial(baseProps);
    }
  }

  /**
   * Load texture with caching
   * 带缓存的纹理加载
   */
  private static loadTexture(url: string): THREE.Texture {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }

    const texture = this.textureLoader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    
    this.textureCache.set(url, texture);
    return texture;
  }

  /**
   * Dispose of cached textures
   * 释放缓存的纹理
   */
  static disposeCachedTextures(): void {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
  }
}

/**
 * Material configuration interface
 * 材质配置接口
 */
export interface MaterialConfig {
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
export const MaterialPresets: Record<string, MaterialConfig> = {
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
export class MaterialUtils {
  /**
   * Clone a material configuration
   * 克隆材质配置
   */
  static cloneMaterialConfig(config: MaterialConfig): MaterialConfig {
    return { ...config };
  }

  /**
   * Blend two materials
   * 混合两个材质
   */
  static blendMaterials(material1: MaterialConfig, material2: MaterialConfig, factor: number): MaterialConfig {
    const blended = { ...material1 };
    
    // Blend colors
    const color1 = new THREE.Color(material1.color);
    const color2 = new THREE.Color(material2.color);
    color1.lerp(color2, factor);
    blended.color = '#' + color1.getHexString();

    // Blend numeric properties
    if (material1.metalness !== undefined && material2.metalness !== undefined) {
      blended.metalness = THREE.MathUtils.lerp(material1.metalness, material2.metalness, factor);
    }
    if (material1.roughness !== undefined && material2.roughness !== undefined) {
      blended.roughness = THREE.MathUtils.lerp(material1.roughness, material2.roughness, factor);
    }
    if (material1.opacity !== undefined && material2.opacity !== undefined) {
      blended.opacity = THREE.MathUtils.lerp(material1.opacity, material2.opacity, factor);
    }

    return blended;
  }

  /**
   * Get material names by category
   * 按类别获取材质名称
   */
  static getMaterialsByCategory(): Record<string, string[]> {
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