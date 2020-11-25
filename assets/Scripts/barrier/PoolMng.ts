/**
 * https://github.com/cocos-creator/tutorial-dark-slash/blob/master/assets/scripts/PoolMng.js
 * 根据这个改造一个pool
 */

import NodePool from './NodePool'

const {ccclass,property} = cc._decorator

@ccclass
export default class PoolMng extends cc.Component{
   
    @property(NodePool)
    foePools: NodePool[] = []
    @property(NodePool)
    projectilePools: NodePool[] = []

    init () {
        for (let i = 0; i < this.foePools.length; ++i) {
            this.foePools[i].init();
        }

        for (let i = 0; i < this.projectilePools.length; ++i) {
            this.projectilePools[i].init();
        }
    }

    requestFoe (foeType) {
        let thePool = this.foePools[foeType];
        if (thePool.idx >= 0) {
            return thePool.request();
        } else {
            return null;
        }
    }

    returnFoe (foeType, obj) {
        let thePool = this.foePools[foeType];
        if (thePool.idx < thePool.size) {
            thePool.return(obj);
        } else {
            cc.log('Return obj to a full pool, something has gone wrong');
            return;
        }
    }

    requestProjectile (type) {
        let thePool = this.projectilePools[type];
        if (thePool.idx >= 0) {
            return thePool.request();
        } else {
            return null;
        }
    }

    returnProjectile (type, obj) {
        let thePool = this.projectilePools[type];
        if (thePool.idx < thePool.size) {
            thePool.return(obj);
        } else {
            cc.log('Return obj to a full pool, something has gone wrong');
            return;
        }
    }
}