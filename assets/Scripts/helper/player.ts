
/**
 * 用户管理类，包含积分段位信息，人物解锁信息，?签到信息
 */
import Storage from '../common/Storage';
import {Role} from '../roles/RoleMapping'
const {USER_RECORD_KEY,USER_UNLOCKED_ROLES_KEY} = Storage;

export interface UserRecord {
    score: number,
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
                score: 0,
                streak: 0,
                coins: 0
            }
    
            Storage.saveItem(USER_RECORD_KEY,userRecord)
        }
        PlayerHelper.instance.userRecord = userRecord;
    }
    updateUserRecord(record){
        let old = PlayerHelper.instance.userRecord;
        let newRecord = {...old,...record};
        PlayerHelper.instance.userRecord = newRecord
        
        Storage.saveItem(USER_RECORD_KEY, newRecord);
    }
    unlockRole(role:Role) {
        let record = PlayerHelper.instance.userRecord;
        if(record.coins<role.cost){
            return false;
        }
        PlayerHelper.addUnlockRole(role.id);
        record.coins -= role.cost;
        PlayerHelper.instance.updateUserRecord(record);
        return true;
    }

}