import {ZoneList} from '../helper/ZoneMapping';
import ScaleList from './ScaleList';
import Start from '../start'

const {ccclass, property} = cc._decorator;

@ccclass
export default class ZoneScrollList extends ScaleList {

    startCtr: Start = null;
    onLoad () {
        this.prepare();
        this.updateScrollSize(800,500)
        this.renderItems();
        this.node.on('scrolling',this.onScroll,this);
        this.node.on('scroll-ended',this.onScrollEnd,this);
    }

    renderItems(){
        let itemW = this.contentItem.data.width;
        let padding = (this.scrollList.node.width - itemW * this.maxScale) / 2;

        let roleNum = ZoneList.length;
        for (let index = 0; index < roleNum; index++) {
            const element = cc.instantiate(this.contentItem);
            if(index === 0){
                element.scale = this.maxScale;
            }
            let jsc = element.getComponent('zoneHost');
            let zone =  ZoneList[index];
            jsc.zone = zone;
            jsc.startCtr = this.startCtr;

            
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "zoneList";
            clickEventHandler.handler = "onZoneClick";
            clickEventHandler.customEventData = index + '';

            let btn = element.addComponent(cc.Button);
            btn.clickEvents.push(clickEventHandler);

            this.scrollContent.addChild(element);
        }
        let sepW =  (roleNum - 1) * this.spaceX
        this.scrollContent.width = padding * 2 + (roleNum - 1) * itemW + this.maxScale * itemW + sepW
    }

    onZoneClick(e,customEventData){
        let index = Number(customEventData);
        let zone = ZoneList[index];
        this.startCtr.chooseZone(zone);
    }
    start () {

    }

    // update (dt) {}
}
