# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Claude Code 사용 통계를 시각화하는 웹 애플리케이션. 사용자의 `~/.claude` 폴더를 업로드하면 연간 사용량을 GitHub 스타일 히트맵, 월별 차트, 도구 사용량 등으로 시각화한다. **모든 데이터 처리는 브라우저에서만 수행**되어 서버로 전송되지 않음.

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (정적 HTML 생성)
npm run lint     # ESLint 실행
npm run deploy   # Cloudflare Pages 배포
```

## 아키텍처

### 데이터 흐름
1. `FileDropzone` → 폴더 드래그앤드롭으로 파일 수집
2. `parseClaudeData()` → `history.jsonl` 파싱 및 통계 계산
3. `YearSummary` → 계산된 `ClaudeStats`를 각 차트 컴포넌트로 전달

### 핵심 파일
- `src/lib/parseClaudeData.ts`: history.jsonl 파싱 로직, 스트릭 계산, 도구 사용량 추출
- `src/lib/types.ts`: `ClaudeStats`, `FunStats` 등 모든 타입 정의
- `src/app/page.tsx`: 랜딩 페이지 + 데모 데이터 생성 함수

### 정적 빌드
`next.config.js`에서 `output: 'export'` 설정으로 정적 HTML 생성. Cloudflare Pages에 배포됨.

## 주요 의존성
- **framer-motion**: 페이지 전환 및 UI 애니메이션
- **recharts**: 월별 활동 차트
- **date-fns**: 날짜 포맷팅 (한국어 로케일 사용)
- **lucide-react**: 아이콘
