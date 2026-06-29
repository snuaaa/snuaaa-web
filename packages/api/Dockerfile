# 1. Base stage
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2. Builder stage
FROM base AS builder
WORKDIR /app

# 루트 및 모든 워크스페이스 코드를 복사합니다 (.dockerignore에 의해 node_modules 등은 제외됨)
COPY . .

# 전체 워크스페이스 의존성 설치
RUN pnpm install --frozen-lockfile

# api 패키지 빌드 (TypeScript 컴파일 등)
RUN pnpm --filter @snuaaa/api run build

# api 패키지와 프로덕션용 의존성만 /app/out 디렉토리로 격리(Deploy)
RUN pnpm deploy --filter @snuaaa/api --prod /app/out

# 3. Runner stage (최종 실행 이미지)
FROM node:20-alpine AS runner
WORKDIR /app

# Builder 단계에서 추출된 격리된 코드와 의존성만 복사
COPY --from=builder /app/out ./

EXPOSE 8080

CMD [ "node", "dist/main.js" ]
