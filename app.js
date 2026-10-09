/**
 * チートシートの描画とハッシュルーティング。
 *
 * ルート: #goal/<目的ID> / #skill/<スキルID> / #flow
 * データは data/cheatsheet.js の window.CHEATSHEET を使う。
 */
(() => {
  "use strict";

  const DATA = window.CHEATSHEET;
  if (!DATA) {
    throw new Error("data/cheatsheet.js が読み込まれていません");
  }

  const app = document.getElementById("app");
  const DEFAULT_GOAL = "start";
  const DEFAULT_SKILL = "grill-with-docs";

  /** スキル一覧の絞り込み状態（タブを移っても保持する）。 */
  const skillFilter = { query: "", category: "all" };

  /** @param {string} s */
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /**
   * データ内のスキル参照がすべて実在するか検査する。
   * 参照切れのまま描画すると壊れたリンクが黙って出るため、起動時に止める。
   * @returns {string[]} 問題の一覧
   */
  function validate() {
    const problems = [];
    const known = new Set(Object.keys(DATA.skills));
    const check = (ids, where) => {
      for (const id of ids || []) {
        if (!known.has(id)) problems.push(`${where}: 未定義のスキル「${id}」`);
      }
    };
    for (const [id, s] of Object.entries(DATA.skills)) {
      if (!DATA.categories[s.category]) problems.push(`skills.${id}: 未定義の分類「${s.category}」`);
      check(s.prev, `skills.${id}.prev`);
      check(s.next, `skills.${id}.next`);
      check(s.uses, `skills.${id}.uses`);
    }
    const groups = new Set(DATA.goalGroups.map((g) => g.id));
    const checkSources = (ids, where) => {
      for (const id of ids || []) {
        const src = DATA.sources[id];
        if (!src) problems.push(`${where}: 未定義の出典「${id}」`);
        else if (!/^https:\/\//.test(src.url)) problems.push(`sources.${id}: URLがhttps://で始まっていません`);
      }
    };
    for (const [id, s] of Object.entries(DATA.skills)) checkSources(s.sources, `skills.${id}.sources`);
    for (const g of DATA.goals) {
      if (!groups.has(g.group)) problems.push(`goals.${g.id}: 未定義のグループ「${g.group}」`);
      checkSources(g.sources, `goals.${g.id}.sources`);
      g.steps.forEach((st, i) => {
        check(st.skills, `goals.${g.id}.steps[${i}]`);
        (st.branches || []).forEach((b, j) => check(b.skills, `goals.${g.id}.steps[${i}].branches[${j}]`));
      });
    }
    DATA.mainFlow.forEach((st, i) => {
      check(st.skills, `mainFlow[${i}]`);
      (st.side || []).forEach((b, j) => check(b.skills, `mainFlow[${i}].side[${j}]`));
    });
    return problems;
  }

  /** スキルIDを分類色付きのリンクにする。 */
  function chip(id, large = false) {
    const s = DATA.skills[id];
    return `<a class="chip cat-${s.category}${large ? " large" : ""}" href="#skill/${esc(id)}" title="${esc(s.summary)}">/${esc(id)}</a>`;
  }

  /** スキル列を描画する。seq なら矢印でつなぎ、そうでなければ並べる。 */
  function chips(ids, seq = false) {
    if (!ids || ids.length === 0) return "";
    const sep = seq ? '<span class="arrow">→</span>' : "";
    return `<div class="chips">${ids.map((id) => chip(id)).join(sep)}</div>`;
  }

  function list(items, ordered = false) {
    if (!items || items.length === 0) return '<p class="empty">なし</p>';
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</${tag}>`;
  }

  /** SKILL.md 以外の出典をリンク付きで描画する。 */
  function sourcesHtml(ids) {
    if (!ids || ids.length === 0) return "";
    const links = ids
      .map((id) => DATA.sources[id])
      .map((src) => `<a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.label)}</a>`)
      .join("、");
    return `<p class="sources">出典: ${links}</p>`;
  }

  function setActiveTab(tab) {
    document.querySelectorAll(".tabs a").forEach((a) => {
      if (a.dataset.tab === tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- 目的から探す ---------- */

  function renderGoalView(goalId) {
    const goal = DATA.goals.find((g) => g.id === goalId);
    if (!goal) {
      location.replace(`#goal/${DEFAULT_GOAL}`);
      return;
    }
    const sidebar = DATA.goalGroups
      .map((grp) => {
        const items = DATA.goals
          .filter((g) => g.group === grp.id)
          .map(
            (g) =>
              `<li><a href="#goal/${esc(g.id)}"${g.id === goalId ? ' aria-current="true"' : ""}>${esc(g.title)}</a></li>`,
          )
          .join("");
        return `<h2>${esc(grp.label)}</h2><ul class="nav-list">${items}</ul>`;
      })
      .join("");

    const steps = goal.steps
      .map((st, i) => {
        const branches = (st.branches || [])
          .map(
            (b) => `<div class="branch">
              <div class="when">${esc(b.when)}</div>
              ${b.skills.length ? chips(b.skills, b.seq) : ""}
              ${b.desc ? `<p>${esc(b.desc)}</p>` : ""}
            </div>`,
          )
          .join("");
        return `<li class="stop${st.optional ? " optional" : ""}">
          <div class="stop-marker">${i + 1}</div>
          <div>
            <div class="stop-title">${esc(st.title)}${st.optional ? '<span class="opt-tag">必要なら</span>' : ""}</div>
            ${chips(st.skills, st.seq)}
            ${st.desc ? `<p>${esc(st.desc)}</p>` : ""}
            ${branches ? `<div class="branches">${branches}</div>` : ""}
          </div>
        </li>`;
      })
      .join("");

    const tips = goal.tips
      ? `<div class="tips"><strong>コツ</strong>${list(goal.tips)}</div>`
      : "";

    app.innerHTML = `<div class="split">
      <aside class="sidebar">${sidebar}</aside>
      <article class="panel">
        <h2>${esc(goal.title)}</h2>
        <p class="lead">${esc(goal.summary)}</p>
        <ol class="route">${steps}</ol>
        ${tips}
        ${sourcesHtml(goal.sources)}
      </article>
    </div>`;
  }

  /* ---------- スキルから探す ---------- */

  /** 絞り込み条件に合うスキルIDを分類順で返す。 */
  function filteredSkills() {
    const q = skillFilter.query.trim().toLowerCase();
    const order = Object.keys(DATA.categories);
    return Object.entries(DATA.skills)
      .filter(([id, s]) => skillFilter.category === "all" || s.category === skillFilter.category)
      .filter(([id, s]) => {
        if (!q) return true;
        const hay = [id, s.summary, ...(s.when || [])].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => order.indexOf(a[1].category) - order.indexOf(b[1].category) || a[0].localeCompare(b[0]))
      .map(([id]) => id);
  }

  function skillNavHtml(currentId) {
    const ids = filteredSkills();
    if (ids.length === 0) return '<p class="empty">該当するスキルがありません</p>';
    return `<ul class="nav-list">${ids
      .map((id) => {
        const s = DATA.skills[id];
        return `<li><a href="#skill/${esc(id)}"${id === currentId ? ' aria-current="true"' : ""}>/${esc(id)}<span class="nav-sub"><span class="badge cat cat-${s.category}">${esc(DATA.categories[s.category].label)}</span><span class="badge invoke" title="${s.manual ? "/" + esc(id) + "と打ったときだけ起動" : "会話の内容から自動でも起動"}">${s.manual ? "手動のみ" : "自動でも"}</span></span></a></li>`;
      })
      .join("")}</ul>`;
  }

  function renderSkillView(skillId) {
    const s = DATA.skills[skillId];
    if (!s) {
      location.replace(`#skill/${DEFAULT_SKILL}`);
      return;
    }
    const cat = DATA.categories[s.category];
    const filterButtons = [["all", "すべて"], ...Object.entries(DATA.categories).map(([k, v]) => [k, v.label])]
      .map(
        ([k, label]) =>
          `<button type="button" data-cat="${esc(k)}" aria-pressed="${skillFilter.category === k}">${esc(label)}</button>`,
      )
      .join("");

    // このスキルを内部で使うスキル（uses の逆引き）
    const usedBy = Object.entries(DATA.skills)
      .filter(([, o]) => (o.uses || []).includes(skillId))
      .map(([id]) => id);
    // このスキルが登場する目的
    const goals = DATA.goals.filter((g) =>
      g.steps.some((st) => (st.skills || []).includes(skillId) || (st.branches || []).some((b) => b.skills.includes(skillId))),
    );

    const col = (label, ids, cls) =>
      `<div class="col ${cls}"><span class="col-label">${label}</span>${ids && ids.length ? ids.map((id) => chip(id)).join("") : '<span class="empty">なし</span>'}</div>`;

    app.innerHTML = `<div class="split">
      <aside class="sidebar">
        <input class="search" type="search" name="skill-query" placeholder="スキル名・キーワードで検索" value="${esc(skillFilter.query)}" aria-label="スキルを検索" />
        <div class="filters">${filterButtons}</div>
        <div id="skill-nav">${skillNavHtml(skillId)}</div>
      </aside>
      <article class="panel">
        <div class="badges">
          <span class="badge cat cat-${s.category}" title="${esc(cat.desc)}">${esc(cat.label)}</span>
          <span class="badge">${s.manual ? "手動で起動（/" + esc(skillId) + "と打つ）" : "自動でも起動（会話の内容で呼ばれる）"}</span>
        </div>
        <h2>/${esc(skillId)}</h2>
        <p class="lead">${esc(s.summary)}</p>

        <h3 class="section-title">前後の流れ</h3>
        <div class="neighbors">
          ${col("前に使う", s.prev, "prev")}
          <div class="col"><span class="col-label self-label">このスキル</span><div class="self-row"><span class="arrow">→</span>${chip(skillId)}<span class="arrow">→</span></div></div>
          ${col("次に使う", s.next, "next")}
        </div>

        <div class="detail-grid">
          <section>
            <h3 class="section-title">使う場面</h3>
            ${list(s.when)}
            <h3 class="section-title">渡すもの</h3>
            <p>${esc(s.input)}</p>
            <h3 class="section-title">できるもの</h3>
            ${list(s.output)}
          </section>
          <section>
            <h3 class="section-title">主な手順</h3>
            ${list(s.steps, true)}
            <h3 class="section-title">注意点</h3>
            ${list(s.notes)}
            ${sourcesHtml(s.sources)}
          </section>
        </div>

        <div class="detail-grid">
          <section>
            <h3 class="section-title">内部で使うスキル</h3>
            ${s.uses && s.uses.length ? chips(s.uses) : '<p class="empty">なし</p>'}
          </section>
          <section>
            <h3 class="section-title">このスキルを内部で使うスキル</h3>
            ${usedBy.length ? chips(usedBy) : '<p class="empty">なし</p>'}
          </section>
        </div>

        <h3 class="section-title">このスキルが登場する目的</h3>
        ${goals.length ? `<div class="goal-links">${goals.map((g) => `<a href="#goal/${esc(g.id)}">${esc(g.title)}</a>`).join("")}</div>` : '<p class="empty">なし</p>'}
      </article>
    </div>`;

    const search = app.querySelector(".search");
    search.addEventListener("input", () => {
      skillFilter.query = search.value;
      document.getElementById("skill-nav").innerHTML = skillNavHtml(skillId);
    });
    app.querySelectorAll(".filters button").forEach((btn) => {
      btn.addEventListener("click", () => {
        skillFilter.category = btn.dataset.cat;
        app.querySelectorAll(".filters button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        document.getElementById("skill-nav").innerHTML = skillNavHtml(skillId);
      });
    });
  }

  /* ---------- 全体フロー ---------- */

  function renderFlowView() {
    const legend = Object.entries(DATA.categories)
      .map(([k, v]) => `<span class="cat-${k}"><i></i>${esc(v.label)}: ${esc(v.desc)}</span>`)
      .join("");

    const sideClass = (b) => {
      const cats = b.skills.map((id) => DATA.skills[id].category);
      if (cats.includes("onramp")) return " onramp";
      if (cats.includes("health")) return " health";
      return "";
    };

    const stops = DATA.mainFlow
      .map(
        (st, i) => `<li class="stop">
          <div class="stop-marker">${i + 1}</div>
          <div class="stop-main">
            <div class="stop-title">${esc(st.label)}</div>
            <div class="chips">${st.skills.map((id) => chip(id, true)).join('<span class="arrow">／</span>')}</div>
            <p>${esc(st.desc)}</p>
          </div>
          <div class="side">${(st.side || [])
            .map(
              (b) => `<div class="branch${sideClass(b)}">
                <div class="when">${esc(b.label)}</div>
                ${chips(b.skills, b.seq)}
                ${b.note ? `<p>${esc(b.note)}</p>` : ""}
              </div>`,
            )
            .join("")}</div>
        </li>`,
      )
      .join("");

    app.innerHTML = `<article class="panel flow">
      <h2>主フロー: アイデア → 出荷</h2>
      <p class="lead">多くの作業はこの本流を通る。右側は合流する入口・寄り道・内部で使うスキル。どこから始めるかは<a href="#goal/start">「何から始めるか」</a>、作業の切れ目での判断は<a href="#goal/phase-boundary">「続けるか切り替えるか」</a>を参照。</p>
      <div class="legend">${legend}</div>
      <ol class="route">${stops}</ol>
      <div class="tips"><strong>コンテキストの扱い</strong>${list([
        "grill-with-docsからto-ticketsまでは1つのセッションで続ける（/compactも/clearもしない）。",
        "implementはチケットごとに/clearして新しく始める（チケットが自己完結しているため）。",
        "retroは振り返る対象のセッション内で、/clearする前に実行する。",
      ])}</div>
    </article>`;
  }

  /* ---------- ルーティング ---------- */

  function route() {
    const [tab, id] = location.hash.replace(/^#/, "").split("/");
    if (tab === "skill") {
      setActiveTab("skill");
      renderSkillView(id || DEFAULT_SKILL);
    } else if (tab === "flow") {
      setActiveTab("flow");
      renderFlowView();
    } else {
      setActiveTab("goal");
      renderGoalView(id || DEFAULT_GOAL);
    }
    window.scrollTo({ top: 0 });
  }

  const problems = validate();
  if (problems.length > 0) {
    app.innerHTML = `<article class="panel"><h2>データに問題があります</h2>${list(problems)}</article>`;
    throw new Error(`data/cheatsheet.js の検証に失敗しました:\n${problems.join("\n")}`);
  }

  document.getElementById("skill-count").textContent = `収録スキル${Object.keys(DATA.skills).length}件・目的${DATA.goals.length}件`;
  window.addEventListener("hashchange", route);
  route();
})();
