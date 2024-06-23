import { ChangeEvent, FC, useCallback, useState } from 'react';
import ExhibitionService, {
  CreateExhibitionRequest,
} from 'services/ExhibitionService';
import DatePicker from 'react-datepicker';
import useBlockBackgroundScroll from 'hooks/useBlockBackgroundScroll';

type Props = {
  boardId: string;
  onClose: () => void;
  onCreate: () => void;
};

export const CreateExhibition: FC<Props> = ({ boardId, onClose, onCreate }) => {
  useBlockBackgroundScroll();

  const [data, setData] = useState<Partial<CreateExhibitionRequest>>({});

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    },
    [data],
  );

  const submit = useCallback(async () => {
    const { text, exhibition_no, slogan, date_start, date_end, place, poster } =
      data;

    if (
      !text ||
      !exhibition_no ||
      !slogan ||
      !date_start ||
      !date_end ||
      !place ||
      !poster
    ) {
      alert('모든 항목을 입력해주세요.');
    } else {
      try {
        await ExhibitionService.createExhibition(boardId, {
          title: '',
          text,
          exhibition_no,
          slogan,
          date_start,
          date_end,
          place,
          poster,
        });
        onCreate();
      } catch (err) {
        console.error(err);
        alert('사진전 생성 실패');
      }
    }
  }, [boardId, data, onCreate]);

  const handleDateStart = (date: Date) => {
    setData({
      ...data,
      date_start: date,
    });
  };

  const handleDateEnd = (date: Date) => {
    setData({
      ...data,
      date_end: date,
    });
  };

  const uploadPoster = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setData({
        ...data,
        poster: e.target.files[0],
      });
    } else {
      setData({
        poster: undefined,
      });
    }
  };

  return (
    <div className="enif-popup">
      <div className="crt-exhibition-wrapper">
        <h3>사진전 생성</h3>
        <div className="crt-exhibition-input-wrapper">
          <div className="crt-exhibition-input-unit">
            <label>회차</label>
            <input
              type="number"
              name="exhibition_no"
              onChange={handleChange}
              value={data.exhibition_no}
            />
          </div>
          <div className="crt-exhibition-input-unit">
            <label>슬로건</label>
            <input
              type="text"
              name="slogan"
              onChange={handleChange}
              value={data.slogan}
            />
          </div>
          <div className="crt-exhibition-input-unit">
            <label>기간</label>
            <DatePicker
              selected={data.date_start}
              onChange={handleDateStart}
              dateFormat="yyyy/MM/dd"
            />
            <p>~</p>
            <DatePicker
              selected={data.date_end}
              onChange={handleDateEnd}
              dateFormat="yyyy/MM/dd"
            />
          </div>
          <div className="crt-exhibition-input-unit">
            <label>장소</label>
            <input
              type="text"
              name="place"
              onChange={handleChange}
              value={data.place}
            />
          </div>
          <div className="crt-exhibition-input-unit">
            <label>포스터</label>
            <input
              type="file"
              name="poster"
              accept="image/*"
              onChange={uploadPoster}
            />
          </div>
          <div className="crt-exhibition-input-unit">
            <label>추가설명</label>
            <textarea name="text" onChange={handleChange} value={data.text} />
          </div>
        </div>
        <div>
          <button className="enif-btn-common enif-btn-ok" onClick={submit}>
            OK
          </button>
          <button className="enif-btn-common enif-btn-cancel" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateExhibition;
