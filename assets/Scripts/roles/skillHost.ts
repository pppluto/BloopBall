
const { ccclass, property } = cc._decorator;
import {TagType} from '../mainWorld'
import {SkillConfig} from './RoleMapping'

@ccclass
export default class SkillHost extends cc.Component {
    skillConfig: SkillConfig = null;
    trigger: cc.Node = null;
    set(config){
        this.skillConfig = config;
    }

    get(){
        return this.skillConfig;
    }
    useSkill(){
        let path = this.skillConfig.spinePath;
        cc.resources.load(path, sp.SkeletonData,(err,skeData) => {
            this.createSpNode(skeData);
        });
    }
    createSpNode(skeData){

        let spNode = new cc.Node();
        spNode.zIndex = 101;
        let skeleton = spNode.addComponent(sp.Skeleton);

        let pos = cc.v3(100,0,0);
        spNode.setPosition(pos);
        spNode.group = 'special';
        let body = spNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;
    
        let collider = spNode.addComponent(cc.PhysicsCircleCollider);
        collider.radius = 100;
        collider.sensor = true;
        collider.tag = TagType.DEBUFF_TAG;
        collider.enabled = false;
        this.node.addChild(spNode);
        skeleton.timeScale = 1;
        skeleton.skeletonData = skeData;
        skeleton.animation = 'ready';
        skeleton.loop = false;
        // skeleton._updateSkeletonData();

        skeleton.setCompleteListener(() => {
            if(skeleton.animation === 'ready') {
                collider.enabled = true;
                skeleton.setAnimation(0,'skill',false);
                spNode.setPosition(pos.x + 100,pos.y);
            } else {
                this.node.parent = null;
                this.node.destroy()
            }
        })
        // setTimeout(() => {
           
        // }, 3000);
    }
}
    