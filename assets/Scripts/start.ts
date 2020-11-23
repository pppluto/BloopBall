import PlayerHelper from './helper/player';
import { Role } from './roles/RoleMapping';
const {ccclass,property} = cc._decorator;

@ccclass
export default class Start extends cc.Component{

    @property(cc.Node)
    roleListWrapper: cc.Node;

    role:Role;
    onLoad () {
        cc.director.preloadScene("Main");
        this.prepare();

        let list = this.roleListWrapper.children[0];
        if(!list) return;

        let roleListJs = list.getComponent('ScaleList');
        roleListJs.startCtr = this;
    }
    prepare(){
        //初始化用户信息
        PlayerHelper.instance.setup();
    }
    chooseRole(){
        this.roleListWrapper.active = true;
    }
    choosedRole(role){
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