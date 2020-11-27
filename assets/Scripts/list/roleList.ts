import {RoleList} from '../roles/RoleMapping';
import ScaleList from './ScaleList';
import Start from '../start'
import PlayerHelper from '../helper/player';

const {ccclass, property} = cc._decorator;

const MAX_SCALE = 1.5;
const SPACE_X = 30;

@ccclass
export default class RoleScrollList extends ScaleList {

    startCtr: Start = null;
    onLoad () {
        this.updateScrollSize(800,500)
        this.scrollContentLayout = this.scrollContent.getComponent(cc.Layout);
        this.updateLayout();
        this.renderItems();
        this.node.on('scrolling',this.onScroll,this);
        this.node.on('scroll-ended',this.onScrollEnd,this);
    }

    renderItems(){
        let unlockedRoles = PlayerHelper.getUnlockedRoleIds();
        let itemW = this.contentItem.data.width;
        let padding = (this.scrollList.node.width - itemW * MAX_SCALE) / 2;

        let roleNum = RoleList.length;
        for (let index = 0; index < roleNum; index++) {
            const element = cc.instantiate(this.contentItem);
            if(index === 0){
                element.scale = MAX_SCALE;
            }
            let jsc = element.getComponent('roleHost');
            let role =  RoleList[index];
            jsc.role = role;
            jsc.startCtr = this.startCtr;
            jsc.locked = role.cost > 0 && !unlockedRoles.includes(role.id)
            this.scrollContent.addChild(element);
        }
        let sepW =  (roleNum - 1) * SPACE_X
        this.scrollContent.width = padding * 2 + (roleNum - 1) * itemW + MAX_SCALE * itemW + sepW
    }
    start () {

    }

    // update (dt) {}
}
