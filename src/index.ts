/**
 * @nova-engine/render-three - Three.js Rendering Adapter
 * Three.js渲染适配器 - 用于Nova引擎的Three.js渲染支持
 */

export const VERSION = '1.0.0';
export const MODULE_NAME = 'nova-ecs-render-three';

// Core exports
export * from './components';
export * from './systems';
export * from './adapters';
export * from './plugins';

// Three.js specific exports
export * from './materials';
export * from './geometries';
export * from './lights';
export * from './cameras';