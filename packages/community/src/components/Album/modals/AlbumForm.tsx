import { ChangeEvent, FC } from 'react';

import { Category } from '~/services/types';

type Props = {
  caption: string;
  // albumInfo: RecordOf<ContentType>
  title: string;
  text: string;
  isPrivate: boolean;
  checkedCategory?: string;
  setIsPrivate: (isPrv: boolean) => void;
  categories?: Category[];
  handleCategory: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  confirmAlbum: () => void;
  cancelAlbum: () => void;
};

const AlbumForm: FC<Props> = (props) => {
  const makeIsPrivate = () => {
    return (
      <div className="select-private-wrapper">
        <div
          className={`select-private-unit ${props.isPrivate ? 'selected' : ''}`}
          onClick={() => props.setIsPrivate(true)}
        >
          <i className="ri-user-fill enif-f-1p2x"></i>개인앨범
        </div>
        <div
          className={`select-private-unit ${props.isPrivate ? '' : 'selected'}`}
          onClick={() => props.setIsPrivate(false)}
        >
          <i className="ri-group-fill enif-f-1p2x"></i>그룹앨범
        </div>
      </div>
    );
  };

  const makeCategoryList = () => {
    if (props.categories && props.categories.length > 0) {
      return props.categories.map((category) => {
        const style = {
          border: `1px solid ${category.category_color}`,
        };
        const style_selected = {
          border: `1px solid ${category.category_color}`,
          backgroundColor: category.category_color,
          color: '#eeeeee',
        };
        return (
          <>
            <input
              type="radio"
              id={category.category_id}
              name="category"
              value={category.category_id}
              checked={props.checkedCategory === category.category_id}
              onChange={props.handleCategory}
            />
            <label
              htmlFor={category.category_id}
              style={
                props.checkedCategory === category.category_id
                  ? style_selected
                  : style
              }
            >
              {category.category_name}
            </label>
          </>
        );
      });
    }
  };

  return (
    <div className="enif-popup">
      <div className="enif-popup-content crt-alb-wrapper">
        <table className="enif-table">
          <caption>{props.caption}</caption>
          <tbody>
            <tr>
              <td colSpan={2}>{makeIsPrivate()}</td>
            </tr>
            {props.categories && props.categories.length > 0 && (
              <tr>
                <th>카테고리</th>
                <td className="categories-wrapper">{makeCategoryList()}</td>
              </tr>
            )}
            <tr>
              <th>제목</th>
              <td className="input-text crt-alb-title">
                <input
                  type="text"
                  name="title"
                  placeholder="앨범 제목"
                  value={props.title}
                  className="border border-solid border-gray-300 rounded-md w-full h-10 px-3 py-2"
                  onChange={props.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>설명</th>
              <td className="crt-alb-contents">
                <textarea
                  name="text"
                  placeholder="앨범 설명"
                  value={props.text}
                  className="border border-solid border-gray-300 rounded-md w-full h-10 px-3 py-2"
                  onChange={props.handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button
          className="enif-btn-common enif-btn-ok"
          onClick={props.confirmAlbum}
        >
          OK
        </button>
        <button
          className="enif-btn-common enif-btn-cancel"
          onClick={props.cancelAlbum}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default AlbumForm;
