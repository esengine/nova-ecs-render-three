/**
 * Transform Component for Three.js Integration
 * Transform组件 - 用于Three.js集成
 */

import { Component } from '@esengine/nova-ecs';

export class TransformComponent extends Component {
  constructor(
    public position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    public rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    public scale: { x: number; y: number; z: number } = { x: 1, y: 1, z: 1 }
  ) {
    super();
  }
}