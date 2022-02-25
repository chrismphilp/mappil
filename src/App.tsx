import React, {useEffect, useState} from 'react';
import {geoEquirectangular, geoPath, select, zoom} from 'd3';
import countries from './custom.geo.json';
import './App.css';

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

    function mouseOutHandler(d: any, i: any) {
        select(d.target).attr("fill", 'black');
    }

    useEffect(() => {
        const projection = geoEquirectangular();
        const geoGenerator = geoPath().projection(projection);

        select(".App")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .selectAll('path')
            .data(countries.features)
            .join('path')
            .attr('d', geoGenerator as any)
            .attr("stroke", "#FFF")
            .on("mousedown", mouseDownHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler);

    }, []);

    let zooms = zoom()
        .on('zoom', handleZoom)
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])

    function handleZoom(e: any) {
        select('svg')
            .attr('transform', e.transform);
    }

    function initZoom() {
        select('svg')
            .call(zooms as any);
    }

    initZoom();

    return (
        <>
            <div className="App"/>
            {countryToFind} - {selectedCounty}
        </>
    );
}

export default App;
