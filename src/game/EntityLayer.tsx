import * as PIXI from 'pixi.js';
import {Container} from "@pixi/react";
import {EntityData, EntityMoveData} from "./util/DataInterfaces";
import {calculatePosition} from "./util/Utils";
import {Entity} from "./Entity";
import {useMemo} from "react";


const transformEntities = (entities: EntityData[], offset: PIXI.Point, scale: number, onEntityMove: (emd: EntityMoveData)=>void) => {
    
    return entities.filter((e) => e.visible).map((e) => {
        const position = calculatePosition(e.cords, offset, scale)
        
        return <Entity data={e} position={position} size={scale} onEntityMove={onEntityMove} key={e.id}/>
    })
}

interface EntityLayerProps {
    zIndex: number;
    onEntityMove: (emd: EntityMoveData)=>void;
    entities: EntityData[];
    offset: PIXI.Point;
    scale: number;
}

export const EntityLayer = (props: EntityLayerProps) => {

    const cachedEntities = useMemo(
        () => transformEntities(props.entities, props.offset, props.scale, props.onEntityMove),
        [props.entities, props.offset, props.onEntityMove, props.scale]
    )

    return (
        <Container scale={1} position={0} zIndex={props.zIndex}>
            {cachedEntities}
        </Container>
    )
}