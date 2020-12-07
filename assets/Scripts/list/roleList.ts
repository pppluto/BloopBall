import {RoleList} from '../roles/RoleMapping';
import ScaleList from './ScaleList';
import Start from '../start'
import PlayerHelper from '../helper/player';
import Global from '../global';
import { ZoneMapping } from '../helper/ZoneMapping';

const {ccclass, property} = cc._decorator;

@ccclass
export default class RoleScrollList extends ScaleList {

    startCtr: Start = null;
    onLoad () {
        this.prepare();
        this.updateScrollSize(800,500)
        this.renderItems();
        this.node.on('scrolling',this.onScroll,this);
        this.node.on('scroll-ended',this.onScrollEnd,this);
    }
    onEnable(){
        this.scrollList.scrollToOffset(cc.v2(0,0));
        this.updateItem();
    }
    renderItems(){
        this.scrollContent.removeAllChildren();
        let unlockedRoles = PlayerHelper.getUnlockedRoleIds();
        let zone = Global.zoneUsed;
        let {avaliableRoleIds,defaultRoleId} = ZoneMapping[zone.name]
        let itemW = this.contentItem.data.width;
        let padding = (this.scrollList.node.width - itemW * this.maxScale) / 2;

        let avaliableRoleList = RoleList.filter(v => avaliableRoleIds.includes(v.id))

        let roleNum = avaliableRoleList.length;
        for (let index = 0; index < roleNum; index++) {
            const element = cc.instantiate(this.contentItem);
            if(index === 0){
                element.scale = this.maxScale;
            }
            let jsc = element.getComponent('roleHost');
            let role =  avaliableRoleList[index];
            jsc.role = role;
            jsc.startCtr = this.startCtr;
            jsc.locked = role.id !== defaultRoleId && !unlockedRoles.includes(role.id)
            this.scrollContent.addChild(element);
        }
        let sepW =  (roleNum - 1) * this.spaceX
        this.scrollContent.width = padding * 2 + (roleNum - 1) * itemW + this.maxScale * itemW + sepW
    }
    start () {

    }

    // update (dt) {}
}
