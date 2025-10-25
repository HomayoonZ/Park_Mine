import react from 'react';
import reactDom from 'react-dom/client';
import "@fontsource/vazir";

import GeoProject from './GeoProject';

const root= reactDom.createRoot(document.getElementById("root"));
root.render(
     <react.StrictMode>
        <GeoProject/>
    </react.StrictMode>
)

