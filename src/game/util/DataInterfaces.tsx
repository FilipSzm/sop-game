import * as PIXI from 'pixi.js';

export interface TileData {
    texture: PIXI.Texture;
}

export interface EntityData {
    id: number;
    texture: PIXI.Texture;
    cords: number[];
    visible: boolean;
}

export interface EntityMoveData {
    id: number;
    mousePosition: PIXI.Point;
}

export interface DynamicEntityData {
    id: number;
    texture: PIXI.Texture;
    mousePosition: PIXI.Point;
}
