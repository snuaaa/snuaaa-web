import { Category } from '~/services/types';

type CategoryProps = {
  categories: Category[];
  selected?: string;
  onClickAll: () => void;
  onClickCategory: (category_id: string) => void;
};

function AlbumCategorySelector({
  categories,
  selected,
  onClickAll,
  onClickCategory,
}: CategoryProps) {
  const style = {
    border: '1px solid var(--color-gray-400)',
  };
  const style_selected = {
    backgroundColor: 'var(--color-gray-400)',
    color: 'var(--color-gray-100)',
  };

  // TODO: radio input으로 refactoring 하기
  return (
    <div className="category-wrapper">
      <div
        className="category-obj category-all"
        style={!selected ? style_selected : style}
        onClick={onClickAll}
      >
        ALL
      </div>
      {categories.map((category) => {
        const style = {
          border: `1px solid ${category.category_color}`,
        };
        const style_selected = {
          border: `1px solid ${category.category_color}`,
          backgroundColor: category.category_color,
          color: 'var(--color-gray-100)',
        };
        return (
          <div
            className="category-obj"
            key={category.category_id}
            style={selected === category.category_id ? style_selected : style}
            onClick={() => {
              onClickCategory(category.category_id);
            }}
          >
            {category.category_name}
          </div>
        );
      })}
    </div>
  );
}

export default AlbumCategorySelector;
