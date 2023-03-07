import * as PIXI from 'pixi.js';
import React from "react";
import {EntityData, TileData} from "./DataInterfaces";
import tile from "../../images/tile.png";
import character from "../../images/character.png";
import {Point} from "pixi.js";

export const NUMBER_OF_TILES_IN_ROW = 12
export const INITIAL_SCALE = 40
export const MIN_SCALE = INITIAL_SCALE
export const MOVE_SPEED = 1
export const SCROLL_SPEED = 1.05
export const VIEW_SIZE = MIN_SCALE * NUMBER_OF_TILES_IN_ROW


export const calculatePosition = (cords: number[], offset: number[], scale: number) => {
    return new PIXI.Point(
        cords[0] * scale + offset[0],
        cords[1] * scale + offset[1]
    )
}

export const validateOffset = (offset: number[], currentSize: number) => {

    const validateSingle = (cord: number) => {
        if (cord < VIEW_SIZE - currentSize) {
            cord = VIEW_SIZE - currentSize
        } else if (cord > 0) {
            cord = 0
        }
        return cord
    }

    return [
        validateSingle(offset[0]),
        validateSingle(offset[1])
    ]
}

export const validatePosition = (position: PIXI.Point, currentSize: number) => {

    const validateSingle = (cord: number) => {
        if (cord > currentSize) {
            cord = currentSize
        } else if (cord < 0) {
            cord = 0
        }
        return cord
    }

    return new PIXI.Point(
        validateSingle(position.x),
        validateSingle(position.y)
    )
}


export const getLocalPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    return new PIXI.Point(e.clientX - bounds.x, e.clientY - bounds.y)
}

export const getCurrentSize = (scale: number) => {
    return NUMBER_OF_TILES_IN_ROW * scale
}

export const calculateOffset = (currentOffset: number[], mousePosition: PIXI.Point, root: PIXI.Point) => {
    return [
        currentOffset[0] + (mousePosition?.x - root.x) * MOVE_SPEED,
        currentOffset[1] + (mousePosition?.y - root.y) * MOVE_SPEED
    ]
}

export const calculateNewScale = (scale: number, e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.deltaY < 0) {
        return scale * SCROLL_SPEED
    }

    const newScale = scale / SCROLL_SPEED
    if (newScale >= MIN_SCALE) {
        return newScale
    }
    return scale
}

export const calculateNewOffset = (offset: number[], mousePosition: PIXI.Point, oldScale: number, newScale: number) => {
    const scaleRatio = newScale / oldScale

    return [
        scaleRatio * (offset[0] - mousePosition.x) + mousePosition.x,
        scaleRatio * (offset[1] - mousePosition.y) + mousePosition.y
    ]
}

export const getTextureDimensions = (texture: PIXI.Texture) => {
    return [texture.baseTexture.width, texture.baseTexture.height]
}

export const resizePosition = (position: PIXI.Point, scale: number, baseDimensions: number[]) => {
    return new Point(
        position.x * scale / baseDimensions[0],
        position.y * scale / baseDimensions[1]
    )
}

// TEMP
export const getArray = (size: number): TileData[][] => {
    return Array.from(
        {length: size},
        () => Array.from({length: size}, () => {
            return {texture: PIXI.Texture.from(tile)}
        })
    );
}

export const getEntities = (): EntityData[] => {

    return [
        {
            id: 1,
            texture: PIXI.Texture.from(character),
            cords: [1, 1],
            visible: true
        },
        {
            id: 2,
            texture: PIXI.Texture.from(character),
            cords: [5, 5],
            visible: true
        }
    ]
}


