import React, { useEffect } from 'react';
import axios from 'axios';

function VisitorCounter (){
  useEffect(() => {
    const VISITOR_KEY = 'hasVisited';
    if (!localStorage.getItem(VISITOR_KEY)) {
      const endpoint = 'https://66e8028eb17821a9d9daf072.mockapi.io/visitors/1';

 
      axios.get(endpoint)
        .then((res) => {
          const currentCount = res.data.numOfVisitors || 0;

      
          return axios.put(endpoint, {
            numOfVisitors: currentCount + 1,
          });
        })
        .then(() => {
          localStorage.setItem(VISITOR_KEY, "true");
        })
        .catch((err) => {
          console.error('Error updating visitor count:', err);
        });
    }
  }, []);

  return null; 
};

export default VisitorCounter;