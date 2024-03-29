
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
    id: number,
    name: string,
    iconName: string,
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

export interface RoleSKinConfig {
    name: string,
    bodies: SkinBody[],
    emotion?: string[],
    bundleName?: string //默认会是resources
}

export interface Role{
    name: string,//角色名，通过这个匹配对应皮肤和技能
    id: number, //标记
    desc?: string,
    cost?: number, //解锁所需金币
    advanceSkillNames?: string[],
    defaultSkillName: string,
    image?: string
}

//技能icon
type SkillMType = Record<string,SkillConfig>;
export const SkillMapping:SkillMType = {
    spider:{
        id: 1,
        name:'spider',
        iconName: 'net',
        spinePath: 'spines/spider/spider',
        cd: 2,
        effect: {
            range: [0,200]
        }
    },
}

/**
 * 默认第一个body为主皮肤
 * 资源默认都放在resources bundle下
 */
type SMType = Record<string,RoleSKinConfig>;
export const RoleSkinMapping:SMType = {
    spider: {
        name: 'spider',
        bodies: [
            {name:'body'},
            {name:'eye',x: 0,y: 0.2},
            {name:'hair',x: 0,y: 1.0},
            {name:'tail',x: -0.9,y: -0.3,isBack:true},
        ],
        emotion: ['normal','angry','smile','sad'],
        bundleName:'resources'
    }
}

export const RoleList:Role[] = [
    {
        name: 'spider',
        id: 1,
        defaultSkillName: 'spider',
        advanceSkillNames: [],
        desc: 'spider',
    },
    {
        name: 'spider',
        id: 2,
        desc: 'spider2',
        defaultSkillName: 'spider',
        advanceSkillNames: []
    },
    {
        name: 'spider',
        desc: 'spider3',
        id: 3,
        defaultSkillName: 'spider',
        advanceSkillNames: []
    },
    {
        name: 'spider',
        desc: '钢铁侠',
        id: 4,
        defaultSkillName: 'spider',
        advanceSkillNames: []
    },
]