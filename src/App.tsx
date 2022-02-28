import {FC, useEffect, useState} from 'react';
import {geoMercator, geoPath, select, zoom} from 'd3';
import countries from './custom.geo.json';
import ScoreContainer from "./score/ScoreContainer";
import './App.css';

const width = 1200;
const height = 500;

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
    const [selectedCounty, setSelectedCountry] = useState<string>();
    const [score, setScore] = useState<number>(0);
    const [errors, setErrors] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);

    useEffect(() => {
        const projection = geoMercator()
            .center([14.1095, 45])
            .scale(155)
            .translate([width / 2, height / 2]);

        const geoGenerator = geoPath().projection(projection);

        const handleZoom = ({transform}: any) => {
            g.attr('transform', transform);
        }

        const svg = select(".App")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, width, height]);

        const zooms = zoom()
            .scaleExtent([0.75, 7])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", handleZoom);

        const g = svg.call(zooms as any).append("g");

        const mouseDownHandler = (d: any, i: any) => {
            const country = i.properties.name_long;
            if (countryToFind === country) {
                setCountryToFind(getNextCountry());
            }
            setSelectedCountry(country);
        }

        const mouseOverHandler = (d: any, i: any) => {
            select(d.target).attr("fill", 'red');
        }

        const mouseOutHandler = (d: any, i: any) => {
            select(d.target).attr("fill", 'green');
        }

        g.attr("fill", "green")
            .selectAll('path')
            .data(countries.features)
            .join('path')
            .attr('d', geoGenerator as any)
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.1)
            .on("mousedown", mouseDownHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler);
    }, []);

    return (
        <>
            <ScoreContainer countryToFind={countryToFind} score={score} errors={errors} streak={streak}/>
            <div className="App"/>
        </>
    );
}

export default App;
