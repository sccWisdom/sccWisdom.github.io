const notesData = [
  {
    id: "2026-05-06-llm-training-inference",
    date: "2026-05-06",
    title: "训练方法与推理增强方法：如何区分与使用",
    category: "方法论",
    tags: ["训练", "SFT", "GRPO", "MCTS", "推理增强"],
    summary:
      "这条笔记的核心是先分清“训练阶段”和“推理阶段”分别用什么方法，再明确它们在实际项目中的位置。",
    sections: [
      {
        heading: "训练阶段方法（用于训练）",
        items: [
          "拒绝采样（Rejection Sampling）：模型先生成多个候选答案，只保留质量高的样本用于后续训练。",
          "普通采样：模型生成什么就用什么，作为基础样本来源。",
          "SFT（监督微调）：用人工标注或整理好的输入输出样本训练模型，先教会模型按期望方式回答。",
          "GRPO（组相对策略优化）：通过比较多份答案优劣来优化策略，强化推理与决策能力。",
        ],
      },
      {
        heading: "推理阶段方法（用于推理增强）",
        items: [
          "MCTS（蒙特卡洛树搜索）：不是一次出答案，而是在多个推理路径中搜索、评估、决策、选择，逐步找到更优答案。",
        ],
      },
    ],
    quickCompare: [
      { key: "拒绝采样", value: "训练时筛优质样本，提升训练数据质量" },
      { key: "SFT", value: "训练模型基础回答能力和风格" },
      { key: "GRPO", value: "训练模型在推理任务上的策略与决策能力" },
      { key: "MCTS", value: "推理时做路径搜索，增强最终答案质量" },
    ],
  },
];

const noteFilters = ["全部", "训练", "推理增强", "方法论"];

function createFilterButtons() {
  const filterGroup = document.getElementById("notesFilterGroup");
  if (!filterGroup) return;

  filterGroup.innerHTML = "";
  noteFilters.forEach((name, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `notes-filter-btn${index === 0 ? " active" : ""}`;
    button.dataset.filter = name;
    button.textContent = name;
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".notes-filter-btn")
        .forEach((el) => el.classList.remove("active"));
      button.classList.add("active");
      renderNotes();
    });
    filterGroup.appendChild(button);
  });
}

function getActiveFilter() {
  const active = document.querySelector(".notes-filter-btn.active");
  return active ? active.dataset.filter : "全部";
}

function normalizeText(text) {
  return String(text || "").toLowerCase();
}

function matchByFilter(note, filter) {
  if (filter === "全部") return true;
  if (filter === "方法论") return note.category === "方法论";
  return note.tags.includes(filter);
}

function matchBySearch(note, keyword) {
  if (!keyword) return true;
  const target = [
    note.title,
    note.summary,
    note.category,
    note.tags.join(" "),
    note.sections
      .map((item) => `${item.heading} ${item.items.join(" ")}`)
      .join(" "),
  ].join(" ");

  return normalizeText(target).includes(normalizeText(keyword));
}

function createCompareRows(compareList) {
  return compareList
    .map(
      (row) => `
        <div class="note-compare-row">
            <span class="note-compare-key">${row.key}</span>
            <span class="note-compare-value">${row.value}</span>
        </div>
    `
    )
    .join("");
}

function createSectionHtml(section) {
  const itemsHtml = section.items.map((item) => `<li>${item}</li>`).join("");
  return `
        <div class="note-section-block">
            <h4>${section.heading}</h4>
            <ul>${itemsHtml}</ul>
        </div>
    `;
}

function copyNote(noteId) {
  const note = notesData.find((item) => item.id === noteId);
  if (!note) return;

  const plainText = [
    `${note.title}（${note.date}）`,
    "",
    note.summary,
    "",
    ...note.sections.map((section) => {
      const body = section.items.map((item) => `- ${item}`).join("\n");
      return `${section.heading}\n${body}`;
    }),
  ].join("\n");

  navigator.clipboard.writeText(plainText).then(() => {
    const target = document.querySelector(`[data-copy-id="${noteId}"]`);
    if (!target) return;
    const oldText = target.textContent;
    target.textContent = "已复制";
    target.disabled = true;
    setTimeout(() => {
      target.textContent = oldText;
      target.disabled = false;
    }, 1200);
  });
}

function renderNotes() {
  const list = document.getElementById("notesList");
  const searchInput = document.getElementById("noteSearchInput");
  const emptyState = document.getElementById("notesEmptyState");
  if (!list || !searchInput || !emptyState) return;

  const filter = getActiveFilter();
  const keyword = searchInput.value.trim();

  const filtered = notesData.filter(
    (note) => matchByFilter(note, filter) && matchBySearch(note, keyword)
  );
  list.innerHTML = "";

  if (!filtered.length) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");
  filtered.forEach((note) => {
    const card = document.createElement("article");
    card.className = "note-card";
    card.innerHTML = `
            <div class="note-card-top">
                <div class="note-meta">
                    <span class="note-date">${note.date}</span>
                    <span class="note-category">${note.category}</span>
                </div>
                <button type="button" class="note-copy-btn" data-copy-id="${
                  note.id
                }">复制笔记</button>
            </div>
            <h3 class="note-title">${note.title}</h3>
            <p class="note-summary">${note.summary}</p>
            <div class="note-tag-list">
                ${note.tags
                  .map((tag) => `<span class="note-tag">${tag}</span>`)
                  .join("")}
            </div>
            <div class="note-section-list">
                ${note.sections.map(createSectionHtml).join("")}
            </div>
            <div class="note-compare-box">
                <h4>快速对照</h4>
                ${createCompareRows(note.quickCompare)}
            </div>
        `;

    list.appendChild(card);
  });

  document.querySelectorAll(".note-copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => copyNote(btn.dataset.copyId));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");
  if (menuButton && navMenu) {
    menuButton.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      menuButton.classList.toggle("active");
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuButton.classList.remove("active");
      });
    });
  }

  createFilterButtons();
  renderNotes();

  const searchInput = document.getElementById("noteSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", renderNotes);
  }
});
