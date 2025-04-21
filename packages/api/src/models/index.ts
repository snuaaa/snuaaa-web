import AlbumModel from './Album';
import AttachedFileModel from './AttachedFile';
import BoardModel from './Board';
import CategoryModel from './Category';
import CommentModel from './Comment';
import CommentLikeModel from './CommentLike';
import ContentModel from './Content';
import ContentTagModel from './ContentTag';
import ContentLikeModel from './ContentLike';
import DocumentModel from './Document';
import ExhibitionModel from './Exhibition';
import ExhibitPhotoModel from './ExhibitPhoto';
import PhotoModel from './Photo';
import PostModel from './Post';
import StatsLoginModel from './StatsLogin';
import TagModel from './Tag';
import UserModel from './User';
import RentModel from './Rent';
import EquipmentCategoryModel from './EquipmentCategory';
import EquipmentModel from './Equipment';
import RentReturnModel from './RentReturn';

AlbumModel.belongsTo(ContentModel, {
    as: 'thumbnail',
    targetKey: 'content_id',
    foreignKey: 'tn_photo_id'
})

AttachedFileModel.belongsTo(ContentModel, {
    foreignKey: 'parent_id',
    targetKey: 'content_id'
});

CategoryModel.belongsTo(BoardModel, {
    foreignKey: 'board_id',
    targetKey: 'board_id'
});

BoardModel.hasMany(TagModel, {
    as: 'tags',
    foreignKey: 'board_id'
})

BoardModel.hasMany(CategoryModel, {
    as: 'categories',
    foreignKey: 'board_id'
})

CommentModel.belongsTo(ContentModel, {
    foreignKey: 'parent_id',
    targetKey: 'content_id'
});

CommentModel.belongsTo(UserModel, {
    foreignKey: 'author_id',
    targetKey: 'user_id'
});

CommentModel.hasMany(CommentModel, {
    as: 'children',
    foreignKey: 'parent_comment_id',
    sourceKey: 'comment_id'
});

CommentModel.belongsToMany(UserModel, {
    as: 'likeUsers',
    through: 'commentLike',
    foreignKey: 'comment_id',
    otherKey: 'user_id'
});

ContentModel.belongsTo(BoardModel, {
    foreignKey: 'board_id',
    targetKey: 'board_id'
});

ContentModel.belongsTo(UserModel, {
    foreignKey: 'author_id',
    targetKey: 'user_id'
});

ContentModel.belongsTo(CategoryModel, {
    foreignKey: 'category_id',
    targetKey: 'category_id'
})

ContentModel.belongsToMany(UserModel, {
    through: 'contentLike',
    foreignKey: 'content_id',
    otherKey: 'content_id'
})

ContentModel.hasOne(PostModel, {
    as: 'post',
    foreignKey: 'content_id'
})

ContentModel.hasOne(AlbumModel, {
    as: 'album',
    foreignKey: 'content_id'
})

ContentModel.hasOne(PhotoModel, {
    as: 'photo',
    foreignKey: 'content_id'
})

ContentModel.hasOne(DocumentModel, {
    as: 'document',
    foreignKey: 'content_id'
})

ContentModel.hasOne(ExhibitionModel, {
    as: 'exhibition',
    foreignKey: 'content_id'
})

ContentModel.hasOne(ExhibitPhotoModel, {
    as: 'exhibitPhoto',
    foreignKey: 'content_id',
})

ContentModel.hasOne(ContentModel, {
    as: 'parent',
    foreignKey: 'content_id',
    sourceKey: 'parent_id'
})

ContentModel.hasMany(ContentModel, {
    as: 'children',
    foreignKey: 'parent_id',
    sourceKey: 'content_id'
})

ContentModel.hasMany(AttachedFileModel, {
    as: 'attachedFiles',
    foreignKey: 'parent_id',
    sourceKey: 'content_id'
})

ContentModel.belongsToMany(TagModel, {
    through: ContentTagModel,
    as: 'tags',
    foreignKey: 'content_id',
    otherKey: 'tag_id'
})

DocumentModel.belongsTo(ContentModel, {
    foreignKey: 'content_id',
    targetKey: 'content_id'
})

PostModel.belongsTo(ContentModel, {
    // as: 'content',
    foreignKey: 'content_id',
    targetKey: 'content_id'
})

StatsLoginModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    targetKey: 'user_id'
});

TagModel.belongsTo(BoardModel, {
    foreignKey: 'board_id',
    targetKey: 'board_id'
});

TagModel.belongsToMany(ContentModel, {
    through: ContentTagModel,
    as: 'tagContents',
    foreignKey: 'tag_id',
    otherKey: 'content_id'
})

UserModel.belongsToMany(CommentModel, {
    through: 'commentLike',
    foreignKey: 'user_id',
    otherKey: 'user_id'
});

UserModel.belongsToMany(ContentModel, {
    through: 'contentLike',
    foreignKey: 'user_id',
    otherKey: 'content_id'
});

UserModel.hasMany(StatsLoginModel, {
    foreignKey: 'user_id'
});

ExhibitPhotoModel.belongsTo(UserModel, {
    as: 'photographer',
    foreignKey: 'photographer_id',
    targetKey: 'user_id'
});

RentModel.belongsTo(EquipmentModel, {
    foreignKey: 'equipment_id',
    targetKey: 'id'
});

RentModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    targetKey: 'user_id'
});

EquipmentModel.hasMany(RentModel, {
    foreignKey: 'equipment_id',
    sourceKey: 'id'
});

EquipmentModel.belongsTo(EquipmentCategoryModel, {
    foreignKey: 'category_id',
    targetKey: 'id'
});

EquipmentCategoryModel.hasMany(EquipmentModel, {
    foreignKey: 'category_id',
    sourceKey: 'id'
});

RentModel.hasOne(RentReturnModel, {
    foreignKey: 'rent_id',
    sourceKey: 'id'
});

RentReturnModel.belongsTo(RentModel, {
    foreignKey: 'rent_id',
    targetKey: 'id'
});

export {
    AlbumModel,
    AttachedFileModel,
    BoardModel,
    CategoryModel,
    CommentModel,
    CommentLikeModel,
    ContentModel,
    ContentTagModel,
    ContentLikeModel,
    DocumentModel,
    ExhibitionModel,
    ExhibitPhotoModel,
    PhotoModel,
    PostModel,
    StatsLoginModel,
    TagModel,
    UserModel,
    EquipmentModel,
    EquipmentCategoryModel,
    RentModel,
    RentReturnModel
};
