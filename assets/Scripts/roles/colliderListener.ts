const { ccclass } = cc._decorator;

/**
 * 这个碰撞监听脚本监听的是球外围碰撞
 * 基本上球所有的碰撞行为都可以在这里拿到
 * 技能碰撞，终点碰撞可以通过中心刚体碰撞来代替，
 * 地面，障碍，球与球需要在这里监听
 * 所有控制都交给ballcontroll去处理，这里只做转发？
 * 
 */

@ccclass
export default class CollisionListener extends cc.Component {
   
    onBeginContact(contact, selfCollider, otherCollider) {
        let ballNode = selfCollider.node.parent;
        let ballControl = ballNode.getComponent('ballControl');
        ballControl.onAroundBeginContact(contact,selfCollider,otherCollider);
    }
    onEndContact (contact, selfCollider, otherCollider) {

        let ballNode = selfCollider.node.parent;
        let ballControl = ballNode.getComponent('ballControl');
        ballControl.onAroundEndContact(contact,selfCollider,otherCollider);
    }
}