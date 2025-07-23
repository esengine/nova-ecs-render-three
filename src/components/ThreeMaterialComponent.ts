/**
 * Three.js Material Component - material configuration
 * Three.js材质组件 - 材质配置
 */

import { Component } from '@esengine/nova-ecs';

export class ThreeMaterialComponent extends Component {
  public materialType: 'standard' | 'basic' | 'phong' | 'physical' | 'wireframe';
  public color: string;
  public metalness: number;
  public roughness: number;
  public emissive: string;
  public emissiveIntensity: number;
  public transparent: boolean;
  public opacity: number;
  public wireframe: boolean;
  public texture?: string;
  public needsUpdate: boolean = false;

  constructor(config: Partial<ThreeMaterialComponent> = {}) {
    super();
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