/**
 * Three.js Cameras
 * Three.js相机系统
 */

import * as THREE from 'three';

/**
 * Camera factory for creating Three.js cameras
 * 相机工厂 - 用于创建Three.js相机
 */
export class CameraFactory {
  /**
   * Create camera from configuration
   * 根据配置创建相机
   */
  static createCamera(config: CameraConfig): THREE.Camera {
    switch (config.type) {
      case 'perspective':
        return new THREE.PerspectiveCamera(
          config.fov || 75,
          config.aspect || 1,
          config.near || 0.1,
          config.far || 1000
        );

      case 'orthographic':
        const size = config.size || 10;
        const aspect = config.aspect || 1;
        return new THREE.OrthographicCamera(
          -size * aspect,
          size * aspect,
          size,
          -size,
          config.near || 0.1,
          config.far || 1000
        );

      case 'stereo':
        const stereoCamera = new THREE.StereoCamera();
        stereoCamera.aspect = config.aspect || 1;
        stereoCamera.eyeSep = config.eyeSeparation || 0.064;
        return stereoCamera as any; // Cast needed due to StereoCamera not extending Camera

      default:
        return new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    }
  }

  /**
   * Create camera controls
   * 创建相机控制器
   */
  static createCameraControls(camera: THREE.Camera, domElement: HTMLElement, type: CameraControlType = 'orbit'): any {
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
  static createCameraHelper(camera: THREE.Camera): THREE.CameraHelper {
    return new THREE.CameraHelper(camera);
  }
}

/**
 * Camera configuration interface
 * 相机配置接口
 */
export interface CameraConfig {
  type: 'perspective' | 'orthographic' | 'stereo';
  
  // Common properties
  aspect?: number;
  near?: number;
  far?: number;
  
  // Perspective camera
  fov?: number;
  
  // Orthographic camera
  size?: number;
  
  // Stereo camera
  eyeSeparation?: number;
  
  // Position and rotation
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
}

/**
 * Camera control types
 * 相机控制类型
 */
export type CameraControlType = 'orbit' | 'fly' | 'first-person' | 'trackball';

/**
 * Predefined camera presets
 * 预定义相机预设
 */
export const CameraPresets: Record<string, CameraConfig> = {
  // Basic cameras
  'DefaultPerspective': {
    type: 'perspective',
    fov: 75,
    aspect: 16/9,
    near: 0.1,
    far: 1000,
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 }
  },
  
  'DefaultOrthographic': {
    type: 'orthographic',
    size: 10,
    aspect: 16/9,
    near: 0.1,
    far: 1000,
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 }
  },

  // Perspective variations
  'WideFOV': {
    type: 'perspective',
    fov: 90,
    aspect: 16/9,
    near: 0.1,
    far: 1000
  },
  
  'NarrowFOV': {
    type: 'perspective',
    fov: 45,
    aspect: 16/9,
    near: 0.1,
    far: 1000
  },

  'TelephotoLens': {
    type: 'perspective',
    fov: 30,
    aspect: 16/9,
    near: 1,
    far: 2000
  },

  'WideAngleLens': {
    type: 'perspective',
    fov: 100,
    aspect: 16/9,
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
    aspect: 16/9,
    near: 0.1,
    far: 100,
    position: { x: 20, y: 0, z: 0 },
    rotation: { x: 0, y: 90, z: 0 }
  },

  'FrontView': {
    type: 'orthographic',
    size: 10,
    aspect: 16/9,
    near: 0.1,
    far: 100,
    position: { x: 0, y: 0, z: 20 },
    rotation: { x: 0, y: 0, z: 0 }
  },

  // Cinematic cameras
  'CinematicWide': {
    type: 'perspective',
    fov: 85,
    aspect: 21/9, // Ultra-wide cinematic aspect
    near: 0.1,
    far: 1000
  },

  'CinematicStandard': {
    type: 'perspective',
    fov: 50,
    aspect: 16/9,
    near: 0.1,
    far: 1000
  },

  'Portrait': {
    type: 'perspective',
    fov: 75,
    aspect: 9/16,
    near: 0.1,
    far: 1000
  },

  // Game-style cameras
  'ThirdPerson': {
    type: 'perspective',
    fov: 75,
    aspect: 16/9,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 },
    target: { x: 0, y: 0, z: 0 }
  },

  'FirstPerson': {
    type: 'perspective',
    fov: 90,
    aspect: 16/9,
    near: 0.01,
    far: 1000,
    position: { x: 0, y: 1.8, z: 0 }
  },

  'IsometricGame': {
    type: 'orthographic',
    size: 15,
    aspect: 16/9,
    near: 0.1,
    far: 1000,
    position: { x: 10, y: 10, z: 10 },
    target: { x: 0, y: 0, z: 0 }
  },

  // Architectural cameras
  'ArchViz': {
    type: 'perspective',
    fov: 60,
    aspect: 16/9,
    near: 0.1,
    far: 2000,
    position: { x: 15, y: 8, z: 15 }
  },

  'Interior': {
    type: 'perspective',
    fov: 75,
    aspect: 16/9,
    near: 0.01,
    far: 100,
    position: { x: 0, y: 1.6, z: 5 }
  }
};

