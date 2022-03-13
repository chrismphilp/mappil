import {FC, useEffect, useState} from "react";
import {geoMercator, geoPath, select, zoom} from "d3";
import {MapDetails} from "./Map.data";

const WIDTH: number = 1200;
const HEIGHT: number = 500;

type ScoreContainerProps = {
    geoJsonData: any;
    mapDetails: MapDetails;
    updateSelectedCountry: (country: string) => void;
    countryToFind: string | undefined;
    selectedCountry: undefined | string;
    countriesFound: string[];
};

const Map: FC<ScoreContainerProps> = (
    {
        geoJsonData,
        mapDetails,
        updateSelectedCountry,
        countryToFind,
        selectedCountry,
        countriesFound
    }) => {

    const [isDesktop, setIsDesktop] = useState(false);

    const handleResize = () => {
        setIsDesktop(window.innerWidth < 720);
    }

    const mouseDownHandler = (_: any, {properties: {name_long}}: any) => {
        updateSelectedCountry(name_long);
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
        window.addEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const projection = geoMercator()
            .center(mapDetails.center)
            .scale(mapDetails.scale)
            .translate([WIDTH / 2, HEIGHT / 2]);

        const geoGenerator = geoPath().projection(projection);

        select("#map").remove();

        const svg = select(".App")
            .append("svg")
            .attr("id", "map")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, WIDTH, HEIGHT]);

        const handleZoom = ({transform}: any) => {
            g.attr('transform', transform);
        }

        const zooms = zoom()
            .scaleExtent( isDesktop ? mapDetails.scaleExtent : mapDetails.mobileScaleExtent)
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .on("zoom", handleZoom);

        const g = svg.call(zooms as any).append("g");

        g.attr("fill", "green")
            .selectAll('path')
            .data(geoJsonData.features)
            .join('path')
            .attr('d', geoGenerator as any)
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.1)
            .on("mousedown", mouseDownHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler);
    }, [geoJsonData]);

    useEffect(() => {
        select('g')
            .selectAll('path')
            .on("mousedown", mouseDownHandler)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler)
            .attr("fill", "green")
            .filter(({properties: {name_long}}: any) => countriesFound.includes(name_long))
            .attr("fill", "orange")
            .attr("stroke", "black");
    }, [countryToFind, selectedCountry, countriesFound]);

    return (
        <></>
    );
}

export default Map;
