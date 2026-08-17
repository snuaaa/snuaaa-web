import Image from '~/components/Common/AaaImage';
import InputField from '~/components/Common/InputField';
import imgDefaultProfile from '~/assets/img/common/profile.png';
import { FormEvent } from 'react';
import useEditProfile from './useEditProfile';
import { User } from '~/services/types';
import { useDeleteUserInfo } from '~/hooks/queries/useUserQueries';
import { useAuth } from '~/contexts/auth';
import { UpdateUserInfoRequest } from '~/services/UserService';

type ProfileFormProps = {
  user: User;
};

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { form, uploadProfileImage } = useEditProfile({
    initialUserInfo: user as UpdateUserInfoRequest, // TODO: 타입 개선 필요
  });

  const { mutateAsync: mutateDeleteUserInfo } = useDeleteUserInfo();
  const authContext = useAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  const deleteUser = async () => {
    const goDrop = window.confirm('정말로 탈퇴하시겠습니까?');
    if (goDrop) {
      try {
        await mutateDeleteUserInfo();
        alert('탈퇴 요청이 정상적으로 처리되었습니다.');
        authContext.authLogout();
      } catch (err) {
        console.error(err);
        alert('탈퇴 실패');
      }
    }
  };

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit}>
        <div className="profile-wrapper">
          <form.AppField
            key="profile_url"
            name="profile_url"
            children={(field) => (
              <div className="profile-img-wrapper">
                <Image
                  imgSrc={field.state.value}
                  defaultImgSrc={imgDefaultProfile}
                />
                <label htmlFor="profileImg">
                  <div className="edit-profile-img">
                    <i className="ri-camera-line"></i>
                  </div>
                </label>
                <input
                  type="file"
                  id="profileImg"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadProfileImage(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          />
          <h5 className="profile-nickname">{user.nickname}</h5>
          <InputField
            label="ID*"
            name="id"
            value={user.id ?? ''}
            disabled={true}
            valid={true}
          />
          <form.AppField
            key="username"
            name="username"
            children={(field) => (
              <InputField
                label="이름*"
                name="username"
                value={field.state.value}
                required={true}
                valid={field.state.meta.isValid}
                handleChange={(e) => field.handleChange(e.target.value)}
                invalidMessage="2-10자의 한글 혹은 영문"
              />
            )}
          />
          <form.AppField
            key="email"
            name="email"
            children={(field) => (
              <InputField
                label="E-mail*"
                name="email"
                value={field.state.value}
                required={true}
                maxLength={30}
                valid={field.state.meta.isValid}
                handleChange={(e) => field.handleChange(e.target.value)}
                invalidMessage="이메일 형식에 맞게 입력해주세요"
              />
            )}
          />
          <form.AppField
            key="mobile"
            name="mobile"
            children={(field) => (
              <InputField
                label="Mobile*"
                name="mobile"
                value={field.state.value}
                required={true}
                valid={field.state.meta.isValid}
                handleChange={(e) => field.handleChange(e.target.value)}
                invalidMessage="전화번호 형식에 맞게 입력해주세요(xxx-xxxx-xxxx)"
              />
            )}
          />
          <form.AppField
            key="aaa_no"
            name="aaa_no"
            children={(field) => (
              <InputField
                label="동아리번호"
                name="aaa_no"
                value={field.state.value}
                valid={field.state.meta.isValid}
                handleChange={(e) => field.handleChange(e.target.value)}
                invalidMessage="가입번호 형식에 맞게 입력해주세요. 동아리 회원이 아닌 경우, 입력하지 않으셔도 됩니다."
              />
            )}
          />
          <form.AppField
            key="col_no"
            name="col_no"
            children={(field) => (
              <InputField
                label="학번"
                name="col_no"
                value={field.state.value}
                valid={field.state.meta.isValid}
                handleChange={(e) => field.handleChange(e.target.value)}
                invalidMessage="숫자 2자리를 입력해 주세요(ex. 19)"
              />
            )}
          />
          <form.AppField
            key="major"
            name="major"
            children={(field) => (
              <InputField
                label="전공"
                name="major"
                value={field.state.value}
                valid={field.state.meta.isValid}
                handleChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />
          <form.AppField
            key="introduction"
            name="introduction"
            children={(field) => (
              <div className="enif-input-field">
                <label htmlFor="introduction">자기소개</label>
                <textarea
                  name="introduction"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <div className="btn-wrapper">
                <button
                  className="btn-withdraw"
                  type="button"
                  onClick={() => deleteUser()}
                >
                  탈퇴하기
                </button>
                <button
                  className="btn-save"
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                >
                  저장
                </button>
              </div>
            )}
          />
        </div>
      </form>
    </form.AppForm>
  );
};

export default ProfileForm;
