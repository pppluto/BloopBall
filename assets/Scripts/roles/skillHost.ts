
const { ccclass, property } = cc._decorator;
import {TagType} from '../mainWorld'
interface SKillConfig{
    name: string,
    spinePath: string,
}

@ccclass
export default class SkillHost extends cc.Component {
    skillConfig: SKillConfig = null;

    set(config){
        this.skillConfig = config;
    }

    get(){
        return this.skillConfig;
    }
    useSkill(player){
        // let path = 'spines/spider';
        let path = this.skillConfig.spinePath;
        cc.resources.load(path, sp.SkeletonData,(err,skeData) => {
            this.createSpNode(player,skeData);
        });
    }
    createSpNode(player,skeData){

        let spNode = new cc.Node();
        spNode.zIndex = 101;
        let skeleton = spNode.addComponent(sp.Skeleton);

        let pos = player.position.add(cc.v3(100,0,0))
        spNode.setPosition(pos);
        spNode.group = 'special';
        let body = spNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;
    
        let collider = spNode.addComponent(cc.PhysicsCircleCollider);
        collider.radius = 100;
        collider.sensor = true;
        collider.tag = TagType.DEBUFF_TAG;
        collider.enabled = false;
        player.parent.addChild(spNode);
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
                spNode.parent = null;
                spNode.destroy()
            }
        })
        // setTimeout(() => {
           
        // }, 3000);
    }
}
    