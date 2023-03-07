import * as PIXI from 'pixi.js';
import {Container, Stage} from "@pixi/react";
import {
    calculateNewOffset,
    calculateNewScale,
    calculateOffset, calculatePosition,
    getArray,
    getCurrentSize, getEntities,
    getLocalPosition, getTextureDimensions,
    INITIAL_SCALE, NUMBER_OF_TILES_IN_ROW, resizePosition, validateOffset, validatePosition,
    VIEW_SIZE
} from "./util/Utils";
import React, {useCallback, useState} from "react";
import {TerrainLayer} from "./TerrainLayer";
import {DynamicEntityData, EntityMoveData} from "./util/DataInterfaces";
import {EntityLayer} from "./EntityLayer";
import {DynamicEntityLayer} from "./DynamicEntityLayer";


export const Map = () => {

    const [scale, setScale] = useState(INITIAL_SCALE)
    const [RMB, setRMB] = useState(false)
    const [LMB, setLMB] = useState(false)
    const [offset, setOffset] = useState([0, 0])
    const [temporaryOffset, setTemporaryOffset] = useState<number[] | undefined>(undefined)
    const [mousePosition, setMousePosition] = useState<PIXI.Point | undefined>(undefined)
    const [root, setRoot] = useState<PIXI.Point | undefined>(undefined)
    const [tiles] = useState(getArray(NUMBER_OF_TILES_IN_ROW))
    const [entities, setEntities] = useState(getEntities())
    const [dynamicEntity, setDynamicEntity] = useState<DynamicEntityData | undefined>(undefined)


    const onEntityMove = useCallback((data: EntityMoveData) => {
        const entity = entities.filter((e) => e.id === data.id)[0]
        const entityPosition = calculatePosition(entity.cords, offset, scale)
        const textureDimensions = getTextureDimensions(entity.texture)
        const resizedMousePosition = resizePosition(data.mousePosition, scale, textureDimensions)

        setMousePosition(new PIXI.Point(
            entityPosition.x + resizedMousePosition.x,
            entityPosition.y + resizedMousePosition.y
        ))
        setLMB(true)
        setEntities([
            ...entities.filter((e) => e.id !== data.id),
            {...entity, visible: false}
        ])
        setDynamicEntity({
            id: entity.id,
            texture: entity.texture,
            mousePosition: data.mousePosition
        })
    }, [entities, offset, scale])


    const onMouseDown: React.MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
        if (e.button === 2) {
            const root = getLocalPosition(e)
            setTemporaryOffset(offset)
            setRoot(root)
            setRMB(true)
        }
    }, [offset])

    const onMouseMove: React.MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
        const localPosition = getLocalPosition(e)

        if (RMB) {
            if (root === undefined || temporaryOffset === undefined) {
                return
            }
            
            const currentSize = getCurrentSize(scale)
            const offset = calculateOffset(temporaryOffset, localPosition, root)
            setOffset(validateOffset(offset, currentSize))
        }

        if (LMB) {
            setMousePosition(localPosition)
        }
    }, [LMB, RMB, root, scale, temporaryOffset])

    const onMouseUp: React.MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
        if (e.button === 2) {
            setTemporaryOffset(undefined)
            setRoot(undefined)
            setRMB(false)
        }

        if (e.button === 0 && LMB) {
            const localPosition = getLocalPosition(e)
            const entity = dynamicEntity

            const textureDimensions = getTextureDimensions(entity!.texture)
            const distanceFromCenter = new PIXI.Point(
                dynamicEntity?.mousePosition.x! - (textureDimensions[0] / 2),
                dynamicEntity?.mousePosition.y! - (textureDimensions[1] / 2)
            )
            const resizedDistanceFromCenter = resizePosition(distanceFromCenter, scale, textureDimensions)

            const currentSize = getCurrentSize(scale)
            const mapPosition = validatePosition(new PIXI.Point(
                localPosition.x - offset[0] - resizedDistanceFromCenter.x,
                localPosition.y - offset[1] - resizedDistanceFromCenter.y
            ), currentSize)

            const entityCords = [
                Math.floor(mapPosition.x / scale),
                Math.floor(mapPosition.y / scale)
            ]

            setEntities([...entities.filter((e) => e.id !== entity?.id), {
                id: entity?.id!,
                texture: entity?.texture!,
                cords: entityCords,
                visible: true
            }])

            setMousePosition(undefined)
            setLMB(false)
            setDynamicEntity(undefined)
        }

        if (e.button === -1 && LMB) {
            const entity = entities.filter((e) => e.id === dynamicEntity?.id)[0]

            setEntities([...entities.filter((e) => e.id !== entity?.id), {
                ...entity,
                visible: true
            }])

            setMousePosition(undefined)
            setLMB(false)
            setDynamicEntity(undefined)
        }
    }, [LMB, dynamicEntity, entities, offset, scale])

    const onWheel: React.WheelEventHandler<HTMLCanvasElement> = useCallback((e) => {

        const localPosition = getLocalPosition(e)
        const newScale = calculateNewScale(scale, e)
        const newOffset = calculateNewOffset(offset, localPosition, scale, newScale)
        const currentSize = getCurrentSize(newScale)

        setScale(newScale)
        setOffset(validateOffset(newOffset, currentSize))
        if (LMB) {
            setMousePosition(localPosition)
        }
    }, [LMB, offset, scale])

    return (
        <Stage width={VIEW_SIZE} height={VIEW_SIZE}
               options={{backgroundAlpha: 100, backgroundColor: 0x1030af}}
               onContextMenu={(e) => e.preventDefault()}
               onPointerDown={onMouseDown}
               onPointerMove={onMouseMove}
               onPointerUp={onMouseUp}
               onPointerOut={onMouseUp}
               onWheel={onWheel}>
            <Container scale={1} position={0} sortableChildren={true}>
                <TerrainLayer tiles={tiles} scale={scale} offset={offset} zIndex={0}/>
                <EntityLayer onEntityMove={onEntityMove} entities={entities} offset={offset} scale={scale} zIndex={100}/>
                {LMB && <DynamicEntityLayer data={dynamicEntity} scale={scale} currentMousePosition={mousePosition} zIndex={200}/>}
            </Container>
        </Stage>
    )
}