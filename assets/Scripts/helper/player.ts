
/**
 * 用户管理类，包含积分段位信息，人物解锁信息，?签到信息
 */
import { recording } from '../common/RecordManager';
import Storage from '../common/Storage';
import {Role} from '../roles/RoleMapping'
import {RewardConfig,getMatchByRank,getHighAINumByStreak,getRewardByGameRank} from './RankMapping'
const {USER_RECORD_KEY,USER_UNLOCKED_ROLES_KEY} = Storage;

export interface UserRecord {
    rank: number,
    streak: number,
    coins: number,
}

export default class PlayerHelper {
    private static _instance: PlayerHelper;

    public userRecord: UserRecord;

    public static get instance() {
        if (!this._instance) {
            this._instance = new PlayerHelper();
        }
        return this._instance;
    }
    public static addUnlockRole(id){
        let roles = PlayerHelper.getUnlockedRoleIds();
        roles.push(id);
        Storage.saveItem(USER_UNLOCKED_ROLES_KEY,roles);
    }
    public static getUnlockedRoleIds():number[]{
        let roles =  Storage.getItem(USER_UNLOCKED_ROLES_KEY);
        if(!(roles instanceof Array)){
            roles = [];
        }
        return roles;
    }

    setup(){
        let userRecord = <UserRecord>Storage.getItem(USER_RECORD_KEY);
        if(!userRecord){
            userRecord = {
                rank: 0,
                streak: 0,
                coins: 0
            }
    
            Storage.saveItem(USER_RECORD_KEY,userRecord)
        }
        this.userRecord = userRecord;
    }
    getUserRankName(){
        let {name} = getMatchByRank(this.userRecord.rank);
        return name;

    }
    getUserRecord(){
        return this.userRecord;
    }
    updateUserRecordByRank(rank:number){
        let newRecord = Object.assign({},this.userRecord);
        let currentStreak = newRecord.streak;
        // rankRewards: [5,3,2], //排名奖励
        // winStreakLimit: 4, //最小连胜条件
        // winStreaks: [1,2,3], //连胜奖励
        currentStreak += rank === 1 ? 1 : -currentStreak;

        let {reward,bonus} = getRewardByGameRank(rank,currentStreak)
        console.log('更新玩家排名，胜利积分,',reward,'连胜次数：',currentStreak,'连胜奖励：',bonus)
        newRecord.rank += reward+bonus;
        newRecord.streak = currentStreak;
        this.userRecord = newRecord;
        
        Storage.saveItem(USER_RECORD_KEY, newRecord);
    }
    updateUserRecord(record:UserRecord){
        let old = this.userRecord;
        let newRecord = {...old,...record};
        this.userRecord = newRecord
        
        Storage.saveItem(USER_RECORD_KEY, newRecord);
    }
    unlockRole(role:Role): boolean{
        let record = this.userRecord;
        if(record.coins<role.cost){
            return false;
        }
        PlayerHelper.addUnlockRole(role.id);
        record.coins -= role.cost;
        this.updateUserRecord(record);
        return true;
    }

    public matchAI() {
        let rank = this.userRecord.rank;
        let {AIRange} = getMatchByRank(rank);
        let highAINum = getHighAINumByStreak(this.userRecord.streak)
        return {AIRange,highAINum}
    }
}