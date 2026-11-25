import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, ConfirmDialog, Field, Input, Sheet } from '~/components/ui';
import {
  useDeleteOfficers,
  useSaveOfficers,
} from '~/hooks/queries/useOfficerQueries';
import {
  OFFICERS_MANAGER_GRADE,
  canDeleteOfficers,
  canSaveOfficers,
} from '~/components/Layout/constants';
import useAuth from '~/hooks/useAuth';
import type { OfficerGeneration } from '~/services/types';
import { parseNames } from './officerUtils';

type Row = { key: number; role: string; names: string };

let rowKey = 0;
const toRow = (role: string, names: string[] = []): Row => ({
  key: ++rowKey,
  role,
  names: names.join(', '),
});

/** The roles a new 기수 starts with: the latest 기수's, without names. */
function templateRows(latest?: OfficerGeneration) {
  const roles = latest?.roles.map((role) => role.role) ?? [
    '부회장',
    '총무',
    '회계',
    '관측부장',
  ];
  return roles.map((role) => toRow(role));
}

type OfficerEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The 기수 to change; a new 기수 when left out. */
  generation?: OfficerGeneration;
  /** Every 기수, to suggest the next number and refuse a duplicate. */
  generations: OfficerGeneration[];
  onDone: (message: string) => void;
};

/** 기수 추가 / 수정 form, a sheet on mobile and a dialog on desktop. */
export default function OfficerEditor(props: OfficerEditorProps) {
  // Remount on every open so the form starts from the given 기수.
  return props.open ? <EditorForm {...props} /> : null;
}

function EditorForm({
  open,
  onOpenChange,
  generation,
  generations,
  onDone,
}: OfficerEditorProps) {
  const { grade } = useAuth().authInfo.user;
  const latest = generations[0];
  const isNew = !generation;
  // 현 회장 may add only the next 기수, so the number is fixed for them.
  const numberLocked = !isNew || grade > OFFICERS_MANAGER_GRADE;
  const [number, setNumber] = useState(
    String(generation?.generation ?? (latest ? latest.generation + 1 : '')),
  );
  const [president, setPresident] = useState(generation?.president ?? '');
  const [rows, setRows] = useState<Row[]>(() =>
    generation
      ? generation.roles.map((role) => toRow(role.role, role.names))
      : templateRows(latest),
  );
  const [submitted, setSubmitted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = useSaveOfficers();
  const remove = useDeleteOfficers();

  const parsedNumber = Number(number);
  const numberError = !/^[1-9][0-9]{0,3}$/.test(number)
    ? '기수를 숫자로 적어 주세요.'
    : isNew && generations.some((g) => g.generation === parsedNumber)
      ? `${parsedNumber}대는 이미 있어요. 목록에서 수정해 주세요.`
      : !canSaveOfficers(grade, parsedNumber, latest?.generation ?? null)
        ? '이 기수는 운영진만 추가할 수 있어요.'
        : undefined;

  // A row left fully empty is dropped; a half-filled one is an error.
  const filled = rows.filter((row) => row.role.trim() || row.names.trim());
  const rowError = (row: Row) =>
    !row.role.trim() && !row.names.trim()
      ? undefined
      : !row.role.trim()
        ? '직책을 적어 주세요.'
        : parseNames(row.names).length === 0
          ? '이름을 적어 주세요.'
          : undefined;
  const presidentError = president.trim()
    ? undefined
    : '회장 이름을 적어 주세요.';
  const invalid =
    Boolean(numberError) || Boolean(presidentError) || filled.some(rowError);

  const updateRow = (key: number, change: Partial<Row>) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...change } : row)),
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (invalid) return;
    save.mutate(
      {
        generation: parsedNumber,
        president: president.trim(),
        roles: filled.map((row) => ({
          role: row.role.trim(),
          names: parseNames(row.names),
        })),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onDone(
            isNew ? `${parsedNumber}대를 추가했어요` : '임원진을 저장했어요',
          );
        },
      },
    );
  };

  const deleteGeneration = () => {
    if (!generation) return;
    remove.mutate(generation.generation, {
      onSuccess: () => {
        setConfirmDelete(false);
        onOpenChange(false);
        onDone(`${generation.generation}대를 삭제했어요`);
      },
    });
  };

  const failed = save.isError || remove.isError;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={isNew ? '기수 추가' : `${generation.generation}대 수정`}
        description="이름이 여럿이면 쉼표로 나눠 주세요."
        footer={
          <div className="flex w-full items-center gap-2">
            {!isNew && canDeleteOfficers(grade) && (
              <Button
                variant="ghost"
                className="mr-auto text-danger"
                onClick={() => setConfirmDelete(true)}
              >
                삭제
              </Button>
            )}
            <Button
              variant="secondary"
              className={
                isNew || !canDeleteOfficers(grade) ? 'ml-auto' : undefined
              }
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              form="officer-editor"
              loading={save.isPending}
            >
              저장
            </Button>
          </div>
        }
      >
        <form
          id="officer-editor"
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-5 px-2 pb-2"
        >
          <div className="flex gap-3">
            <Field
              label="기수"
              required
              error={submitted ? numberError : undefined}
              className="w-28 shrink-0"
            >
              <Input
                inputMode="numeric"
                value={number}
                onChange={(event) => setNumber(event.target.value.trim())}
                disabled={numberLocked}
              />
            </Field>
            {/* 회장 is required, so it has its own field and column. */}
            <Field
              label="회장"
              required
              error={submitted ? presidentError : undefined}
              className="min-w-0 flex-1"
            >
              <Input
                value={president}
                onChange={(event) => setPresident(event.target.value)}
                placeholder="이름"
              />
            </Field>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1.5 text-label text-fg">다른 임원</legend>
            {rows.map((row, index) => {
              const error = submitted ? rowError(row) : undefined;
              return (
                <div key={row.key} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label={`${index + 1}번째 직책`}
                      placeholder="직책"
                      value={row.role}
                      onChange={(event) =>
                        updateRow(row.key, { role: event.target.value })
                      }
                      aria-invalid={Boolean(error) || undefined}
                      className="w-28 shrink-0"
                    />
                    <Input
                      aria-label={`${row.role || `${index + 1}번째 직책`} 이름`}
                      placeholder="이름"
                      value={row.names}
                      onChange={(event) =>
                        updateRow(row.key, { names: event.target.value })
                      }
                      aria-invalid={Boolean(error) || undefined}
                      className="min-w-0 flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${row.role || `${index + 1}번째`} 줄 지우기`}
                      onClick={() =>
                        setRows((current) =>
                          current.filter((r) => r.key !== row.key),
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>
                  {error && <p className="text-caption text-danger">{error}</p>}
                </div>
              );
            })}
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => setRows((current) => [...current, toRow('')])}
            >
              <Plus aria-hidden />
              직책 추가
            </Button>
          </fieldset>
          {failed && (
            <p className="text-caption text-danger" role="alert">
              저장하지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
        </form>
      </Sheet>
      {generation && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`${generation.generation}대를 삭제할까요?`}
          description="이 기수의 임원 기록이 모두 지워져요."
          confirmLabel="삭제"
          tone="danger"
          loading={remove.isPending}
          onConfirm={deleteGeneration}
        />
      )}
    </>
  );
}
