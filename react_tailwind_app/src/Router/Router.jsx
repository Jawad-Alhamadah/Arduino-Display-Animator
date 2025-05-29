import React from 'react'
import * as ReactDOM from "react-dom/client";

import Max7219ICPage from '../components/Max7219Page.jsx';
import OledPage from "../components/OledPage.jsx"
import UnderConstruction from "../components/UnderConstruction.jsx"
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Max7219ICPage/>
    },
    {
        path: "/max7219",
        element: <Max7219ICPage/>
    },
    {
        path:"/oled",
        element: <UnderConstruction/>

    },
  
]);

function Router() {
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}

export default Router