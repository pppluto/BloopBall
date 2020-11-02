const {ccclass, property} = cc._decorator;

@ccclass
export class Global extends cc.Component {
    private static _instance: Global;
    public static get instance() {
        if (!this._instance) {
            this._instance = new Global();
        }
        return this._instance;
    }

    @property(Number)
    _collideCount: number = 0
}