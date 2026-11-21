// merge-command.yml에서 actions/github-script로 실행한다. 규칙과 동작은 워크플로 파일의 주석 참고.
module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  const issue_number = context.issue.number;

  // 일반 코멘트(issue_comment)와 리뷰 본문(pull_request_review)은 읽을 곳이 다르다.
  const { comment, review } = context.payload;
  const source = comment ?? review;
  if (!source) return;
  const commenter = source.user.login;

  const command = (source.body ?? '').trim();
  if (command !== '/merge' && command !== '/sync') return;
  const action = command === '/sync' ? '동기화' : '머지';

  // 리뷰 본문에는 reaction API가 없어서 reaction을 달지 않는다 (결과는 코멘트로 알린다).
  const react = async (content) => {
    if (!comment) return;
    await github.rest.reactions.createForIssueComment({ owner, repo, comment_id: comment.id, content });
  };
  const reply = (body) =>
    github.rest.issues.createComment({ owner, repo, issue_number, body });
  const fail = async (message) => {
    await react('confused');
    await reply(`❌ ${action}하지 않았습니다: ${message}`);
    core.setFailed(message);
  };

  await react('eyes');

  const { data: perm } = await github.rest.repos.getCollaboratorPermissionLevel({
    owner,
    repo,
    username: commenter,
  });
  if (!['admin', 'write'].includes(perm.permission)) {
    return fail(`@${commenter} 님은 이 레포에 write 권한이 없습니다.`);
  }

  const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number: issue_number });
  if (pr.state !== 'open') return fail('열려 있는 PR이 아닙니다.');

  const base = pr.base.ref;
  const head = pr.head.ref;
  const sameRepo = pr.head.repo?.full_name === pr.base.repo.full_name;
  const isEpic = (ref) => /^epic\/.+/.test(ref);
  const isWork = (ref) => /^(feat|fix|chore|refactor)\/.+/.test(ref);
  const isSync = (ref) => /^sync\/.+/.test(ref);

  if (command === '/sync') {
    // epic 진행 상황을 추적하는 draft PR에서도 쓸 수 있도록 draft 여부는 보지 않음
    if (base !== 'main' || !sameRepo || !isEpic(head)) {
      return fail('`/sync`는 `epic/*` → `main` PR에서만 쓸 수 있습니다.');
    }
    try {
      await github.rest.pulls.updateBranch({
        owner,
        repo,
        pull_number: issue_number,
        // 코멘트 이후 epic에 새 커밋이 들어왔으면 동기화하지 않음
        expected_head_sha: pr.head.sha,
      });
    } catch (err) {
      if (/no new commits/i.test(err.message)) {
        await react('+1');
        await reply(`ℹ️ \`${head}\`에 이미 \`main\`의 변경이 모두 반영되어 있습니다.`);
        return;
      }
      return fail(err.message);
    }
    await react('rocket');
    await reply(`✅ \`main\`을 \`${head}\`에 merge commit으로 반영하도록 요청했습니다.`);
    return;
  }

  if (pr.draft) return fail('draft PR은 머지할 수 없습니다.');

  let method;
  if (base === 'main' && sameRepo && isEpic(head)) method = 'merge';
  else if (base === 'main' && isWork(head)) method = 'squash';
  else if (isEpic(base) && isWork(head)) method = 'squash';
  else if (isEpic(base) && sameRepo && isSync(head)) method = 'merge';

  if (!method) {
    return fail(
      `\`${base} ← ${head}\` 조합에 대한 머지 규칙이 없습니다. ` +
        '브랜치 이름이 `epic/*`, `sync/*`, `feat/*`, `fix/*`, `chore/*`, `refactor/*` 중 하나인지 확인해주세요.',
    );
  }

  // ruleset 설정과 별개로, head 커밋의 체크가 모두 통과했는지 직접 확인
  const checkRuns = await github.paginate(github.rest.checks.listForRef, {
    owner,
    repo,
    ref: pr.head.sha,
    per_page: 100,
  });
  if (checkRuns.length === 0) return fail('head 커밋에 CI 결과가 없습니다.');
  const pending = checkRuns.filter((run) => run.status !== 'completed');
  if (pending.length > 0) {
    return fail(`아직 끝나지 않은 체크가 있습니다: ${pending.map((run) => run.name).join(', ')}`);
  }
  const failed = checkRuns.filter(
    (run) => !['success', 'skipped', 'neutral'].includes(run.conclusion),
  );
  if (failed.length > 0) {
    return fail(`통과하지 못한 체크가 있습니다: ${failed.map((run) => run.name).join(', ')}`);
  }
  const { data: status } = await github.rest.repos.getCombinedStatusForRef({
    owner,
    repo,
    ref: pr.head.sha,
  });
  if (status.total_count > 0 && status.state !== 'success') {
    return fail(`commit status가 \`${status.state}\` 상태입니다.`);
  }

  try {
    await github.rest.pulls.merge({
      owner,
      repo,
      pull_number: issue_number,
      merge_method: method,
      commit_title: `${pr.title} (#${issue_number})`,
      // 코멘트 이후 새로 push된 커밋이 검증 없이 머지되지 않도록 고정
      sha: pr.head.sha,
    });
  } catch (err) {
    return fail(err.message);
  }

  await react('rocket');
  await reply(`✅ \`${base} ← ${head}\`를 **${method === 'merge' ? 'merge commit' : 'squash'}** 방식으로 머지했습니다.`);
};
