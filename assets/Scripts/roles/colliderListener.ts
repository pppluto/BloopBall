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

const { ccclass } = cc._decorator;

@ccclass
export default class CollisionListener extends cc.Component {
   
    onBeginContact(contact, selfCollider, otherCollider) {
        //follow engine 
        //https://github.com/cocos-creator/engine/blob/26031bddd1aecdbf9bbdebe19ecaa672b1c35061/cocos2d/core/physics/CCPhysicsContact.js#L368
        let comps = selfCollider.node.parent._components;
        var i,l,comp;
        for (i = 0, l = comps.length; i < l; i++) {
            comp = comps[i];
            if (comp['onBeginContact']) {
                comp['onBeginContact'](contact, selfCollider, otherCollider);
            }
        }
    }
    onEndContact(contact, selfCollider, otherCollider) {
        let comps = selfCollider.node.parent._components;
        var i,l,comp;
        for (i = 0, l = comps.length; i < l; i++) {
            comp = comps[i];
            if (comp['onEndContact']) {
                comp['onEndContact'](contact, selfCollider, otherCollider);
            }
        }
    }
}