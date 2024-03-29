const {ccclass, property} = cc._decorator;

const CHECK_KEY = 'BB_checkin_key';
const COIN_MAP = [100,150,300,400,500,800,1000];
//NOTE:只是把围住渣男代码拷贝，具体根据逻辑再优化，尽量做到解耦
// http://121.41.95.96/bitbucket/projects/CST/repos/nervecat/browse/mainProject/assets/script/Start.js#119

export interface CheckRecord{
    hasCheck: boolean,
    serialDay: number,
    coin: number
}

@ccclass
export default class CheckIn extends cc.Component{
    private static _instance: CheckIn;
    public static get instance() {
        if (!this._instance) {
            this._instance = new CheckIn();
        }
        return this._instance;
    }

    getLocalCheck(){
        let checkRecords;
        try {
          checkRecords = JSON.parse(cc.sys.localStorage.getItem(CHECK_KEY))
        } catch (error) {}
        checkRecords = !!checkRecords ? checkRecords : []
        return checkRecords;
    }
    saveLocalCheck(serialDay){
        let checkRecords = [];
        if(serialDay !== 1 ){
            checkRecords = this.getLocalCheck();
            checkRecords = checkRecords.length === 7 ? [] : checkRecords;
        }
        let today = new Date().getTime();
        checkRecords.push(today);
        cc.sys.localStorage.setItem(CHECK_KEY,JSON.stringify(checkRecords))
    }
    isSameDay(date,date2){
        let a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        let b =  new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime();
        return a === b;
    }
    getCheckRecord():CheckRecord{
        let checkRecords = this.getLocalCheck();

        if(!checkRecords.length){
            return {hasCheck: false,serialDay: 1,coin:COIN_MAP[1]};
        }
        let lastTS = checkRecords[checkRecords.length -1];
        let lastDate = new Date(lastTS);
        let nowDate = new Date();
        let nowTS = new Date().getTime();
        let serialDay;
        if(this.isSameDay(lastDate,nowDate)){
            console.log('今天已经签到');
            serialDay = checkRecords.length;
            return {hasCheck: true,serialDay,coin:COIN_MAP[serialDay-1]};
        }
        let day = 3600 * 24 * 1000;

        let preDate = new Date(nowTS - day);

        let isSerial = this.isSameDay(preDate,lastDate);

        console.log('isserial',isSerial)

        serialDay = isSerial ? checkRecords.length + 1 : 1;
        serialDay = serialDay > 7 ? 1 : serialDay;
        return {hasCheck: false,serialDay,coin:COIN_MAP[serialDay-1]};
    }
}
