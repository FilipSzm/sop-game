import * as PIXI from 'pixi.js';
import {Container, Stage} from "@pixi/react";
import {
    calculateOffsetAfterScaleChange,
    calculateNextScale,
    calculateOffsetAfterMove,
    getArray,
    getCurrentSize,
    getEntities,
    getLocalPosition,
    getTextureDimensions,
    INITIAL_SCALE,
    NUMBER_OF_TILES_IN_ROW,
    scaleDimensions,
    validateOffset,
    validatePosition,
    VIEW_SIZE,
    calculateMousePositionRelativeToContainer,
    getPositionRelativeToCenter,
    getCordsFromPosition,
    findPositionRelativeToRoot, subtractOffset
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
        const adjustedMousePosition = calculateMousePositionRelativeToContainer(entity, data.mousePosition, scale, offset)

        setMousePosition(adjustedMousePosition)
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
        const localMousePosition = getLocalPosition(e)

        if (RMB) {
            const currentSize = getCurrentSize(scale)
            const newOffset = calculateOffsetAfterMove(temporaryOffset!, localMousePosition, root!)
            setOffset(validateOffset(newOffset, currentSize))
        }

        if (LMB) {
            setMousePosition(localMousePosition)
        }
    }, [LMB, RMB, root, scale, temporaryOffset])

    const onMouseUp: React.MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
        if (e.button === 2) {
            setTemporaryOffset(undefined)
            setRoot(undefined)
            setRMB(false)
        }

        if (e.button === 0 && LMB) {
            const textureDimensions = getTextureDimensions(dynamicEntity!.texture)
            const rootRelativeToCenter = getPositionRelativeToCenter(dynamicEntity?.mousePosition!, textureDimensions)
            const positionRelativeToRoot = findPositionRelativeToRoot(
                getLocalPosition(e),
                scaleDimensions(rootRelativeToCenter, scale, textureDimensions)
            )

            const mapPosition = subtractOffset(positionRelativeToRoot, offset)
            const entityCords = getCordsFromPosition(
                validatePosition(mapPosition, getCurrentSize(scale)),
                scale
            )

            setLMB(false)
            setMousePosition(undefined)
            setDynamicEntity(undefined)
            setEntities([...entities.filter((e) => e.id !== dynamicEntity?.id), {
                id: dynamicEntity?.id!,
                texture: dynamicEntity?.texture!,
                cords: entityCords,
                visible: true
            }])
        }

        if (e.button === -1 && LMB) {
            const entity = entities.filter((e) => e.id === dynamicEntity?.id)[0]

            setLMB(false)
            setMousePosition(undefined)
            setDynamicEntity(undefined)
            setEntities([...entities.filter((e) => e.id !== entity?.id), {
                ...entity,
                visible: true
            }])
        }
    }, [LMB, dynamicEntity, entities, offset, scale])

    const onWheel: React.WheelEventHandler<HTMLCanvasElement> = useCallback((e) => {

        const localMousePosition = getLocalPosition(e)
        const newScale = calculateNextScale(scale, e)
        const newOffset = calculateOffsetAfterScaleChange(offset, localMousePosition, scale, newScale)
        const currentSize = getCurrentSize(newScale)

        setScale(newScale)
        setOffset(validateOffset(newOffset, currentSize))
        if (LMB) {
            setMousePosition(localMousePosition)
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
                <EntityLayer onEntityMove={onEntityMove} entities={entities} offset={offset} scale={scale}
                             zIndex={100}/>
                {LMB && <DynamicEntityLayer data={dynamicEntity} scale={scale} currentMousePosition={mousePosition}
																						zIndex={200}/>}
            </Container>
        </Stage>
    )
}