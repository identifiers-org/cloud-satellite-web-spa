import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

export default () => <>
  <Header />
  <div className="container mt-5">
    <Outlet />
  </div>
  <Footer />
</>


