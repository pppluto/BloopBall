import PlayerHelper,{UserRecord} from './helper/player';
import { Role } from './roles/RoleMapping';
import { getMatchByRank } from './helper/RankMapping'
import Global from './global'
import { Zone, ZoneList } from './helper/ZoneMapping';
const {ccclass,property} = cc._decorator;

@ccclass
export default class Start extends cc.Component{

    @property(cc.Label)
    rankLabel: cc.Label = null;

    @property(cc.Node)
    roleListWrapper: cc.Node = null;

    @property(cc.Node)
    zoneList: cc.Node = null;
    @property(cc.Node)
    checkNode: cc.Node = null;

    role:Role;
    zone:Zone;
    onLoad () {
        let transisionNode = cc.find('Transition');
        cc.game.addPersistRootNode(transisionNode);

        cc.director.preloadScene("Main");
        this.prepare();
        this.zone = ZoneList[0];
    }
    prepare(){
        //初始化用户信息
        PlayerHelper.instance.setup();

        let userRecord:UserRecord = PlayerHelper.instance.getUserRecord();

        let {name} = getMatchByRank(userRecord.rank)
        this.rankLabel.string = `${name}\n金币${userRecord.coins}`;

        //解锁列表
        let list = this.roleListWrapper.children[0];
        if(!list) return;

        let roleListJs = list.getComponent('roleList');
        roleListJs.startCtr = this;

        let zoneListJs = this.zoneList.getComponent('zoneList');
        zoneListJs.startCtr = this;
    }
    updateCheck(){
        let userRecord:UserRecord = PlayerHelper.instance.getUserRecord();

        let {name} = getMatchByRank(userRecord.rank)
        this.rankLabel.string = `${name}\n金币${userRecord.coins}`;

    }
    showRankList(){
        this.hideList()
    }
    showCheck(){
        this.hideList()
        this.checkNode.active = true;
    }
    hideList(){
        this.roleListWrapper.active = false;
        this.checkNode.active = false;
        this.zoneList.active = true;
    }
    chooseRole(){
        // this.hideList()
        this.zoneList.active = false;
        this.roleListWrapper.active = true;
        let list = this.roleListWrapper.children[0];
        let roleListJs = list.getComponent('roleList');
        roleListJs.renderItems();
    }
    chooseZone(zone){
        Global.zoneUsed = zone;
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