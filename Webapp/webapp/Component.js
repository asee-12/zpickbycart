/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/tl/ewm/lib/reuses1/components/base/Component",
    "sap/ui/Device",
    "zscm/ewm/pickcarts1/model/Models",
  ],
  function (e, t, s, i) {
    "use strict";
    var n = "---connection-view--";
    var o = "---processtasks-view--";
    var a = "---drop-view--";
    var r = "column-cell-button";
    return t.extend("scm.ewm.pickcarts1.Component", {
      metadata: { manifest: "json" },
      initialPage: "Main",
      _hasDirtyPage: function () {
        return false;
      },
      init: function () {
        this.setModel(i.createDeviceModel(), "device");
        i.init(this.getModel(), this.getModel("i18n"));
        t.prototype.init.apply(this, arguments);
      },
      destroy: function () {
        t.prototype.destroy.apply(this, arguments);
        this.destroyTableCells();
      },
      destroyTableCells: function () {
        var e = this.getId();
        var t = [n, o, a];
        var s;
        t.forEach(
          function (t) {
            s = this.byId(e + t + r);
            if (s) {
              s.destroy();
            }
          }.bind(this),
        );
      },
      getContentDensityClass: function () {
        if (this._sContentDensityClass === undefined) {
          if (
            jQuery(document.body).hasClass("sapUiSizeCozy") ||
            jQuery(document.body).hasClass("sapUiSizeCompact")
          ) {
            this._sContentDensityClass = "";
          } else if (!s.support.touch) {
            this._sContentDensityClass = "sapUiSizeCompact";
          } else {
            this._sContentDensityClass = "sapUiSizeCozy";
          }
        }
        return this._sContentDensityClass;
      },
    });
  },
);
//# sourceMappingURL=Component.js.map
