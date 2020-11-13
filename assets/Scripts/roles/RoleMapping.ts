
/**
 * x,y -> [-1,1],0,0表示中心点，注意要考虑贴图的宽高
 */
//技能的效果 比如持续时间等等
export interface SkillEffect{
    /**
    ....
     */
    duration?: number
}
export interface SkillConfig {
    name: string,
    spinePath?: string,
    effect?: SkillEffect 
}

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
            {name:'eye',x: 0,y: 0.5},
            {name:'hair',x: 0,y: 0.8},
            {name:'tail',x: -1,y: 0.5,isBack:true},
        ],
        skill: {
            name:'spider',
            spinePath: 'spines/spider/spider'
        },
        bundleName:'resources'
    }
}

 