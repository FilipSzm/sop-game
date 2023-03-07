import * as PIXI from 'pixi.js';
import {Container} from "@pixi/react";
import {TileData} from "./util/DataInterfaces";
import {calculatePosition} from "./util/Utils";
import {Terrain} from "./Terrain";
import {useMemo} from "react";

const transformTiles = (tiles: TileData[][], offset: PIXI.Point, scale: number) => {

    return tiles.flatMap((row, i) =>
        row.map((data, j) => {
            const position = calculatePosition([j, i], offset, scale)
            const key = i + ' ' + j

            return <Terrain data={data} position={position} size={scale} key={key}/>
        })
    )
}

interface TerrainLayerProps {
    tiles: TileData[][];
    scale: number;
    offset: PIXI.Point;
    zIndex: number;
}

export const TerrainLayer = (props: TerrainLayerProps) => {

    const cachedTiles = useMemo(
        () => transformTiles(props.tiles, props.offset, props.scale),
        [props.offset, props.scale, props.tiles]
    )

    return (
        <Container scale={1} position={0} zIndex={props.zIndex}>
            {cachedTiles}
        </Container>
    )
}