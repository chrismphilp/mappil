import {DifficultyEnum} from "../map/Difficulty.enum";

const filterCountriesOnDifficulty = (difficulty: DifficultyEnum, countries: any): string[] => {
    const populationEstimate: number = processDifficultyPopulationEstimates(difficulty);
    return countries.features
        .filter((feature: any) => feature.properties.pop_est > populationEstimate)
        .map((feature: any) => feature.properties.name_long);
}

const processDifficultyPopulationEstimates = (difficulty: DifficultyEnum): number => {
    switch (difficulty) {
        case DifficultyEnum.EASY:
            return 50_000_000;
        case DifficultyEnum.MEDIUM:
            return 25_000_000;
        case DifficultyEnum.HARD:
            return -1;
    }
}

export {
    filterCountriesOnDifficulty
}
