
/**
 * 用户管理类，包含积分段位信息，地图，角色，技能解锁信息，?签到信息
 */
import Storage from '../common/Storage';
import {Role} from '../roles/RoleMapping'
import {getMatchByRank,getHighAINumByStreak,getRewardByGameRank} from './RankMapping'
const {USER_RECORD_KEY,} = Storage;
const { USER_UNLOCKED_ROLES_KEY, USER_UNLOCKED_SKILL_KEY_PREFIX} = Storage;
const {USER_UNLOCKED_ZONE_KEY} = Storage;
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
    public static addUnlockZone(id){
        let zones = PlayerHelper.getUnlockedRoleIds();
        zones.push(id);
        Storage.saveItem(USER_UNLOCKED_ZONE_KEY,zones);
    }
    public static getUnlockedZoneIds():number[]{
        let roles =  Storage.getItem(USER_UNLOCKED_ZONE_KEY);
        if(!(roles instanceof Array)){
            roles = [];
        }
        return roles;
    }
    public static addUnlockRoleSkill(roleId,skillName){
        let key = USER_UNLOCKED_SKILL_KEY_PREFIX+ '_' + roleId;
        let roles = PlayerHelper.getUnlockedRoleSkillNames(roleId);
        roles.push(skillName);
        Storage.saveItem(key,roles);
    }
    public static getUnlockedRoleSkillNames(roleId):number[]{
        let key = USER_UNLOCKED_SKILL_KEY_PREFIX+ '_' + roleId;
        let skillNames =  Storage.getItem(key);
        if(!(skillNames instanceof Array)){
            skillNames = [];
        }
        return skillNames;
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
    updateUserRecordByRank(gameRank:number){
        let newRecord = Object.assign({},this.userRecord);
        let currentStreak = newRecord.streak;
        // rankRewards: [5,3,2], //排名奖励
        // winStreakLimit: 4, //最小连胜条件
        // winStreaks: [1,2,3], //连胜奖励
        currentStreak += gameRank === 1 ? 1 : -currentStreak;
        newRecord.streak = currentStreak;

        let {reward,bonus,coins} = getRewardByGameRank(gameRank,newRecord)
        console.log('更新玩家排名，胜利积分,',reward,'连胜次数：',currentStreak,'连胜奖励：',bonus,'获取金币:',coins)
        newRecord.rank += reward+bonus;
        newRecord.coins += coins;
        this.userRecord = newRecord;
        
        Storage.saveItem(USER_RECORD_KEY, newRecord);
    }
    addCoins(coin){
        console.log('获得金币',coin)
        this.userRecord.coins += coin
        
        Storage.saveItem(USER_RECORD_KEY, this.userRecord);
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