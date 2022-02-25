import React, {useEffect, useState} from 'react';
import {geoMercator, geoPath, select, zoom} from 'd3';
import countries from './custom.geo.json';
import './App.css';
import MenuModal from "./modal/MenuModal";

const width = 1200;
const height = 500;

const App = () => {

    const getNextCountry = () => {
        const nextIndex = Math.floor(Math.random() * countryList.length);
        return countryList[nextIndex];
    }

    const countryList = countries.features.map(feature => feature.properties.name_long);
    const [countryToFind, setCountryToFind] = useState<string>(getNextCountry());
    const [selectedCounty, setSelectedCountry] = useState<string>();

    const mouseDownHandler = (d: any, i: any) => {
        const country = i.properties.name_long;
        console.log(countryToFind, country);
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

    useEffect(() => {
        const projection = geoMercator()
            .center([114.1095, 45])
            .scale(95)
            .translate([width / 2, height / 2]);

        const geoGenerator = geoPath().projection(projection);


        function handleZoom({transform}: any) {
            g.attr('transform', transform);
        }

        const svg = select(".App")
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

        const g = svg
            .append("g")
            .attr("fill", "green")
            .selectAll('path')
            .data(countries.features)
            .join('path')
            .attr('d', geoGenerator as any)
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mousedown", mouseDownHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler)
            .call(zoom()
                .on('zoom', handleZoom)
                .scaleExtent([1, 8])
                .extent([[0, 0], [width, height]]) as any
            );
    }, []);

    return (
        <>
            <MenuModal/>
            <div className="App"/>
            {countryToFind} - {selectedCounty}
        </>
    );
}

export default App;