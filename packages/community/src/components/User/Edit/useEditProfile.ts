import { formOptions } from '@tanstack/react-form';
import { useCallback } from 'react';
import { useAppForm } from '~/components/Form';
import UploadService from '~/services/UploadService';
import { useUpdateMyUserInfo } from '~/hooks/queries/useUserQueries';
import { UpdateUserInfoRequest } from '~/services/UserService';

type Props = {
  initialUserInfo: UpdateUserInfoRequest;
  onEditProfile?: () => void;
};

const useEditProfile = ({ initialUserInfo, onEditProfile }: Props) => {
  const formOpts = formOptions({
    defaultValues: initialUserInfo,
    validators: {
      onChange: ({ value }) => {
        return {
          fields: {
            username: new RegExp('^[가-힣]{2,6}$|^[A-Za-z ]{2,20}$').test(
              value.username,
            )
              ? undefined
              : '2-10자의 한글 혹은 영문',
            email: new RegExp(
              '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$',
            ).test(value.email)
              ? undefined
              : '이메일 형식에 맞게 입력해주세요',
            mobile: new RegExp('^[0-9]{1,8}-[0-9]{1,8}-[0-9]{1,8}$').test(
              value.mobile,
            )
              ? undefined
              : '전화번호 형식에 맞게 입력해주세요(xxx-xxxx-xxxx)',
            aaa_no:
              value.aaa_no &&
              !new RegExp(
                '^[0-9]{2}[Aa]{3}-[0-9]{1,3}|[Aa]{3}[0-9]{2}-[0-9]{1,3}$',
              ).test(value.aaa_no)
                ? '가입번호 형식에 맞게 입력해주세요. 동아리 회원이 아닌 경우, 입력하지 않으셔도 됩니다.'
                : undefined,
            col_no:
              value.col_no && !new RegExp('^[0-9]{2}$').test(value.col_no)
                ? '숫자 2자리를 입력해 주세요(ex. 26)'
                : undefined,
          },
        };
      },
    },
  });

  const { mutateAsync: mutateAsyncUpdateMyInfo } = useUpdateMyUserInfo();

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      try {
        await mutateAsyncUpdateMyInfo(value);
        onEditProfile?.();
      } catch (err) {
        console.error(err);
        alert('업데이트 실패');
      }
    },
  });

  const uploadProfileImage = useCallback(
    async (file: File) => {
      const { data } = await UploadService.uploadImage(file, 'profile', true);
      form.setFieldValue('profile_url', data.imgUrl);
    },
    [form],
  );

  return {
    form,
    uploadProfileImage,
  };
};

export default useEditProfile;
