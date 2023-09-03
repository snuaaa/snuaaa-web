import React, { useState, useEffect } from 'react';

type AaaHistoryType = {
    'year': number;
    'occasion': {
        'date': string;
        'desc': string;
    }[]
}[]

function AaaHistory() {

  //TODO : User who is admin can be edit data.
  //TODO : convert to database from json

  const [aaaHistory, setAaaHistory] = useState<AaaHistoryType>([]);
  useEffect(() => {
    import('./history_tmp.json')
      .then((history) => {
        setAaaHistory(history.default);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);


  function makeHistoryList() {

    if (aaaHistory && aaaHistory.length > 0) {
      return aaaHistory.map((his) => {
        const occasions = his.occasion;
        const occasionList = occasions.map((occ, idx) => {
          return (
            <div key={idx}>
              <h5>{occ.date}</h5>
              <p>{occ.desc}</p>
            </div>
          );
        });
        return (
          <div className="intro-history-unit" key={his.year}>
            <div className="unit-half">
              <div className="mark-year"></div>
              <h4>{his.year}년</h4>
              {occasionList}
            </div>
          </div>
        );
      });
    }
  }

  return (
    <div className="intro-div-wrapper" id="history">
      <div id="intro-top"></div>
      <h3>동아리 발자취</h3>
      <div className="intro-history-wrapper">
        <div className="intro-line"></div>
        {makeHistoryList()}
      </div>
    </div>
  );
}

export default AaaHistory;