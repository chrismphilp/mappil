import {DifficultyEnum} from "./Difficulty.enum";
import worldJsonData from '../geojson/world.geo.json';
import ukJsonData from '../geojson/uk.geo.json';
import {MapType} from "./MapType.enum";

const fetchJsonData = (mapType: MapType) => {
    switch (mapType) {
        case MapType.WORLD_COUNTRIES:
            return worldJsonData;
        case MapType.UK_ADMINISTRATIVE_REGIONS:
            return ukJsonData;
    }
};

const filterCountriesOnDifficulty = (mapType: MapType, difficulty: DifficultyEnum, geoJsonData: any): string[] => {
    switch (mapType) {
        case MapType.WORLD_COUNTRIES:
            const populationEstimate: number = processDifficultyPopulationEstimates(difficulty);
            return geoJsonData.features
                .filter((feature: any) => feature.properties.pop_est > populationEstimate)
                .map((feature: any) => feature.properties.name_long);
        case MapType.UK_ADMINISTRATIVE_REGIONS:
            return geoJsonData.features
                .map((feature: any) => feature.properties.name_long);
    }
}

const processDifficultyPopulationEstimates = (difficulty: DifficultyEnum): number => {
    switch (difficulty) {
        case DifficultyEnum.EASY:
            return 50_000_000;
        case DifficultyEnum.MEDIUM:
            return 25_000_000;
        case DifficultyEnum.HARD:
            return 10_000;
    }
}

export {
    fetchJsonData,
    filterCountriesOnDifficulty,
}
