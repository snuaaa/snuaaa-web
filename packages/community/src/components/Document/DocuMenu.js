import React from 'react';

const TAG = 'DOCUMENU';

class DocuMenu extends React.Component {

  constructor(props) {
    super(props);
    this.generationList = React.createRef();
    this.genFlowIndex = 0;
  }
 
  createGeneration = () => {
    let currentGen = 2 * ((new Date()).getFullYear() - 1980);
    if((new Date()).getMonth() > 5) currentGen++;
    let genList = [];
    for(let i = currentGen; i > 0; i--){
      genList.push(<li key={i} onClick={() => this.props.retrieveDocumentsByGeneration(i)}>{i}대</li>);
    }
    return genList;
  };

  leftHandler = () => {
    if(this.genFlowIndex < 0) {
      this.genFlowIndex += this.generationList.current.clientWidth;
      this.generationList.current.style.transform = `translateX(${this.genFlowIndex}px)`;
    }
  };

  rightHandler = () => {
    if(this.genFlowIndex >= -3000) {
      this.genFlowIndex -= this.generationList.current.clientWidth;
      this.generationList.current.style.transform = `translateX(${this.genFlowIndex}px)`;    
    }
  };


  render() {
    console.log('[%s] render', TAG);
    return (
      <div className="documenu-wrapper">
        <div className="doc-gen-list-handler" onClick={this.leftHandler}>&lt;&lt;</div>
        <div className="doc-gen-list-wrapper">
          <ul className="doc-gen-list" ref={this.generationList}>
            {this.createGeneration()}
          </ul>
        </div>
        <div className="doc-gen-list-handler" onClick={this.rightHandler}>&gt;&gt;</div>
      </div>
    ); 
  }
}

export default DocuMenu;