/**
 * Three.js Camera Component - camera configuration
 * Three.js相机组件 - 相机配置
 */

import { Component } from '@esengine/nova-ecs';
import { component, property } from '@esengine/nova-ecs-editor';
import * as THREE from 'three';

@component({
  displayName: 'Three.js Camera',
  category: 'Three.js', 
  icon: '📹',
  description: 'Three.js camera component',
  order: 21
})
export class ThreeCameraComponent extends Component {
  @property({
    displayName: 'Camera Type',
    type: 'enum',
    description: 'Type of camera projection',
    options: ['perspective', 'orthographic']
  })
  public cameraType: 'perspective' | 'orthographic';
  
  @property({ 
    displayName: 'FOV', 
    type: 'number', 
    description: 'Field of view in degrees',
    min: 1,
    max: 179
  })
  public fov: number;
  
  @property({
    displayName: 'Aspect',
    type: 'number',
    description: 'Camera aspect ratio',
    min: 0.1
  })
  public aspect: number;
  
  @property({ 
    displayName: 'Near', 
    type: 'number', 
    description: 'Near clipping distance',
    min: 0.01
  })
  public near: number;
  
  @property({ 
    displayName: 'Far', 
    type: 'number', 
    description: 'Far clipping distance',
    min: 1
  })
  public far: number;
  
  public camera: THREE.Camera | null = null;
  public needsUpdate: boolean = false;

  constructor(config: Partial<ThreeCameraComponent> = {}) {
    super();
    this.cameraType = config.cameraType || 'perspective';
    this.fov = config.fov || 75;
    this.aspect = config.aspect || 1;
    this.near = config.near || 0.1;
    this.far = config.far || 1000;
  }
}