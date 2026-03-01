/**
 * UpgradeKit Widget — Embeddable upgrade gate for SaaS
 * Sprints 2.3 + 2.6
 * @version 1.0.0
 */
(function () {
  "use strict";

  // ─── State ────────────────────────────────────────────────────────────────
  var _apiKey = null;
  var _apiUrl = "";
  var _gateCache = {};
  var _styleInjected = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function generateSessionId() {
    var arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map(function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  var _sessionId = generateSessionId();

  function request(method, path, body) {
    return fetch(_apiUrl + path, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + _apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(function (res) { return res.json(); })
      .catch(function (err) { console.warn("[UpgradeKit]", err); });
  }

  function getGate(gateId) {
    if (_gateCache[gateId]) {
      return Promise.resolve(_gateCache[gateId]);
    }
    return request("GET", "/api/public/gates/" + gateId).then(function (res) {
      if (res && res.data) {
        _gateCache[gateId] = res.data;
        return res.data;
      }
      return null;
    });
  }

  function track(gateId, userId, type) {
    return request("POST", "/api/track", {
      gate_id: gateId,
      user_id: userId || undefined,
      session_id: _sessionId,
      type: type,
    });
  }

  function convert(gateId, userId, source) {
    return request("POST", "/api/convert", {
      gate_id: gateId,
      user_id: userId || undefined,
      session_id: _sessionId,
      source: source,
    });
  }

  // ─── CSS Injection ─────────────────────────────────────────────────────────
  function injectStyles() {
    if (_styleInjected) return;
    _styleInjected = true;
    var style = document.createElement("style");
    style.id = "upgradekit-styles";
    style.textContent = [
      ".upgradekit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);",
      "display:flex;align-items:center;justify-content:center;z-index:99999;",
      "animation:uk-fade-in .15s ease}",
      "@keyframes uk-fade-in{from{opacity:0}to{opacity:1}}",
      ".upgradekit-modal{background:#18181b;border:1px solid #3f3f46;border-radius:12px;",
      "padding:32px;max-width:420px;width:90%;position:relative;color:#fafafa;",
      "box-shadow:0 20px 60px rgba(0,0,0,.6);animation:uk-slide-up .15s ease}",
      "@keyframes uk-slide-up{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}",
      ".upgradekit-close{position:absolute;top:12px;right:14px;background:none;border:none;",
      "color:#a1a1aa;font-size:20px;cursor:pointer;line-height:1;padding:4px}",
      ".upgradekit-close:hover{color:#fafafa}",
      ".upgradekit-badge-icon{font-size:40px;margin-bottom:16px}",
      ".upgradekit-headline{font-size:20px;font-weight:700;margin:0 0 10px;color:#fafafa}",
      ".upgradekit-body{font-size:14px;color:#a1a1aa;margin:0 0 24px;line-height:1.6}",
      ".upgradekit-cta{display:inline-block;width:100%;padding:12px 20px;",
      "background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;",
      "font-size:15px;border:none;border-radius:8px;cursor:pointer;text-align:center;",
      "transition:opacity .15s}",
      ".upgradekit-cta:hover{opacity:.9}",
      // Hint badge
      ".upgradekit-hint-wrap{position:relative;display:inline-block}",
      ".upgradekit-hint-badge{display:inline-flex;align-items:center;gap:3px;",
      "background:#f59e0b;color:#000;font-size:11px;font-weight:700;",
      "padding:2px 7px;border-radius:99px;cursor:pointer;margin-left:6px;",
      "vertical-align:middle;transition:background .15s;position:relative}",
      ".upgradekit-hint-badge:hover{background:#d97706}",
      ".upgradekit-hint-tooltip{position:absolute;bottom:calc(100% + 6px);left:50%;",
      "transform:translateX(-50%);background:#27272a;color:#fafafa;font-size:12px;",
      "padding:6px 10px;border-radius:6px;white-space:nowrap;pointer-events:none;",
      "opacity:0;transition:opacity .15s;z-index:1000;",
      "box-shadow:0 4px 12px rgba(0,0,0,.4)}",
      ".upgradekit-hint-badge:hover .upgradekit-hint-tooltip{opacity:1}",
    ].join("");
    document.head.appendChild(style);
  }

  // ─── Modal ─────────────────────────────────────────────────────────────────
  function showModal(gate, opts) {
    injectStyles();
    var userId = (opts && opts.userId) || null;
    var onUpgrade = (opts && opts.onUpgrade) || null;
    var onDismiss = (opts && opts.onDismiss) || null;

    // Track impression
    track(gate.id, userId, "impression");

    var overlay = document.createElement("div");
    overlay.className = "upgradekit-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "uk-headline");

    var canDismiss = gate.dismiss_behavior !== "force";

    overlay.innerHTML = [
      '<div class="upgradekit-modal">',
      canDismiss ? '<button class="upgradekit-close" aria-label="Close">&#x2715;</button>' : "",
      '<div class="upgradekit-badge-icon">&#x2B50;</div>',
      '<h2 id="uk-headline" class="upgradekit-headline">' + escapeHtml(gate.headline) + "</h2>",
      gate.body
        ? '<p class="upgradekit-body">' + escapeHtml(gate.body) + "</p>"
        : "",
      '<button class="upgradekit-cta">' + escapeHtml(gate.cta_text || "Upgrade Now") + "</button>",
      "</div>",
    ].join("");

    function close(src) {
      overlay.remove();
      if (src === "cta") {
        convert(gate.id, userId, "cta-click");
        if (onUpgrade) onUpgrade();
      } else {
        convert(gate.id, userId, "dismiss");
        if (onDismiss) onDismiss();
      }
    }

    // CTA button
    var ctaBtn = overlay.querySelector(".upgradekit-cta");
    ctaBtn.addEventListener("click", function () {
      if (gate.upgrade_url) {
        window.open(gate.upgrade_url, "_blank", "noopener");
      }
      close("cta");
    });

    // Close button
    if (canDismiss) {
      var closeBtn = overlay.querySelector(".upgradekit-close");
      closeBtn.addEventListener("click", function () { close("dismiss"); });
      // Click outside modal to dismiss
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close("dismiss");
      });
      // Escape key
      function onKey(e) {
        if (e.key === "Escape") { close("dismiss"); document.removeEventListener("keydown", onKey); }
      }
      document.addEventListener("keydown", onKey);
    }

    document.body.appendChild(overlay);
    // Focus CTA for accessibility
    ctaBtn.focus();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Initialize UpgradeKit with API key and optional base URL
   * @param {Object} config
   * @param {string} config.apiKey  - Your UpgradeKit API key
   * @param {string} [config.apiUrl] - Base API URL (defaults to current origin)
   */
  function init(config) {
    if (!config || !config.apiKey) {
      console.error("[UpgradeKit] init() requires { apiKey }");
      return;
    }
    _apiKey = config.apiKey;
    _apiUrl = config.apiUrl || window.location.origin;
    // In button-intercept mode, auto-attach to any [data-upgradekit] elements
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachInterceptors);
    } else {
      attachInterceptors();
    }
  }

  function attachInterceptors() {
    var els = document.querySelectorAll("[data-upgradekit]");
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var gateId = el.getAttribute("data-upgradekit");
        el.addEventListener("click", function (e) {
          e.preventDefault();
          gate(gateId, {});
        });
      })(els[i]);
    }
  }

  /**
   * Show an upgrade gate modal
   * @param {string} gateId  - Gate UUID
   * @param {Object} [opts]
   * @param {string} [opts.userId]       - End-user ID
   * @param {Function} [opts.onUpgrade]  - Called when CTA clicked
   * @param {Function} [opts.onDismiss]  - Called when dismissed
   */
  function gate(gateId, opts) {
    if (!_apiKey) { console.error("[UpgradeKit] Call init() first"); return; }
    getGate(gateId).then(function (gateData) {
      if (!gateData) { console.warn("[UpgradeKit] Gate not found:", gateId); return; }
      showModal(gateData, opts || {});
    });
  }

  /**
   * Attach a "Pro ↗" hint badge next to a target element (Sprint 2.6)
   * @param {string} gateId           - Gate UUID
   * @param {Element} targetElement   - DOM element to place badge next to
   * @param {Object} [opts]
   * @param {string} [opts.userId]     - End-user ID
   * @param {string} [opts.badgeText]  - Override badge label
   * @param {string} [opts.tooltip]    - Override tooltip text
   */
  function hint(gateId, targetElement, opts) {
    if (!_apiKey) { console.error("[UpgradeKit] Call init() first"); return; }
    if (!targetElement) { console.warn("[UpgradeKit] hint() requires a valid element"); return; }

    injectStyles();

    var badgeText = (opts && opts.badgeText) || "Pro \u2197";

    // Create badge
    var badge = document.createElement("span");
    badge.className = "upgradekit-hint-badge";
    badge.setAttribute("role", "button");
    badge.setAttribute("tabindex", "0");
    badge.setAttribute("aria-label", "Upgrade to unlock");

    // Tooltip will be populated after gate fetch
    var tooltipEl = document.createElement("span");
    tooltipEl.className = "upgradekit-hint-tooltip";
    tooltipEl.textContent = (opts && opts.tooltip) || "Upgrade to unlock this feature";

    badge.textContent = badgeText;
    badge.appendChild(tooltipEl);

    // Insert badge right after the target element
    var parent = targetElement.parentNode;
    if (parent) {
      var next = targetElement.nextSibling;
      if (next) {
        parent.insertBefore(badge, next);
      } else {
        parent.appendChild(badge);
      }
    } else {
      // Fallback: append to body near element
      document.body.appendChild(badge);
    }

    // When clicked, show gate modal (with impression tracking)
    function openGate() {
      var userId = (opts && opts.userId) || null;
      gate(gateId, {
        userId: userId,
        onUpgrade: opts && opts.onUpgrade,
        onDismiss: opts && opts.onDismiss,
      });
    }

    badge.addEventListener("click", openGate);
    badge.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGate(); }
    });

    // Optionally update tooltip with gate headline
    getGate(gateId).then(function (gateData) {
      if (gateData && gateData.headline && !(opts && opts.tooltip)) {
        tooltipEl.textContent = gateData.headline;
      }
    });
  }

  // ─── Expose global ─────────────────────────────────────────────────────────
  var UpgradeKit = { init: init, gate: gate, hint: hint };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = UpgradeKit;
  } else {
    window.UpgradeKit = UpgradeKit;
  }
})();
