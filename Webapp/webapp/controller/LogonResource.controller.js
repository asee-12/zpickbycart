/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
    "zscm/ewm/pickcarts1/model/Global",
    "zscm/ewm/pickcarts1/model/OData",
    "zscm/ewm/pickcarts1/model/LogonResource",
    "zscm/ewm/pickcarts1/utils/Const",
    "zscm/ewm/pickcarts1/utils/Util",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  function (e, t, s, i, r, u, o, a, n, c, h) {
    "use strict";
    var l = "0000000000";
    var d = "dummy-input";
    var g = "pbc---logon--EWMResource";
    var f = "id-queue-select";
    return e.extend("zscm.ewm.pickcarts1.controller.LogonResource", {
      onInit: function () {
        this.initModes();
        this.initUserSettings();
        this.getOwnerComponent()
          .getRouter()
          .attachRouteMatched(this.onRouteMatched, this);
      },
      initModes: function () {
        var e = this.getModel("i18n");
        this.setModel(u.init(e), "local");
      },
      onRouteMatched: function (e) {
        if (e.getParameters().config.target === "logonResource") {
          if (i.getWONumber()) {
            var t = this.getI18nText("haveWOIntheCart", [
              r.getResourceNumber(),
              i.getWONumber(),
            ]);
            this.displayMessage(t, true);
          } else {
            u.setModeEditable(true);
          }
        }
      },
      initUserSettings: function () {
        this.setBusy(true);
        r.getUserSetting()
          .then(
            function (e) {
              if (e.EWMWarehouse) {
                this.bindAudioAggregation(r.getWarehouseNumber());
              }
              this.bindResource(e.IntralogisticsOperationsUser);
              if (e.EWMWarehouse && e.EWMResource) {
                this.verifyResourceAndWarehouseNum(e.EWMResource);
              } else {
                this.setBusy(false);
              }
            }.bind(this),
          )
          .catch(
            function (e) {
              this.setBusy(false);
              this.playAudio(o.ERROR);
            }.bind(this),
          );
      },
      initQueue: function (e) {
        var s = [];
        s.push({ Queue: "" });
        var i = new t({ items: s });
        this.byId(f).setValue("");
        this.byId(f).setSelectedKey("");
        if (a.isEmpty(e)) {
          this.setModel(i, "QueueModel");
          return;
        }
        this.setBusy(true);
        r.getQueueSet(e)
          .then(
            function (e) {
              for (var r = 0; r < e.results.length; r++) {
                s.push({ Queue: e.results[r].Queue });
              }
              i = new t({ items: s });
              this.setModel(i, "QueueModel");
            }.bind(this),
          )
          .finally(
            function () {
              this.setBusy(false);
            }.bind(this),
          );
      },
      bindAudioAggregation: function (e) {
        var t = this.getOwnerComponent().getId();
        var s = sap.ui.getCore().byId(t + "---main");
        var i = new n("EWMWarehouse", c.EQ, e);
        s.getController().bindAudioList([i]);
      },
      playAudio: function (e) {
        a.playAudio(this, e);
      },
      bindResource: function (e) {
        var t = this.getView();
        t.bindElement(
          "/UserSet(UserDataEntry='',IntralogisticsOperationsUser='" + e + "')",
        );
      },
      onResourceInputLiveChanged: function () {
        i.disableNext();
      },
      onResourceInputChanged: function (e) {
        var t = a.trim(e.getParameter("newValue"));
        t = t.toUpperCase();
        this.setResourceInput(t);
        u.setModeEditable(true);
        r.resetPickcartConfig();
        r.getUserSetting().then(
          function (e) {
            this.verifyResourceAndWarehouseNum(t);
          }.bind(this),
        );
      },
      verifyResourceAndWarehouseNum: function (e) {
        this.focusDummyElement();
        this.setBusy(true);
        r.verifyResourceAndWarhouseNumber(e)
          .then(
            function () {
              this.setBusy(false);
              i.setWONumber("");
              i.setQueue("");
              r.setResourceNumber(e);
              u.setNone();
              i.enableNext();
              this.initQueue(e);
            }.bind(this),
          )
          .catch(
            function (e) {
              this.setBusy(false);
              i.disableNext();
              this.displayMessage(e);
              setTimeout(
                function () {
                  this.playAudio(o.ERROR);
                }.bind(this),
                0,
              );
              this.initQueue("");
            }.bind(this),
          );
      },
      displayMessage: function (e, t) {
        var s = this.getI18nText("invalidInput");
        if (a.isString(e)) {
          s = e;
        } else {
          if (a.isJsonString(e.responseText)) {
            s = JSON.parse(e.responseText).error.message.value;
          }
        }
        var i = !!this.getView().$().closest(".sapUiSizeCompact").length;
        if (t) {
          h.information(s, {
            styleClass: i ? "sapUiSizeCompact" : "",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function () {
              var e = this.byId(g);
              e.focus();
            }.bind(this),
          });
        } else {
          h.error(s, {
            styleClass: i ? "sapUiSizeCompact" : "",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function () {
              var e = this.byId(g);
              e.focus();
            }.bind(this),
          });
        }
      },
      focusDummyElement: function () {
        this.byId(d).setValue("");
        this.byId(d).focus();
      },
      getModel: function (e) {
        return this.getOwnerComponent().getModel(e);
      },
      setModel: function (e, t) {
        this.getView().setModel(e, t);
      },
      onPressLogoff: function () {
        this.setBusy(true);
        r.logoffResource()
          .then(
            function () {
              i.setAppProgress(0);
              r.setResourceNumber("");
              r.resetPickcartConfig();
              i.setWONumber("");
              i.setQueue("");
              i.setWoQueue("");
              this.initQueue("");
              i.disableNext();
              u.setEditable(true);
              u.setModeEditable(true);
              this.setBusy(false);
              this.playAudio(o.INFO);
            }.bind(this),
          )
          .catch(
            function (e) {
              this.setBusy(false);
              this.playAudio(o.ERROR);
            }.bind(this),
          );
      },
      onPressNext: function () {
        i.setToLeaveAfterDrop(false);
        if (i.getWONumber()) {
          var e = this.getNavParamByAppProgress();
          var t = a.getNavParamsByStatus(e.sStatus, e.oParam, true);
          if (t.route) {
            i.setAppProgress(t.progress);
            this.navTo(t.route, t.param);
          }
        } else {
          var s = !i.isSystemMode();
          //20260716 - get the chosen mode
          var y = i.isSystemMode();
          this.setBusy(true);
          r.logonResource(s)
            .then(
              function (e) {
                if (e && e.EWMWarehouseOrder !== l) {
                  i.setWONumber(e.EWMWarehouseOrder);
                  i.setWoQueue(e.Queue);
                  //20270716 add 1 parameter to pass 
                  var t = a.getNavParamsByStatus(e.PickcartWhoStatus, e, false, y);
                  if (t.route) {
                    i.setAppProgress(t.progress);
                    this.navTo(t.route, t.param);
                  }
                } else if (s) {
                  var o = r.getResourceNumber();
                  var n = r.getWarehouseNumber();
                  i.setAppProgress(1);
                  this.navTo("warehouseOrderList", {
                    resourceId: o,
                    warehouseNumber: n,
                  });
                }
                u.setEditable(false);
                u.setModeEditable(false);
                this.setBusy(false);
              }.bind(this),
            )
            .catch(
              function (e) {
                this.setBusy(false);
                this.displayMessage(e);
                this.playAudio(o.ERROR);
              }.bind(this),
            );
        }
      },
      onQueueChange: function (e) {
        var t = this.byId(f);
        var r = t.getValue();
        if (!a.isEmpty(r) && a.isEmpty(t.getSelectedKey())) {
          r = "";
          t.setValueState(s.Error);
          t.setValueStateText(this.getI18nText("invalidInput"));
          this.playAudio(o.ERROR);
        } else {
          t.setValueState(s.None);
          t.setValueStateText("");
        }
        t.setValue(r);
        i.setQueue(t.getSelectedKey());
      },
      getNavParamByAppProgress: function () {
        var e;
        var t = {};
        var s = i.getAppProgress();
        var u = o.WHO_STATUS;
        var a = i.getWONumber();
        switch (s) {
          case 2:
            e = u.INITIAL;
            t.EWMWarehouseOrder = a;
            break;
          case 3:
            e = u.PICKING;
            t.EWMWarehouseOrder = a;
            break;
          case 4:
            e = u.DROPPING;
            t.EWMWarehouseOrder = a;
            t.EWMWarehouse = r.getWarehouseNumber();
            break;
        }
        return { sStatus: e, oParam: t };
      },
      navTo: function (e, t) {
        this.getOwnerComponent().getRouter().navTo(e, t);
      },
      setBusy: function (e) {
        this.getView().setBusy(!!e);
      },
      setResourceError: function (e) {
        var t = this.byId(g);
        t.setValue("");
        u.setError();
        if (a.isString(e)) {
          t.setValueStateText(e);
        } else if (e) {
          var s = JSON.parse(e.responseText);
          t.setValueStateText(s.error.message.value);
        }
        t.focus();
      },
      setResourceInput: function (e) {
        this.byId(g).setValue(e);
      },
      getI18nText: function (e, t) {
        var s = this.getModel("i18n");
        return s.getResourceBundle().getText(e, t);
      },
    });
  },
);
//# sourceMappingURL=LogonResource.controller.js.map
