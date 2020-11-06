const {ccclass} = cc._decorator;

@ccclass
export class Storage extends cc.Component {
    private static _instance: Storage;
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