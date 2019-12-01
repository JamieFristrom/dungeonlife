import * as PossessionData from 'ReplicatedStorage/Standard/PossessionDataStd'

export interface MonsterDatumI extends PossessionData.PossessionDatumI
{
    tagsT: { Boss?: boolean, Dark?: boolean, Superboss?: boolean }
    soloLevelN: number
}