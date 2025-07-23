/**
 * Three.js Geometry Component - geometry configuration
 * Three.js几何体组件 - 几何体配置
 */

import { Component } from '@esengine/nova-ecs';

export class ThreeGeometryComponent extends Component {
  public geometryType: 'box' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus' | 'custom';
  public parameters: Record<string, number>;
  public needsUpdate: boolean = false;

  constructor(geometryType: string = 'box', parameters: Record<string, number> = {}) {
    super();
    this.geometryType = geometryType as any;
    this.parameters = parameters;
  }
}