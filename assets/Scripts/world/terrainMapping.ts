import { Barrier } from "../barrier/Barrier";

export interface TerrainGroup{
    terrainConfig: TerrainConfig,
    barrierConfigList: GroupBarrierConfig[]
}
export const BOTTOM_HEIGHT = 210;
export const PIXEL_STEP = 10;
export interface TerrainConfig{
    // groupName: string,
    controlPoints: cc.Vec2[],
    isBox?:boolean,
    name?: string
}

export interface GroupBarrierConfig{
    position: cc.Vec2,
    barrier: Barrier
}

const Point = (x,y) => {
    return cc.v2(x,y);
}

const RightQuaterCircle = (radius) => {
    return [Point(0,radius),Point(radius,0)];
}
const LeftQuaterCircle = (radius) => {
    return [Point(0,0),Point(radius,radius)];
}
const HalfCircle = (radius) => {
    return Arc(2* radius,radius);
}
const Arc = (width,arcH,startX=0) => {
    return [Point(startX,0),Point(startX+ width/2,arcH),Point(startX+width,0)]; 
}
const Box = (width,height=0) => {
    return [Point(0,height),Point(width,height)];
}
export const TerrainList:TerrainConfig[] = [
    {
        controlPoints: Box(400),
        isBox: true,
        name: 'L1'
    },
    {
        controlPoints: [...Arc(200,60),...Arc(200,20,220),...Arc(200,60,440)],
        name: 'L2'
    },
    {
        controlPoints: Arc(600,200),
        name: 'L3'
    },
    {
        controlPoints: Arc(600,-200),
        name: 'L4'
    }
]