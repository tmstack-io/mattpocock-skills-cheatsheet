/**
 * チートシートの表示データ（手書きの正本）。
 *
 * 内容は ~/.agents/skills/<スキル名>/SKILL.md を読んで日本語で要約したもの。
 * SKILL.md が更新されたら `node scripts/check-sync.mjs` で差分を検出し、
 * 該当スキルの記述を見直してから `--accept` で取り込み済みとして記録する。
 *
 * file:// で開いても読めるよう、JSON ではなく window へ代入する JS にしている。
 */
window.CHEATSHEET = {
  /** スキルの分類。ask-matt の地図（主フロー・入口・保守・語彙・単体）に合わせている。 */
  categories: {
    prereq: { label: "前提", desc: "最初に1回だけ実行する設定" },
    main: { label: "主フロー", desc: "アイデアから出荷までの本流" },
    onramp: { label: "入口", desc: "仕事を生み出し、主フローへ合流する" },
    health: { label: "保守", desc: "機能開発ではないコードベースの手入れ" },
    vocab: { label: "語彙", desc: "他のスキルの下で働く用語の正本" },
    standalone: { label: "単体", desc: "主フローの外で単独に使う" },
    router: { label: "案内", desc: "どのスキルを使うか尋ねる" },
  },

  /** SKILL.md 以外の出典。goals・skills の sources からIDで参照する。 */
  sources: {
    "x-2026-10-08": {
      label: "Matt PocockのX投稿（2026-10-08）",
      url: "https://x.com/mattpocockuk/status/2108216899439894574?s=20",
    },
  },

  /** 「目的から探す」の分類。 */
  goalGroups: [
    { id: "plan", label: "計画・仕様を作る" },
    { id: "build", label: "実装・レビュー・PR" },
    { id: "fix", label: "バグ・外部からの依頼" },
    { id: "health", label: "保守・環境の改善" },
    { id: "assist", label: "補助・その他" },
  ],

  skills: {
    "setup-matt-pocock-skills": {
      category: "prereq",
      manual: true,
      summary:
        "リポジトリごとに1回、issue tracker・トリアージラベル・用語集とADRの置き場所を設定する。",
      when: [
        "エンジニアリング系のスキルを初めて使う前",
        "to-specやto-ticketsなどが「setupを実行して」と言って止まったとき",
      ],
      input: "対象リポジトリ（自動で調査される）",
      output: [
        "CLAUDE.md（無ければAGENTS.md）の「## Agent skills」節",
        "docs/agents/issue-tracker.md（trackerの使い方）",
        "docs/agents/domain.md（GLOSSARY.mdとADRの配置）",
        "docs/agents/triage-labels.md（triage導入時のみ）",
      ],
      steps: [
        "リポジトリを調べる（git remote、CLAUDE.md、GLOSSARY.md、docs/adr/、.scratch/など）",
        "issue trackerを選ぶ（GitHub・GitLab・ローカルMarkdown・その他）",
        "triageラベルを既定のまま使うか決める（triage導入時のみ）",
        "ドメイン文書の配置を決める（通常は単一コンテキストで質問なし）",
        "書き込む内容の下書きを確認し、承認後に書き込む",
      ],
      notes: [
        "ローカルMarkdownのtrackerでは、仕様は.scratch/<feature>/spec.md、チケットは.scratch/<feature>/issues/<NN>-<slug>.mdになる。",
        "CLAUDE.mdもAGENTS.mdも無い場合は、どちらを作るか聞かれる。",
      ],
      prev: [],
      next: ["grill-with-docs", "triage", "wayfinder"],
    },

    "ask-matt": {
      category: "router",
      manual: true,
      summary: "今の状況に合うスキルやフローを尋ねる案内役。",
      when: ["どのスキルを使えばいいか分からないとき", "スキル同士の関係を確かめたいとき"],
      input: "状況や目的（自然文で引数に書く）",
      output: ["推奨するスキルと流れの説明"],
      steps: [
        "状況を読み、主フロー・入口・単体のどれに当たるかを判断する",
        "説明する前に該当スキルのSKILL.mdを読み、内容を確かめてから答える",
      ],
      notes: ["このチートシートはask-mattの地図をもとに作っている。"],
      prev: [],
      next: [],
    },

    "grill-with-docs": {
      category: "main",
      manual: true,
      summary:
        "質問攻めのインタビューでアイデアや計画を詰め、確定した用語をGLOSSARY.md、重要な決定をADRに残す。中身はgrillingとdomain-modelingの同時実行。",
      when: [
        "差分が中〜大になりそうな作業を、作る前に詰めるとき（新規アプリ・新機能・仕様改定など）",
        "improve-codebase-architecture・research・to-questionnaireの結果を検討するとき",
      ],
      input: "アイデア・計画（会話で渡す）",
      output: [
        "会話内の共通理解（このあとto-specやimplementがそのまま使う）",
        "GLOSSARY.md（用語が確定するたびに更新）",
        "docs/adr/（3条件を満たす決定だけ）",
      ],
      steps: [
        "前提が決まった質問をまとめて番号付きで聞く（各質問に推奨回答が付く）",
        "回答を受けて次に聞ける質問を洗い出し、次のラウンドへ進む",
        "事実はエージェントが調べ、決定だけをユーザーに聞く",
        "既存の用語集・コードとの食い違いはその場で指摘される",
        "未決の分岐がゼロになり、ユーザーが共通理解に達したと確認したら終わる",
      ],
      notes: [
        "差分が小さい変更には使わない。詰めずに一発で頼み（one shot）、差分を見てから合わせる（作者の推奨）。",
        "詰めている途中で想定より大きい・不明点が多いと分かったら、「/wayfinder ここまでの内容を地図にして」でそのまま地図に切り替える（作者の推奨）。",
        "リポジトリが無い場面ではgrill-meを使う（記録が残らない）。",
        "このあとto-ticketsまでは同じセッションで続け、/compactも/clearもしない。",
        "会話で決まらない問い（状態・ロジック・見た目）はhandoff→prototype→handoffで寄り道する。",
      ],
      prev: ["setup-matt-pocock-skills", "improve-codebase-architecture", "research", "to-questionnaire", "handoff"],
      next: ["to-spec", "implement", "wayfinder", "handoff"],
      sources: ["x-2026-10-08"],
      uses: ["grilling", "domain-modeling"],
    },

    "grill-me": {
      category: "standalone",
      manual: true,
      summary:
        "grill-with-docsと同じインタビューを、何も保存せずに行う（grillingだけを呼ぶ）。",
      when: ["リポジトリの外で、計画・設計・文章などを詰めるとき"],
      input: "詰めたい計画や考え",
      output: ["会話内の共通理解のみ（ファイルは作らない）"],
      steps: ["grillingと同じ（ラウンドごとに質問→回答→次のラウンド）"],
      notes: ["リポジトリがあるならgrill-with-docsのほうが記録が残るので、そちらを使う。"],
      prev: [],
      next: [],
      uses: ["grilling"],
    },

    grilling: {
      category: "standalone",
      manual: false,
      summary:
        "インタビューの本体。決めるべき事項を設計ツリーとして扱い、前提が決まった質問をまとめて推奨回答付きで聞く。",
      when: [
        "計画や考えを突き詰めたいとき（「grill」と言う）",
        "grill-me・grill-with-docs・triage・wayfinder・improve-codebase-architectureの内部",
      ],
      input: "計画・決定・アイデア",
      output: ["会話内の共通理解"],
      steps: [
        "前提が決まった質問をすべて1ラウンドにまとめて聞く（「はい」で推奨回答を受け入れられる形）",
        "回答で設計ツリーを更新し、次に聞ける質問で次のラウンドへ",
        "環境から分かる事実はサブエージェントに調べさせ、ユーザーには聞かない",
        "未決の分岐がゼロになり、ユーザーが共通理解を確認したら終わる",
      ],
      notes: ["ユーザーが確認するまで、決まった内容の実行には移らない。"],
      prev: [],
      next: [],
    },

    "domain-modeling": {
      category: "vocab",
      manual: false,
      summary:
        "プロジェクトのドメイン用語を鍛え、GLOSSARY.mdとADRを書く規律。",
      when: [
        "用語が曖昧・多義なとき（例: 「account」が3つの意味で使われている）",
        "GLOSSARY.mdやADRを書く・直すとき",
        "grill-with-docs・triage・wayfinder・improve-codebase-architectureの内部",
      ],
      input: "会話中の用語・設計の議論",
      output: ["GLOSSARY.md（実装詳細は書かない純粋な用語集）", "docs/adr/<番号>-<名前>.md"],
      steps: [
        "既存の用語集と矛盾する言葉が出たら、その場で指摘する",
        "曖昧な言葉には正式な用語を提案する",
        "具体的なシナリオで概念の境界を確かめる",
        "発言とコードの食い違いを指摘する",
        "用語が確定したらすぐにGLOSSARY.mdを更新する",
      ],
      notes: [
        "ADRを提案するのは「覆しにくい」「文脈なしでは理由が分からない」「実際にトレードオフを比べた結果」の3条件が揃ったときだけ。",
        "ファイルは書く内容ができてから作る。複数コンテキストのリポジトリではGLOSSARY-MAP.mdを使う。",
      ],
      prev: [],
      next: [],
    },

    "to-spec": {
      category: "main",
      manual: true,
      summary:
        "インタビューはせず、ここまでの会話とコードベースから仕様を書き、issue trackerに1件公開する（ready-for-agentラベル付き）。",
      when: [
        "grill-with-docs（またはwayfinder）で詰め終わり、複数セッションにまたがる開発になるとき",
      ],
      input: "現在の会話とコードベース",
      output: [
        "仕様issue1件（ローカルtrackerなら.scratch/<feature>/spec.md）",
        "見出し: Problem Statement / Solution / User Stories / Implementation Decisions / Testing Decisions / Out of Scope / Further Notes",
      ],
      steps: [
        "リポジトリを調べ、用語集の語彙と関連ADRに従う",
        "テストする境界（seam）を提案してユーザーに確認する（できるだけ上位に置き、数は少なく、理想は1つ）",
        "テンプレートで書いて公開する",
      ],
      notes: [
        "ファイルパスやコード片は書かない。例外はprototypeで確定した状態機械・型などの抜粋。",
        "既存の仕様を書き換える手順は無い。仕様改定は新しいissueとして公開される。",
        "見出しが英語なのは雛形が英語だから。日本語にしたい場合はCLAUDE.mdやdocs/agents/issue-tracker.mdに書いておく。",
        "setup-matt-pocock-skills未実施だと止まる。",
      ],
      prev: ["grill-with-docs", "wayfinder"],
      next: ["to-tickets"],
    },

    "to-tickets": {
      category: "main",
      manual: true,
      summary:
        "仕様・計画・会話を縦切りのチケット（tracer bullet）に分け、依存関係（blocking edges）を付けて公開する。",
      when: ["to-specの直後", "仕様issueを作らず、計画から直接チケットに分けたいとき"],
      input: "会話、または仕様issue・パス（引数で渡せる）",
      output: [
        "GitHub/GitLab: チケットごとのissue＋ネイティブの依存リンク",
        "ローカル: .scratch/<feature>/issues/<NN>-<slug>.md（1チケット1ファイル）",
      ],
      steps: [
        "文脈を集める（引数があればissue本文とコメントを読む）",
        "必要ならコードを調べ、先に済ませる下準備（prefactor）を探す",
        "DB・API・UI・テストを1本ずつ貫く細い単位に分け、依存を付ける",
        "番号付き一覧で粒度と依存をユーザーと確認し、承認まで調整する",
        "依存の上流から順に公開する（ready-for-agent）",
      ],
      notes: [
        "全体に及ぶ機械的な変更（列名の変更など）は「新しい形を追加→呼び出し側を移行→旧い形を削除」の3段に分ける。",
        "既存issueが起点なら各チケットをそのsub-issueにする。親issueは変更しない。",
        "Blocked by:とStatus:の行は他スキルが読む書式なので英語のまま残す。",
        "to-ticketsが作ったチケットはtriage不要。",
      ],
      prev: ["to-spec"],
      next: ["implement", "implement-spec"],
    },

    implement: {
      category: "main",
      manual: true,
      summary:
        "仕様やチケットに沿って実装し、tdd→code-review→コミットまで行う。",
      when: [
        "チケットを1件ずつ実装するとき（チケット間で/clearする）",
        "1セッションに収まる作業を、詰めた同じセッションのまま実装するとき",
      ],
      input: "チケット参照（issue番号など）、または仕様・会話",
      output: ["現在のブランチへのコミット"],
      steps: [
        "チケット参照があればtrackerから取得し、タイトルを示す（曖昧なら聞く）",
        "可能な箇所は合意した境界でtddを使う",
        "型検査と単体テストをこまめに、最後に全テストを実行する",
        "code-reviewでレビューする",
        "現在のブランチにコミットする",
      ],
      notes: [
        "コミットまで行う。コミットさせたくない場合は起動時に指示する。",
        "ローカルtrackerでは依存の上流のチケットから手作業で順に進める。",
      ],
      prev: ["to-tickets", "grill-with-docs", "triage"],
      next: ["pr", "retro"],
      uses: ["tdd", "code-review"],
    },

    "implement-spec": {
      category: "main",
      manual: true,
      summary:
        "仕様とチケットを依存グラフとして読み、着手できるチケットを並列のサブエージェントで実装し、1本の統合ブランチにまとめる。",
      when: ["チケットを自分で1件ずつ回すより、仕様全体の実装をまとめて任せたいとき"],
      input: "チケットが付いた仕様",
      output: ["統合ブランチ（PRで閉じる運用ならdraft PR→ready）", "チケットのクローズ"],
      steps: [
        "仕様とチケットを読み、依存グラフを把握する",
        "（任意）調査用サブエージェントがリポジトリ外にメモを残す",
        "統合ブランチを作る",
        "チケットごとにworktreeを切り、実装サブエージェントがtddで作る",
        "完了したものをマージ用サブエージェントが統合ブランチへ取り込む",
        "着手できるチケットが増えたら追加で起動する",
        "全チケット完了後にcode-reviewし、指摘は1つのサブエージェントでまとめて直す",
        "PRをreadyにする（またはチケットを閉じる）",
        "worktreeを片付ける",
      ],
      notes: ["サブエージェントとのやりとりは、仕様・チケット・コミットへの参照で行い、内容を複製しない。"],
      prev: ["to-tickets"],
      next: ["pr", "retro"],
      uses: ["tdd", "code-review"],
    },

    tdd: {
      category: "main",
      manual: false,
      summary:
        "テストを1つ書く→通す最小の実装、を繰り返すテスト先行開発。テストは事前に合意した境界（seam）だけに書く。",
      when: [
        "機能やバグ修正をテスト先行で進めたいとき",
        "仕様なしで、具体的な振る舞いを1つ作りたいとき",
        "implement・implement-specの内部",
      ],
      input: "作りたい振る舞い",
      output: ["テストと実装"],
      steps: [
        "テストする境界を書き出し、それぞれが何を捕まえ何を見逃すかを添えてユーザーと合意する",
        "失敗するテストを1つ書く",
        "それを通す最小限の実装をする",
        "1サイクルに1境界・1テストで繰り返す",
      ],
      notes: [
        "公開インターフェース越しに振る舞いを検証し、内部を試験しない。",
        "期待値はコードと同じ計算で作らず、具体的な値や仕様など独立した根拠から決める。",
        "テストを先にまとめて書かない（1テスト→1実装の縦切り）。",
        "リファクタはこのループに含めず、レビュー段階で行う。",
        "境界の形そのものが問題ならcodebase-designの語彙を使う。",
      ],
      prev: ["implement", "implement-spec"],
      next: ["code-review"],
    },

    "code-review": {
      category: "main",
      manual: false,
      summary:
        "固定点（コミット・ブランチ・タグ）からの差分を、「規約（Standards）」と「仕様（Spec）」の2軸で並列にレビューし、並べて報告する。",
      when: [
        "ブランチ・PR・作業中の変更をレビューしたいとき（「Xからレビューして」）",
        "implement・implement-specの内部",
      ],
      input: "固定点（指定が無ければ聞かれる）",
      output: ["## Standardsと## Specの2節の報告", "軸ごとの件数と最も重い指摘"],
      steps: [
        "固定点を確定し、差分が空でないことを確かめる",
        "仕様の出所を探す（コミットのissue参照→引数→docs/・specs/・.scratch/→ユーザーに聞く）",
        "規約文書を集め、加えてFowlerのコードの臭い12種を基準にする（リポジトリの規約が優先）",
        "規約側と仕様側の2つのサブエージェントを並列に起動する",
        "2つの報告を混ぜず、順位も付け直さずに並べる",
      ],
      notes: [
        "報告までを行い、修正はしない。",
        "仕様が見つからなければSpec軸は省略される。",
      ],
      prev: ["implement", "implement-spec", "tdd", "diagnosing-bugs"],
      next: ["pr", "retro"],
    },

    pr: {
      category: "main",
      manual: false,
      summary:
        "PR本文を「Summary（最小の図）・Evidence（変更前後の証拠）・Merge Danger（後戻りできるか・影響範囲）」の雛形で書く。",
      when: ["PRを作るとき（エージェントが自動で使う）"],
      input: "差分と検証結果",
      output: ["PR本文"],
      steps: [
        "Summary: 擬似コード・呼び出しツリー・ファイルツリー・Mermaid・diffなど、要点が伝わる最小の図を選ぶ",
        "Evidence: 変更前後のスクリーンショット（最良）かテスト結果・出力を示す",
        "Merge Danger: 後戻りできる変更か（two-way door）できないか（one-way door）と、影響範囲を書く",
      ],
      notes: ["前置きを省き、GLOSSARY.mdの用語を使う。"],
      prev: ["implement", "implement-spec", "code-review"],
      next: ["retro"],
    },

    retro: {
      category: "main",
      manual: true,
      summary:
        "セッションを振り返り、コードではなくエージェントの作業環境（案内・自動チェック・規約・ツール）の改善候補を深刻度順に挙げる。",
      when: [
        "実装が一段落したとき（うまくいかなかったセッションのあとは特に）",
        "diagnosing-bugsでバグを直した直後",
        "レビューで見逃しが出たとき",
      ],
      input: "振り返るセッション（指定が無ければ現在のセッション）",
      output: ["深刻度順の改善候補の一覧（採用するかはユーザーが決める）"],
      steps: [
        "writing-for-agentsで書き方の基準を読み込む",
        "対象セッションの記録を読む",
        "観点ごとに候補を探す: ファイルの探しやすさ／自動チェック／コーディング規約／AGENTS.mdの肥大化／高コストなツール呼び出し／効果のない指示／情報へのアクセス",
        "深刻度順に提示する",
      ],
      notes: [
        "機械的に判定できる違反はLintルールやpre-commitフックとして作り、判断が必要なものだけCODING_STANDARDS.mdに書く。",
        "pre-commitフックもCIも無いリポジトリは、それ自体が指摘対象。",
        "/clearする前に、振り返る対象のセッション内で実行する。/clear後はそのセッションのログを指定する。",
      ],
      prev: ["implement", "implement-spec", "pr", "diagnosing-bugs"],
      next: ["improve-codebase-architecture"],
      uses: ["writing-for-agents"],
    },

    triage: {
      category: "onramp",
      manual: true,
      summary:
        "issue trackerのissue（設定すれば外部PRも）を分類・再現確認・質問し、状態ラベルを付けて、エージェントが着手できる作業指示（agent brief）を書く。",
      when: [
        "外部から届いたバグ報告・機能要望が溜まっているとき",
        "クライアントからの報告を処理したいとき（先にissueとして登録する）",
      ],
      input: "自然文の指示（例: 「対応が必要なものを見せて」「#42を見よう」「#42をready-for-agentに」）",
      output: [
        "分類ラベル（bug／enhancement）と状態ラベル（needs-triage／needs-info／ready-for-agent／ready-for-human／wontfix）",
        "agent brief、確認事項のコメント、または理由付きのクローズ",
        "却下した要望の記録（.out-of-scope/）",
      ],
      steps: [
        "issueとコードを調べ、既に実装済みでないか、過去に却下した要望に似ていないかを確認する",
        "分類と状態を推奨し、ユーザーの指示を待つ",
        "主張を検証する（バグなら報告どおりに再現を試みる）",
        "必要ならgrillingとdomain-modelingで中身を詰める（答えるのはメンテナー）",
        "結果を反映する（ready-for-agentならagent brief、needs-infoなら報告者への質問、wontfixなら理由を書いて閉じる）",
      ],
      notes: [
        "issueを新規作成する手順は無い。クライアントのメッセージは先にissueとして登録する。",
        "needs-infoの質問は報告者宛てにissue上へ書かれる。クライアントがtrackerを見ないなら転送と回答の追記は自分で行う。",
        "公開リポジトリをtrackerにしているとクライアントの文面が公開されるので注意。",
        "投稿には「AIが生成した」という但し書きが付く。",
        "to-ticketsが作ったチケットはtriageしない。",
      ],
      prev: ["setup-matt-pocock-skills"],
      next: ["implement", "grill-with-docs"],
      uses: ["grilling", "domain-modeling"],
    },

    "diagnosing-bugs": {
      category: "onramp",
      manual: false,
      summary:
        "難しいバグや性能劣化を、まず「このバグで確実に失敗するコマンド」を作ってから診断し、回帰テスト付きで修正する。",
      when: [
        "ひと目では原因が分からないバグ",
        "ときどきしか起きないバグ",
        "ある時点から壊れた・遅くなったとき",
      ],
      input: "症状（エラー・期待と実際の動作）と再現手順",
      output: ["修正と回帰テスト（コミットはしない）", "正しかった仮説（コミットメッセージやPRに書く材料）"],
      steps: [
        "Phase 1: 確実に失敗するコマンドを作る（一度実行済み・報告どおりの症状・毎回同じ結果・数秒・無人で実行可能）",
        "Phase 2: 失敗を再現し、どれを削っても失敗しなくなるまで条件を削る",
        "Phase 3: 検証できる仮説を3〜5個、可能性の高い順に並べてユーザーに見せる",
        "Phase 4: 予測1つにつき1つ観測を入れる（ログには[DEBUG-xxxx]の接頭辞）",
        "Phase 5: 回帰テストを先に書いて失敗を確認し、修正して成功を確認する",
        "Phase 6: デバッグ用ログと試作を片付ける",
      ],
      notes: [
        "Phase 1のコマンドが作れなければ推測に進まず止まり、再現環境・ログ・一時的な計測の許可を求める。",
        "修正前に承認を求める手順は無い。止めてほしい場合は起動時に指示する。",
        "回帰テストを置ける適切な境界が無いこと自体が発見。improve-codebase-architectureの候補になる。",
        "出力中の秘密情報は<REDACTED>に置き換える。",
      ],
      prev: ["triage"],
      next: ["code-review", "retro", "improve-codebase-architecture"],
    },

    wayfinder: {
      category: "onramp",
      manual: true,
      summary:
        "1セッションに収まらず道筋も見えない大きな取り組みを、issue tracker上の「地図」と「決定チケット」で1件ずつ決めていき、道筋が見えたら主フローへ渡す。",
      when: [
        "grill-with-docsで詰めている途中で、想定より大きい・不明点（霧）が多いと分かったとき",
        "grillingのセッションがsmart zone（鋭く考えられる範囲、約150kトークン）を超えそうなとき",
      ],
      input: "進行中のgrillingセッション（「/wayfinder ここまでの内容を地図にして」と言う）／地図のURLか番号（作業時）",
      output: [
        "地図issue（wayfinder:mapラベル。目的地・メモ・決定済み一覧・未特定・対象外）",
        "決定チケット（子issue。research／prototype／grilling／taskの4種）",
      ],
      steps: [
        "地図作成: 目的地を決める→全体を広く洗い出す→地図を作る→決められるチケットを作って依存を張る→researchチケットを並列で調べさせる",
        "作業: 地図を読む→着手できるチケットを1件選んで自分に割り当てる→種類どおりに解決する→結果をコメントして閉じ、地図に追記する→新しく見えたチケットを追加する",
      ],
      notes: [
        "最初からwayfinderで始めない。詰めてみたら解決策が単純だった場合、作った地図とチケットが無駄になる。必ずgrill-with-docsから始める（作者の推奨）。",
        "1セッションで解決するのは1チケットだけ（researchを除く）。",
        "作るのは成果物ではなく決定。道筋が見えたらto-specへ渡す。",
        "洗い出しても不明点が無ければ地図は不要。",
      ],
      prev: ["grill-with-docs", "setup-matt-pocock-skills"],
      next: ["to-spec"],
      sources: ["x-2026-10-08"],
      uses: ["grilling", "domain-modeling", "research", "prototype"],
    },

    "improve-codebase-architecture": {
      category: "health",
      manual: true,
      summary:
        "最近よく変更される箇所を中心にコードベースを調べ、浅いモジュールを深くするリファクタ候補をHTMLレポートで示し、選んだ候補を一緒に詰める。",
      when: [
        "手が空いたとき（コードベースをエージェントが扱いやすく保つ）",
        "diagnosing-bugsやretroで、テストを置ける境界が無いと分かったとき",
      ],
      input: "（任意）見てほしいモジュールや悩み",
      output: [
        "OSの一時ディレクトリのarchitecture-review-<timestamp>.html（リポジトリには置かない）",
        "GLOSSARY.md・ADRの更新",
      ],
      steps: [
        "調べる範囲を決め（指定が無ければgit logで変更の多い箇所）、サブエージェントで探索する",
        "候補ごとにファイル・問題・解決策・利点・Before/After図・推奨度をカードにしたレポートを開く",
        "選んだ候補をgrillingとdomain-modelingで詰める",
      ],
      notes: [
        "インターフェースの提案は、候補を選んだあとに行う。",
        "結論はgrill-with-docsで主フローに乗せる。",
      ],
      prev: ["retro", "diagnosing-bugs"],
      next: ["grill-with-docs", "codebase-design"],
      uses: ["codebase-design", "grilling", "domain-modeling"],
    },

    "codebase-design": {
      category: "vocab",
      manual: false,
      summary:
        "深いモジュール（小さなインターフェースの裏に多くの振る舞い）を設計するための共通語彙と原則。",
      when: [
        "モジュールのインターフェースを設計・改善するとき",
        "テストの境界（seam）をどこに置くか決めるとき",
        "tdd・improve-codebase-architectureの内部",
      ],
      input: "設計中のモジュール",
      output: ["共通語彙に沿った設計の議論"],
      steps: [
        "語彙: module／interface／implementation／depth／seam／adapter／leverage／locality",
        "削除テスト: それを消すと複雑さが1箇所に集まるか、他へ移るだけかを見る",
        "代替案は並列に2つ設計して比べる（design it twice）",
      ],
      notes: ["component・service・API・boundaryと言い換えない。手順ではなく参照する語彙集。"],
      prev: [],
      next: [],
    },

    prototype: {
      category: "standalone",
      manual: false,
      summary: "設計上の問いを1つ答えるための使い捨てコードを作る。",
      when: [
        "状態モデルやロジックが正しいか確かめたいとき",
        "UIをどうするか探りたいとき",
        "grill-with-docs中に会話では決まらない問いが出たとき",
        "wayfinderのprototypeチケット",
      ],
      input: "答えたい問い",
      output: [
        "ロジック: ダブルクリックで開ける単一HTML（自由操作ボタン＋ガイド付きシナリオ）",
        "UI: 1つのルート上でURLパラメータで切り替えられる、大きく異なる複数案",
      ],
      steps: [
        "問いがロジックかUIかを決める",
        "使い捨てと分かる名前で、使う場所の近くに作る（1コマンドで起動・永続化なし・磨かない・状態を常に表示）",
        "決まったことを本体へ反映し、試作はprototype/<name>ブランチに残してissueから参照する",
      ],
      notes: ["別ディレクトリで作業する場合はhandoffで行き来する。"],
      prev: ["handoff", "wayfinder"],
      next: ["handoff", "to-spec"],
    },

    handoff: {
      category: "standalone",
      manual: true,
      summary:
        "現在の会話を、別のエージェントが続きから始められる引き継ぎ文書にまとめ、OSの一時ディレクトリに保存する。",
      when: [
        "別のハーネスへ移るとき（Claude→Codexなど）",
        "別のディレクトリ・リポジトリへ移るとき（prototypeへの寄り道など）",
        "同僚へ渡すとき",
        "作業途中で見つけた別タスクを切り出すとき",
      ],
      input: "（任意）次のセッションで何をするか",
      output: ["$TMPDIRの引き継ぎMarkdown（次に使うべきスキルの節付き）"],
      steps: [
        "会話を要約し、仕様・ADR・issueなどにある内容は複製せずパスやURLで参照する",
        "秘密情報を伏せて一時ディレクトリに保存する",
      ],
      notes: ["何も移動しないなら不要。同じ場所で続けるならcontinue・/compactを先に検討する。"],
      prev: ["grill-with-docs", "prototype"],
      next: ["prototype", "grill-with-docs"],
    },

    research: {
      category: "standalone",
      manual: false,
      summary:
        "バックグラウンドのエージェントが一次情報（公式ドキュメント・ソース・仕様）を調べ、出典付きのMarkdownをリポジトリに残す。",
      when: ["外部APIやライブラリの事実が必要なとき", "wayfinderのresearchチケット"],
      input: "調べたい問い",
      output: ["出典付きのMarkdown1ファイル（リポジトリの既存の置き場所に合わせる）"],
      steps: [
        "バックグラウンドのエージェントを起動する（その間も作業を続けられる）",
        "一次情報で調べ、主張ごとに出典を付けて書く",
      ],
      notes: ["結果は考える材料。grill-with-docsに持ち込んで判断する。"],
      prev: ["wayfinder"],
      next: ["grill-with-docs"],
    },

    "to-questionnaire": {
      category: "standalone",
      manual: true,
      summary: "自分だけでは答えられない判断について、知っている相手に渡す質問票（Markdown）を作る。",
      when: ["必要な情報がクライアント・同僚など他人の頭の中にあるとき"],
      input: "送る相手と、返してほしい情報（聞かれて答える）",
      output: ["to-questionnaire-<slug>.md（現在のディレクトリ）"],
      steps: [
        "誰に送るか（役割・専門・関係）を答える",
        "何が返ってくれば判断できるかを答える",
        "重要な質問から順に並べた質問票が書かれる",
      ],
      notes: ["聞かれるのは送付先と欲しい答えだけで、主題そのものは聞かれない。非同期でも会議でも使える。"],
      prev: [],
      next: ["grill-with-docs", "to-spec"],
    },

    wizard: {
      category: "standalone",
      manual: false,
      summary:
        "人間にしかできない手順（インフラ準備・認証情報・CIシークレット・外部ダッシュボード操作・一回限りの移行）を1段ずつ案内する対話型bashスクリプトを作る。",
      when: ["エージェント自身では実行できず、人間の操作が必要な手順があるとき"],
      input: "手順の目的（リポジトリの.env・CI設定などは自動で調べる）",
      output: ["URLを開き、値を受け取り、.envやGitHub secretsに書き込むbashスクリプト"],
      steps: [
        "手順と取得する値を洗い出し、順序を確認する",
        "各段で人が辿る操作経路を具体的に書く",
        "テンプレートから各段を作る",
        "構文チェックし、静的に追跡して確認する（自分では実行しない）",
      ],
      notes: [
        "エージェントが自分でできる作業には使わない。",
        "既定は使い捨て。繰り返す手順ならコミットしてREADMEから案内する。",
      ],
      prev: [],
      next: [],
    },

    "wait-what": {
      category: "standalone",
      manual: true,
      summary:
        "直前の説明が分からなかったとき、文脈を足して簡潔な技術英語（ASD-STE100）とGLOSSARY.mdの用語で言い直させる。",
      when: ["どのスキルの途中でも、エージェントの説明が理解できなかったとき"],
      input: "なし",
      output: ["言い直した説明"],
      steps: ["文脈を補い、簡潔な技術英語と用語集の語彙で言い直す"],
      notes: [
        "指示文が英語の言い直しを求めているため、英語で返ることがある。",
        "予防策はgrill-with-docsで早めに共通の用語を揃えておくこと。",
      ],
      prev: [],
      next: [],
    },

    teach: {
      category: "standalone",
      manual: true,
      summary: "現在のディレクトリを学習用ワークスペースにして、テーマを複数セッションで学ぶ。",
      when: ["概念や技能を継続的に学びたいとき"],
      input: "学びたいテーマ",
      output: [
        "MISSION.md（学ぶ理由）・RESOURCES.md（教材）・NOTES.md",
        "lessons/*.html（1テーマ1ファイルの短いレッスン）",
        "reference/*.html（早見表）・learning-records/*.md（学習記録）",
      ],
      steps: [
        "学ぶ理由と信頼できる教材を集める",
        "理解の段階に合った短いレッスンをHTMLで作り、学習記録を残す",
      ],
      notes: ["想起練習・間隔反復・交互練習で長期記憶を狙う。"],
      prev: [],
      next: [],
    },

    "writing-for-agents": {
      category: "standalone",
      manual: false,
      summary:
        "エージェントが読む文書（スキル・AGENTS.md・CLAUDE.md・参照文書）の書き方の基準。",
      when: ["スキルを作る・直すとき", "AGENTS.mdやCLAUDE.mdを編集するとき", "retroの内部"],
      input: "書く・直す文書",
      output: ["基準に沿った文書"],
      steps: [
        "参照を示す一行（context pointer）は、何があり、どの場合に読むかを書く",
        "常に読み込まれる記述の負荷（context load）と、人が覚える負荷（cognitive load）を比べる",
        "手順→本文中の参照→別ファイルの参照の順に配置を決める",
        "各手順に完了条件を付ける",
      ],
      notes: ["スキル固有の書き方（frontmatter・起動方式）はSKILL-MECHANICS.mdにある。"],
      prev: ["retro"],
      next: [],
    },

    "resolving-merge-conflicts": {
      category: "standalone",
      manual: false,
      summary:
        "進行中のmerge・rebaseの衝突を、各変更の意図を一次情報で確かめて解消し、チェックを通してコミットまで行う。",
      when: ["merge・rebaseで衝突が起きているとき"],
      input: "進行中のmerge・rebase",
      output: ["衝突を解消したコミット（rebaseなら最後まで継続）"],
      steps: [
        "merge・rebaseの状態と衝突ファイルを確認する",
        "コミットメッセージ・PR・issueから各変更の意図を確かめる",
        "両方の意図を残して解消する（両立しなければmergeの目的に合う方を選び、理由を記す）",
        "型検査・テスト・フォーマットを実行し、壊れた箇所を直す",
        "ステージしてコミットする",
      ],
      notes: ["--abortはしない。新しい振る舞いを作らない。"],
      prev: [],
      next: [],
    },
  },

  /**
   * 「目的から探す」のデータ。
   * steps[].skills はスキルID、branches は条件分岐（when の場合に skills を使う）。
   * seq: true のときは skills を順に使う（矢印で表示）。無ければ併用・選択肢として並べる。
   */
  goals: [
    {
      id: "start",
      sources: ["x-2026-10-08"],
      group: "plan",
      title: "新しい作業を、何から始めるか決めたい",
      summary: "差分の大きさで入口を選ぶ。大きくても最初はgrill-with-docsから始め、wayfinderは途中で切り替える。",
      steps: [
        {
          title: "差分は小さいか",
          desc: "エージェントの差分をすぐに確認でき、やり直しの手間がほぼ無いなら「小さい」。",
          branches: [
            {
              when: "小さい",
              skills: [],
              desc: "一発で頼む（one shot）: スキルを使わず直接頼んで一度で作らせる。事前に合わせず、差分を見てから合わせる",
            },
            { when: "小さくない", skills: ["grill-with-docs"], desc: "次の手順へ" },
          ],
        },
        {
          skills: ["grill-with-docs"],
          title: "作る前に詰め、ドメインの用語を固める",
          desc: "エージェントが違うものを作ってしまう事態を、作る前の擦り合わせで防ぐ。",
        },
        {
          title: "想定より大きいか",
          desc: "grillingがsmart zone（鋭く考えられる範囲、約150kトークン）を超えそう、または想定より不明点（霧）が多いなら「大きい」。",
          branches: [
            {
              when: "大きい",
              skills: ["wayfinder"],
              desc: "「/wayfinder ここまでの内容を地図にして」と言い、そのgrillingを地図に変えて進める",
            },
            {
              when: "大きくない",
              skills: ["grill-with-docs"],
              desc: "そのまま詰め続ける。終わったらto-spec、または1セッションで収まるならimplementへ",
            },
          ],
        },
      ],
      tips: [
        "最初から/wayfinderで始めない。詰めてみたら解決策が単純だった場合、作った地図とチケットが要らなくなる。",
      ],
    },
    {
      id: "first-time",
      group: "plan",
      title: "このスキル群を初めて使う",
      summary: "リポジトリごとに最初に1回だけ設定する。",
      steps: [
        {
          skills: ["setup-matt-pocock-skills"],
          title: "trackerと文書の置き場所を設定する",
          desc: "issue tracker（GitHub・GitLab・ローカルMarkdown）、トリアージラベル、用語集とADRの配置を決める。",
        },
        {
          skills: ["ask-matt"],
          title: "迷ったら案内役に聞く",
          desc: "状況を自然文で書くと、合うスキルと流れを教えてくれる。",
          optional: true,
        },
      ],
    },
    {
      id: "new-spec",
      sources: ["x-2026-10-08"],
      group: "plan",
      title: "新規アプリ・新機能の仕様を作りたい",
      summary: "詰める→仕様にする→チケットに分ける。差分が中〜大になる作業の場合。",
      steps: [
        {
          skills: ["setup-matt-pocock-skills"],
          title: "（初回のみ）リポジトリを設定する",
          desc: "to-specとto-ticketsはこの設定が無いと止まる。新規アプリなら先にリポジトリを作る。",
          optional: true,
        },
        {
          skills: ["grill-with-docs"],
          title: "インタビューで中身を詰める",
          desc: "推奨回答付きの質問にラウンドごとに答える。用語はGLOSSARY.md、重要な決定はADRに残る。",
          branches: [
            { when: "外部APIやライブラリの事実が必要", skills: ["research"], desc: "出典付きMarkdownにして持ち込む" },
            { when: "答えを他の人しか知らない", skills: ["to-questionnaire"], desc: "相手に渡す質問票を作る" },
            { when: "状態・ロジック・UIが会話で決まらない", seq: true, skills: ["handoff", "prototype", "handoff"], desc: "別セッションで試作し、結果を戻す" },
            { when: "想定より大きい・不明点が多い", skills: ["wayfinder"], desc: "「/wayfinder ここまでの内容を地図にして」で地図に切り替える" },
          ],
        },
        {
          title: "複数セッションにまたがるか判断する",
          desc: "収まるなら仕様を作らず、同じセッションでそのままimplementする。",
          branches: [
            { when: "1セッションで収まる", skills: ["implement"], desc: "同じコンテキストのまま実装する" },
            { when: "複数セッションにまたがる", skills: ["to-spec"], desc: "次の手順へ" },
          ],
        },
        {
          skills: ["to-spec"],
          title: "仕様issueにまとめる",
          desc: "インタビューはせず会話を統合する。テストの境界だけ確認され、仕様issueが1件公開される。",
        },
        {
          skills: ["to-tickets"],
          title: "縦切りのチケットに分ける",
          desc: "粒度と依存をユーザーと確認し、承認後にチケットを公開する。",
        },
        {
          title: "実装する",
          desc: "ここで初めてコンテキストを切ってよい。",
          branches: [
            { when: "1件ずつ自分で回す", skills: ["implement"], desc: "チケットごとに/clearして実行" },
            { when: "全体をまとめて任せる", skills: ["implement-spec"], desc: "並列サブエージェントで統合ブランチへ" },
          ],
        },
      ],
      tips: [
        "差分が小さい変更なら、詰めずに一発で頼んでよい（「新しい作業を、何から始めるか決めたい」を参照）。",
        "grill-with-docsからto-ticketsまでは同じセッションで続け、/compactも/clearもしない。",
        "コンテキストが約150kトークンに近づいたら、手順の切れ目で/compactする。",
      ],
    },
    {
      id: "foggy",
      sources: ["x-2026-10-08"],
      group: "plan",
      title: "詰めている途中で、想定より大きいと分かった",
      summary: "大きな取り組みでも最初はgrill-with-docsから始め、途中でwayfinderの地図に切り替える。",
      steps: [
        {
          skills: ["grill-with-docs"],
          title: "まず通常どおり詰める",
          desc: "最初から地図を作ると、解決策が単純だった場合に地図とチケットが無駄になる。",
        },
        {
          skills: ["wayfinder"],
          title: "grillingを地図に変える",
          desc: "「/wayfinder ここまでの内容を地図にして」と言う。目的地を決め、全体を広く洗い出し、地図issueと決定チケットを作る。researchチケットは並列で調べ始める（issue trackerの設定が必要）。",
        },
        {
          skills: ["wayfinder"],
          title: "決定チケットを1セッション1件ずつ解決する",
          desc: "地図のURLか番号を渡すと、着手できるチケットを選んで種類どおりに解決する。",
          branches: [
            { when: "researchチケット", skills: ["research"], desc: "一次情報を調べる（AFK）" },
            { when: "prototypeチケット", skills: ["prototype"], desc: "試作して反応を見る" },
            { when: "grillingチケット", skills: ["grilling", "domain-modeling"], desc: "会話で決める" },
          ],
        },
        {
          skills: ["to-spec"],
          title: "道筋が見えたら仕様にまとめる",
          desc: "地図に散らばった決定を1つの実装計画に集約する。ここを飛ばすと決定の詳細が失われる。",
        },
        {
          seq: true,
          skills: ["to-tickets", "implement-spec"],
          title: "チケットに分けて実装する",
          desc: "以降は通常の主フローと同じ。",
        },
      ],
      tips: [
        "洗い出しても不明点が無ければ、地図は作らずgrill-with-docsを続ける。",
        "切り替えの目安: grillingがsmart zone（約150kトークン）を超えそう、または想定より不明点が多い。",
      ],
    },
    {
      id: "spec-revision",
      group: "plan",
      title: "既存の仕様を改定したい",
      summary: "流れは新規と同じ。既存の用語集・ADR・コードが判断材料に加わる。",
      steps: [
        {
          skills: ["grill-with-docs"],
          title: "改定内容を詰める",
          desc: "既存のGLOSSARY.mdやコードと食い違う発言はその場で指摘される。用語の意味が変われば用語集を更新し、覆しにくい決定を変えるならADRに残す。",
        },
        {
          skills: ["to-spec"],
          title: "改定を新しい仕様issueとして公開する",
          desc: "既存の仕様を書き換える手順は無い。関連ADRと用語に従って新しいissueを書く。",
        },
        {
          skills: ["to-tickets"],
          title: "チケットに分ける",
          desc: "既存issueを引数に渡すと、各チケットがそのsub-issueになる（親は変更しない）。",
          branches: [
            {
              when: "コード全体に及ぶ機械的な変更",
              skills: ["to-tickets"],
              desc: "新しい形を追加→呼び出し側を移行→旧い形を削除の3段に分ける",
            },
          ],
        },
        {
          skills: ["implement", "implement-spec"],
          title: "実装する",
          desc: "新規の場合と同じ。",
        },
      ],
    },
    {
      id: "small-change",
      sources: ["x-2026-10-08"],
      group: "build",
      title: "1セッションで終わる変更をしたい",
      summary: "仕様もチケットも作らない。差分の大きさで、詰めるかどうかを決める。",
      steps: [
        {
          title: "差分は小さいか",
          desc: "すぐに確認でき、やり直しの手間がほぼ無いなら「小さい」。",
          branches: [
            { when: "小さい", skills: [], desc: "一発で頼む: 詰めずに直接頼み、差分を見てから合わせる" },
            { when: "小さくない", skills: ["grill-with-docs"], desc: "次の手順へ" },
          ],
        },
        {
          seq: true,
          skills: ["grill-with-docs", "implement"],
          title: "詰めて、同じセッションのまま実装する",
          desc: "implementの内部でtdd→code-review→コミットまで進む。",
          optional: true,
        },
        { skills: ["pr"], title: "PRを書く", desc: "PRを作るときにエージェントが自動で使う。", optional: true },
      ],
    },
    {
      id: "test-first",
      group: "build",
      title: "仕様なしで、振る舞いをテスト先行で作りたい",
      summary: "具体的な振る舞いが決まっていれば、tddだけで進められる。",
      steps: [
        {
          skills: ["tdd"],
          title: "テストの境界を合意し、1テスト→1実装を繰り返す",
          desc: "境界の形そのものが問題ならcodebase-designの語彙を使う。",
        },
        { skills: ["code-review"], title: "差分をレビューする", desc: "固定点を指定して規約と仕様の2軸で確認する。", optional: true },
      ],
    },
    {
      id: "review",
      group: "build",
      title: "変更をレビューしたい",
      summary: "固定点からの差分を、規約と仕様の2軸で見る。",
      steps: [
        {
          skills: ["code-review"],
          title: "固定点を指定してレビューする",
          desc: "例: 「mainからレビューして」。仕様はコミットのissue参照などから自動で探される。報告のみで修正はしない。",
        },
        { skills: ["retro"], title: "見逃しがあれば環境を直す", desc: "規約の追加や自動チェックの作成を検討する。", optional: true },
      ],
    },
    {
      id: "write-pr",
      group: "build",
      title: "PRの本文を書きたい",
      summary: "最小の図・前後の証拠・後戻りできるかを書く。",
      steps: [
        {
          skills: ["pr"],
          title: "雛形で本文を書く",
          desc: "Summary（最小の図）・Evidence（前後の証拠）・Merge Danger（one-way／two-way door、影響範囲）。",
        },
      ],
    },
    {
      id: "merge-conflict",
      group: "build",
      title: "merge・rebaseの衝突を解消したい",
      summary: "各変更の意図を確かめて両立させる。",
      steps: [
        {
          skills: ["resolving-merge-conflicts"],
          title: "意図を確かめて解消し、チェックを通してコミットする",
          desc: "--abortはしない。rebaseなら最後まで継続する。",
        },
      ],
    },
    {
      id: "bug",
      group: "fix",
      title: "バグを直したい",
      summary: "原因が見えるかどうかで使うスキルが分かれる。",
      steps: [
        {
          title: "入口を選ぶ",
          desc: "外部から届いた報告なら、先にtriageで分類と再現確認をする。",
          branches: [
            { when: "外部から届いた報告", skills: ["triage"], desc: "issue化してから分類・再現確認" },
            { when: "自分で見つけたバグ", skills: [], desc: "そのまま次へ" },
          ],
        },
        {
          title: "修正する",
          desc: "diagnosing-bugsは修正と回帰テストまで行うが、コミットはしない。",
          branches: [
            { when: "原因が見えない・ときどき起きる・ある時点から壊れた", skills: ["diagnosing-bugs"], desc: "確実に失敗するコマンドから始める" },
            { when: "原因の見当がついている", skills: ["tdd"], desc: "再現テスト→修正" },
          ],
        },
        { skills: ["code-review"], title: "差分をレビューする", desc: "必要に応じて。", optional: true },
        {
          skills: ["retro"],
          title: "同じセッションで振り返る",
          desc: "そのバグを事前に防げた仕組み（自動チェック・規約）を探す。",
        },
        {
          skills: ["improve-codebase-architecture"],
          title: "回帰テストを置く境界が無かったら設計を見直す",
          desc: "境界が無いこと自体が設計上の問題として扱われる。",
          optional: true,
        },
      ],
    },
    {
      id: "incoming",
      group: "fix",
      title: "クライアント・外部からの報告や要望を処理したい",
      summary: "issue trackerに登録し、triageでエージェントが着手できる状態にする。",
      steps: [
        {
          title: "issueとして登録する",
          desc: "triageにはissueを新規作成する手順が無い。クライアントのメッセージを本文にして登録する（公開リポジトリなら内容が公開される点に注意）。",
        },
        {
          skills: ["triage"],
          title: "分類・再現確認・状態の確定",
          desc: "例: 「#42を見よう」。",
          branches: [
            { when: "ready-for-agent", skills: ["implement"], desc: "agent briefを元に実装する" },
            { when: "needs-info", skills: [], desc: "質問をクライアントへ転送し、回答をissueに追記して再度triage" },
            { when: "仕様改定に相当する大きな要望", seq: true, skills: ["grill-with-docs", "to-spec"], desc: "仕様を作る流れへ" },
          ],
        },
      ],
    },
    {
      id: "design-question",
      group: "assist",
      title: "紙の上では決まらない設計の問いを確かめたい",
      summary: "状態モデル・ロジック・UIを、使い捨てのコードで確かめる。",
      steps: [
        { skills: ["handoff"], title: "引き継ぎ文書を書き出す", desc: "試作は別ディレクトリで行うため。" },
        {
          skills: ["prototype"],
          title: "新しいセッションで試作する",
          desc: "ロジックなら単一HTML、UIなら切り替え可能な複数案。",
        },
        { skills: ["handoff"], title: "分かったことを元のスレッドへ戻す", desc: "元の会話から参照する。" },
      ],
    },
    {
      id: "research",
      group: "assist",
      title: "外部の仕様・APIの事実を調べたい",
      summary: "一次情報で調べ、出典付きで残す。",
      steps: [
        { skills: ["research"], title: "バックグラウンドで調べさせる", desc: "その間も作業を続けられる。" },
        { skills: ["grill-with-docs"], title: "結果を判断材料にする", desc: "調査結果は考える材料で、判断そのものではない。" },
      ],
    },
    {
      id: "ask-others",
      group: "assist",
      title: "他の人しか知らない情報を集めたい",
      summary: "相手に渡す質問票を作る。",
      steps: [
        { skills: ["to-questionnaire"], title: "質問票を作る", desc: "答えるのは送付先と欲しい答えだけ。" },
        { seq: true, skills: ["grill-with-docs", "to-spec"], title: "返ってきた回答を持ち込む", desc: "仕様を詰める材料にする。" },
      ],
    },
    {
      id: "architecture",
      group: "health",
      title: "コードベースの設計を健全に保ちたい",
      summary: "リファクタ候補を探し、選んだものを詰めて主フローに乗せる。",
      steps: [
        {
          skills: ["improve-codebase-architecture"],
          title: "候補をHTMLレポートで見る",
          desc: "変更の多い箇所を中心に、浅いモジュールを深くする候補が並ぶ。",
        },
        { skills: ["codebase-design"], title: "選んだ候補のインターフェースを設計する", desc: "共通語彙で議論し、必要なら代替案を並列に設計する。" },
        { skills: ["grill-with-docs"], title: "主フローに乗せる", desc: "以降は仕様作成の流れと同じ。" },
      ],
    },
    {
      id: "terms",
      group: "health",
      title: "用語を整理したい・ADRを書きたい",
      summary: "用語集と決定記録を鍛える。",
      steps: [
        {
          skills: ["domain-modeling"],
          title: "曖昧な用語を正し、GLOSSARY.mdとADRを更新する",
          desc: "ADRは「覆しにくい」「理由が自明でない」「トレードオフの結果」の3条件が揃ったときだけ。",
        },
      ],
    },
    {
      id: "retro",
      group: "health",
      title: "作業後に、次回のための環境を改善したい",
      summary: "コードではなく、案内・自動チェック・規約・ツールを直す。",
      steps: [
        {
          skills: ["retro"],
          title: "セッションを振り返る",
          desc: "/clearする前に同じセッションで実行する。候補を深刻度順に提示し、採用はユーザーが決める。",
        },
        { skills: ["writing-for-agents"], title: "AGENTS.mdや規約を書き直す", desc: "エージェントが読む文書の基準に沿って直す。", optional: true },
      ],
    },
    {
      id: "phase-boundary",
      group: "assist",
      title: "作業の切れ目で、続けるか切り替えるか決めたい",
      summary: "上から順に判断し、最初に「はい」になったものを選ぶ。",
      steps: [
        { title: "1. このまま続けられるか", desc: "次の作業が今の会話そのものを必要とする、または残り容量が足りるなら、そのまま続ける。" },
        { title: "2. 今の文脈は次に無関係か", desc: "無関係なら/clear。関係ある文脈を消すと「なぜ」が失われるので注意。" },
        {
          skills: ["handoff"],
          title: "3. 引き継ぎが必要か",
          desc: "別ハーネス・別ディレクトリ・同僚へ渡す・途中で別タスクを切り出す、のいずれかならhandoff。",
        },
        { title: "4. 無人で任せられるか", desc: "範囲が明確なら（自動レビューなど）サブエージェントに任せる。" },
        { title: "5. それ以外は/compact", desc: "次の作業内容を添えて実行する（例: /compact 次はこの領域をQAする）。" },
      ],
    },
    {
      id: "manual-steps",
      group: "assist",
      title: "人間にしかできない手順を案内させたい",
      summary: "認証情報・CIシークレット・外部ダッシュボード・一回限りの移行など。",
      steps: [
        { skills: ["wizard"], title: "対話型bashスクリプトを作らせる", desc: "URLを開き、値を受け取り、.envやGitHub secretsへ書く。" },
      ],
    },
    {
      id: "didnt-get-it",
      group: "assist",
      title: "エージェントの説明が分からなかった",
      summary: "文脈を足して言い直させる。",
      steps: [{ skills: ["wait-what"], title: "言い直させる", desc: "どのスキルの途中でも使える。英語で返ることがある。" }],
    },
    {
      id: "plan-outside-repo",
      group: "assist",
      title: "リポジトリの外で、計画や文章を詰めたい",
      summary: "記録を残さないインタビュー。",
      steps: [{ skills: ["grill-me"], title: "インタビューで詰める", desc: "リポジトリがあるならgrill-with-docsを使う。" }],
    },
    {
      id: "learn",
      group: "assist",
      title: "テーマを複数セッションで学びたい",
      summary: "現在のディレクトリを学習用ワークスペースにする。",
      steps: [{ skills: ["teach"], title: "学びたいテーマを渡す", desc: "レッスン・早見表・学習記録がHTMLとMarkdownで残る。" }],
    },
    {
      id: "agent-docs",
      group: "assist",
      title: "スキルやAGENTS.mdを書きたい",
      summary: "エージェントが読む文書の書き方の基準を使う。",
      steps: [{ skills: ["writing-for-agents"], title: "基準に沿って書く", desc: "参照の一行・負荷の配分・情報の配置・完了条件。" }],
    },
  ],

  /** 「全体フロー」の主フロー。lane は駅の横に並べる支線。 */
  mainFlow: [
    {
      skills: ["setup-matt-pocock-skills"],
      label: "前提",
      desc: "リポジトリごとに1回。",
    },
    {
      skills: ["grill-with-docs"],
      label: "詰める",
      desc: "インタビューで共通理解を作り、用語集とADRを残す。",
      side: [
        { label: "差分が小さいなら", skills: [], note: "詰めずに一発で頼む。差分を見てから合わせる" },
        { label: "詰める途中で想定より大きいと分かったら", skills: ["wayfinder"], note: "「/wayfinder ここまでの内容を地図にして」で地図に切り替え、晴れたらto-specへ合流" },
        { label: "材料を集める", skills: ["research", "to-questionnaire"] },
        { label: "会話で決まらない問い", seq: true, skills: ["handoff", "prototype", "handoff"] },
      ],
    },
    {
      skills: ["to-spec"],
      label: "仕様にする",
      desc: "複数セッションにまたがる場合。1セッションで収まるならimplementへ直行。",
    },
    {
      skills: ["to-tickets"],
      label: "チケットに分ける",
      desc: "縦切り＋依存関係。ここまで同じセッションで続ける。",
    },
    {
      skills: ["implement", "implement-spec"],
      label: "実装する",
      desc: "内部でtdd→code-review。",
      side: [
        { label: "入口: 外部からの報告・要望", skills: ["triage"], note: "agent briefを作ってimplementへ" },
        { label: "内部で使う", skills: ["tdd", "code-review"] },
      ],
    },
    {
      skills: ["pr"],
      label: "PRを書く",
      desc: "PR作成時にエージェントが自動で使う。",
    },
    {
      skills: ["retro"],
      label: "振り返る",
      desc: "次回の環境を良くする。",
      side: [
        { label: "入口: 難しいバグ", skills: ["diagnosing-bugs"], note: "修正後にretroへ" },
        { label: "保守", skills: ["improve-codebase-architecture"], note: "候補はgrill-with-docsへ" },
      ],
    },
  ],
};
