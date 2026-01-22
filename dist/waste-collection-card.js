/**
 * Waste Collection Card for Home Assistant
 * A beautiful card for displaying waste collection dates
 *
 * @version 1.0.0
 */

const CARD_VERSION = "1.0.0";

console.info(
  `%c WASTE-COLLECTION-CARD %c ${CARD_VERSION} `,
  "color: white; background: #4CAF50; font-weight: bold;",
  "color: #4CAF50; background: white; font-weight: bold;"
);

const WASTE_TYPES = {
  restmuell: {
    name: "Restmüll",
    icon: "mdi:trash-can-outline",
    color: "200, 200, 200", // hellgrau/weiß
  },
  bio: {
    name: "Bio",
    icon: "mdi:leaf",
    color: "76, 175, 80", // green
  },
  gelb: {
    name: "Plastik",
    icon: "mdi:bottle-soda",
    color: "255, 235, 59", // yellow
  },
  papier: {
    name: "Papier",
    icon: "mdi:newspaper-variant-outline",
    color: "33, 150, 243", // blue
  },
};

class WasteCollectionCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  setConfig(config) {
    if (!config.entities && !config.entity_prefix) {
      throw new Error("Please define entities or entity_prefix");
    }
    this._config = {
      title: config.title || "Müllabfuhr",
      entity_prefix: config.entity_prefix || "sensor.mullabfuhr_kirchham_",
      entities: config.entities || null,
      show_title: config.show_title !== false,
      columns: config.columns || 2,
      ...config,
    };
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("waste-collection-card-editor");
  }

  static getStubConfig() {
    return {
      entity_prefix: "sensor.mullabfuhr_kirchham_",
      title: "Müllabfuhr",
    };
  }

  getEntities() {
    if (this._config.entities) {
      return this._config.entities;
    }
    // Auto-detect entities based on prefix
    const prefix = this._config.entity_prefix;
    return [
      { entity: `${prefix}restmull`, type: "restmuell" },
      { entity: `${prefix}biotonne`, type: "bio" },
      { entity: `${prefix}gelbe_tonne`, type: "gelb" },
      { entity: `${prefix}altpapier`, type: "papier" },
    ];
  }

  getUrgency(state) {
    if (!state) return { level: 0, label: "unknown" };
    const val = state.toLowerCase();
    if (val.includes("heute")) return { level: 4, label: "heute" };
    if (val.includes("morgen")) return { level: 3, label: "morgen" };
    if (val.includes("in 2 tagen")) return { level: 2, label: "2tage" };
    if (val.includes("in 3 tagen")) return { level: 1, label: "3tage" };
    return { level: 0, label: "normal" };
  }

  render() {
    if (!this._hass || !this._config) return;

    const entities = this.getEntities();
    const columns = this._config.columns;

    let cardsHtml = "";
    entities.forEach((entityConfig, index) => {
      const entityId = entityConfig.entity;
      const type = entityConfig.type || this.detectType(entityId);
      const stateObj = this._hass.states[entityId];

      if (!stateObj) {
        cardsHtml += this.renderCard(type, "Nicht verfügbar", { level: 0, label: "unknown" }, entityId);
        return;
      }

      const state = stateObj.state;
      const urgency = this.getUrgency(state);
      cardsHtml += this.renderCard(type, state, urgency, entityId);
    });

    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <ha-card>
        ${this._config.show_title ? `<div class="card-header">${this._config.title}</div>` : ""}
        <div class="card-content">
          <div class="waste-grid columns-${columns}">
            ${cardsHtml}
          </div>
        </div>
      </ha-card>
    `;
  }

  detectType(entityId) {
    const id = entityId.toLowerCase();
    if (id.includes("rest")) return "restmuell";
    if (id.includes("bio")) return "bio";
    if (id.includes("gelb") || id.includes("plastik")) return "gelb";
    if (id.includes("papier") || id.includes("paper")) return "papier";
    return "restmuell";
  }

  renderCard(type, state, urgency, entityId) {
    const wasteType = WASTE_TYPES[type] || WASTE_TYPES.restmuell;
    const color = wasteType.color;

    let badgeHtml = "";
    if (urgency.label === "heute") {
      badgeHtml = `<div class="badge badge-red"><ha-icon icon="mdi:exclamation-thick"></ha-icon></div>`;
    } else if (urgency.label === "morgen") {
      badgeHtml = `<div class="badge badge-orange"><ha-icon icon="mdi:bell-ring"></ha-icon></div>`;
    }

    return `
      <div class="waste-card urgency-${urgency.label}"
           style="--waste-color: ${color};"
           data-entity="${entityId}">
        <div class="icon-container">
          <ha-icon icon="${wasteType.icon}" class="waste-icon"></ha-icon>
          ${badgeHtml}
        </div>
        <div class="info">
          <div class="name">${wasteType.name}</div>
          <div class="state">${state}</div>
        </div>
      </div>
    `;
  }

  getStyles() {
    return `
      :host {
        --card-primary-color: var(--primary-text-color);
        --card-secondary-color: var(--secondary-text-color);
      }

      ha-card {
        padding: 0;
        overflow: hidden;
        background: transparent !important;
        box-shadow: none !important;
      }

      .card-header {
        padding: 12px 16px;
        font-size: 1.1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .card-content {
        padding: 0 12px 12px;
      }

      .waste-grid {
        display: grid;
        gap: 8px;
      }

      .waste-grid.columns-1 { grid-template-columns: 1fr; }
      .waste-grid.columns-2 { grid-template-columns: repeat(2, 1fr); }
      .waste-grid.columns-4 { grid-template-columns: repeat(4, 1fr); }

      .waste-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 8px;
        border-radius: 12px;
        background: rgba(var(--waste-color), 0.08);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      /* Kompaktes Layout bei 4 Spalten */
      .waste-grid.columns-4 .waste-card {
        padding: 12px 4px;
      }
      .waste-grid.columns-4 .waste-icon {
        --mdc-icon-size: 28px;
      }
      .waste-grid.columns-4 .icon-container {
        margin-bottom: 6px;
      }
      .waste-grid.columns-4 .name {
        font-size: 0.8em;
      }
      .waste-grid.columns-4 .state {
        font-size: 0.75em;
      }
      .waste-grid.columns-4 .badge {
        width: 14px;
        height: 14px;
        top: -2px;
        right: -6px;
      }
      .waste-grid.columns-4 .badge ha-icon {
        --mdc-icon-size: 10px;
      }

      .waste-card:hover {
        background: rgba(var(--waste-color), 0.15);
      }

      /* Urgency styles */
      .waste-card.urgency-heute {
        background: rgba(var(--waste-color), 0.5) !important;
        border: 2px solid rgba(var(--waste-color), 0.8);
      }

      .waste-card.urgency-morgen {
        background: rgba(var(--waste-color), 0.35) !important;
        border: 1px solid rgba(var(--waste-color), 0.6);
      }

      .waste-card.urgency-2tage {
        background: rgba(var(--waste-color), 0.2) !important;
        border: 1px solid rgba(var(--waste-color), 0.4);
      }

      .waste-card.urgency-3tage {
        background: rgba(var(--waste-color), 0.1) !important;
      }

      .icon-container {
        position: relative;
        margin-bottom: 8px;
      }

      .waste-icon {
        --mdc-icon-size: 40px;
        color: rgb(var(--waste-color));
        transition: all 0.3s ease;
      }

      .urgency-heute .waste-icon,
      .urgency-morgen .waste-icon,
      .urgency-2tage .waste-icon,
      .urgency-3tage .waste-icon {
        color: white;
      }

      /* Animations */
      .urgency-heute .waste-icon {
        animation: pulse 0.4s ease-in-out infinite, shake 0.15s linear infinite;
        filter: drop-shadow(0 0 12px rgba(255, 255, 255, 1));
      }

      .urgency-heute .waste-card {
        animation: borderPulse 1s ease-in-out infinite;
      }

      .urgency-morgen .waste-icon {
        animation: wobbling 0.6s linear infinite alternate;
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
      }

      .urgency-2tage .waste-icon {
        animation: wobbling 1.2s linear infinite alternate;
      }

      .badge {
        position: absolute;
        top: -4px;
        right: -8px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .badge ha-icon {
        --mdc-icon-size: 12px;
        color: white;
      }

      .badge-red {
        background: #f44336;
      }

      .badge-orange {
        background: #ff9800;
      }

      .info {
        text-align: center;
      }

      .name {
        font-weight: 500;
        font-size: 0.95em;
        color: var(--primary-text-color);
        margin-bottom: 2px;
        white-space: nowrap;
      }

      .urgency-heute .name,
      .urgency-morgen .name {
        color: white;
      }

      .state {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .urgency-heute .state,
      .urgency-morgen .state {
        color: rgba(255, 255, 255, 0.9);
      }

      @keyframes wobbling {
        0% { transform: rotate(-8deg); }
        100% { transform: rotate(8deg); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(-2px) rotate(-5deg); }
        50% { transform: translateX(2px) rotate(5deg); }
      }

      @keyframes borderPulse {
        0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
        50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
      }

      /* Bei schmalen Fenstern: Spalten beibehalten, nur etwas kompakter */
      @media (max-width: 400px) {
        .waste-card { padding: 10px 4px; }
        .waste-icon { --mdc-icon-size: 28px; }
        .name { font-size: 0.8em; }
        .state { font-size: 0.7em; }
      }
    `;
  }
}

// Card Editor for UI configuration
class WasteCollectionCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .editor-row {
          margin-bottom: 12px;
        }
        .editor-row label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .editor-row input, .editor-row select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
      </style>
      <div class="editor">
        <div class="editor-row">
          <label>Titel</label>
          <input type="text" id="title" value="${this._config.title || "Müllabfuhr"}">
        </div>
        <div class="editor-row">
          <label>Entity Prefix</label>
          <input type="text" id="entity_prefix" value="${this._config.entity_prefix || "sensor.mullabfuhr_kirchham_"}">
        </div>
        <div class="editor-row">
          <label>Spalten</label>
          <select id="columns">
            <option value="1" ${this._config.columns === 1 ? "selected" : ""}>1</option>
            <option value="2" ${this._config.columns === 2 || !this._config.columns ? "selected" : ""}>2</option>
            <option value="4" ${this._config.columns === 4 ? "selected" : ""}>4</option>
          </select>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("change", (e) => this._valueChanged(e));
    });
  }

  _valueChanged(ev) {
    const target = ev.target;
    const newConfig = { ...this._config };

    if (target.id === "columns") {
      newConfig[target.id] = parseInt(target.value);
    } else {
      newConfig[target.id] = target.value;
    }

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("waste-collection-card", WasteCollectionCard);
customElements.define("waste-collection-card-editor", WasteCollectionCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "waste-collection-card",
  name: "Waste Collection Card",
  description: "A card to display waste collection dates with animations",
  preview: true,
  documentationURL: "https://github.com/hoizi89/hacs_waste_card",
});
