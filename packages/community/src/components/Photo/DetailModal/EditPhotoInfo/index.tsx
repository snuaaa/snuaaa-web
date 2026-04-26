// import { Prompt } from 'react-router';
import { Photo, Tag } from '~/services/types';
import { UpdatePhotoRequest } from '~/services/PhotoService';
import { formOptions, useStore } from '@tanstack/react-form';
import { useAppForm } from '~/components/Form';
import EditTagList from './EditTagList';
import { FormEvent, useCallback } from 'react';
import { useUpdatePhoto } from '~/hooks/queries/usePhotoQueries';
import { format } from 'date-fns';

type PhotoInfoProps = {
  photoInfo: Photo;
  boardTagInfo: Tag[];
  onCancel: () => void;
  onUpdate: () => void;
};

const EditPhotoInfo = ({
  photoInfo,
  boardTagInfo,
  onCancel,
  onUpdate,
}: PhotoInfoProps) => {
  const { content_id, title, text, tags, photo } = photoInfo;
  const {
    date,
    location,
    camera,
    lens,
    focal_length,
    f_stop,
    exposure_time,
    iso,
  } = photo;

  const { mutateAsync: mutateAsyncUpdatePhoto } = useUpdatePhoto(content_id);

  const formattedDate = date ? format(new Date(date), 'yyyy-MM-dd') : undefined;

  const formOpts = formOptions({
    defaultValues: {
      content_id,
      title,
      text,
      tags: tags?.map(({ tag_id }) => tag_id) ?? [],
      photo: {
        date: formattedDate,
        location,
        camera,
        lens,
        focal_length,
        f_stop,
        exposure_time,
        iso,
      },
    } as UpdatePhotoRequest,
  });

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      try {
        await mutateAsyncUpdatePhoto(value);
        onUpdate();
      } catch (err) {
        console.error(err);
        alert('업데이트 실패');
      }
    },
  });

  const selectedTags = useStore(form.store, (state) =>
    state.values.tags.map((tagId: string) => tagId),
  );

  const handleChangeTag = useCallback(
    (tagId: string) => {
      const tags = form.getFieldValue('tags') ?? [];

      const nextSelectedTags = tags.includes(tagId)
        ? tags.filter((selectedTag) => selectedTag !== tagId)
        : [...tags, tagId];
      form.setFieldValue('tags', nextSelectedTags);
    },
    [form],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <>
      {/* <Prompt
        when={true}
        message="작성 중인 내용은 저장되지 않습니다. 작성을 취소하시겠습니까?"
      ></Prompt> */}
      <form.AppForm>
        <form
          className="flex flex-col h-full overflow-auto"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2 h-full px-2 pb-2">
            <EditTagList
              boardTagInfo={boardTagInfo}
              selectedTags={selectedTags}
              onChangeTag={handleChangeTag}
            />
            <form.AppField
              key={`title`}
              name={`title`}
              children={(field) => (
                <field.Input type="text" name="title" placeholder="제목" />
              )}
            />

            <form.AppField
              key="text"
              name="text"
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
              key="date"
              name="photo.date"
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
              key="location"
              name="photo.location"
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
              key="camera"
              name="photo.camera"
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
              key="lens"
              name="photo.lens"
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
              key="focal_length`"
              name="photo.focal_length"
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
              key="f_stop"
              name="photo.f_stop"
              children={(field) => (
                <field.Input placeholder="F값" type="text" name="f_stop" />
              )}
            />

            <form.AppField
              key="exposure_time"
              name="photo.exposure_time"
              children={(field) => (
                <field.Input
                  placeholder="노출 시간"
                  type="text"
                  name="exposure_time"
                />
              )}
            />
            <form.AppField
              key="iso"
              name="photo.iso"
              children={(field) => (
                <field.Input placeholder="ISO" type="text" name="iso" />
              )}
            />
          </div>
          <div className="mt-auto flex">
            <button
              className="h-12 text-base font-bold grow text-[#1d1d1d] bg-[#F1F1F1] hover:bg-[#E0E0E0] "
              onClick={onCancel}
            >
              취소
            </button>
            <button
              className="h-12 text-base font-bold grow text-white bg-[#7193C4] hover:bg-[#7193C4]"
              disabled={form.state.isSubmitting}
              type="submit"
            >
              수정완료
            </button>
          </div>
        </form>
      </form.AppForm>
    </>
  );
};

export default EditPhotoInfo;
