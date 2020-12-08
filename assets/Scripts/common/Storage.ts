export default class Storage {
    private static _instance: Storage;

    public static AI_CONFIG_KEY = 'BB_ai_config';
    public static BALL_M_CONFIG_KEY = 'BB_BALL_M_CONFIG_KEY';
    public static BALL_P_CONFIG_KEY = 'BB_BALL_P_CONFIG_KEY';

    public static USER_RECORD_KEY = 'BB_user_record';
    public static USER_UNLOCKED_ROLES_KEY = 'BB_USER_UNLOCKED_ROLES_KEY';
    public static USER_UNLOCKED_ZONE_KEY = 'BB_USER_UNLOCKED_ZONE_KEY';
    public static USER_UNLOCKED_SKILL_KEY_PREFIX = 'BB_USER_UNLOCKED_ROLE_SKILL_KEY_PREFIX';

    public static get instance() {
        if (!this._instance) {
            this._instance = new Storage();
        }
        return this._instance;
    }

    public static getItem(key) {
       let item =  cc.sys.localStorage.getItem(key);
       try {
          let data = JSON.parse(item);
          return data;
       } catch (error) {
          return item;
       }
    }

    public static saveItem(key,data) {
       let item = data;
       if(typeof data === 'object'){
           item = JSON.stringify(data)
       } else if(typeof data === 'function'){
           throw 'can not save function'
       }
       cc.sys.localStorage.setItem(key,item);
    }
    
}