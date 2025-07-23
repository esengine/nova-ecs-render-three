/**
 * Three.js Geometries
 * Three.js几何体系统
 */

import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Geometry factory for creating Three.js geometries
 * 几何体工厂 - 用于创建Three.js几何体
 */
export class GeometryFactory {
  private static geometryCache = new Map<string, THREE.BufferGeometry>();

  /**
   * Create geometry from configuration
   * 根据配置创建几何体
   */
  static createGeometry(config: GeometryConfig): THREE.BufferGeometry {
    const cacheKey = this.getCacheKey(config);
    
    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!.clone();
    }

    let geometry: THREE.BufferGeometry;

    switch (config.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          config.width || 1,
          config.height || 1,
          config.depth || 1,
          config.widthSegments || 1,
          config.heightSegments || 1,
          config.depthSegments || 1
        );
        break;

      case 'sphere':
        geometry = new THREE.SphereGeometry(
          config.radius || 0.5,
          config.widthSegments || 16,
          config.heightSegments || 12,
          config.phiStart || 0,
          config.phiLength || Math.PI * 2,
          config.thetaStart || 0,
          config.thetaLength || Math.PI
        );
        break;

      case 'plane':
        geometry = new THREE.PlaneGeometry(
          config.width || 1,
          config.height || 1,
          config.widthSegments || 1,
          config.heightSegments || 1
        );
        break;

      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          config.radiusTop || 0.5,
          config.radiusBottom || 0.5,
          config.height || 1,
          config.radialSegments || 8,
          config.heightSegments || 1,
          config.openEnded || false,
          config.thetaStart || 0,
          config.thetaLength || Math.PI * 2
        );
        break;

      case 'cone':
        geometry = new THREE.ConeGeometry(
          config.radius || 0.5,
          config.height || 1,
          config.radialSegments || 8,
          config.heightSegments || 1,
          config.openEnded || false,
          config.thetaStart || 0,
          config.thetaLength || Math.PI * 2
        );
        break;

      case 'torus':
        geometry = new THREE.TorusGeometry(
          config.radius || 0.4,
          config.tube || 0.2,
          config.radialSegments || 8,
          config.tubularSegments || 6,
          config.arc || Math.PI * 2
        );
        break;

      case 'torusKnot':
        geometry = new THREE.TorusKnotGeometry(
          config.radius || 0.4,
          config.tube || 0.1,
          config.tubularSegments || 64,
          config.radialSegments || 8,
          config.p || 2,
          config.q || 3
        );
        break;

      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(
          config.radius || 0.5,
          config.detail || 0
        );
        break;

      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(
          config.radius || 0.5,
          config.detail || 0
        );
        break;

      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(
          config.radius || 0.5,
          config.detail || 0
        );
        break;

      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(
          config.radius || 0.5,
          config.detail || 0
        );
        break;

      case 'capsule':
        geometry = new THREE.CapsuleGeometry(
          config.radius || 0.3,
          config.length || 0.8,
          config.capSegments || 4,
          config.radialSegments || 8
        );
        break;

      case 'ring':
        geometry = new THREE.RingGeometry(
          config.innerRadius || 0.2,
          config.outerRadius || 0.5,
          config.thetaSegments || 8,
          config.phiSegments || 1,
          config.thetaStart || 0,
          config.thetaLength || Math.PI * 2
        );
        break;

      case 'lathe':
        const points = config.points || [
          new THREE.Vector2(0, -0.5),
          new THREE.Vector2(0.5, 0),
          new THREE.Vector2(0, 0.5)
        ];
        geometry = new THREE.LatheGeometry(
          points,
          config.segments || 12,
          config.phiStart || 0,
          config.phiLength || Math.PI * 2
        );
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
          geometry = new THREE.ExtrudeGeometry(config.shape, extrudeSettings);
        } else {
          // Fallback to box if no shape provided
          geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        break;

      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    // Cache the geometry
    this.geometryCache.set(cacheKey, geometry.clone());
    
    return geometry;
  }

  /**
   * Generate cache key for geometry configuration
   * 为几何体配置生成缓存键
   */
  private static getCacheKey(config: GeometryConfig): string {
    return JSON.stringify(config);
  }

  /**
   * Clear geometry cache
   * 清除几何体缓存
   */
  static clearCache(): void {
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.geometryCache.clear();
  }

  /**
   * Create custom shape for extrusion
   * 为挤压创建自定义形状
   */
  static createShape(points: THREE.Vector2[]): THREE.Shape {
    const shape = new THREE.Shape();
    if (points.length > 0) {
      shape.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
      }
    }
    return shape;
  }
}

/**
 * Geometry configuration interface
 * 几何体配置接口
 */
export interface GeometryConfig {
  type: 'box' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus' | 'torusKnot' | 
        'dodecahedron' | 'icosahedron' | 'octahedron' | 'tetrahedron' | 'capsule' | 
        'ring' | 'lathe' | 'extrude';
  
  // Common properties
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  
  // Segment properties
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  radialSegments?: number;
  tubularSegments?: number;
  
  // Sphere specific
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
  
  // Cylinder/Cone specific
  radiusTop?: number;
  radiusBottom?: number;
  openEnded?: boolean;
  
  // Torus specific
  tube?: number;
  arc?: number;
  
  // Torus knot specific
  p?: number;
  q?: number;
  
  // Polyhedron specific
  detail?: number;
  
  // Capsule specific
  capSegments?: number;
  length?: number;
  
  // Ring specific
  innerRadius?: number;
  outerRadius?: number;
  thetaSegments?: number;
  phiSegments?: number;
  
  // Lathe specific
  points?: THREE.Vector2[];
  segments?: number;
  
  // Extrude specific
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
export const GeometryPresets: Record<string, GeometryConfig> = {
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
export class GeometryUtils {
  /**
   * Calculate bounding box of geometry
   * 计算几何体边界框
   */
  static calculateBoundingBox(geometry: THREE.BufferGeometry): THREE.Box3 {
    geometry.computeBoundingBox();
    return geometry.boundingBox || new THREE.Box3();
  }

  /**
   * Calculate bounding sphere of geometry
   * 计算几何体边界球
   */
  static calculateBoundingSphere(geometry: THREE.BufferGeometry): THREE.Sphere {
    geometry.computeBoundingSphere();
    return geometry.boundingSphere || new THREE.Sphere();
  }

  /**
   * Merge multiple geometries
   * 合并多个几何体
   */
  static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    return mergeGeometries(geometries);
  }

  /**
   * Create wireframe geometry
   * 创建线框几何体
   */
  static createWireframe(geometry: THREE.BufferGeometry): THREE.WireframeGeometry {
    return new THREE.WireframeGeometry(geometry);
  }

  /**
   * Create edges geometry
   * 创建边缘几何体
   */
  static createEdges(geometry: THREE.BufferGeometry, thresholdAngle: number = 1): THREE.EdgesGeometry {
    return new THREE.EdgesGeometry(geometry, thresholdAngle);
  }

  /**
   * Get geometry categories
   * 获取几何体分类
   */
  static getGeometryCategories(): Record<string, string[]> {
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
  static optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // Remove duplicate vertices
    geometry = mergeVertices(geometry);
    
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