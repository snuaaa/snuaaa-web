import { useState, type ReactNode } from 'react';
import {
  Heart,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  CountBadge,
  Dialog,
  Fab,
  Field,
  Input,
  LoadMore,
  Pagination,
  SegmentedControl,
  Sheet,
  SheetAction,
  Tabs,
  TabsList,
  TabsTrigger,
  Tag,
  Textarea,
} from '~/components/ui';

// TEMPORARY component gallery for the redesign. See routes/dev/ui.tsx.

// A div, not <section>: legacy _section.scss styles every section.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-sm">
      <h2 className="text-heading text-fg">{title}</h2>
      {children}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2.5">{children}</div>;
}

const sampleUsers = [
  { nickname: '김별', grade: 1 },
  { nickname: '이은하', grade: 3 },
  { nickname: '박성운', grade: 6 },
  { nickname: '최혜성', grade: 8 },
];

export default function UiGallery() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState<'photo' | 'album'>('photo');
  const [page, setPage] = useState(3);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('abcd');

  return (
    <div className="min-h-full bg-bg font-sans leading-normal text-fg">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 pb-28">
        <header className="flex flex-col gap-1">
          <p className="text-label text-navy-700">SNUAAA COMPONENTS</p>
          <h1 className="text-display">컴포넌트 시트</h1>
          <p className="text-caption text-fg-muted">
            리디자인 기간에만 쓰는 임시 페이지예요. 리디자인이 끝나면 지워요.
          </p>
        </header>

        <Section title="Button">
          <Row>
            <Button>글쓰기</Button>
            <Button variant="secondary">취소</Button>
            <Button variant="ghost">더 보기</Button>
            <Button variant="accent">장비 예약</Button>
            <Button variant="danger">삭제</Button>
            <Button disabled>비활성</Button>
          </Row>
          <Row>
            <Button size="sm">
              <Plus />새 앨범
            </Button>
            <Button size="sm" variant="secondary">
              임시저장
            </Button>
            <Button
              size="sm"
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              {loading ? '저장 중' : '저장'}
            </Button>
            <Button size="icon" variant="secondary" aria-label="좋아요">
              <Heart />
            </Button>
            <Button size="icon" variant="ghost" aria-label="더보기 메뉴">
              <MoreHorizontal />
            </Button>
          </Row>
          <Button block>가로 전체 버튼</Button>
        </Section>

        <Section title="Input">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="아이디" required>
              <Input placeholder="아이디를 입력하세요" autoComplete="off" />
            </Field>
            <Field label="이메일" hint="학교 메일이 아니어도 괜찮아요">
              <Input type="email" defaultValue="aaa@snu.ac.kr" />
            </Field>
            <Field
              label="비밀번호"
              error={password.length < 8 ? '8자 이상 입력해 주세요' : undefined}
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="비활성">
              <Input disabled defaultValue="수정할 수 없음" />
            </Field>
          </div>
          <Field label="소개">
            <Textarea placeholder="자기소개를 입력하세요" />
          </Field>
        </Section>

        <Section title="Tag · Badge">
          <Row>
            <Tag variant="brand">공지</Tag>
            <Tag>자유</Tag>
            <Tag variant="accent">관측</Tag>
            <Tag variant="outline"># 은하수</Tag>
          </Row>
          <Row>
            <Badge tone="success">대여 가능</Badge>
            <Badge tone="warning">대여 중</Badge>
            <Badge tone="danger">연체</Badge>
            <Badge tone="info">예약</Badge>
            <CountBadge count={3} />
            <CountBadge count={120} />
          </Row>
        </Section>

        <Section title="Avatar">
          <Row>
            {([56, 40, 28, 20] as const).map((size) => (
              <Avatar key={size} size={size} user={{ nickname: '김별' }} />
            ))}
          </Row>
          <Row>
            {sampleUsers.map((user) => (
              <Avatar key={user.nickname} size={56} user={user} showGrade />
            ))}
            <Avatar size={40} user={sampleUsers[1]} showGrade />
            <Avatar size={28} user={sampleUsers[2]} showGrade />
          </Row>
        </Section>

        <Section title="Tabs · SegmentedControl">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="notice">공지</TabsTrigger>
              <TabsTrigger value="free">자유</TabsTrigger>
              <TabsTrigger value="observe">관측</TabsTrigger>
            </TabsList>
          </Tabs>
          <SegmentedControl
            aria-label="보기 방식"
            value={view}
            onValueChange={setView}
            options={[
              { value: 'photo', label: '사진' },
              { value: 'album', label: '앨범' },
            ]}
          />
        </Section>

        <Section title="더 보기 · Pagination">
          <LoadMore hasMore onClick={() => undefined} />
          <Pagination page={page} totalPages={23} onPageChange={setPage} />
        </Section>

        <Section title="Sheet · Dialog">
          <p className="text-caption text-fg-muted">
            Sheet는 모바일·태블릿에서 하단 시트, 데스크톱에서 가운데 Dialog로
            열려요. 확인 질문은 화면 크기와 상관없이 ConfirmDialog를 써요.
          </p>
          <Row>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>
              게시글 메뉴 (Sheet)
            </Button>
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Dialog
            </Button>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              삭제 확인 (ConfirmDialog)
            </Button>
          </Row>
        </Section>
      </div>

      <Fab icon={<Pencil />} onClick={() => setSheetOpen(true)}>
        글쓰기
      </Fab>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="게시글"
        footer={
          <Button
            variant="secondary"
            block
            className="border-0 bg-surface-sunken"
            onClick={() => setSheetOpen(false)}
          >
            닫기
          </Button>
        }
      >
        <SheetAction icon={<Pencil />}>수정</SheetAction>
        <SheetAction icon={<Link2 />}>링크 복사</SheetAction>
        <SheetAction icon={<Search />}>작성자 글 보기</SheetAction>
        <SheetAction
          icon={<Trash2 />}
          tone="danger"
          onClick={() => {
            setSheetOpen(false);
            setConfirmOpen(true);
          }}
        >
          삭제
        </SheetAction>
      </Sheet>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="이메일 변경"
        description="새 이메일로 확인 메일을 보내요."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setDialogOpen(false)}>보내기</Button>
          </>
        }
      >
        <div className="px-2">
          <Field label="새 이메일">
            <Input type="email" placeholder="aaa@snu.ac.kr" />
          </Field>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="게시글을 삭제할까요?"
        description="삭제한 글은 되돌릴 수 없어요."
        confirmLabel="삭제"
        tone="danger"
        loading={deleting}
        onConfirm={() => {
          setDeleting(true);
          setTimeout(() => {
            setDeleting(false);
            setConfirmOpen(false);
          }, 1000);
        }}
      />
    </div>
  );
}
