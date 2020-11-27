// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import {RoleList,Role} from '../roles/RoleMapping';
import start from '../start'
import PlayerHelper from '../helper/player';
const {ccclass, property} = cc._decorator;

@ccclass
export default class RoleHost extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;
   
    @property(cc.Label)
    cost: cc.Label = null;
    @property(cc.Label)
    btnLabel: cc.Label = null;

    role: Role = null
    startCtr: start = null
    locked: boolean = true;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.nameLabel.string = this.role.name;
        this.cost.string =  this.locked?`${this.role.cost}解锁`:'已解锁';
        this.btnLabel.string = this.locked?`解锁`:'选择';
    }

    onRoleChoose(){
        if(this.locked) {
            let success = PlayerHelper.instance.unlockRole(this.role);
            if(!success){
                console.log('解锁失败')
                return;
            }
            console.log('解锁成功')
        }
        this.startCtr.choosedRole(this.role)
    }
    // update (dt) {}
}
