 import {Flip } from 'react-toastify';
 
 export function notifyUser(message, notificationFunction) {
    notificationFunction(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Flip,
    });
  }

export default {notifyUser}