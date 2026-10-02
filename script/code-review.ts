/**
 * Claude 기반 코드 리뷰 스크립트.
 *
 * 사용법 (repo root):
 *   pnpm code-review            # origin/main 대비 현재 브랜치(커밋 + 작업 중인 변경) 리뷰
 *   pnpm code-review develop    # 비교 기준 브랜치 지정
 *
 * 인증: ANTHROPIC_API_KEY 환경 변수 (또는 `ant auth login` 프로필).
 * 모델 변경: CODE_REVIEW_MODEL 환경 변수.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.CODE_REVIEW_MODEL ?? 'claude-opus-5-5';

// 리뷰할 필요가 없는 생성 파일 / lockfile
const EXCLUDED_PATHS = [
  ':(exclude)pnpm-lock.yaml',
  ':(exclude,glob)**/routeTree.gen.ts',
];

const SYSTEM_PROMPT = `당신은 SNUAAA 커뮤니티 웹사이트 monorepo의 시니어 코드 리뷰어입니다.
주어진 git diff를 리뷰하고 아래 형식의 한국어 Markdown으로 답하세요.

## 요약
변경 내용을 2~3문장으로 요약합니다.

## 발견 사항
심각도 순서로 나열합니다. 각 항목은 다음 형식을 따릅니다.
- **[심각도] \`파일경로:라인\`** 문제 설명. 어떤 입력/상황에서 어떤 잘못된 결과가 나는지 구체적으로 적고, 수정 방법을 제안합니다.

심각도는 다음 중 하나입니다.
- 🔴 Critical: 버그, 보안 문제, 데이터 손실, 런타임 에러
- 🟡 Warning: 잠재적 버그, 엣지 케이스 누락, 성능 문제, 프로젝트 컨벤션 위반
- 🔵 Suggestion: 가독성, 단순화, 재사용 등 선택적인 개선

발견 사항이 없으면 "발견된 문제 없음"이라고 적습니다.

리뷰 원칙:
- diff에서 변경된 코드에 집중하고, 변경되지 않은 기존 코드의 문제는 변경과 직접 관련될 때만 언급합니다.
- 실제로 확인할 수 있는 문제만 보고하고, diff만으로 확신할 수 없는 부분은 그렇다고 명시합니다.
- 아래 프로젝트 가이드(CLAUDE.md)의 아키텍처와 컨벤션을 기준으로 판단합니다.`;

function git(args: string[]): string {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  }).trim();
}

function getDiff(baseRef: string): { mergeBase: string; diff: string } {
  const mergeBase = git(['merge-base', baseRef, 'HEAD']);
  // merge-base 대비 working tree diff: 커밋된 변경 + 아직 커밋하지 않은 변경 모두 포함
  const diff = git([
    'diff',
    '--no-color',
    mergeBase,
    '--',
    '.',
    ...EXCLUDED_PATHS,
  ]);
  return { mergeBase, diff };
}

function loadProjectGuide(repoRoot: string): string {
  const guidePath = path.join(repoRoot, 'CLAUDE.md');
  return existsSync(guidePath) ? readFileSync(guidePath, 'utf8') : '';
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const baseRef = args[0] ?? 'origin/main';

  const repoRoot = git(['rev-parse', '--show-toplevel']);
  process.chdir(repoRoot);

  const { mergeBase, diff } = getDiff(baseRef);
  if (!diff) {
    console.log(`${baseRef} 대비 변경 사항이 없습니다.`);
    return;
  }

  const changedFiles = git([
    'diff',
    '--stat',
    mergeBase,
    '--',
    '.',
    ...EXCLUDED_PATHS,
  ]);
  console.error(`Base: ${baseRef} (${mergeBase.slice(0, 8)})`);
  console.error(changedFiles);
  console.error(`\n${MODEL} 로 리뷰 중...\n`);

  const client = new Anthropic();
  const projectGuide = loadProjectGuide(repoRoot);

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    // 안전 분류기가 요청을 거절하면 서버에서 권장 모델로 자동 재시도
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system: [
      { type: 'text', text: SYSTEM_PROMPT },
      {
        type: 'text',
        text: `<project_guide>\n${projectGuide}\n</project_guide>`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `다음 diff를 리뷰해 주세요.\n\n<changed_files>\n${changedFiles}\n</changed_files>\n\n<diff>\n${diff}\n</diff>`,
      },
    ],
  });

  stream.on('text', (text) => process.stdout.write(text));
  const message = await stream.finalMessage();
  process.stdout.write('\n');

  if (message.stop_reason === 'refusal') {
    console.error(
      `\n리뷰 요청이 거절되었습니다 (${message.stop_details?.category ?? 'unknown'}).`,
    );
    process.exitCode = 1;
  } else if (message.stop_reason === 'max_tokens') {
    console.error('\n출력 토큰 한도에 도달해 리뷰가 잘렸습니다.');
    process.exitCode = 1;
  }

  const { usage } = message;
  console.error(
    `\n[${message.model}] input ${usage.input_tokens} / cache read ${usage.cache_read_input_tokens ?? 0} / output ${usage.output_tokens} tokens`,
  );
}

main().catch((error: unknown) => {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error('인증 실패: ANTHROPIC_API_KEY를 확인하세요.');
  } else if (error instanceof Anthropic.RateLimitError) {
    console.error('Rate limit에 걸렸습니다. 잠시 후 다시 시도하세요.');
  } else if (error instanceof Anthropic.APIError) {
    console.error(`API 에러 ${error.status}: ${error.message}`);
  } else {
    console.error(error);
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
      console.error(
        '\nANTHROPIC_API_KEY가 설정되어 있지 않습니다. 예: ANTHROPIC_API_KEY=sk-ant-... pnpm code-review',
      );
    }
  }
  process.exitCode = 1;
});
