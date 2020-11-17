/**
 * 1）遇到障碍的时候，设置AI跳过障碍的概率为A；
 * 2）区域判定：判断AI周围X范围内有无敌人；
 * 3）技能释放：区域判定范围内有人的情况下，地图前半程AI释放技能概率为Y，后半程AI释放技能概率为Z。
 * 4） 综合调整A/X/Y/Z的参数来设置AI的聪明程度，设置AI等级，暂定为20个等级，等级越高，智能越高。
 */

export interface AIConfig {
    barrierPosibility: number, //障碍跳过概率
    firstPeriodSkillPosibility: number, //前半段技能释放概率
    secondPeriodSkillPosibility: number, //后半段技能释放概率
    aroundDistance?: number, //周围检测距离
}

export const MAX_AI_LEVEL = 20;
export const getAIConfigByLevel = (level:number) => {
    level = Math.min(level,MAX_AI_LEVEL)
    let a,y,z,x;
    let weight = level/ MAX_AI_LEVEL;
    a = weight;
    y = weight;
    z = weight;
    x = level * 10;

    return {
        barrierPosibility: a,
        firstPeriodSkillPosibility: y,
        secondPeriodSkillPosibility: z,
        aroundDistance: x
    }
}
export default class AIHelper extends cc.Component {

    public config: AIConfig = null
    shouldJumpWhenBlocked(){
        let ran = Math.random();
        return ran < this.config.barrierPosibility
    }
    shouldUseSkill(player:cc.Node,mapLength:number){
        let ran = Math.random();
        let isPeriod1 = player.x < mapLength;
        if(isPeriod1) {
            return ran < this.config.firstPeriodSkillPosibility;
        } else {
            return ran < this.config.secondPeriodSkillPosibility;
        }
    }
    hasEnemyAround(player:cc.Node, otherPlayers:[cc.Node]){
        let has = otherPlayers.some(e => {
            let offset = player.position.sub(e.position);
            let tmp = player.width/2+e.width/2;
            return offset.mag() < (this.config.aroundDistance + tmp);
        });
        return has
    }
    
}
