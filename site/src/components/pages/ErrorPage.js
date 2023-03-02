import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import Cookies from 'js-cookie'
import { useMatomo } from '@datapunt/matomo-tracker-react';


const ErrorPage = () => {
  const { trackPageView } = useMatomo()
  trackPageView();

  let title = Cookies.get('title');
  if (title === undefined) {
    title = "An error has happened";
  } else {
    title = title.replaceAll("+", " ");
    Cookies.remove('title');
  }

  let message = Cookies.get('message');
  if (message === undefined) {
    message = "Perhaps you are using an invalid URL";
  } else {
    message = message.replaceAll("+", " ");
    Cookies.remove('message');
  }

  window.history.replaceState({}, '', location.pathname)

  return (
    <div>
      <h1><i className="icon icon-common icon-bomb"></i> {title}</h1>
      { message.split("; ").map( (s) => <p> {s} </p> ) }
      <p><Link to="/">Go home</Link></p>
    </div>
  )
};

export default ErrorPage;
