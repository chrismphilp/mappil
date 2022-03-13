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
    [MapType.WORLD_COUNTRIES]: {
        scale: 155,
        scaleExtent: [0.75, 7],
        mobileScaleExtent: [0.75, 25],
        center: [14.1095, 45],
    },
    [MapType.UK_ADMINISTRATIVE_REGIONS]: {
        scale: 1955,
        scaleExtent: [0.75, 7],
        mobileScaleExtent: [0.75, 25],
        center: [-5, 55],
    }
};

export {
    MapData
}
