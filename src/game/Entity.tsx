import {EntityData, EntityMoveData} from "./util/DataInterfaces";
import {Point} from "pixi.js";
import {Sprite} from "@pixi/react";
import React, {useCallback} from "react";


interface EntityProps {
    data: EntityData;
    position: Point;
    size: number;
    onEntityMove: (emd: EntityMoveData)=>void;
}

export const Entity = (props: EntityProps) => {

    const onMouseDown = useCallback((e: { currentTarget: any; global: any; }) =>{
        const sprite = e.currentTarget;
        const localMousePosition = sprite.toLocal(e.global)

        props.onEntityMove({
            id: props.data.id,
            mousePosition: localMousePosition
        })
    }, [props])
    
    return (
        <Sprite 
            interactive
            position={props.position}
            texture={props.data.texture} 
            width={props.size} 
            height={props.size} 
            mousedown={onMouseDown}/>
    )
}