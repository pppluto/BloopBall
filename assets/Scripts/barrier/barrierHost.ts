const {ccclass, property} = cc._decorator;
import {BarrierConfig} from './Barrier'
import {TagType} from '../mainWorld'
/**
 * 障碍管理，主要给碰撞提供对应的数据(加减速。。。)获取障碍提供的buff/debuff
 */

@ccclass
export class BarrierHost extends cc.Component {
    
    barrierConfig: BarrierConfig = null

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
    prepare(){
        if(!this.barrierConfig) return;
        
        let {bundleName,prebafPath} = this.barrierConfig

        cc.assetManager.loadBundle(bundleName,null,(err,bundle) => {
            if(err){
                console.log('er',err);
                return;
            }
            bundle.load(prebafPath, cc.Prefab,(err,prefab) => {
                let barrier = <any>cc.instantiate(prefab);
               
                let offset = barrier.height/2;
                this.node.y += offset-20;
                
                let collider = barrier.getComponent(cc.PhysicsPolygonCollider);
                collider.tag = TagType.BLOCK_TAG;
                barrier.parent = this.node;
                 
            });
        })
    }
    preDestory(){
        //bundle 是不是也要清理
        this.node.parent = null;
        this.node.destroy();
    }
}