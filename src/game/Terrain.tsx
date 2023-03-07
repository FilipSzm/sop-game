import {TileData} from "./util/DataInterfaces";
import {Point} from "pixi.js";
import {Sprite} from "@pixi/react";

interface TerrainProps {
    data: TileData;
    position: Point;
    size: number;
}

export const Terrain = (props: TerrainProps) => {

    return (
        <Sprite
            position={props.position}
            texture={props.data.texture}
            width={props.size}
            height={props.size}/>
    )
}