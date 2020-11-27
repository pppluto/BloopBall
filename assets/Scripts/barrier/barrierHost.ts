const {ccclass, property} = cc._decorator;
import {BarrierConfig} from './Barrier'
import {TagType} from '../mainWorld'
import ColliderListener from '../roles/colliderListener'
/**
 * 障碍管理，主要给碰撞提供对应的数据(加减速。。。)获取障碍提供的buff/debuff
 */

@ccclass
export class BarrierHost extends cc.Component {
    
    public static barrierIdx = 0;

    public barrierConfig: BarrierConfig = null

    set(config){
        this.barrierConfig = config;
    }
    get(){
        return this.barrierConfig;
    }

    initWithPosition(position,angle?){
        this.node.setPosition(position);
        if(angle) {
            this.node.angle = angle
        }
        this.prepare()
    }
    //放哪里去处理
    onBeginContact (contact, selfCollider, otherCollider) {
        if(this.barrierConfig.disposable){
            this.preDestory();
        }
    }
    onEndContact (contact, selfCollider, otherCollider) {
    
    }
    prepare(){
        if(!this.barrierConfig) return;

        this.barrierConfig.customData = BarrierHost.barrierIdx;
        BarrierHost.barrierIdx += 1;
    
        let {bundleName,prebafPath} = this.barrierConfig

        cc.assetManager.loadBundle(bundleName,null,(err,bundle) => {
            if(err){
                console.log('er',err);
                return;
            }
            bundle.load(prebafPath, cc.Prefab,(err,prefab) => {
                let barrier = <any>cc.instantiate(prefab);
               
                let offset = 0;
                let {yOffset} = this.barrierConfig;
                if(yOffset) {
                    offset += yOffset * barrier.height;
                }
                this.node.y += offset-20;
                
                let collider = barrier.getComponent(cc.PhysicsPolygonCollider) || barrier.getComponent(cc.PhysicsCircleCollider);
                if(collider){
                    collider.tag = TagType.BLOCK_TAG;
                }
                barrier.parent = this.node;
                barrier.addComponent(ColliderListener);
                 
            });
        })
    }
    public preDestory(){
        //bundle 是不是也要清理
        this.node.parent = null;
        this.node.destroy();
    }
}