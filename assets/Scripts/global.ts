import { Role } from "./roles/RoleMapping";
import { ZoneConfig } from './helper/ZoneMapping';
export default class Global {

    public static roleUsed: Role;
    public static zoneUsed: ZoneConfig;

    private static _instance: Global;
    public static get instance() {
        if (!this._instance) {
            this._instance = new Global();
        }
        return this._instance;
    }

    _collideCount: number = 0
}