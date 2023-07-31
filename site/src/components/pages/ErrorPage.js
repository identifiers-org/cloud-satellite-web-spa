import React from 'react';
import { Link, useAsyncError, useRouteError } from 'react-router-dom';
import Cookies from 'js-cookie'
// import { useMatomo } from '@datapunt/matomo-tracker-react';


const ErrorPage = ({defaultMessage}) => {
  // const { trackPageView } = useMatomo()
  // trackPageView(); // Will result in duplicated measurements if Spring renders this in failed resolution.

  let title = Cookies.get('title');
  if (title === undefined) {
    title = "An error has happened";
  } else {
    title = title.replaceAll("+", " ");
    Cookies.remove('title');
  }

  let message = Cookies.get('message');
  if (message === undefined) {
    const err = useAsyncError();
    if (!err) message = defaultMessage || "Perhaps you are using an invalid URL";
    else if (typeof err == "string") message = err;
    else message = err.message;
  } else {
    message = message.replaceAll("+", " ");
    Cookies.remove('message');
  }

  // window.history.replaceState({}, '', location.pathname)

  return (
    <div>
      <h1><i className="icon icon-common icon-bomb"></i> {title}</h1>
      { message.split("; ").map( (s, i) => <p key={i}> {s} </p> ) }
      <p><Link to="/">Go home</Link></p>
    </div>
  )
};

export default ErrorPage;
