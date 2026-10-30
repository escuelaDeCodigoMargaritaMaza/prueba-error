<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All diagnostic-test math lives in `src/lib/diagnostic.ts` (pure, tested in `diagnostic.test.ts`); pages only render. Why: one source of truth for formulas.
- The user's 2×2 study is shared across pages via `StudyProvider` in `__root.tsx`. Why: the same numbers follow the student through every concept.
- 2×2 cell colours come from the `vp/fp/fn/vn` tokens in `src/styles.css`. Why: students learn one colour code site-wide.
