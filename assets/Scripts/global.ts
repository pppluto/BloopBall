import { Role } from "./roles/RoleMapping";
import { ZoneConfig } from './helper/ZoneMapping';


interface BRType {
    role: Role,
    seq: number
}

interface GameResult{
    ballRankList: BRType[],
    userSeq: number,
    playerRank: number
}
export default class Global {

    public static roleUsed: Role;
    public static zoneUsed: ZoneConfig;
    public static lastGameResult: GameResult;

    private static _instance: Global;
    public static get instance() {
        if (!this._instance) {
            this._instance = new Global();
        }
        return this._instance;
    }

    _collideCount: number = 0
}