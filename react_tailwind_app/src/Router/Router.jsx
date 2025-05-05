import React from 'react'
import * as ReactDOM from "react-dom/client";
import About from '../Pages/About';
import Home from '../Pages/Home';

import Max7219ICPage from '../components/Max7219ICPage.jsx';
import OledPage from "../components/OledPage.jsx"
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
        path:"/Oled128x64",
        element: <OledPage/>

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