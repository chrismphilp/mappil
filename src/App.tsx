import {FC, useState} from 'react';
import countries from './custom.geo.json';
import ScoreContainer from "./score/ScoreContainer";
import Map from "./map/Map";
import './App.css';

// https://github.com/ivan-ha/d3-hk-map/blob/development/map.js
// https://bl.ocks.org/HarryStevens/75b3eb474527c10055618fa00123ba44
// https://bl.ocks.org/HarryStevens/raw/75b3eb474527c10055618fa00123ba44/?raw=true

const App: FC = () => {

    const getNextCountry = () => {
        const nextIndex = Math.floor(Math.random() * countryList.length);
        return countryList[nextIndex];
    }

    const countryList = countries.features.map(feature => feature.properties.name_long);
    const [countryToFind, setCountryToFind] = useState<string>(getNextCountry());
    const [selectedCountry, setSelectedCountry] = useState<string>();
    const [countriesFound, setCountriesFound] = useState<string[]>([]);
    const [score, setScore] = useState<number>(0);
    const [errors, setErrors] = useState<number>(0);
    const [currentGuessErrors, setCurrentGuessErrors] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);

    const updateSelectedCountry = (country: string) => {
        if (country === countryToFind) {
            const nextCountry: string = getNextCountry();
            setCountriesFound([country, ...countriesFound]);
            setCountryToFind(nextCountry);
            setStreak(currentGuessErrors > 0 ? 1 : streak + 1);
            setScore(score + 1);
            setCurrentGuessErrors(0);
        } else if (currentGuessErrors >= 2) {
            setErrors(errors + 1);
            const nextCountry: string = getNextCountry();
            setCountriesFound([countryToFind, ...countriesFound]);
            setCountryToFind(nextCountry);
            setStreak(0);
            setCurrentGuessErrors(0);
        } else {
            setErrors(errors + 1);
            setCurrentGuessErrors(currentGuessErrors + 1);
            setStreak(0);
        }
        setSelectedCountry(country);
    };

    return (
        <>
            <Map updateSelectedCountry={updateSelectedCountry}
                 countriesFound={countriesFound}
                 countryToFind={countryToFind}
                 selectedCountry={selectedCountry}/>
            <ScoreContainer countryToFind={countryToFind} score={score} errors={errors} streak={streak}/>
            <div className="App"/>
        </>
    );
}

export default App;
