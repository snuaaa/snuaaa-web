import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

import { GRADE_GUIDE } from '~/components/Auth/signupRules';
import { GradeDot } from '~/components/Auth/SignupSteps';
import { assignableGrades } from '~/components/Layout/constants';
import { Button, Sheet } from '~/components/ui';
import { useUpdateUserGrade } from '~/hooks/queries/useUserQueries';
import { cn } from '~/lib/utils';
import { User } from '~/services/types';

type GradeSheetProps = {
  /** The member being changed; null keeps the sheet closed. */
  user: User | null;
  /** The signed-in member's grade, which bounds the choices. */
  actorGrade: number;
  onClose: () => void;
  onChanged: (message: string) => void;
};

/**
 * 등급 조정: picks one of the grades lower than the actor's own. The API
 * rejects anything else, so the list only offers what it will accept.
 */
export default function GradeSheet({
  user,
  actorGrade,
  onClose,
  onChanged,
}: GradeSheetProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateUserGrade();

  useEffect(() => {
    setSelected(user?.grade ?? null);
    setError(null);
  }, [user]);

  const allowed = assignableGrades(actorGrade);
  const options = GRADE_GUIDE.filter(({ grade }) => allowed.includes(grade));
  const highest = GRADE_GUIDE.find(({ grade }) => grade === allowed[0]);
  const unchanged = selected === null || selected === user?.grade;

  const save = async () => {
    if (!user || selected === null || unchanged) return;
    setError(null);
    try {
      await mutateAsync({ userUuid: user.user_uuid, grade: selected });
      const name = GRADE_GUIDE.find(({ grade }) => grade === selected)?.name;
      onChanged(`${user.nickname}님을 ${name}(${selected}등급)으로 바꿨어요`);
      onClose();
    } catch (err) {
      console.error(err);
      setError('바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <Sheet
      open={!!user}
      onOpenChange={(open) => !open && !isPending && onClose()}
      title={`${user?.nickname ?? ''} 등급 조정`}
      description={
        highest &&
        `본인보다 낮은 ${highest.name}(${highest.grade}등급) 이하로만 바꿀 수 있어요.`
      }
      footer={
        <div className="flex w-full flex-col gap-2">
          {error && (
            <p role="alert" className="text-caption text-danger">
              {error}
            </p>
          )}
          <Button block loading={isPending} disabled={unchanged} onClick={save}>
            변경
          </Button>
        </div>
      }
    >
      <div role="group" aria-label="등급" className="flex flex-col">
        {options.map(({ grade, name, role }) => {
          const checked = selected === grade;
          const current = user?.grade === grade;
          return (
            <button
              key={grade}
              type="button"
              aria-pressed={checked}
              onClick={() => setSelected(grade)}
              className={cn(
                'flex h-14 w-full items-center gap-3 rounded-md px-2 text-left hover:bg-gray-50',
                checked && 'bg-info-soft hover:bg-info-soft',
              )}
            >
              <GradeDot grade={grade} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                  {grade} {name}
                  {current && (
                    <span className="rounded-full bg-gray-100 px-1.5 py-px text-micro font-medium text-fg-muted">
                      현재
                    </span>
                  )}
                </span>
                <span className="truncate text-caption text-fg-muted">
                  {role}
                </span>
              </span>
              {checked && (
                <Check className="size-5 shrink-0 text-primary" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
