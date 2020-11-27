// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import start from '../start'
import PlayerHelper from '../helper/player';
import { RankConfig } from '../helper/RankMapping'
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;
   
    @property(cc.Label)
    cost: cc.Label = null;

    rankConfig: RankConfig = null;
    startCtr: start = null
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.nameLabel.string = this.rankConfig.name;
        this.cost.string =  this.rankConfig.range.join(' - ');
        let userRankName = PlayerHelper.instance.getUserRankName();
        if(userRankName === this.rankConfig.name){
            this.nameLabel.node.color = new cc.Color(255,0,0);
            this.cost.node.color = new cc.Color(255,0,0);
        }
    }
    // update (dt) {}
}
