// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {RoleList} from './roles/RoleMapping';
import {RankList} from './helper/RankMapping';

import Start from './start'
import PlayerHelper from './helper/player';

const {ccclass, property} = cc._decorator;

const MAX_SCALE = 1.5;
const SPACE_X = 30;

const  ItemType = cc.Enum({
    RANK:1,
    ROLE:2
})
@ccclass
export default class NewClass extends cc.Component {

    
    @property(cc.ScrollView)
    scrollList: cc.ScrollView = null;

    @property(cc.Node)
    scrollContent: cc.Node = null

    @property(cc.Prefab)
    contentItem: cc.Prefab = null
    // LIFE-CYCLE CALLBACKS:

    @property({
        type: cc.Enum(ItemType),
    })
    itemType = ItemType.ROLE;

    startCtr: Start = null;
    scrollContentLayout: cc.Layout = null;
    scrollEndHandled: boolean = true;
    onLoad () {
        this.updateScrollSize(800,500)
        this.scrollContentLayout = this.scrollContent.getComponent(cc.Layout);
        this.updateLayout();
        this.renderItems();
        this.node.on('scrolling',this.onScroll,this);
        this.node.on('scroll-ended',this.onScrollEnd,this);
    }
    onScroll = (e) => {
        if(this.scrollList.isScrolling()) {
            this.scrollEndHandled = false;
        }
        this.updateItem();
    }
    onScrollEnd = () => {
        if(this.scrollEndHandled) return;


        return;
        //FIXME:有问题
        this.scrollEndHandled = true;
        let contentOffsetX = this.scrollList.getScrollOffset().x;
        let itemW = this.contentItem.data.width;
        let itemSep = SPACE_X + itemW;
        let index = Math.round(Math.abs(contentOffsetX) / itemSep);

        console.log('in',index);
        let offset = index * itemW;
        console.log('offset',offset,contentOffsetX)
        this.scrollList.scrollToOffset(cc.v2(offset,0),0.2);
    }
    onDestroy(){
        this.node.off('scrolling',this.onScroll,this);
        this.node.off('scroll-ended',this.onScrollEnd,this);
    }
    updateScrollSize(width,height) {
        this.scrollList.node.setContentSize(width,height);
    }
    updateLayout(){
        let itemW = this.contentItem.data.width;
        let padding = (this.scrollList.node.width - itemW * MAX_SCALE) / 2;
        this.scrollContentLayout.paddingLeft = padding;
        this.scrollContentLayout.paddingRight = padding;
        this.scrollContentLayout.spacingX = SPACE_X;
    }
    updateItem(){
        let contentOffsetX = this.scrollList.getScrollOffset().x;
        let itemW = this.contentItem.data.width;
        let itemSep = SPACE_X + itemW;
        let padding = (this.scrollList.node.width - itemW * MAX_SCALE) / 2;
        let index = Math.abs(Math.round(contentOffsetX / itemSep));
        index = Math.max(0,index);

        // let list = [index-1,index,index+1].filter(v => v>=0);

        let childs = this.scrollContent.children;
        childs.forEach(v => {
            let node = v;
            let offset = Math.abs(node.x + contentOffsetX - padding - node.width/2);
            let scale = MAX_SCALE - Math.min(1,offset/itemSep) * (MAX_SCALE - 1);
            node.scale = scale;
        });
    }
    renderItems(){
        console.log('this.itemtype',this.itemType)
        if(this.itemType === ItemType.ROLE){
            this.renderRoleItems();
        } else {
            this.renderRankItems();
        }
    }
    renderRankItems(){
        let itemW = this.contentItem.data.width;
        let padding = (this.scrollList.node.width - itemW * MAX_SCALE) / 2;

        let roleNum = RankList.length;
        for (let index = 0; index < roleNum; index++) {
            const element = cc.instantiate(this.contentItem);
            if(index === 0){
                element.scale = MAX_SCALE;
            }
            let jsc = element.getComponent('rankHost');
            let rank =  RankList[index];
            console.log('rak',rank)
            jsc.rankConfig = rank;
            jsc.startCtr = this.startCtr;
            this.scrollContent.addChild(element);
        }
        let sepW =  (roleNum - 1) * SPACE_X
        this.scrollContent.width = padding * 2 + (roleNum - 1) * itemW + MAX_SCALE * itemW + sepW
    }
    renderRoleItems(){
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
