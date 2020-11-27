
/**
 * 排位积分相关配置
 */

import { UserRecord } from "./player";

export const RewardConfig = {
    rankRewards: [5,3,2], //排名奖励
    winStreakLimit: 4, //最小连胜条件
    winStreakBonus: [1,2,3], //连胜奖励
    minusBonus: 100,
    majorBonus: 200,
}

export interface RankConfig {
    name: string,
    range: number[], //积分要求
    AIRange: number[], //ai 等级区间
}

export const WinStreakAiConfig = [0,1,1,2,3,4,5];

export const getHighAINumByStreak = (streak) =>{
    if(streak > 5) return 5;
    return WinStreakAiConfig[streak] || 0;
}

export const getMatchByRank = (rank):RankConfig =>{
    if(rank >= 500) {
        return RankList[RankList.length-1];
    }
    for (let index = 0; index < RankList.length; index++) {
        const element = RankList[index];
        let [floor,ceil] = element.range;
        let inRange = floor<= rank && ceil >= rank;
        if(inRange) {
            return element;
        } else {
            continue
        }        
    }
    return RankList[0];
}

interface WinReward{
    reward:number,
    bonus: number,
    coins: number
}
const getMarjorName = (rankName) => {
    return  rankName.split('').filter(v => isNaN(Number(v))).join('');
}
export const getRewardByGameRank = (gameRank,userRecord:UserRecord):WinReward => {

    let {rankRewards,winStreakLimit,winStreakBonus,majorBonus,minusBonus} = RewardConfig;
    let {streak,rank} = userRecord;
    let reward = rankRewards[gameRank - 1] || 0;
    let bonus = 0;
    let coins = 0;
    if(streak >= winStreakLimit) {
        bonus = winStreakBonus[streak - winStreakLimit] || 0;
    }
    let rankName = getMatchByRank(rank).name;

    let newRank = rank + reward + bonus;
    let newRankName = getMatchByRank(newRank).name;

    if(rankName !== newRankName) {
        coins = minusBonus;
        let majorName = getMarjorName(rankName);
        let majroName2 = getMarjorName(newRankName);
        if(majorName !== majroName2) {
            coins = majorBonus;
        }
    }

    return {reward,bonus,coins};
}
export const RankList:RankConfig[] = [
    {
        name:'无段位',
        range: [0,4],
        AIRange: [1,3]
    },
    {
        name:'黑铁1',
        range: [5,9],
        AIRange: [1,3]
    },
    {
        name:'黑铁2',
        range: [10,19],
        AIRange: [1,4]
    },
    {
        name:'黑铁3',
        range: [20,29],
        AIRange: [1,5]
    },
    {
        name:'青铜1',
        range: [30,49],
        AIRange: [2,5]
    },
    {
        name:'青铜2',
        range: [50,69],
        AIRange: [2,6]
    },
    {
        name:'青铜3',
        range: [70,99],
        AIRange: [2,7]
    },
    {
        name:'白银1',
        range: [100,129],
        AIRange: [3,6]
    },
    {
        name:'白银2',
        range: [130,159],
        AIRange: [3,7]
    },
    {
        name:'白银3',
        range: [160,199],
        AIRange: [3,8]
    },
    // ...
]