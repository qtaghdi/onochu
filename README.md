# onochu

인스타 게시글에 사용할 오늘의 추천곡을 원하는 만큼 저장하고 공유하는 공개 운영 도구입니다.

## 로컬 실행

```bash
cp .env.example .env
pnpm install
pnpm dev
```

- 공개 조회: `http://localhost:5173/songs/today`
- 추천곡 관리: `http://localhost:5173/songs/manage`

## 환경변수

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Supabase SQL Editor에서 `supabase/schema.sql`을 실행하세요. 이 앱은 로그인 없이 사용하는 MVP이므로 테이블의 select, insert, update를 `anon` 역할에 공개합니다. 민감한 데이터를 저장하지 마세요.

기존 2곡 버전의 테이블을 이미 만들었다면 `supabase/migrations/20260629-allow-multiple-songs.sql`도 한 번 실행해 게시곡 인덱스의 2곡 제한을 제거하세요.

## GitHub Pages

저장소의 Settings → Pages에서 Source를 **GitHub Actions**로 설정하고, Actions secrets에 `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`를 추가합니다. `main` 브랜치 push 시 `.github/workflows/deploy-pages.yml`이 저장소 이름을 base path로 사용해 정적 빌드를 배포합니다. 커스텀 도메인이나 사용자/조직 Pages 저장소를 쓴다면 `BASE_PATH`를 빈 문자열로 조정하세요.

`@sveltejs/adapter-static`의 `404.html` fallback을 사용하므로 `/songs/today`, `/songs/manage` 직접 접근과 새로고침도 SPA 라우팅으로 복구됩니다.
