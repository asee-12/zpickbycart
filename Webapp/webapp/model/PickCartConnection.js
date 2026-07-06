/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "zscm/ewm/pickcarts1/model/Global",
    "zscm/ewm/pickcarts1/utils/Util",
  ],
  function (n, t, i) {
    "use strict";
    var e;
    var r;
    return {
      init: function () {
        if (e === undefined) {
          e = new n({
            handlingUnits: [],
            errors: [],
            currentHandlingUnit: {},
            progress: 0,
            debundleHUId: "",
            debundlePosition: "",
            statusOfHU: [],
          });
        }
        return e;
      },
      destroy: function () {
        e = undefined;
        r = null;
      },
      clearData: function () {
        e.setProperty("/progress", 0);
        e.setProperty("/errors", []);
        r = null;
      },
      setErrors: function (n) {
        e.setProperty("/errors", n);
      },
      clearHandlingUnits: function () {
        e.setProperty("/handlingUnits", []);
        e.setProperty("/currentHandlingUnit", {});
      },
      setHandlingUnitId: function (n) {
        e.setProperty("/debundleHUId", n);
      },
      setDebundlePosition: function (n) {
        e.setProperty("/debundlePosition", n);
      },
      getDebundldPosition: function () {
        return e.getProperty("/debundlePosition");
      },
      updateConnectionProgress: function (n) {
        var t = this.getConnectionProgress();
        var i = this.getHandlingUnits();
        this.setStatusOfHUIndex();
        if (n) {
          if (t < i.length) {
            t++;
          }
        } else {
          if (t > 0) {
            t--;
          }
        }
        e.setProperty("/progress", t);
      },
      resetAllHandlingUnits: function () {
        var n = this.getHandlingUnits();
        r = null;
        n.forEach(function (n) {
          n.HandlingUnitNumber = "";
          n.HandlingUnitLogicalPosition = "";
        });
        e.setProperty("/currentHandlingUnit", n[0]);
        e.setProperty("/progress", 0);
        e.setProperty("/statusOfHU", []);
      },
      updatePositionId: function (n) {
        e.getProperty("/currentHandlingUnit").HandlingUnitLogicalPosition = n;
      },
      prepareHandlingUnit: function () {
        var n;
        var t = this.getHandlingUnits();
        if (i.isEmpty(r)) {
          n = this.checkProgress();
        } else {
          n = r;
          var s = e.getProperty("/currentHandlingUnit");
          if (s) {
            this.clearHandlingUnit(s);
          }
          r = null;
        }
        e.setProperty("/currentHandlingUnit", t[n]);
      },
      getAllLogicalPositions: function () {
        var n = this.getHandlingUnits();
        var t = [];
        n.forEach(function (n) {
          if (!i.isEmpty(n.HandlingUnitLogicalPosition)) {
            t.push(n.HandlingUnitLogicalPosition);
          }
        });
        return t;
      },
      getStatusOfHU: function () {
        return e.getProperty("/statusOfHU");
      },
      checkProgress: function () {
        var n;
        var t = this.getStatusOfHU();
        t.forEach(function (t, i) {
          if (!n && !t.status) {
            n = i;
          }
        });
        return n;
      },
      isHandlingUnitsReady: function () {
        var n = this.getConnectionProgress();
        var t = this.getHandlingUnits();
        return n === t.length;
      },
      getHandlingUnits: function () {
        return e.getProperty("/handlingUnits");
      },
      getConnectionProgress: function () {
        return e.getProperty("/progress");
      },
      setHandlingUnit: function (n) {
        var t = [];
        var i = [];
        n.forEach(
          function (n) {
            if (this._hasPrepared(n)) {
              t.push(n);
            } else {
              n.HandlingUnitNumber = "";
              n.HandlingUnitLogicalPosition = "";
              i.push(n);
            }
          }.bind(this),
        );
        var r = t.concat(i);
        e.setProperty("/handlingUnits", r);
        e.setProperty("/currentHandlingUnit", i[0]);
        e.setProperty("/progress", t.length);
      },
      _hasPrepared: function (n) {
        var t = true;
        if (
          i.isEmpty(n.HandlingUnitLogicalPosition) ||
          i.isEmpty(n.HandlingUnitNumber)
        ) {
          t = false;
        }
        return t;
      },
      getConnectedPositions: function () {
        var n = e.getProperty("/handlingUnits");
        var t = [];
        n.forEach(function (n) {
          if (!i.isEmpty(n.HandlingUnitLogicalPosition)) {
            t.push(n.HandlingUnitLogicalPosition);
          }
        });
        return t;
      },
      setStatusOfHUIndex: function () {
        var n = this.getHandlingUnits();
        var t = this.getStatusOfHU();
        if (!t || t.length === 0) {
          n.forEach(function (n, i) {
            var e = { index: i, status: "" };
            if (
              n.HandlingUnitNumber !== "" &&
              n.HandlingUnitLogicalPosition !== ""
            ) {
              e.status = true;
            } else {
              e.status = false;
            }
            t.push(e);
          }, this);
        } else {
          n.forEach(function (n, i) {
            var e = { index: i, status: "" };
            if (
              n.HandlingUnitNumber !== "" &&
              n.HandlingUnitLogicalPosition !== ""
            ) {
              e.status = true;
            } else {
              e.status = false;
            }
            t[i] = e;
          }, this);
        }
        e.setProperty("/statusOfHU", t);
      },
      debundPreparation: function (n, t) {
        var e = this.getHandlingUnits();
        var s = i.find(e, function (t, i) {
          if (t.HandlingUnitLogicalPosition === n) {
            r = i;
            return true;
          }
          return false;
        });
        if (s) {
          this.setHandlingUnitId(s.HandlingUnitNumber);
          this.setDebundlePosition(t);
        }
      },
      debundFinished: function () {
        this.setHandlingUnitId("");
        this.setDebundlePosition("");
        r = null;
      },
      restoreHandlingUnit: function (n, t, i) {
        n.HandlingUnitNumber = t;
        n.HandlingUnitLogicalPosition = i;
      },
      clearHandlingUnit: function (n) {
        n.HandlingUnitNumber = "";
        n.HandlingUnitLogicalPosition = "";
      },
      getDebundleHandlingUnit: function () {
        var n = this.getHandlingUnits();
        return n[r];
      },
      getCurrentHandlingUnit: function () {
        return e.getProperty("/currentHandlingUnit");
      },
      getCurrentHandlingUnitLogicalPosition: function () {
        return e.getProperty(
          "/currentHandlingUnit/HandlingUnitLogicalPosition",
        );
      },
      isHandlingUnitReserved: function (n) {
        var t = e.getProperty("/handlingUnits");
        var i = e.getProperty("/currentHandlingUnit");
        var r = false;
        for (var s = 0; s < t.length; s++) {
          if (t[s] !== i && t[s].HandlingUnitNumber === n) {
            r = true;
          }
        }
        return r;
      },
      isLogicalPositionReserved: function (n) {
        var t = e.getProperty("/handlingUnits");
        var i = e.getProperty("/currentHandlingUnit");
        var r = false;
        for (var s = 0; s < t.length; s++) {
          if (t[s] !== i && t[s].HandlingUnitLogicalPosition === n) {
            r = true;
          }
        }
        return r;
      },
      isContainsSpecialCharacter: function (n) {
        var t = "$*+";
        for (var i = 0; i < n.length; i++) {
          if (t.indexOf(n.charAt(i)) !== -1) {
            return true;
          }
        }
      },
    };
  },
);
//# sourceMappingURL=PickCartConnection.js.map
