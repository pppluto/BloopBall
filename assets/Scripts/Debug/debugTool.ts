import { CoinRegular } from '../barrier/Barrier';
import Storage from '../common/Storage';
import {getAIConfigByLevel} from '../helper/AI'
const { ccclass, property } = cc._decorator;


const AI_DEBUG_LIST = [
    {
        name: '检测范围',
        min: 0,
        max: 500,
        key: 'aroundDistance'
    },
    {
        name: '跳过概率',
        min: 0,
        max: 1,
        key: 'barrierPosibility',
    },
    {
        name: '一阶段技能',
        min: 0,
        max: 1,
        key:'firstPeriodSkillPosibility'
    },
    {
        name: '二阶段技能',
        min: 0,
        max: 1,
        key: 'secondPeriodSkillPosibility'
    },
    {
        name: '决策间隔',
        min: 0.1,
        max: 4,
        key: 'behaveInterval'
    },
]
const BALL_MATERIALS = [
    {
        name: '弹性(越小越弹)',
        min: 50,
        max: 300,
        key: 'bounce'
    },
    {
        name: '摩擦因子',
        min: 0,
        max: 1,
        key: 'friction'
    },
]
const BALL_PROPERTIES = [
    {
        name: '跳跃力度',
        min: 10,
        max: 100,
        key: 'jumpXImpulse'
    },
    {
        name: '滚动力度',
        min: 100,
        max: 500,
        key: 'torque'
    },
    {
        name: '最小速度',
        min: 0,
        max: 100,
        key: 'minXSpeed'
    },
    {
        name: '最大滚动速度',
        min: 100,
        max: 1000,
        key: 'maxAngular'
    },
]

const AllDebugs = {
    ai: AI_DEBUG_LIST,
    ballM: BALL_MATERIALS,
    ballP: BALL_PROPERTIES
}

@ccclass
export default class DebugTool extends cc.Component {
    //debug
    @property(cc.Prefab)
    debugItem: cc.Prefab = null;
    @property(cc.Label)
    debugLabel: cc.Label = null;

    @property(cc.Node)
    scrollList: cc.Node = null;

    debugInfoList: [string] = ['']
    debugCount: number = 0;

    allConfig = {}
    // use this for initialization
    onLoad () {
        this.loadConfig()
    }
    loadConfig(){
        let key =  Storage.AI_CONFIG_KEY;
        let aiconfig = Storage.getItem(key);

        if(!aiconfig){
            aiconfig = getAIConfigByLevel(1);
            Storage.saveItem(key,aiconfig)
        }


        key = Storage.BALL_M_CONFIG_KEY;
        let ballM = Storage.getItem(key) || {};
        key = Storage.BALL_P_CONFIG_KEY;
        let ballP = Storage.getItem(key) || {};
      

        this.allConfig = {...this.allConfig,ai: aiconfig,ballM,ballP};
        this.renderDebugList()

    }
    renderDebugList() {
        this.scrollList.removeAllChildren();
        let h = this.debugItem.data.height;
        let w = this.debugItem.data.width;
        let keys = Object.keys(AllDebugs);
        for (let index = 0; index < keys.length; index++) {
            let prefix = keys[index];
            let list = AllDebugs[prefix];
            for (let index2 = 0; index2 < list.length; index2++) {
                let info = list[index2];
                let debugItem = cc.instantiate(this.debugItem);
    
                debugItem.setPosition(cc.v2(w/2 + 100 + index  * (w + 20),-index2 * h - 100))
    
                let labelNode = debugItem.getChildByName('label');
                let label = labelNode.getComponent(cc.Label);
                let config = this.allConfig[prefix] || {};


                label.string = info.name + config[info.key] || '';
    
                var sliderEventHandler = new cc.Component.EventHandler();
                sliderEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
                sliderEventHandler.component = "debugTool"
                sliderEventHandler.handler = "changeSlider";
                sliderEventHandler.customEventData = `${prefix}_${info.key}`;
    
                let slider = debugItem.getComponent(cc.Slider);
                slider.slideEvents.push(sliderEventHandler);
    
                this.scrollList.addChild(debugItem);
            }
           
        }
    }
   
    changeSlider(slider,flagKey){
        let [prefix,key] = flagKey.split('_');

        let list = AllDebugs[prefix];

        let index = list.findIndex(v => v.key === key);
        let {min,max} = list[index];
        let progress = slider.progress;
        let value = progress * (max - min) + min;
        let value2 = Number(value).toFixed(2);

        this.updateAllConfig(prefix,key,value2)

    }
    updateItems(prefix){
        let sep1 = AI_DEBUG_LIST.length;
        let sep2 = sep1 + BALL_MATERIALS.length;
        let config = this.allConfig[prefix] || {}
        let childs = this.scrollList.children;
        switch(prefix){
            case 'ai':
                childs = childs.slice(0,sep1);
                break;
            case 'ballM':
                childs = childs.slice(sep1,sep2);
                break;
            case 'ballP':
                childs = childs.slice(sep2);
                break;
        }

        let list = AllDebugs[prefix]
        childs.forEach((v,i) => {
            let info = list[i];
            let labelNode = v.getChildByName('label');
            let label = labelNode.getComponent(cc.Label);
            label.string = info.name + config[info.key];
        })
    }
    updateAllConfig(prefix,key,value){
        // console.log('updateAllConfig',prefix,key,value);

        let config = this.allConfig[prefix] || {};
        config = {...config,[key]:value};

        this.allConfig[prefix] = config;

        this.updateItems(prefix)

        let localKey = '';

        switch (prefix) {
            case 'ai':
                localKey = Storage.AI_CONFIG_KEY;
                break;
            case 'ballM':
                localKey = Storage.BALL_M_CONFIG_KEY;
                break;
            case 'ballP':
                localKey = Storage.BALL_P_CONFIG_KEY;
                break;
            default:
                break;
        }
        if(localKey){
            Storage.saveItem(localKey,config);
        }
    }
  
    showDebug(msg:string){
        this.debugCount +=1;
        let seq = '==seq:' + this.debugCount;
        this.debugInfoList.push(msg+seq);
        if(this.debugInfoList.length>4){
            this.debugInfoList.shift();
        }
        this.debugLabel.string = this.debugInfoList.join('\n');
    }
    hide(){
        this.node.active = false;
        cc.director.resume();
    }
    updateConfig(){
        let gameCtr = this.node.parent.getComponent('gameControl');
        gameCtr.updateConfig()
    }
}
