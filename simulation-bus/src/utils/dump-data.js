import fs from 'fs';
import path from 'path';

const filePath = '../data/Municipios_de_Cundinamarca_2022.geojson';

const getPolygonByName = (targetName) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const geoJsonData = JSON.parse(data);

        const filteredFeatures = geoJsonData.features.filter(feature => {
            return feature.properties.MpNombre === targetName;
        });

        if (filteredFeatures.length > 0) {
            return filteredFeatures[0].geometry.coordinates;
        } else {
            return 'No features were found with the specified name.';
        }
    } catch (error) {
        throw new Error('Error reading or parsing the file:', error);
    }
};

const targetName = 'Cabrera';
const coordinates = getPolygonByName(filePath, targetName);
console.log(coordinates);
