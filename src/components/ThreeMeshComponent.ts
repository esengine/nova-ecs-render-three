/**
 * Three.js Mesh Component - holds reference to Three.js mesh
 * Three.js网格组件 - 持有Three.js网格的引用
 */

import { Component } from '@esengine/nova-ecs';
import * as THREE from 'three';

export class ThreeMeshComponent extends Component {
  public mesh: THREE.Mesh | null = null;
  public needsUpdate: boolean = false;
  
  constructor(mesh?: THREE.Mesh) {
    super();
    this.mesh = mesh || null;
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry?.dispose();
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(material => material.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
      this.mesh = null;
    }
  }
}