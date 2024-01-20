
interface UserType {
    user_id: number;
    user_uuid?: string;
    id?: string;
    username?: string;
    aaa_no?: string;
    nickname: string;
    col_no?: string;
    major?: string;
    email?: string;
    mobile?: string;
    introduction?: string;
    profile_path: string;
    grade: number;
    level: number;
    login_at?: string;
    created_at?: string;
    deleted_at?: string;
}

export default UserType;