/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "sap/ui/core/ValueState",
    "zscm/ewm/pickcarts1/model/Global",
    "zscm/ewm/pickcarts1/utils/Const",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat",
  ],
  function (r, e, t, n, a) {
    "use strict";
    return {
      isEmpty: function (r) {
        var e = false;
        if (r === undefined || r === null || r === "") {
          e = true;
        }
        return e;
      },
      isString: function (r) {
        return typeof r === "string";
      },
      trim: function (r) {
        return $.trim(r);
      },
      getNavParamsByStatus: function (r, e, n) {
        var a;
        var i;
        var s = t.WHO_STATUS;
        var o = { bRestore: !!n };
        switch (r) {
          case s.INITIAL:
            a = "connection";
            i = 2;
            o.warehouseOrder = e.EWMWarehouseOrder;
            break;
          case s.PICKING:
            a = "processTasks";
            i = 3;
            o.warehouseOrder = e.EWMWarehouseOrder;
            break;
          case s.DROPPING:
            a = "dropHandlingUnit";
            i = 4;
            o.warehouseOrder = e.EWMWarehouseOrder;
            o.warehouseNumber = e.EWMWarehouse;
            break;
        }
        return { route: a, param: o, progress: i };
      },
      removeLeadingZeroinNumeric: function (r) {
        if (isNaN(r)) {
          return r;
        }
        return parseInt(r, 10).toString();
      },
      findIndex: function (r, e) {
        var t = 0;
        var n = r.length;
        var a = -1;
        for (; t < n; t++) {
          if (e(r[t], t, r)) {
            a = t;
            break;
          }
        }
        return a;
      },
      find: function (r, e) {
        var t;
        var n = r.length;
        for (var a = 0; a < n; a++) {
          if (e(r[a], a, r)) {
            t = r[a];
            break;
          }
        }
        return t;
      },
      includes: function (r, e) {
        var t = false;
        var n = r.length;
        for (var a = 0; a < n; a++) {
          if (r[a] === e) {
            t = true;
            break;
          }
        }
        return t;
      },
      isInteger: (function () {
        if (Number.isInteger) {
          return Number.isInteger;
        } else {
          return function (r) {
            return typeof r === "number" && isFinite(r) && Math.floor(r) === r;
          };
        }
      })(),
      convertDateTime: function (r) {
        if (this.isEmpty(r)) {
          return null;
        }
        var e = r.split(" ");
        var t = e[0].split(".");
        var n = t[0];
        var a = t[1] - 1;
        var i = t[2];
        var s = e[1].split(":");
        var o = s[0];
        var u = s[1];
        var f = parseInt(s[2]);
        return new Date(i, a, n, o, u, f);
      },
      formatDateTime: function (r, e) {
        if (this.isEmpty(r)) {
          return "";
        }
        var t = n.getDateTimeWithTimezoneInstance();
        return t.format(r, e);
      },
      parseNumber: function (r, e) {
        var t = a.getFloatInstance();
        var n = t.oFormatOptions;
        n.parseAsString = true;
        return t.parse(r, n);
      },
      formatNumber: function (r, e) {
        var n;
        var i;
        if (this.isEmpty(e)) {
          i = { minFractionDigits: t.MaxDecimalDigits, parseAsString: true };
          n = a.getFloatInstance(i);
        } else {
          i = {
            minFractionDigits: 0,
            maxFractionDigits: e,
            parseAsString: true,
          };
          n = a.getFloatInstance(i);
        }
        return n.format(r);
      },
      formatInteger: function (r) {
        if (isNaN(r)) {
          return "";
        }
        var e = {
          parseAsString: true,
          minFractionDigits: 0,
          maxFractionDigits: 0,
        };
        var t = a.getFloatInstance(e);
        return t.format(r);
      },
      playAudio: function (r, e) {
        if (r.getOwnerComponent() === undefined) {
          return;
        }
        var t = r.getOwnerComponent().getId();
        var n = sap.ui.getCore().byId(t + "---main--audio-player");
        if (!this.isEmpty(n)) {
          n.play(e);
        }
      },
      isJsonString: function (r) {
        try {
          if (typeof JSON.parse(r) == "object") {
            return true;
          }
        } catch (r) {}
        return false;
      },
    };
  },
);
//# sourceMappingURL=Util.js.map
