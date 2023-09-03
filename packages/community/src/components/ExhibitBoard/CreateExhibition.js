import React from 'react';
import BoardService from 'services/BoardService.ts';
import DatePicker from 'react-datepicker';

const TAG = 'CREATE_EXHIBITION';

class CreateExhibition extends React.Component {

  constructor(props) {
    console.log('[%s] constructor', TAG);
    super(props);

    this.state = {
      title: '',
      text: '',
      exhibition_no: '',
      slogan: '',
      date_start: '',
      date_end: '',
      place: '',
      poster: null
    };
  }

  componentDidMount() {
    document.body.classList.add('enif-overflow-hidden');
  }

  componentWillUnmount() {
    document.body.classList.remove('enif-overflow-hidden');
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  submit = async () => {
    console.log('[%s] createAlbum', TAG);
    const { title, text, exhibition_no, slogan, date_start, date_end, place, poster } = this.state;
    const { fetch, close, board_id } = this.props;

    if (!exhibition_no || !slogan || !date_start || !date_end || !place || !poster) {
      alert('모든 항목을 입력해주세요.');
    }
    else {
      const data = new FormData();
      data.append('title', title);
      data.append('text', text);
      data.append('exhibition_no', exhibition_no);
      data.append('slogan', slogan);
      data.append('date_start', date_start);
      data.append('date_end', date_end);
      data.append('place', place);
      data.append('poster', poster);

      await BoardService.createExhibition(board_id, data)
        .then(() => {
          close();
          fetch();
        })
        .catch((err) => {
          console.error(err);
          alert('사진전 생성 실패');
        });
    }
  };

  handleDateStart = (date) => {
    this.setState({
      date_start: date
    });
  };

  handleDateEnd = (date) => {
    this.setState({
      date_end: date
    });
  };

  uploadPoster = (e) => {
    if (e.target.files[0]) {
      this.setState({
        poster: e.target.files[0]
      });
    }
    else {
      this.setState({
        poster: null
      });
    }
  };

  render() {
    console.log('[%s] render', TAG);

    const { handleChange, submit, handleDateStart, handleDateEnd, uploadPoster } = this;
    const { text, exhibition_no, slogan, date_start, date_end, place } = this.state;
    const { close } = this.props;
    return (
      <div className="enif-popup">
        <div className="crt-exhibition-wrapper">
          <h3>사진전 생성</h3>
          <div className="crt-exhibition-input-wrapper">
            <div className="crt-exhibition-input-unit">
              <label>회차</label>
              <input type="number" name="exhibition_no" onChange={handleChange} value={exhibition_no} />
            </div>
            <div className="crt-exhibition-input-unit">
              <label>슬로건</label>
              <input type="text" name="slogan" onChange={handleChange} value={slogan} />
            </div>
            <div className="crt-exhibition-input-unit">
              <label>기간</label>
              <DatePicker selected={date_start} onChange={handleDateStart} dateFormat="yyyy/MM/dd" />
              <p>~</p>
              <DatePicker selected={date_end} onChange={handleDateEnd} dateFormat="yyyy/MM/dd" />
            </div>
            <div className="crt-exhibition-input-unit">
              <label>장소</label>
              <input type="text" name="place" onChange={handleChange} value={place} />
            </div>
            <div className="crt-exhibition-input-unit">
              <label>포스터</label>
              <input type="file" name="poster" accept="image/*" onChange={uploadPoster} />
            </div>
            <div className="crt-exhibition-input-unit">
              <label>추가설명</label>
              <textarea name="text" onChange={handleChange} value={text} />
            </div>
          </div>
          <div>
            <button className="enif-btn-common enif-btn-ok" onClick={submit}>OK</button>
            <button className="enif-btn-common enif-btn-cancel" onClick={close} >CANCEL</button>
          </div>
        </div>
      </div>

    );
  }
}

export default CreateExhibition;