/**
 * Camera animation presets
 * 相机动画预设
 */
export interface CameraAnimation {
  name: string;
  keyframes: CameraKeyframe[];
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface CameraKeyframe {
  time: number; // 0-1
  position: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  fov?: number;
}

export const CameraAnimations: Record<string, CameraAnimation> = {
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
export class CameraUtils {
  /**
   * Update camera aspect ratio
   * 更新相机宽高比
   */
  static updateAspectRatio(camera: THREE.Camera, width: number, height: number): void {
    const aspect = width / height;
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    } else if (camera instanceof THREE.OrthographicCamera) {
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
  static lookAt(camera: THREE.Camera, target: THREE.Vector3): void {
    camera.lookAt(target);
  }

  /**
   * Calculate camera distance from target
   * 计算相机到目标的距离
   */
  static getDistanceToTarget(camera: THREE.Camera, target: THREE.Vector3): number {
    return camera.position.distanceTo(target);
  }

  /**
   * Frame object in camera view
   * 在相机视图中框架对象
   */
  static frameObject(
    camera: THREE.Camera, 
    object: THREE.Object3D, 
    fitRatio: number = 1.2
  ): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    const maxSize = Math.max(size.x, size.y, size.z);
    
    if (camera instanceof THREE.PerspectiveCamera) {
      const distance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * fitRatio;
      const direction = camera.position.clone().sub(center).normalize();
      camera.position.copy(center).add(direction.multiplyScalar(distance));
    } else if (camera instanceof THREE.OrthographicCamera) {
      const distance = maxSize * fitRatio;
      camera.zoom = 1 / fitRatio;
      camera.updateProjectionMatrix();
    }
    
    camera.lookAt(center);
  }

  /**
   * Create camera from preset
   * 从预设创建相机
   */
  static createFromPreset(presetName: string): THREE.Camera {
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
      camera.rotation.set(
        THREE.MathUtils.degToRad(config.rotation.x),
        THREE.MathUtils.degToRad(config.rotation.y),
        THREE.MathUtils.degToRad(config.rotation.z)
      );
    }
    
    if (config.target) {
      camera.lookAt(new THREE.Vector3(config.target.x, config.target.y, config.target.z));
    }
    
    return camera;
  }

  /**
   * Animate camera between two positions
   * 在两个位置之间动画相机
   */
  static animateCamera(
    camera: THREE.Camera,
    fromConfig: CameraConfig,
    toConfig: CameraConfig,
    duration: number = 1000,
    onComplete?: () => void
  ): void {
    const startTime = Date.now();
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(
      toConfig.position?.x || 0,
      toConfig.position?.y || 0,
      toConfig.position?.z || 0
    );
    
    let startFOV = 75;
    let endFOV = 75;
    
    if (camera instanceof THREE.PerspectiveCamera) {
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
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(startFOV, endFOV, eased);
        camera.updateProjectionMatrix();
      }
      
      // Look at target if specified
      if (toConfig.target) {
        camera.lookAt(new THREE.Vector3(toConfig.target.x, toConfig.target.y, toConfig.target.z));
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };
    
    animate();
  }

  /**
   * Get camera categories
   * 获取相机分类
   */
  static getCameraCategories(): Record<string, string[]> {
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
  static exportCameraConfig(camera: THREE.Camera): CameraConfig {
    const config: CameraConfig = {
      type: camera instanceof THREE.PerspectiveCamera ? 'perspective' : 'orthographic',
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      },
      rotation: {
        x: THREE.MathUtils.radToDeg(camera.rotation.x),
        y: THREE.MathUtils.radToDeg(camera.rotation.y),
        z: THREE.MathUtils.radToDeg(camera.rotation.z)
      }
    };
    
    if (camera instanceof THREE.PerspectiveCamera) {
      config.fov = camera.fov;
      config.aspect = camera.aspect;
      config.near = camera.near;
      config.far = camera.far;
    } else if (camera instanceof THREE.OrthographicCamera) {
      config.size = Math.abs(camera.top);
      config.aspect = Math.abs(camera.right / camera.top);
      config.near = camera.near;
      config.far = camera.far;
    }
    
    return config;
  }
}