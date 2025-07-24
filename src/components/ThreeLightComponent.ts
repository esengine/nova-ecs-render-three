/**
 * Three.js Light Component - light configuration
 * Three.js光照组件 - 光照配置
 */

import { Component } from '@esengine/nova-ecs';
import { component, property } from '@esengine/nova-ecs-editor';
import * as THREE from 'three';


@component({
  displayName: 'Three.js Light',
  category: 'Three.js',
  icon: '💡',
  description: 'Three.js light source component',
  order: 20
})
export class ThreeLightComponent extends Component {
  @property({ 
    displayName: 'Light Type', 
    type: 'enum', 
    description: 'Type of light source',
    options: ['ambient', 'directional', 'point', 'spot', 'hemisphere']
  })
  public lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  
  @property({ 
    displayName: 'Color', 
    type: 'color', 
    description: 'Light color' 
  })
  public color: string;
  
  @property({ 
    displayName: 'Intensity', 
    type: 'number', 
    description: 'Light intensity',
    min: 0,
    max: 10,
    step: 0.1
  })
  public intensity: number;
  
  @property({ 
    displayName: 'Cast Shadow', 
    type: 'boolean', 
    description: 'Whether this light casts shadows' 
  })
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