import {FC, useState} from 'react';
import ScoreBoard from "./score/ScoreBoard";
import Map from "./map/Map";
import MenuButton from "./modal/MenuButton";
import {DifficultyEnum} from "./map/Difficulty.enum";
import {fetchJsonData, filterRegionOnDifficulty} from "./map/Map.util";
import {MapType} from "./map/MapType.enum";
import {MapData} from "./map/Map.data";
import './App.css';

// https://github.com/ivan-ha/d3-hk-map/blob/development/map.js
// https://bl.ocks.org/HarryStevens/75b3eb474527c10055618fa00123ba44
// https://bl.ocks.org/HarryStevens/raw/75b3eb474527c10055618fa00123ba44/?raw=true

type AppState = {
    geoJsonData: any;
    map: MapType;
    regionsToFind: string[];
    regionToFind: string | undefined;
    selectedRegion: string | undefined;
    regionsFound: string[];
    difficulty: DifficultyEnum;
    score: number;
    errors: number;
    currentGuessErrors: number;
    streak: number;
    gameOver: boolean;
};

const App: FC = () => {

    const audio = new Audio("/click.mp3")

    const geoJsonData = fetchJsonData(MapType.WORLD_COUNTRIES);
    let jsonRegions: string[] = geoJsonData.features.map((feature: any) => feature.properties.name_long);

    const getNextRegion = (countryList: string[]) => {
        const nextIndex = Math.floor(Math.random() * countryList.length);
        return countryList[nextIndex];
    }

    const [state, setState] = useState<AppState>({
        geoJsonData: fetchJsonData(MapType.WORLD_COUNTRIES),
        map: MapType.WORLD_COUNTRIES,
        regionsToFind: filterRegionOnDifficulty(MapType.WORLD_COUNTRIES, DifficultyEnum.MEDIUM, geoJsonData),
        regionToFind: getNextRegion(jsonRegions),
        selectedRegion: undefined,
        regionsFound: [],
        difficulty: DifficultyEnum.MEDIUM,
        score: 0,
        errors: 0,
        currentGuessErrors: 0,
        streak: 0,
        gameOver: false,
    });

    const changeMap = (mapType: MapType) => {
        const geoData = fetchJsonData(mapType);
        jsonRegions = geoData.features.map((feature: any) => feature.properties.name_long);
        const regionsWithDifficulty = filterRegionOnDifficulty(mapType, state.difficulty, geoData);
        const nextRegion: string = getNextRegion(regionsWithDifficulty);

        setState({
            ...state,
            geoJsonData: geoData,
            map: mapType,
            regionsToFind: regionsWithDifficulty.filter(v => v !== nextRegion),
            regionToFind: nextRegion,
            selectedRegion: undefined,
            regionsFound: [],
            score: 0,
            errors: 0,
            currentGuessErrors: 0,
            streak: 0,
            gameOver: false,
        });
    };

    const changeDifficulty = (difficulty: DifficultyEnum) => {
        const regionsWithDifficulty = filterRegionOnDifficulty(state.map, difficulty, state.geoJsonData);
        setState({
            ...state,
            regionsToFind: regionsWithDifficulty,
            regionToFind: getNextRegion(regionsWithDifficulty),
            selectedRegion: undefined,
            difficulty: difficulty,
            regionsFound: [],
            score: 0,
            errors: 0,
            currentGuessErrors: 0,
            streak: 0,
        });
    };

    const resetGame = () => {
        const regionsWithDifficulty: string[] = filterRegionOnDifficulty(state.map, state.difficulty, geoJsonData);
        const nextRegion: string = getNextRegion(regionsWithDifficulty);

        setState({
            ...state,
            regionsToFind: regionsWithDifficulty.filter(v => v !== nextRegion),
            regionToFind: nextRegion,
            selectedRegion: undefined,
            regionsFound: [],
            score: 0,
            errors: 0,
            currentGuessErrors: 0,
            streak: 0,
            gameOver: false,
        });
    };

    const updateSelectedRegion = (region: string) => {
        audio.play();
        if (region === state.regionToFind) {
            const newRegionList: string[] = state.regionsToFind.filter(v => v !== region);
            const nextRegion: string = getNextRegion(newRegionList);

            if (state.regionsToFind.length - 1 === 0) {
                setState({
                    ...state,
                    regionsToFind: newRegionList.filter(v => v !== nextRegion),
                    selectedRegion: region,
                    regionsFound: [state.regionToFind, ...state.regionsFound],
                    regionToFind: undefined,
                    streak: state.currentGuessErrors > 0 ? 1 : state.streak + 1,
                    score: state.score + 1,
                    currentGuessErrors: 0,
                    gameOver: true,
                });
            } else {
                setState({
                    ...state,
                    regionsToFind: newRegionList.filter(v => v !== nextRegion),
                    selectedRegion: region,
                    regionsFound: [state.regionToFind, ...state.regionsFound],
                    regionToFind: nextRegion,
                    streak: state.currentGuessErrors > 0 ? 1 : state.streak + 1,
                    score: state.score + 1,
                    currentGuessErrors: 0,
                });
            }
        } else if (state.currentGuessErrors >= 2) {
            const newRegionList: string[] = state.regionsToFind.filter(v => v !== region || v !== state.regionToFind);
            const nextRegion: string = getNextRegion(newRegionList);

            setState({
                ...state,
                regionsToFind: newRegionList.filter(v => v !== nextRegion),
                selectedRegion: region,
                errors: state.errors + 1,
                regionsFound: state.regionToFind ? [state.regionToFind, ...state.regionsFound] : state.regionsFound,
                regionToFind: nextRegion,
                streak: 0,
                currentGuessErrors: 0,
            });
        } else {
            setState({
                ...state,
                selectedRegion: region,
                errors: state.errors + 1,
                streak: 0,
                currentGuessErrors: state.currentGuessErrors + 1,
            });
        }
    };

    return (
        <>
            <MenuButton resetGame={resetGame}
                        changeMap={changeMap}
                        map={state.map}
                        changeDifficulty={changeDifficulty}
                        difficulty={state.difficulty}/>
            <ScoreBoard regionToFind={state.regionToFind}
                        score={state.score}
                        errors={state.errors}
                        streak={state.streak}/>
            <Map geoJsonData={state.geoJsonData}
                 mapDetails={MapData[state.map]}
                 updateSelectedRegion={updateSelectedRegion}
                 regionsFound={state.regionsFound}
                 regionToFind={state.regionToFind}
                 selectedRegion={state.selectedRegion}/>
            <div className="App"/>
        </>
    );
}

export default App;
