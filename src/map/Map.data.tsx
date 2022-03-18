import {MapType} from "./MapType.enum";

export type MapDetails = {
    scale: number;
    scaleExtent: [number, number];
    mobileScaleExtent: [number, number];
    center: [number, number];
};

type MapDataType = {
    [mapType in MapType]: MapDetails;
};

const MapData: MapDataType = {
    [MapType.MODERN_WORLD_COUNTRIES]: {
        scale: 155,
        scaleExtent: [0.75, 7],
        mobileScaleExtent: [0.75, 25],
        center: [15, 45],
    },
    [MapType.US_STATES]: {
        scale: 475,
        scaleExtent: [0.75, 7],
        mobileScaleExtent: [0.75, 25],
        center: [-125, 50],
    },
    [MapType.UK_ADMINISTRATIVE_REGIONS]: {
        scale: 1955,
        scaleExtent: [0.75, 7],
        mobileScaleExtent: [0.75, 25],
        center: [-5, 55.5],
    }
};

export {
    MapData
}
