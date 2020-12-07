/**
 * 关卡路段设定
 * 2） 暂定低级路段编辑数量为5个，中级路段10个，高级路段10个，所有路段长度一致，且起始坐标和结束坐标一致。
 * 3） 设定主题1关卡共由6个路段来组成地图配置，在三个难度的路段池子中随机取，
 * 取到低级路段的概率为40%，取到中级路段的概率为30%，取到高级路段概率为30%。
 * 连续取到两个同样难度的路段概率为20%，同样难度的路段不能被连续取到2次以上。
 * 4） 游戏开始和结束时的路段必定为平地路段
 * 5） 每个主题关卡前2次挑战的关卡均为设定好路段难度顺序的固定关卡。方便调控关卡难度。后续关卡再执行以上随机规则
 */




/**
 * 关卡信息
 * 可用角色，解锁花费，资源包，默认解锁人物
 */
export interface ZoneConfig{
    defaultRoleId: number,
    avaliableRoleIds: number[],
    name: string, 
    desc?: string,
    bundleName?: string,
    specailBarrierIds?: number[], //特定场景障碍
}
export interface Zone{
    name: string,
    id: number,
    desc?: string,
    cost: number,
    bundleName?: string
}
type ZMType = Record<string,ZoneConfig>;
export const ZoneMapping:ZMType = {
    farm: {
        name: 'farm',
        desc: '农场',
        avaliableRoleIds: [1,2],
        defaultRoleId: 1,
        specailBarrierIds: [],
    },
    farm2: {
        name: 'farm',
        desc: '农场2',
        avaliableRoleIds: [2,3],
        defaultRoleId: 2,
        specailBarrierIds: [],
    },
    farm3: {
        name: 'farm',
        desc: '农场3',
        avaliableRoleIds: [1,2,3,4],
        defaultRoleId: 1,
        specailBarrierIds: [],
    }
}

export const ZoneList:Zone[] = [
    {
        name: 'farm',
        id: 1,
        cost: 0,
    },
    {
        name: 'farm2',
        id: 2,
        cost: 1000,
    },
    {
        name: 'farm3',
        id: 3,
        cost: 3000,
    }
]