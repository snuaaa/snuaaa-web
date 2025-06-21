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

    return (
      <div className="flex flex-col gap-1 p-2">
        <form.AppField
          key={`list[${editingIdx}].title`}
          name={`list[${editingIdx}].title`}
          children={(field) => (
            <field.Input type="text" name="title" placeholder="제목" />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].text`}
          name={`list[${editingIdx}].text`}
          children={(field) => (
            <textarea
              className="w-full h-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="설명"
              name="text"
              onChange={(e) => field.handleChange(e.target.value)}
              value={field.state.value}
            />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].date`}
          name={`list[${editingIdx}].date`}
          children={(field) => (
            <field.Input
              placeholder="촬영 날짜"
              iconClassName="ri-calendar-2-line"
              type="date"
              name="date"
            />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].location`}
          name={`list[${editingIdx}].location`}
          children={(field) => (
            <field.Input
              placeholder="장소"
              iconClassName="ri-map-pin-line"
              type="text"
              name="location"
            />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].camera`}
          name={`list[${editingIdx}].camera`}
          children={(field) => (
            <field.Input
              placeholder="카메라"
              iconClassName="ri-camera-line"
              type="text"
              name="camera"
            />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].lens`}
          name={`list[${editingIdx}].lens`}
          children={(field) => (
            <field.Input
              placeholder="렌즈"
              iconClassName="ri-camera-lens-line"
              type="text"
              name="lens"
            />
          )}
        />

        <form.AppField
          key={`list[${editingIdx}].focal_length`}
          name={`list[${editingIdx}].focal_length`}
          children={(field) => (
            <field.Input
              placeholder="초점거리"
              type="text"
              name="focal_length"
              Adornment={<span className="flex items-center">mm</span>}
            />
          )}
        />

        <form.AppField
          key={`list[${editingIdx}].f_stop`}
          name={`list[${editingIdx}].f_stop`}
          children={(field) => (
            <field.Input placeholder="F값" type="text" name="f_stop" />
          )}
        />

        <form.AppField
          key={`list[${editingIdx}].exposure_time`}
          name={`list[${editingIdx}].exposure_time`}
          children={(field) => (
            <field.Input
              placeholder="노출 시간"
              type="text"
              name="exposure_time"
            />
          )}
        />
        <form.AppField
          key={`list[${editingIdx}].iso`}
          name={`list[${editingIdx}].iso`}
          children={(field) => (
            <field.Input placeholder="ISO" type="text" name="iso" />
          )}
        />
      </div>
    );
  },
});

export default PhotoInfoForm;
