import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formOptionsCreatePhoto, withForm } from '../formContext';

const PhotoInfoForm = withForm({
  ...formOptionsCreatePhoto,
  props: {
    editingIdx: -1,
  },
  render: ({ form, editingIdx }) => {
    if (editingIdx < 0) {
      return <></>;
    }

    const photoInfo = form.getFieldValue(`list[${editingIdx}]`);
    return (
      <div className="photo-input-area-wrapper">
        <form.AppField
          key={`list[${editingIdx}].title`}
          name={`list[${editingIdx}].title`}
          children={(field) => (
            <field.Input
              className="input-title"
              type="text"
              name="title"
              placeholder="제목"
            />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].text`}
          name={`list[${editingIdx}].text`}
          children={(field) => (
            <textarea
              className="input-desc"
              placeholder="설명"
              name="text"
              onChange={(e) => field.handleChange(e.target.value)}
              value={field.state.value}
            />
          )}
        />
        {photoInfo && (
          <div className="photo-infos">
            <div className="photo-info">
              <div className="label-wrapper">
                <label>Date</label>
              </div>
              <form.AppField
                key={`list[${editingIdx}].date`}
                name={`list[${editingIdx}].date`}
                children={(field) => (
                  <DatePicker
                    selected={field.state.value}
                    onChange={(date) => field.handleChange(date as Date)}
                    dateFormat="yyyy/MM/dd"
                  />
                )}
              />
            </div>
            <div className="photo-info">
              <div className="label-wrapper">
                <label>Location</label>
              </div>
              <form.AppField
                key={`list[${editingIdx}].location`}
                name={`list[${editingIdx}].location`}
                children={(field) => (
                  <field.Input className="w-1/2" type="text" name="location" />
                )}
              />
            </div>
            <div className="photo-info">
              <div className="label-wrapper">
                <label>Camera</label>
              </div>
              <form.AppField
                key={`list[${editingIdx}].camera`}
                name={`list[${editingIdx}].camera`}
                children={(field) => (
                  <field.Input className="w-1/2" type="text" name="camera" />
                )}
              />
            </div>
            <div className="photo-info">
              <div className="label-wrapper">
                <label>Lens</label>
              </div>
              <div>
                <form.AppField
                  key={`list[${editingIdx}].lens`}
                  name={`list[${editingIdx}].lens`}
                  children={(field) => <field.Input type="text" name="lens" />}
                />
                <div className="flex flex-row items-center">
                  <label>@</label>
                  <form.AppField
                    key={`list[${editingIdx}].focal_length`}
                    name={`list[${editingIdx}].focal_length`}
                    children={(field) => (
                      <field.Input
                        className="w-1/2"
                        type="text"
                        name="focal_length"
                      />
                    )}
                  />
                  mm
                </div>
              </div>
            </div>
            <div className="photo-info">
              <div className="label-wrapper">Exposure</div>
              <div className="input-wrapper">
                <div>
                  <label>F/</label>
                  <form.AppField
                    key={`list[${editingIdx}].f_stop`}
                    name={`list[${editingIdx}].f_stop`}
                    children={(field) => (
                      <field.Input
                        className="w-1/4"
                        type="text"
                        name="f_stop"
                      />
                    )}
                  />
                </div>
                <div>
                  <label>time</label>
                  <form.AppField
                    key={`list[${editingIdx}].exposure_time`}
                    name={`list[${editingIdx}].exposure_time`}
                    children={(field) => (
                      <field.Input
                        className="w-1/4"
                        type="text"
                        name="exposure_time"
                      />
                    )}
                  />
                </div>
                <div>
                  <label>ISO</label>
                  <form.AppField
                    key={`list[${editingIdx}].iso`}
                    name={`list[${editingIdx}].iso`}
                    children={(field) => (
                      <field.Input className="w-1/4" type="text" name="iso" />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
});

export default PhotoInfoForm;
