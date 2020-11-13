/**
 * collider tag只区分几大类，其它的还是需要通过js来管理
 * 
 */

export enum BarrierType {
    STATIC
}

export interface BarrierEffect{
    // duration?:1
}

export interface BarrierConfig{
    name?:string,
    effect?: BarrierEffect,
    bundleName: string,
    prebafPath: string,
    type?: BarrierType
}

export const BarrierMapping = {
    poo: {
        name: 'poo',
        type: BarrierType.STATIC,
        prebafPath: 'barrier/poo',
        bundleName:'prefabs'
    },
    cactus: {
        name: 'cactus',
        type: BarrierType.STATIC,
        prebafPath: 'barrier/cactus',
        bundleName:'prefabs'
    },
    smallAirBlock:{
        name: 'smallAB',
        type: BarrierType.STATIC,
        prebafPath: 'barrier/block1',
        bundleName:'prefabs'
    },
    bigAirBlock:{
        name: 'bigAB',
        type: BarrierType.STATIC,
        prebafPath: 'barrier/block2',
        bundleName:'prefabs'
    }
}

 