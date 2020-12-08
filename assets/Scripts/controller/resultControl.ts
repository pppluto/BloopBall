// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Global from "../global";
import PlayerHelper from '../helper/player'
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    
    //结算
    @property(cc.Node)
    gameBoard: cc.Node = null
    @property(cc.Node)
    restartBtn: cc.Node = null
    @property(cc.Node)
    roleBoard: cc.Node = null
    @property(cc.Prefab)
    roleItem: cc.Prefab = null
    

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.showBoard();
    }

    start () {

    }
    restart(){
        cc.director.loadScene('Main');
    }
    relaunch(){
        cc.director.loadScene('Start');
    }
    showBoard(){
        let re = Global.lastGameResult;
        if(!re) return;
        let {ballRankList,userSeq,playerRank} = Global.lastGameResult;
        ballRankList.forEach((b,index) => {
            let role = b.role;

            let node = cc.instantiate(this.roleItem);
            let bg = node.getChildByName('mask');
            let rankLabel = node.getChildByName('rank').getComponent(cc.Label);
            rankLabel.string = ballRankList.length - index + '°';
            if(b.seq === userSeq) {
                node.scale = 1.2;
                bg.color = new cc.Color(255,255,255);
                bg.opacity = 150;
            }
            this.roleBoard.addChild(node);
        })

      
        PlayerHelper.instance.updateUserRecordByRank(playerRank);
    }

    // update (dt) {}
}
