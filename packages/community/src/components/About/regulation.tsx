import React from 'react';
import regulation from './regulation_tmp.json';
import { breakLine } from '../../utils/breakLine';

type clause = {
    clause_no: number;
    text: string;
}

type article = {
    article_no: number;
    article_title: string;
    clauses?: clause[];
    article_text?: string;
}

function Regulation() {

  //TODO : User who is admin can be edit data.
  //TODO : convert to database from json
  function makeClauseNumber(index: number) {
    switch (index) {
    case 1:
      return '①';
    case 2:
      return '②';
    case 3:
      return '③';
    case 4:
      return '④';
    case 5:
      return '⑤';
    case 6:
      return '⑥';
    case 7:
      return '⑦';
    case 8:
      return '⑧';
    case 9:
      return '⑨';
    default:
      return;
    }
  }

  function makeClauseList(clauses: clause[]) {
    if (clauses && clauses.length > 0) {
      return clauses.map((clause: clause, idx: number) => {
        return (
          <div className="clause-wrapper" key={idx}>
            <h4>{makeClauseNumber(clause.clause_no)}</h4>
            <p>{breakLine(clause.text)}</p>
          </div>
        );
      });
    }
  }

  function makeArticleList(articles: article[]) {
    if (articles && articles.length > 0) {
      return articles.map((article: article, idx: number) => {
        return (
          <div className="article-wrapper" key={idx}>
            <h3>제{article.article_no}조({article.article_title})</h3>
            {
              article.clauses && makeClauseList(article.clauses)
            }
            <h5>{breakLine(article.article_text)}</h5>
          </div>
        );
      });
    }
  }

  function makeRegulationList() {
    return regulation.map((chapter) => {
      return (
        <div className="chapter-wrapper" key={`ch${chapter.chapter_no}`}>
          {
            chapter.chapter_no ?
              <h2>제{chapter.chapter_no}장 {chapter.chapter_title}</h2>
              :
              <h2>{chapter.chapter_title}</h2>
          }
          {
            chapter.articles &&
                        makeArticleList(chapter.articles)
          }
        </div>
      );
    });
  }

  return (

    <div className="intro-div-wrapper">
      <h3>서울대학교 아마추어 천문회 회칙</h3>
      <div className="intro-content regulation">
        {makeRegulationList()}
      </div>
    </div>
  );
}

export default Regulation;
