// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import start from '../start'
import PlayerHelper from '../helper/player';
import { ZoneConfig,Zone, ZoneMapping } from '../helper/ZoneMapping'
import * as Utils from '../helper/utils';

const {ccclass, property} = cc._decorator;


@ccclass
export default class RankHost extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;
   
    @property(cc.Label)
    cost: cc.Label = null;

    zone: Zone = null;
    startCtr: start = null
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let zoneConfig = ZoneMapping[this.zone.name];
        this.nameLabel.string = zoneConfig.desc;

        let zoneRoles = zoneConfig.avaliableRoleIds;

        let userRoles = PlayerHelper.getUnlockedRoleIds();
        userRoles.push(zoneConfig.defaultRoleId);
        let userRolesInZone = userRoles.filter(rId => zoneRoles.includes(rId));
        userRolesInZone = Utils.unique(userRolesInZone);


        let roleLabel = `${userRolesInZone.length}/${zoneRoles.length}`
        this.cost.string =  this.zone.cost + '角色解锁' + roleLabel;

        
        let unlockIds = PlayerHelper.getUnlockedZoneIds();
        if(unlockIds.includes(this.zone.id)){
            this.nameLabel.node.color = new cc.Color(255,0,0);
            this.cost.node.color = new cc.Color(255,0,0);
        }
    }
    onClick() {
        this.startCtr.chooseZone(this.zone);
    }
    // update (dt) {}
}
