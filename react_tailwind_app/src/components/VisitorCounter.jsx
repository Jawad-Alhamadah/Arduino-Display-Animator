import React, { useEffect } from 'react';
import axios from 'axios';

function VisitorCounter (){
  useEffect(() => {
    const VISITOR_KEY = 'hasVisited';
    if (!localStorage.getItem(VISITOR_KEY)) {
      const endpoint = 'https://66e8028eb17821a9d9daf072.mockapi.io/visitors/1';

      // Step 1: Get current visitor count
      axios.get(endpoint)
        .then((res) => {
          const currentCount = res.data.numOfVisitors || 0;

          // Step 2: Update count
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

  return null; // or some message like <p>Thanks for visiting!</p>
};

export default VisitorCounter;