import {FC, useState} from 'react';
import countries from './custom.geo.json';
import ScoreContainer from "./score/ScoreContainer";
import Map from "./map/Map";
import './App.css';
import MenuButton from "./modal/MenuButton";

// https://github.com/ivan-ha/d3-hk-map/blob/development/map.js
// https://bl.ocks.org/HarryStevens/75b3eb474527c10055618fa00123ba44
// https://bl.ocks.org/HarryStevens/raw/75b3eb474527c10055618fa00123ba44/?raw=true

type AppState = {
    countryToFind: string;
    selectedCountry: string;
    countriesFound: string[];
    score: number;
    errors: number;
    currentGuessErrors: number;
    streak: number;
};

const App: FC = () => {

    const audio = new Audio("/click.mp3")

    const getNextCountry = () => {
        const nextIndex = Math.floor(Math.random() * countryList.length);
        return countryList[nextIndex];
    }

    const countryList = countries.features.map(feature => feature.properties.name_long);

    const [state, setState] = useState<AppState>({
        countryToFind: getNextCountry(),
        selectedCountry: '',
        countriesFound: [],
        score: 0,
        errors: 0,
        currentGuessErrors: 0,
        streak: 0
    });

    const resetGame = () => {
        setState({
            countryToFind: getNextCountry(),
            selectedCountry: '',
            countriesFound: [],
            score: 0,
            errors: 0,
            currentGuessErrors: 0,
            streak: 0,
        });
    };

    const updateSelectedCountry = (country: string) => {
        audio.play();
        if (country === state.countryToFind) {
            const nextCountry: string = getNextCountry();
            setState({
                ...state,
                selectedCountry: country,
                countriesFound: [country, ...state.countriesFound],
                countryToFind: nextCountry,
                streak: state.currentGuessErrors > 0 ? 1 : state.streak + 1,
                score: state.score + 1,
                currentGuessErrors: 0
            });
        } else if (state.currentGuessErrors >= 2) {
            const nextCountry: string = getNextCountry();
            setState({
                ...state,
                selectedCountry: country,
                errors: state.errors + 1,
                countriesFound: [country, ...state.countriesFound],
                countryToFind: nextCountry,
                streak: 0,
                currentGuessErrors: 0
            });
        } else {
            setState({
                ...state,
                selectedCountry: country,
                errors: state.errors + 1,
                streak: 0,
                currentGuessErrors: state.currentGuessErrors + 1
            });
        }
    };

    return (
        <>
            <MenuButton/>
            <ScoreContainer countryToFind={state.countryToFind}
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
