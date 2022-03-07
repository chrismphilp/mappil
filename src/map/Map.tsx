import {FC, useEffect} from "react";
import {geoMercator, geoPath, select, zoom} from "d3";
import countries from "../custom.geo.json";

const width = 1200;
const height = 500;

type ScoreContainerProps = {
    updateSelectedCountry: (country: string) => void;
    countryToFind: string;
    selectedCountry: undefined | string;
    countriesFound: string[];
};

const Map: FC<ScoreContainerProps> = ({updateSelectedCountry, countryToFind, selectedCountry, countriesFound}) => {

    const mouseDownHandler = (d: any, i: any) => {
        const country = i.properties.name_long;
        updateSelectedCountry(country);
    };

    const mouseOverHandler = (d: any, {properties: {name_long}}: any) => {
        if (!countriesFound.includes(name_long)) {
            select(d.target).attr("fill", 'orange');
        }
    };

    const mouseOutHandler = (d: any, {properties: {name_long}}: any) => {
        if (!countriesFound.includes(name_long)) {
            select(d.target).attr("fill", 'green');
        }
    };

    useEffect(() => {
        const projection = geoMercator()
            .center([14.1095, 45])
            .scale(155)
            .translate([width / 2, height / 2]);

        const geoGenerator = geoPath().projection(projection);

        const svg = select(".App")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, width, height]);

        const handleZoom = ({transform}: any) => {
            g.attr('transform', transform);
        }

        const zooms = zoom()
            .scaleExtent([0.75, 7])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", handleZoom);

        const g = svg.call(zooms as any).append("g");

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

    useEffect(() => {
        select('g')
            .selectAll('path')
            .on("mousedown", mouseDownHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler)
            .filter(({properties: {name_long}}: any) => countriesFound.includes(name_long))
            .attr("fill", "orange");
    }, [countryToFind, selectedCountry, countriesFound]);

    return (
        <></>
    );
}

export default Map;
