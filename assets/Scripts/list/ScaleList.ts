// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

const MAX_SCALE = 1.5;
const SPACE_X = 30;

@ccclass
export default class NewClass extends cc.Component {

    
    @property(cc.ScrollView)
    scrollList: cc.ScrollView = null;

    @property(cc.Node)
    scrollContent: cc.Node = null

    @property(cc.Prefab)
    contentItem: cc.Prefab = null
    // LIFE-CYCLE CALLBACKS:

    scrollContentLayout: cc.Layout = null;
    scrollEndHandled: boolean = true;
    onLoad () {
       
    }
    prepare(){
        this.scrollContentLayout = this.scrollContent.getComponent(cc.Layout);
        this.updateLayout();
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
    start () {

    }

    // update (dt) {}
}
