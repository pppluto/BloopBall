// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import PlayerHelper from './helper/player';
import CheckHelper,{CheckRecord} from './helper/checkin';
const {ccclass, property} = cc._decorator;

@ccclass
export default class Check extends cc.Component {

 
    // LIFE-CYCLE CALLBACKS:
    @property(cc.ScrollView)
    scrollList: cc.ScrollView = null;

    @property(cc.Node)
    scrollContent: cc.Node = null

    scrollContentLayout:cc.Layout;
    checkRecord: CheckRecord;
    onLoad () {
        this.scrollContentLayout = this.scrollContent.getComponent(cc.Layout);

        this.checkRecord = CheckHelper.instance.getCheckRecord();
        console.log('checkRecord', this.checkRecord );

        this.updateCheckList();

    }

    onCheckPress(handler,dayString) {
        console.log('onchecpress',dayString);

        let pressDay = Number(dayString);
        if(pressDay !== this.checkRecord.serialDay || this.checkRecord.hasCheck) {
            console.log(this.checkRecord)
            return;
        }

        this.checkRecord.hasCheck = true;
        CheckHelper.instance.saveLocalCheck(this.checkRecord.serialDay);
        PlayerHelper.instance.addCoins(this.checkRecord.coin)
        this.updateCheckList();
        this.node.parent.getComponent('start').updateCheck()

    }
    updateCheckList(){
        this.scrollContent.removeAllChildren()
        let {hasCheck,serialDay} = this.checkRecord;
        let padding = 20;
        let space = 20;
        let itemW = 150;
        let checkN = 7;
        let size = cc.size(itemW,350)
        for (let index = 1; index <= checkN; index++) {
            const element = new cc.Node();
            element.setContentSize(size);

            const labelNode = new cc.Node();
            labelNode.color = serialDay === index ?new cc.Color(255,0,0) :new cc.Color(0,0,0);
            let label = labelNode.addComponent(cc.Label)
            element.addChild(labelNode);
            label.string = serialDay > index || (hasCheck && serialDay === index) ? '已签到' : '签到';
            

            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "check";// 这个是代码文件名
            clickEventHandler.handler = "onCheckPress";
            clickEventHandler.customEventData = index + '';

            let btn = element.addComponent(cc.Button);
            btn.clickEvents.push(clickEventHandler);
            this.scrollContent.addChild(element);
        }
        let sepW =  (checkN - 1) * space
        this.scrollContent.width = padding * 2 +  checkN * itemW  + sepW;
    }

    // update (dt) {}
}
