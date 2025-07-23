/**
 * Three.js Light Component - light configuration
 * Three.js光照组件 - 光照配置
 */

import { Component } from '@esengine/nova-ecs';
import * as THREE from 'three';

export class ThreeLightComponent extends Component {
  public lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  public color: string;
  public intensity: number;
  public castShadow: boolean;
  public light: THREE.Light | null = null;
  public needsUpdate: boolean = false;

  constructor(config: Partial<ThreeLightComponent> = {}) {
    super();
    this.lightType = config.lightType || 'directional';
    this.color = config.color || '#ffffff';
    this.intensity = config.intensity || 1.0;
    this.castShadow = config.castShadow || false;
  }
}