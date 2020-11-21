
/**
 * x,y -> [-1,1],0,0表示中心点，注意要考虑贴图的宽高
 */
//技能的效果 比如持续时间等等
export interface SkillEffect{
    /**
    ....
     */
    range?: [number,number], //作用范围 [0,3] //改成单位(球)
    duration?: number
}
export interface SkillConfig {
    name: string,
    spinePath?: string,
    effect?: SkillEffect,
    cd?: number // 秒
}

/**
 * x,y: clip space -1 -> 1
 */
export interface SkinBody{
    name: string, //资源名
    x?: number,
    y?: number,
    isBack?: boolean,
}

export interface SKinConfig {
    name: string,
    bodies: [SkinBody],
    skill?: SkillConfig,
    bundleName?: string //默认会是resources
}



/**
 * 默认第一个body为主皮肤
 * 资源默认都放在resources bundle下
 */
export const SkinMapping = {
    spider: {
        name: 'spider',
        bodies: [
            {name:'body'},
            {name:'eye',x: 0,y: 0.2},
            {name:'hair',x: 0,y: 1.0},
            {name:'tail',x: -0.9,y: -0.4,isBack:true},
        ],
        skill: {
            name:'spider',
            spinePath: 'spines/spider/spider',
            cd: 2,
            effect: {
                range: [0,200]
            }
        },
        bundleName:'resources'
    }
}

 