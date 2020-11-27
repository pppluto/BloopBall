import PlayerHelper,{UserRecord} from './helper/player';
import { Role } from './roles/RoleMapping';
import { getMatchByRank } from './helper/RankMapping'
import Global from './global'
const {ccclass,property} = cc._decorator;

@ccclass
export default class Start extends cc.Component{

    @property(cc.Label)
    rankLabel: cc.Label;

    @property(cc.Node)
    roleListWrapper: cc.Node;
    @property(cc.Node)
    rankListWrapper: cc.Node;
    
    role:Role;
    onLoad () {
        cc.director.preloadScene("Main");
        this.prepare();
    }
    prepare(){
        //初始化用户信息
        PlayerHelper.instance.setup();

        let userRecord:UserRecord = PlayerHelper.instance.getUserRecord();

        let {name} = getMatchByRank(userRecord.rank)
        this.rankLabel.string = name + ':' + userRecord.rank;

        //解锁列表
        let list = this.roleListWrapper.children[0];
        if(!list) return;

        let roleListJs = list.getComponent('ScaleList');
        roleListJs.startCtr = this;
    }
    showRankList(){
        this.rankListWrapper.active = true;
    }
    hideList(){
        this.roleListWrapper.active = false;
        this.rankListWrapper.active = false;
    }
    chooseRole(){
        this.roleListWrapper.active = true;
    }
    choosedRole(role){
        Global.roleUsed = role;
        this.role = role;
        this.roleListWrapper.active = false;
        this.startGame();
    }
    startGame(){
        if(!this.role) {
            this.chooseRole();
        } else {
            cc.director.loadScene("Main");
        }
    }
}