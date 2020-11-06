
import {Global} from '../global'
import {TagType}from '../mainWorld'
const { ccclass } = cc._decorator;

@ccclass
export default class CollisionListener extends cc.Component {
   
    onBeginContact(contact, selfCollider, otherCollider) {
        //只计算地面，空中平台, 其它球
        //FIXME:需要换一种方式来做
        //根据标签来存
        let otherGroup = otherCollider.node.group
        if(otherGroup ==='ground' || otherGroup ==='block' ){
            Global.instance._collideCount +=1;
        }
        if(otherCollider.tag === TagType.FINAL_TAG){
            let js = selfCollider.node.parent.getComponent('ballControl');
            js.winGame();
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        let otherGroup = otherCollider.node.group

        if(otherGroup ==='ground' || otherGroup ==='block' ){
            Global.instance._collideCount -=1;
        }
    }
}