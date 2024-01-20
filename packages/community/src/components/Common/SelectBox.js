import React from 'react';

const SelectBox = ({ selectName, optionList, onSelect, selectedOption }) => {

  const makeSelectList = () => {
    if (optionList) {
      return optionList.map((option, i) => {
        return <option value={option.id} key={i}>{option.name}</option>;
      });
    }
  };

  return (
    <div className="select-wrapper">
      <select name={selectName} onChange={onSelect} value={selectedOption} >
        <option value="" >All</option>
        {makeSelectList()}
      </select>
    </div>
  );
};

export default SelectBox;