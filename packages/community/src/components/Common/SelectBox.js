const SelectBox = ({ selectName, optionList, onSelect, selectedOption }) => {
  const makeSelectList = () => {
    if (optionList) {
      return optionList.map((option, i) => {
        return (
          <option value={option.id} key={i}>
            {option.name}
          </option>
        );
      });
    }
  };

  return (
    <div className="mx-1 border border-solid">
      <select
        className="p-1.5"
        name={selectName}
        onChange={onSelect}
        value={selectedOption}
      >
        <option value="">All</option>
        {makeSelectList()}
      </select>
    </div>
  );
};

export default SelectBox;
