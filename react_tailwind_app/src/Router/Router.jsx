import React, { Suspense, lazy } from 'react'
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ArduinoAnimation from '../components/ArduinoAnimation.jsx';

// Create delayed versions of components to ensure 1-second loading time
const DelayedMax7219ICPage = lazy(() => 
    Promise.all([
        import('../components/Max7219Page.jsx'),
        new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(([moduleExports]) => moduleExports)
);

const DelayedOledPage = lazy(() => 
    Promise.all([
        import('../components/OledPage.jsx'),
        new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(([moduleExports]) => moduleExports)
);

const DelayedUnderConstruction = lazy(() => 
    Promise.all([
        import('../components/UnderConstruction.jsx'),
        new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(([moduleExports]) => moduleExports)
);

// Use ArduinoAnimation as the loading spinner
const LoadingSpinner = ArduinoAnimation;

const LazyRoute = ({ Component }) => (
    <Suspense fallback={<LoadingSpinner />}>
        <Component />
    </Suspense>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <LazyRoute Component={DelayedMax7219ICPage} />
    },
    {
        path: "/max",
        element: <LazyRoute Component={DelayedMax7219ICPage} />
    },
    {
        path: "/oled",
        element: <LazyRoute Component={DelayedOledPage} />
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