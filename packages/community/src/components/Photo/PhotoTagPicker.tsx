import { groupTags } from '~/components/Board/PhotoBoard/tagGroups';
import { cn } from '~/lib/utils';
import { Tag } from '~/services/types';

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((t) => t !== id) : [...list, id];

type PhotoTagPickerProps = {
  /** The board's tags. 별사진 has them; album boards have none. */
  tags: Tag[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

/** Toggle chips for a photo's tags, one row per tag group. */
export default function PhotoTagPicker({
  tags,
  selected,
  onChange,
}: PhotoTagPickerProps) {
  return groupTags(tags).map((group) => (
    <div key={group.type} className="flex flex-col gap-2">
      <div className="text-label">{group.name}</div>
      <div
        role="group"
        aria-label={`${group.name} 태그`}
        className="flex flex-wrap gap-1.5"
      >
        {group.tags.map((tag) => {
          const on = selected.includes(tag.tag_id);
          return (
            <button
              key={tag.tag_id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(toggle(selected, tag.tag_id))}
              className={cn(
                'h-9 rounded-full border px-3 text-label transition-colors md:h-8 md:text-caption',
                on
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface font-normal text-gray-700 hover:border-gray-300',
              )}
            >
              {tag.tag_name}
            </button>
          );
        })}
      </div>
    </div>
  ));
}
