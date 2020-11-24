import { Role } from "./roles/RoleMapping";
export default class Global {

    public static roleUsed: Role;

    private static _instance: Global;
    public static get instance() {
        if (!this._instance) {
            this._instance = new Global();
        }
        return this._instance;
    }

    _collideCount: number = 0
}