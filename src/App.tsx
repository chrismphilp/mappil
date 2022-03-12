import {FC, useState} from 'react';
import countries from './custom.geo.json';
import ScoreBoard from "./score/ScoreBoard";
import Map from "./map/Map";
import MenuButton from "./modal/MenuButton";
import './App.css';
import {DifficultyEnum} from "./map/Difficulty.enum";
import {filterCountriesOnDifficulty} from "./util/Map.util";

// https://github.com/ivan-ha/d3-hk-map/blob/development/map.js
// https://bl.ocks.org/HarryStevens/75b3eb474527c10055618fa00123ba44
// https://bl.ocks.org/HarryStevens/raw/75b3eb474527c10055618fa00123ba44/?raw=true

type AppState = {
    countriesToFind: string[];
    countryToFind: string;
    selectedCountry: string;
    countriesFound: string[];
    difficulty: DifficultyEnum;
    score: number;
    errors: number;
    currentGuessErrors: number;
    streak: number;
    gameOver: boolean;
};

const App: FC = () => {

    const audio = new Audio("/click.mp3")

    const jsonCountries = countries.features.map(feature => feature.properties.name_long);

    const getNextCountry = (countryList: string[]) => {
        const nextIndex = Math.floor(Math.random() * countryList.length);
        return countryList[nextIndex];
    }

    const [state, setState] = useState<AppState>({
        countriesToFind: filterCountriesOnDifficulty(DifficultyEnum.MEDIUM, countries),
        countryToFind: getNextCountry(jsonCountries),
        selectedCountry: '',
        countriesFound: [],
        difficulty: DifficultyEnum.MEDIUM,
        score: 0,
        errors: 0,
        currentGuessErrors: 0,
        streak: 0,
        gameOver: false,
    });

    const changeDifficulty = (difficulty: DifficultyEnum) => {
        const countriesWithDifficulty = filterCountriesOnDifficulty(difficulty, countries);
        setState({
            ...state,
            countriesToFind: countriesWithDifficulty,
            countryToFind: getNextCountry(countriesWithDifficulty),
            selectedCountry: '',
            difficulty: difficulty,
            countriesFound: [],
            score: 0,
            errors: 0,
            currentGuessErrors: 0,
            streak: 0,
        });
    }

    const resetGame = () => {
        const countriesWithDifficulty: string[] = filterCountriesOnDifficulty(state.difficulty, countries);
        const nextCountry: string = getNextCountry(countriesWithDifficulty);

        setState({
            ...state,
            countriesToFind: countriesWithDifficulty.filter(v => v !== nextCountry),
            countryToFind: nextCountry,
            selectedCountry: '',
            countriesFound: [],
            score: 0,
            errors: 0,
            currentGuessErrors: 0,
            streak: 0,
            gameOver: false,
        });
    };

    const updateSelectedCountry = (country: string) => {
        audio.play();
        console.log(state);
        if (country === state.countryToFind) {
            const newCountryList: string[] = state.countriesToFind.filter(v => v !== country);
            const nextCountry: string = getNextCountry(newCountryList);

            if (state.countriesToFind.length - 1 === 0) {
                setState({
                    ...state,
                    countriesToFind: newCountryList.filter(v => v !== nextCountry),
                    selectedCountry: country,
                    countriesFound: [state.countryToFind, ...state.countriesFound],
                    countryToFind: '',
                    streak: state.currentGuessErrors > 0 ? 1 : state.streak + 1,
                    score: state.score + 1,
                    currentGuessErrors: 0,
                    gameOver: true,
                });
            } else {
                setState({
                    ...state,
                    countriesToFind: newCountryList.filter(v => v !== nextCountry),
                    selectedCountry: country,
                    countriesFound: [state.countryToFind, ...state.countriesFound],
                    countryToFind: nextCountry,
                    streak: state.currentGuessErrors > 0 ? 1 : state.streak + 1,
                    score: state.score + 1,
                    currentGuessErrors: 0,
                });
            }
        } else if (state.currentGuessErrors >= 2) {
            const newCountryList: string[] = state.countriesToFind.filter(v => v !== country || v !== state.countryToFind);
            const nextCountry: string = getNextCountry(newCountryList);

            setState({
                ...state,
                countriesToFind: newCountryList.filter(v => v !== nextCountry),
                selectedCountry: country,
                errors: state.errors + 1,
                countriesFound: [state.countryToFind, ...state.countriesFound],
                countryToFind: nextCountry,
                streak: 0,
                currentGuessErrors: 0,
            });
        } else {
            setState({
                ...state,
                selectedCountry: country,
                errors: state.errors + 1,
                streak: 0,
                currentGuessErrors: state.currentGuessErrors + 1,
            });
        }
    };

    return (
        <>
            <MenuButton resetGame={resetGame}
                        changeDifficulty={changeDifficulty}
                        difficulty={state.difficulty}/>
            <ScoreBoard countryToFind={state.countryToFind}
                        score={state.score}
                        errors={state.errors}
                        streak={state.streak}/>
            <Map updateSelectedCountry={updateSelectedCountry}
                 countriesFound={state.countriesFound}
                 countryToFind={state.countryToFind}
                 selectedCountry={state.selectedCountry}/>
            <div className="App"/>
        </>
    );
}

export default App;
