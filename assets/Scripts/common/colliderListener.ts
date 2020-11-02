
import {Global} from '../global'
import {TagType}from '../mainWorld'
const { ccclass } = cc._decorator;

@ccclass
export default class CollisionListener extends cc.Component {
   
    onBeginContact(contact, selfCollider, otherCollider) {
        //只计算地面，空中平台, 其它球
        //FIXME:需要换一种方式来做
        //根据标签来存
        Global.instance._collideCount +=1;
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        Global.instance._collideCount -=1;
    }
}