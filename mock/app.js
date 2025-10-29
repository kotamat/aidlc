const showToast = (message) => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 200);
  }, 2800);
};

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-button");
  const views = document.querySelectorAll(".view");

  const activateView = (id) => {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === id);
    });
    views.forEach((view) => {
      view.classList.toggle("active", view.id === id);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!tab.classList.contains("active")) {
        activateView(tab.dataset.tab);
      }
    });
  });

  document.querySelectorAll('[data-role="category-filter"]').forEach((group) => {
    group.addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      showToast(`フィルターを「${chip.textContent.trim()}」に切り替えました`);
    });
  });

  document.querySelectorAll(".payment-item button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".payment-item").forEach((item) => item.classList.remove("active"));
      const parent = button.closest(".payment-item");
      parent.classList.add("active");
      showToast(`${parent.querySelector("strong").textContent} を既定の支払いに設定しました`);
    });
  });

  const changeForm = document.querySelector(".change-form");
  if (changeForm) {
    changeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showToast("変更リクエストを送信しました");
      changeForm.reset();
    });

    const cancelButton = changeForm.querySelector('button[type="button"]');
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        showToast("キャンセル申請を受け付けました");
      });
    }
  }

  document.querySelectorAll(".queue-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.closest(".queue-item").querySelector("strong")?.textContent ?? "注文";
      showToast(`${orderId} のステータスを更新します`);
    });
  });

  document.querySelectorAll(".job-item").forEach((item) => {
    const jobId = item.querySelector("strong")?.textContent?.split("·")[0]?.trim();
    item.querySelectorAll(".primary").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("ghost")) {
          showToast(`${jobId} の詳細を表示します`);
        } else {
          showToast(`${jobId} を受諾しました`);
        }
      });
    });
  });

  const proofButton = document.querySelector(".submit-proof");
  if (proofButton) {
    proofButton.addEventListener("click", () => {
      showToast("受け渡し証明を提出しました");
    });
  }

  document.querySelectorAll(".alert-list button").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.closest("li").querySelector("strong")?.textContent ?? "アラート";
      showToast(`${title} の対応フローを開きます`);
    });
  });

  document.querySelectorAll(".city-actions button").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(`${button.textContent.trim()} の設定を開始します`);
    });
  });
});
