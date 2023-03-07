import {DynamicEntityData} from "./util/DataInterfaces";
import * as PIXI from "pixi.js";
import {Sprite} from "@pixi/react";
import {useMemo} from "react";
import {getTextureDimensions, resizePosition} from "./util/Utils";


interface DynamicEntityLayerProps {
    zIndex: number;
    data?: DynamicEntityData;
    currentMousePosition?: PIXI.Point;
    scale: number;
}

export const DynamicEntityLayer = (props: DynamicEntityLayerProps) => {

    const position = useMemo(() => {
        const textureDimensions = getTextureDimensions(props.data!.texture)
        const resizedPosition = resizePosition(props.data!.mousePosition, props.scale, textureDimensions)

        return new PIXI.Point(
            props.currentMousePosition!.x - resizedPosition.x,
            props.currentMousePosition!.y - resizedPosition.y
        )
    }, [props.currentMousePosition, props.data, props.scale])

    return (
        <Sprite
            zIndex={props.zIndex}
            position={position}
            width={props.scale}
            height={props.scale}
            texture={props.data!.texture}/>
    )
}