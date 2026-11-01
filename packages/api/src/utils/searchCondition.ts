import { Op } from 'sequelize';
import { SearchType } from '../controllers/post.controller';

/**
 * `where` clauses for searching photos and albums: `content` goes on the
 * Content row and `user` on the author include. Empty when not searching.
 */
export const getSearchCondition = (type?: SearchType, keyword?: string) => {
  if (!type || !keyword || keyword.trim() === '') {
    return {};
  }
  switch (type) {
    case 'all': {
      return {
        content: {
          [Op.or]: [
            {
              title: {
                [Op.like]: `%${keyword}%`,
              },
            },
            {
              text: {
                [Op.like]: `%${keyword}%`,
              },
            },
          ],
        },
      };
    }
    case 'title': {
      return {
        content: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    case 'text': {
      return {
        content: {
          text: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    case 'user': {
      return {
        user: {
          nickname: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    default:
      return {};
  }
};
