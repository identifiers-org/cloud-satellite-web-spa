import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

import HomePage from '../components/pages/HomePage';
import NotFoundPage from '../components/pages/NotFoundPage';
import ResolvePage from '../components/pages/ResolvePage';
import ErrorPage from "../components/pages/ErrorPage";

const identifiersLogoImage = new URL('../assets/identifiers_logo.png', import.meta.url);
const ebinavBgImage = new URL('../assets/ebinav_bg.svg', import.meta.url);


const identifiersLogo = (
  <>
    <img src={identifiersLogoImage} className=""/>
    <div className="logo-text">
      <h1>Identifiers.org</h1>
      <p className="logo-subtitle">Resolution service</p>
    </div>
  </>
);


const AppRouter = () => (
  <BrowserRouter>
    <>
      <Header />
      <div className="container mt-5">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resolve" element={<ResolvePage />} />
          <Route path="*" element={<ErrorPage />} />
          {/*<Route path="*" element={<NotFoundPage />} />*/}
        </Routes>
      </div>
      <Footer />
    </>
  </BrowserRouter>
);


export default AppRouter;
