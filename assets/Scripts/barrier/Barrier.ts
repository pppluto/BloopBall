/**
 * collider tag只区分几大类，其它的还是需要通过js来管理
 * 
 */
export const BarrierRegular = {
    sameSeed: 0.2,
    spaceRange: [5,10], //以球为单位

}
//fixme
export enum BarrierEffectType {
    LINEAR,
    AUGULAR,
    DAMPING
}
export enum BarrierType {
    POSITIVE,
    NEGTIVE,
    NEUTRAL,
}

export interface BarrierEffect{
    duration?: number //s
    type: BarrierEffectType,
    impulse?: number,
    damping?: number
}
export interface Barrier{
    name: string,
    type: BarrierType
}
export interface BarrierConfig{
    name:string,
    inAir?: boolean,
    effect?: BarrierEffect,
    bundleName: string,
    prebafPath: string,
    type?: BarrierEffectType,
    disposable?: boolean, //是否碰撞后消除
    yOffset?: number, //位置补偿
}

export const BarrierMapping = {
    poo: {
        name: 'poo',
        prebafPath: 'barrier/poo',
        bundleName:'resources'
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
        effect: {
            type: BarrierEffectType.DAMPING,
            damping: 1,
        },
        yOffset: -0.5
    },
    mushroom: {
        name: 'cactus',
        prebafPath: 'barrier/mushroom',
        bundleName:'resources',
        yOffset: -0.5
    },
    power: {
        name: 'power',
        inAir: true,
        prebafPath: 'barrier/power',
        bundleName:'resources',
        disposable: true,
        effect: {
            type: BarrierEffectType.LINEAR,
            impulse: 40,
        },
        yOffset: 0
    },
    wheel: {
        name: 'wheel',
        inAir: true,
        prebafPath: 'barrier/wheel',
        bundleName:'resources'
    },
    chomper: {
        name: 'chomper',
        inAir: true,
        prebafPath: 'barrier/chomper',
        bundleName:'resources',
        yOffset: -0.7
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
    {
        name:'poo',
        type: BarrierType.NEUTRAL
    },
    {
        name:'cactus',
        type: BarrierType.NEUTRAL
    },
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