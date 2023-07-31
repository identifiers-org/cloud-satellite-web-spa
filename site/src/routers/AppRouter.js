import React from 'react';
import { createBrowserRouter, defer, Outlet, RouterProvider } from 'react-router-dom';

import HomePage from '../components/pages/HomePage';
// import NotFoundPage from '../components/pages/NotFoundPage';
import ResolvePage from '../components/pages/ResolvePage';
import ErrorPage from "../components/pages/ErrorPage";
import ProtectedLandingPage from "../components/pages/ProtectedLandingPage";
import DeactivatedLandingPage from "../components/pages/DeactivatedLanding";
import { config } from "../config/Config";
import AppLayout from "./AppRouterLayout";


const cidLoader = ({ params }) => {
  const cid = params["*"]
  if (!cid) return defer({resolverData: Promise.reject("Compact identifier is empty")});

  const resolverQueryUrl = new URL("/" + cid, config.resolverApi);
  const res = fetch(resolverQueryUrl).then(res => {
    if (!res.ok) return Promise.reject(`Resolution failed for ${cid}`);
    else return res.json();
  })

  return defer({resolverData: res});
}

const routes = [
  {
    //AppLayout is needed to make sure Header is inside router for the nav elements
    element: <AppLayout />,
    children: [
      {
        //Outlet element is needed to make everyone share the same error element
        element: <Outlet/>,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <HomePage/>
          }, {
            path: "/resolve",
            element: <ResolvePage/>
          }, {
            path: "/protectedLanding/*",
            element: <ProtectedLandingPage/>,
            loader: cidLoader
          }, {
            path: "/deactivatedLanding/*",
            element: <DeactivatedLandingPage />,
            loader: cidLoader
          }, {
            path: "*",
            element: <ErrorPage />
          }
        ]
      }
    ]
  }
]

const router = createBrowserRouter(routes);
export default () => <RouterProvider router={router} />;
