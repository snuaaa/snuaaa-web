import TagType from './TagType';
import CategoryType from './CategoryType';

interface BoardType {
    board_id: string;
    board_name: string;
    board_type: string;
    board_desc: string;
    menu: number;
    order: number;
    lv_read: number;
    lv_write: number;
    lv_edit: number;
    tags: TagType[];
    categories: CategoryType[];
}

export default BoardType;
