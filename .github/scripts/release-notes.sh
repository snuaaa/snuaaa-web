#!/usr/bin/env bash
# 릴리즈 태그의 패키지 경로를 바꾼 PR만 모아 릴리즈 노트(마크다운)를 출력한다.
#   WEB-* -> packages/community, API-* -> packages/api
# 같은 접두사의 직전 태그와 비교하고, PR은 squash 머지되므로 커밋 하나가 PR 하나다.
# 사용법: release-notes.sh <tag> [repo(owner/name)]
set -euo pipefail

tag=$1
repo=${2:-}

case "$tag" in
  WEB-*) prefix=WEB- path=packages/community ;;
  API-*) prefix=API- path=packages/api ;;
  *) echo "Unsupported tag: $tag (expected WEB-* or API-*)" >&2; exit 1 ;;
esac

git rev-parse -q --verify "refs/tags/$tag" >/dev/null || { echo "Tag not found: $tag" >&2; exit 1; }

# 같은 접두사 태그를 버전 내림차순으로 정렬했을 때 현재 태그 바로 다음 것
prev=$(git tag -l "${prefix}*" --sort=-v:refname | awk -v t="$tag" 'found { print; exit } $0 == t { found = 1 }')

if [ -n "$prev" ]; then
  range="$prev..$tag"
else
  range="$tag"
fi

# 머지 커밋(epic -> main, sync)은 빼고, 그 안의 개별 PR 커밋을 쓴다.
subjects=$(git log --no-merges --format='%s' "$range" -- "$path")

section() {
  local title=$1 pattern=$2 lines
  lines=$(printf '%s\n' "$subjects" | grep -E "^\[$pattern\]" | sed -E "s/^\[$pattern\][[:space:]]*/- /" || true)
  [ -n "$lines" ] && printf '### %s\n\n%s\n\n' "$title" "$lines"
  return 0
}

if [ -z "$subjects" ]; then
  echo "이 범위에서 \`$path\`를 바꾼 PR이 없습니다."
  echo
else
  section 'Features' feat
  section 'Fixes' fix
  section 'Refactoring' refactor
  section 'Chores' chore
  others=$(printf '%s\n' "$subjects" | grep -vE '^\[(feat|fix|refactor|chore)\]' | sed 's/^/- /' || true)
  [ -n "$others" ] && printf '### Others\n\n%s\n\n' "$others"
fi

if [ -n "$prev" ] && [ -n "$repo" ]; then
  echo "**Full Changelog**: https://github.com/$repo/compare/$prev...$tag"
elif [ -n "$prev" ]; then
  echo "**Full Changelog**: $prev...$tag"
fi
