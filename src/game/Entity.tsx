import {EntityData, EntityMoveData} from "./util/DataInterfaces";
import {Sprite} from "@pixi/react";
import React, {useCallback, useMemo} from "react";
import {calculatePosition} from "./util/Utils";


interface EntityProps {
    data: EntityData;
    scale: number;
    offset: number[];
    onEntityMove: (emd: EntityMoveData)=>void;
}

export const Entity = (props: EntityProps) => {

    const position = useMemo(() => {
        return calculatePosition(props.data.cords, props.offset, props.scale)
    }, [props.data.cords, props.offset, props.scale])
    
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
            position={position}
            texture={props.data.texture} 
            width={props.scale} 
            height={props.scale} 
            mousedown={onMouseDown}/>
    )
}