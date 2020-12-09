/**
 * collider tag只区分几大类，其它的还是需要通过js来管理
 * 
 */
export const BarrierRegular = {
    sameSeed: 0.2,
    spaceRange: [10,20], //以球为单位

}
export const HighBarrierRegular = {
    groupsPerGame: 5,
    groupNumPool: [1,1,1,1,1,2,2,2,3,3],  // 每组1/2/3个高台的概率为0.5/0.3/0.2
    groupSpaceRange: [1,1,5], //屏幕为单位
    xSpaceRange: [0.5,1], //高台宽度单位
    ySpaceRange: [1.5,3], //角色单位
}

export const CoinRegular = {
    highBarrierPosibility: 0.8,
    aroundNegtivePosibility: 0.4,
    otherBarrierPosibility: 0.2,
    normalPosibility: 0.1,
    numberRange: [200,300],
}

//fixme
export enum BarrierEffectType {
    LINEAR,
    AUGULAR,
    DAMPING,
    STUNNING
}
export enum BarrierType {
    POSITIVE,
    NEGTIVE,
    NEUTRAL,
}
export enum BarrierPriority{
    NONE,
    VERYLOW = 1 <<1,
    LOW = 1 << 2,
    HIGH = 1 << 3,
    VERYHIGH = 1 << 4
}
export interface BarrierEffect{
    duration?: number //s
    type: BarrierEffectType,
    impulse?: cc.Vec2,
    damping?: number
}
/**
 * summary
 */
export interface Barrier{
    name: string,
    type: BarrierType
}

/**
 * detail
 */
export interface BarrierConfig{
    name:string,
    bundleName: string,
    prebafPath: string,
    syncGroundAngle?: boolean,
    effect?: BarrierEffect,
    type?: BarrierEffectType,
    disposable?: boolean, //是否碰撞后消除
    yOffset?: number, //位置补偿
    priority?: BarrierPriority,
    customData?: any //
}

type BMType = Record<string,BarrierConfig>

export const BarrierMapping: BMType = {
    poo: {
        name: 'poo',
        prebafPath: 'barrier/poo',
        bundleName:'resources',
        syncGroundAngle: true,
    },
    cactus: {
        name: 'cactus',
        prebafPath: 'barrier/cactus',
        bundleName:'resources'
    },
    mud: {
        name: 'mud',
        prebafPath: 'barrier/mud',
        bundleName:'resources',
        syncGroundAngle: true,
        effect: {
            type: BarrierEffectType.DAMPING,
            damping: 1,
        },
        yOffset: 0
    },
    mushroom: {
        name: 'cactus',
        prebafPath: 'barrier/mushroom',
        bundleName:'resources',
        yOffset: 0.2,
        syncGroundAngle: true,
        priority: BarrierPriority.VERYLOW,
        effect: {
            type: BarrierEffectType.LINEAR,
            impulse: cc.v2(0,50),
        }
    },
    power: {
        name: 'power',
        prebafPath: 'barrier/power',
        bundleName:'resources',
        disposable: true,
        effect: {
            type: BarrierEffectType.LINEAR,
            impulse: cc.v2(30,0),
        },
        yOffset: 0.6
    },
    wheel: {
        name: 'wheel',
        prebafPath: 'barrier/wheel',
        bundleName:'resources',
        yOffset: 1
    },
    chomper: {
        name: 'chomper',
        prebafPath: 'barrier/chomper',
        bundleName:'resources',
        yOffset: 0,
        effect: {
            type: BarrierEffectType.STUNNING,
            duration: 1,
        }
    },
    // smallAirBlock:{
    //     name: 'smallAirBlock',
    //     type: BarrierEffectType.STATIC,
    //     prebafPath: 'barrier/block1',
    //     bundleName:'resources'
    // },
    // bigAirBlock:{
    //     name: 'bigAirBlock',
    //     type: BarrierEffectType.STATIC,
    //     prebafPath: 'barrier/block2',
    //     bundleName:'resources'
    // }
}

export const BarrierList:Barrier[] = [
    // {
    //     name:'poo',
    //     type: BarrierType.NEUTRAL
    // },
    // {
    //     name:'cactus',
    //     type: BarrierType.NEUTRAL
    // },
    {
        name:'mud',
        type: BarrierType.NEGTIVE
    },
    {
        name:'mushroom',
        type: BarrierType.POSITIVE
    },
    {
        name:'chomper',
        type: BarrierType.NEGTIVE
    },
    {
        name:'power',
        type: BarrierType.POSITIVE
    },
    {
        name:'wheel',
        type: BarrierType.NEUTRAL
    },
];

export const PositiveBarrierList: Barrier[] = BarrierList.filter(v => v.type === BarrierType.POSITIVE);
export const NegtiveBarrierList: Barrier[] = BarrierList.filter(v => v.type === BarrierType.NEGTIVE);
export const NertualBarrierList: Barrier[] = BarrierList.filter(v => v.type === BarrierType.NEUTRAL);