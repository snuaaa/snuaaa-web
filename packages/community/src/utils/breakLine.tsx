import React from 'react';

export function breakLine(data?: string) {
  if(data) {
    return data.split('\n').map((line, index) => {
      return (<span className="break-line" key={index}>{line} <br/></span>);
    });
  }
}
