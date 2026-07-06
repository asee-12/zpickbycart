/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  ["sap/ui/model/json/JSONModel", "zscm/ewm/pickcarts1/utils/Const"],
  function (t, n) {
    "use strict";
    var i;
    var o;
    var s;
    var r = [];
    return {
      init: function () {
        if (!i) {
          i = new t({ layout: [] });
        }
        return i;
      },
      destroy: function () {
        i = undefined;
        s = undefined;
        s = undefined;
        r = [];
      },
      setData: function (t) {
        var r = [],
          a,
          e,
          u,
          c;
        o = {};
        s = {};
        if (t.length > 0) {
          for (var f = 0; f < t.length; f++) {
            a = t[f];
            e = parseInt(a.RowInd, 10) - 1;
            u = parseInt(a.ColInd, 10) - 1;
            c = parseFloat(a.DepthInd, 10) - 1;
            if (r[e] === undefined) {
              r[e] = { cells: [] };
            }
            a.connection = { status: -1 };
            a.picking = {
              status: n.HU_STATUS_PICK.INVALID,
              expected: "",
              actual: "",
              split: false,
            };
            a.dropping = { status: n.HU_STATUS_DROP.INVALID };
            r[e].cells[u] = a;
            o[a.Lab] = a;
            s[a.HandlingUnitLogicalPosition] = a;
          }
        }
        i.setProperty("/layout", r);
        this.invokeLayoutChangeCallback();
      },
      clearData: function () {
        o = {};
        s = {};
        i.setProoerty("/layout", []);
        r = [];
      },
      invokeLayoutChangeCallback: function () {
        var t = i.getProperty("/layout/0/cells");
        var n = 0;
        if (t) {
          n = t.length;
        }
        for (var o = 0; o < r.length; o++) {
          r[o](n);
        }
      },
      registLayoutChangeCallback: function (t) {
        r.push(t);
      },
      getUnprocessedPositions: function () {
        var t = [];
        var o = i.getProperty("/layout");
        o.forEach(function (i) {
          i.cells.forEach(function (i) {
            if (i.picking.status === n.HU_STATUS_PICK.NEED_MATERIAL) {
              t.push(i.HandlingUnitLogicalPosition);
            }
          });
        });
        return t;
      },
      getPositionsWithPickingException: function () {
        var t = [];
        var o = i.getProperty("/layout");
        o.forEach(function (i) {
          i.cells.forEach(function (i) {
            if (
              i.picking.status === n.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION
            ) {
              t.push(i.HandlingUnitLogicalPosition);
            }
          });
        });
        return t;
      },
      getInvalidPickingPositions: function () {
        var t = [];
        var o = i.getProperty("/layout");
        o.forEach(function (i) {
          i.cells.forEach(function (i) {
            if (
              i.picking.status !== n.HU_STATUS_PICK.NEED_MATERIAL &&
              i.picking.status !== n.HU_STATUS_PICK.INVALID
            ) {
              t.push(i.HandlingUnitLogicalPosition);
            }
          });
        });
        return t;
      },
      getWrongPickingPositions: function () {
        var t = [];
        var o = i.getProperty("/layout");
        o.forEach(function (i) {
          i.cells.forEach(function (i) {
            if (i.picking.status === n.HU_STATUS_PICK.WRONG) {
              t.push(i.HandlingUnitLogicalPosition);
            }
          });
        });
        return t;
      },
      getEmptyPositions: function () {
        var t = [];
        var o = i.getProperty("/layout");
        o.forEach(function (i) {
          i.cells.forEach(function (i) {
            if (i.picking.status === n.HU_STATUS_PICK.INVALID) {
              t.push(i.HandlingUnitLogicalPosition);
            }
          });
        });
        return t;
      },
      getPositionInfoByLable: function (t) {
        var n;
        if (o) {
          n = o[t];
        }
        return n;
      },
      getPositionInfoById: function (t) {
        var n;
        if (s) {
          n = s[t];
        }
        return n;
      },
      getPickingStatusById: function (t) {
        var n;
        if (s) {
          n = s[t];
        }
        return n.picking.status;
      },
      getPickingQuantityById: function (t) {
        var n;
        if (s) {
          n = s[t];
        }
        return n.picking.actual;
      },
      getPickingSplitFlagById: function (t) {
        var n;
        if (s) {
          n = s[t];
        }
        return n.picking.split;
      },
      getDropingStatusById: function (t) {
        var n;
        if (s) {
          n = s[t];
        }
        return n.dropping.status;
      },
      getPositionByLable: function (t) {
        var n;
        if (o) {
          n = o[t];
        }
        if (n) {
          return n.HandlingUnitLogicalPosition;
        }
      },
      updatePositionStatus: function (t, n) {
        var o = parseInt(t.RowInd, 10) - 1;
        var s = parseInt(t.ColInd, 10) - 1;
        i.setProperty("/layout/" + o + "/cells/" + s + "/connection/status", n);
      },
      setStatusForPreparationByIds: function (t, n) {
        t.forEach(
          function (t) {
            if (t !== "") {
              var i = this.getPositionInfoById(t);
              this.updatePositionStatus(i, n);
            }
          }.bind(this),
        );
      },
      setStatusForPickingByLable: function (t, n) {
        var i = this.getPositionInfoByLable(t);
        this._setStatusForPicking(i, n);
      },
      setStatusForPickingById: function (t, n) {
        if (t !== "") {
          var i = this.getPositionInfoById(t);
          this._setStatusForPicking(i, n);
        }
      },
      setStatusForPickingByIds: function (t, n) {
        t.forEach(
          function (t) {
            if (t !== "") {
              var i = this.getPositionInfoById(t);
              this._setStatusForPicking(i, n);
            }
          }.bind(this),
        );
      },
      _setStatusForPicking: function (t, n) {
        var o = parseInt(t.RowInd, 10) - 1;
        var s = parseInt(t.ColInd, 10) - 1;
        i.setProperty("/layout/" + o + "/cells/" + s + "/picking/status", n);
      },
      setNumbersForPickingById: function (t, n) {
        if (t !== "") {
          var i = this.getPositionInfoById(t);
          this._setNumbersForPicking(i, n);
        }
      },
      setNumbersForPickingByIds: function (t, n) {
        t.forEach(
          function (t) {
            if (t !== "") {
              var i = this.getPositionInfoById(t);
              this._setNumbersForPicking(i, n);
            }
          }.bind(this),
        );
      },
      _setNumbersForPicking: function (t, n) {
        var o = parseInt(t.RowInd, 10) - 1;
        var s = parseInt(t.ColInd, 10) - 1;
        i.setProperty("/layout/" + o + "/cells/" + s + "/picking/actual", n);
      },
      setSplitForPickingById: function (t, n) {
        if (t !== "") {
          var i = this.getPositionInfoById(t);
          this._setSplitForPicking(i, n);
        }
      },
      _setSplitForPicking: function (t, n) {
        var o = parseInt(t.RowInd, 10) - 1;
        var s = parseInt(t.ColInd, 10) - 1;
        i.setProperty("/layout/" + o + "/cells/" + s + "/picking/split", n);
      },
      setStatusForDroppingByIds: function (t, n) {
        t.forEach(
          function (t) {
            if (t !== "") {
              var i = this.getPositionInfoById(t);
              this._setStatusForDroping(i, n);
            }
          }.bind(this),
        );
      },
      _setStatusForDroping: function (t, n) {
        var o = parseInt(t.RowInd, 10) - 1;
        var s = parseInt(t.ColInd, 10) - 1;
        i.setProperty("/layout/" + o + "/cells/" + s + "/dropping/status", n);
      },
      getFirstPositionForSerialManaged: function (t) {
        var n = undefined;
        var i = undefined;
        var o = undefined;
        t.forEach(
          function (t) {
            var s = this.getPositionInfoById(t);
            var r = parseInt(s.RowInd, 10) - 1;
            var a = parseInt(s.ColInd, 10) - 1;
            if (i === undefined) {
              n = t;
              o = a;
              i = r;
            } else {
              if (r > i || (r === i && a < o)) {
                n = t;
                o = a;
                i = r;
              }
            }
          }.bind(this),
        );
        return n;
      },
    };
  },
);
//# sourceMappingURL=PickCartLayout.js.map
