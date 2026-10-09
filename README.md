# mattpocock-skills-cheatsheet

[mattpocock/skills](https://github.com/mattpocock/skills)の使い方を、目的別・スキル別に引ける日本語のチートシート。

- **目的から探す**: 「新規アプリの仕様を作りたい」「バグを直したい」などから、使うスキルの手順と分岐を路線図で表示する。
- **スキルから探す**: スキル名で検索し、使う場面・渡すもの・できるもの・手順・注意点と、前後につながるスキルを表示する。
- **全体フロー**: アイデアから出荷までの主フローと、合流する入口・寄り道を1枚で表示する。

## 開き方

`index.html`をブラウザで開く。ビルドもサーバも不要（`file://`で動く）。

URLのハッシュで直接開ける: `#goal/new-spec`、`#skill/to-spec`、`#flow`。

## 構成

| パス | 役割 |
|---|---|
| `index.html` | 画面の骨組み |
| `style.css` | 見た目（ライト・ダーク両対応） |
| `app.js` | 描画とハッシュルーティング。起動時にデータ内のスキル参照を検査し、参照切れがあれば表示を止める |
| `data/cheatsheet.js` | 表示データの正本（スキル・目的・主フロー）。各SKILL.mdを読んで日本語で手書きしたもの |
| `data/source-hashes.json` | 最後に記述を見直したときの各スキルの内容ハッシュ |
| `scripts/check-sync.mjs` | 導入済みスキルとデータの差分検出 |

## mattpocock/skillsを更新したとき

`npx skills update`などでスキルを更新したら、次の手順でチートシートを追随させる。

1. 差分を確認する。

   ```sh
   node scripts/check-sync.mjs
   ```

   次の4種類が報告される（差分があれば終了コード1）。
   - **未収録**: 導入済みだがデータに無い → `data/cheatsheet.js`の`skills`に追加し、必要なら`goals`・`mainFlow`にも載せる
   - **導入なし**: データにあるが導入されていない → データから削除するか、導入状況を確認する
   - **未確認**: データにあるがハッシュが未記録 → 記述を確認する
   - **変更あり**: 前回の記録から内容が変わった → 表示されたSKILL.mdを読み、記述を直す

2. ブラウザで`index.html`を開き、表示とデータ検査（参照切れがあると「データに問題があります」と表示される）を確認する。

3. 見直したスキルを記録する。

   ```sh
   node scripts/check-sync.mjs --accept to-spec tdd   # 指定したスキルだけ
   node scripts/check-sync.mjs --accept               # 全スキル
   ```

4. もう一度`node scripts/check-sync.mjs`を実行し、「差分なし」になることを確かめる。

SKILL.md以外を根拠にした記述（作者のX投稿など）は、`data/cheatsheet.js`の`sources`にURLを登録し、目的やスキルの`sources`からIDで参照する。画面には「出典」としてリンクが出る。この部分は`check-sync.mjs`では検出できないので、出典側の更新は手作業で確認する。

スキルの導入先は既定で`~/.agents`（`.skill-lock.json`と`skills/`）を見る。別の場所なら環境変数`SKILLS_HOME`で指定する。ハッシュは各スキルディレクトリ内のファイル（他ハーネス向けの`agents/`を除く）から計算する。
