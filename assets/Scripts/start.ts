import PlayerHelper,{UserRecord} from './helper/player';
import { Role } from './roles/RoleMapping';
import { getMatchByRank } from './helper/RankMapping'
import Global from './global'
const {ccclass,property} = cc._decorator;

@ccclass
export default class Start extends cc.Component{

    @property(cc.Label)
    rankLabel: cc.Label = null;

    @property(cc.Node)
    roleListWrapper: cc.Node = null;
    @property(cc.Node)
    rankListWrapper: cc.Node = null;
    @property(cc.Node)
    checkNode: cc.Node = null;

    role:Role;
    onLoad () {
        let transisionNode = cc.find('Transition');
        cc.game.addPersistRootNode(transisionNode);

        cc.director.preloadScene("Main");
        this.prepare();
    }
    prepare(){
        //初始化用户信息
        PlayerHelper.instance.setup();

        let userRecord:UserRecord = PlayerHelper.instance.getUserRecord();

        let {name} = getMatchByRank(userRecord.rank)
        this.rankLabel.string = `${name}\n段位分:${userRecord.rank}\n金币${userRecord.coins}`;

        //解锁列表
        let list = this.roleListWrapper.children[0];
        if(!list) return;

        let roleListJs = list.getComponent('ScaleList');
        roleListJs.startCtr = this;
    }
    showRankList(){
        this.hideList()
        this.rankListWrapper.active = true;
    }
    showCheck(){
        this.hideList()
        this.checkNode.active = true;
    }
    hideList(){
        this.roleListWrapper.active = false;
        this.rankListWrapper.active = false;
        this.checkNode.active = false;
    }
    chooseRole(){
        this.hideList()
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