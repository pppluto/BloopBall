import { Barrier } from "../barrier/Barrier";

export interface TerrainGroup{
    terrainConfig: TerrainConfig,
    barrierConfigList: GroupBarrierConfig[]
}

export interface TerrainConfig{
    groupName: string,
    multiplyer: number,
}

export interface GroupBarrierConfig{
    position: cc.Vec2,
    barrier: Barrier
}