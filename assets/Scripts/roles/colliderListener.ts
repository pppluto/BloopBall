import {BarrierHost} from '../barrier/barrierHost';
import BallControl from '../controller/ballControl';
const { ccclass } = cc._decorator;

/**
 * ~~这个碰撞监听脚本监听的是球外围碰撞~~
 * ~~基本上球所有的碰撞行为都可以在这里拿到~~
 * ~~技能碰撞，终点碰撞可以通过中心刚体碰撞来代替~~
 * ~~地面，障碍，球与球需要在这里监听~~
 * ~~所有控制都交给ballcontroll去处理，这里只做转发？~~
 * 
 * 普通的碰撞监听脚本，根据组类型判断，交给上级对应脚本处理
 *  block -> barrierHost
 *  ball  -> ballControl
 *  specail -> skillHost
 */

@ccclass
export default class CollisionListener extends cc.Component {
   
    onBeginContact(contact, selfCollider, otherCollider) {
        let group = selfCollider.node.group;
        if(group === 'block') {
            let parent = selfCollider.node.parent;
            let bHost = parent.getComponent(BarrierHost);
            if(bHost){
                bHost.onBeginContact(contact, selfCollider, otherCollider);
            }
        } else if(group === 'ball') {
            let ballNode = selfCollider.node.parent;
            let ballControl = ballNode.getComponent(BallControl);
            ballControl.onBeginContact(contact,selfCollider,otherCollider);
        } else if(group === 'special'){
            //TODO
        }
    }
    onEndContact(contact, selfCollider, otherCollider) {
        let group = selfCollider.node.group;
        if(group === 'block') {
            let parent = selfCollider.node.parent;
            let bHost = parent.getComponent(BarrierHost);
            if(bHost){
                bHost.onEndContact(contact, selfCollider, otherCollider);
            }
        } else if(group === 'ball') {
            let ballNode = selfCollider.node.parent;
            let ballControl = ballNode.getComponent(BallControl);
            ballControl.onEndContact(contact,selfCollider,otherCollider);
        } else if(group === 'special'){
            //TODO
        }
      
    }
}