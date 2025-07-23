/**
 * Three.js Camera Component - camera configuration
 * Three.js相机组件 - 相机配置
 */

import { Component } from '@esengine/nova-ecs';
import * as THREE from 'three';

export class ThreeCameraComponent extends Component {
  public cameraType: 'perspective' | 'orthographic';
  public fov: number;
  public aspect: number;
  public near: number;
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