//@ui5-bundle scm/ewm/pickcarts1/Component-preload.js
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/Component",
  [
    "sap/ui/core/UIComponent",
    "sap/tl/ewm/lib/reuses1/components/base/Component",
    "sap/ui/Device",
    "scm/ewm/pickcarts1/model/Models",
  ],
  function (e, t, s, i) {
    "use strict";
    var n = "---connection-view--";
    var o = "---processtasks-view--";
    var a = "---drop-view--";
    var r = "column-cell-button";
    return t.extend("zscm.ewm.pickcarts1.Component", {
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
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/control/Audio",
  ["sap/ui/core/Control"],
  function (e) {
    "use strict";
    var t = e.extend("zscm.ewm.pickcarts1.control.Audio", {
      metadata: {
        properties: {
          src: { type: "String", defaultValue: "", bindable: "bindable" },
          type: { type: "String", defaultValue: "", bindable: "bindable" },
        },
        designTime: true,
      },
    });
    t.prototype.play = function () {
      var e = this.$();
      if (e.length) {
        e[0].play();
      }
    };
    return t;
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/control/AudioList",
  ["sap/ui/core/Control"],
  function (e) {
    "use strict";
    var t = e.extend("zscm.ewm.pickcarts1.control.AudioList", {
      metadata: {
        properties: {
          visible: {
            type: "boolean",
            group: "Appearance",
            defaultValue: false,
          },
        },
        defaultAggregation: "items",
        aggregations: {
          items: {
            type: "sap.ui.core.Control",
            multiple: true,
            singularName: "item",
            bindable: "bindable",
          },
        },
        designTime: true,
      },
    });
    t.prototype.play = function (e) {
      var t = this.getItems();
      for (var a = 0; a < t.length; a++) {
        if (t[a].getType() === e) {
          return t[a].play();
        }
      }
    };
    return t;
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/control/AudioListRenderer",
  [],
  function () {
    "use strict";
    var r = {};
    r.render = function (r, e) {
      var t = r;
      t.write("<div");
      t.writeControlData(e);
      t.write(">");
      var i = e.getItems();
      for (var n = 0; n < i.length; n++) {
        t.renderControl(i[n]);
      }
      t.write("</div>");
    };
    return r;
  },
  true,
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/control/AudioRenderer",
  [],
  function () {
    "use strict";
    var r = {};
    r.render = function (r, t) {
      var e = r;
      e.write("<audio");
      e.writeControlData(t);
      e.writeAttributeEscaped("src", t.getSrc());
      e.write(">");
      e.write("</audio>");
    };
    return r;
  },
  true,
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/Base.controller",
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/ValueState",
    "scm/ewm/pickcarts1/model/PickCartLayout",
    "scm/ewm/pickcarts1/model/LogonResource",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/utils/Const",
    "scm/ewm/pickcarts1/utils/Util",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
  ],
  function (t, e, i, n, a, s, o, r, u, l) {
    "use strict";
    var f = "dummy-input";
    return t.extend("zscm.ewm.pickcarts1.controller.Base", {
      onInit: function () {
        if (this.createPickcart) {
          i.registLayoutChangeCallback(this.createPickcart.bind(this));
        }
        this.getRouter().attachRouteMatched(
          function (t) {
            var e = t.getParameters();
            if (e.name === this.sRouteName) {
              if (!s.getWONumber()) {
                this.getRouter().navTo(o.ROUT_NAME.LOGON, true);
              } else if (e.arguments.bRestore !== "true") {
                this.setBusy(true);
                this.clearPageState();
                this.onRouteMatched(e.arguments);
              }
            }
          }.bind(this),
          this,
        );
        this.setModel(i.init(), "cart");
        a.getUserSetting().then(
          function (t) {
            this.byId("PickcartTitle").bindProperty(
              "text",
              a.getResourcePath(),
            );
          }.bind(this),
        );
        this.init();
      },
      init: function () {},
      sRoutName: "",
      onRouteMatched: function (t) {},
      aManualInput: [],
      buildGroupHeaderInputConfig: function () {},
      clearPageState: function () {
        this.aManualInput.forEach(
          function (t) {
            this.updateInputWithDefault(t.id, "");
          }.bind(this),
        );
      },
      moveFocus: function (t) {
        var i = this.byId(t);
        if (i && i.getValueState() === e.Warning) {
          i.focus();
          return true;
        }
        var n, a, s;
        var o = 0;
        if (t) {
          s = true;
          o = r.findIndex(this.aManualInput, function (e) {
            return e.id === t;
          });
        } else {
          s = false;
          o = this.aManualInput.length;
        }
        if (s) {
          this._updateOptionalFieldsStateByRange(0, o);
        }
        n = this._findFocusFieldByRange(0, o, s);
        if (s && !n) {
          n = this._findFocusFieldByRange(
            o + 1,
            this.aManualInput.length,
            false,
          );
        }
        if (n) {
          jQuery.sap.delayedCall(0, this, function () {
            this.byId(n.id).focus();
          });
          a = true;
        }
        var u = r.findIndex(this.aManualInput, function (t) {
          if (t === n) {
            return true;
          }
          return false;
        });
        if (u === this.aManualInput.length - 1) {
          this.enableCartInteraction();
        }
        return a;
      },
      _findFocusFieldByRange: function (t, e, i) {
        var n, a, s;
        for (s = t; s < e; s++) {
          a = this.aManualInput[s];
          if (!this.isInputValid(a) && this.isInputFocusable(a, i)) {
            n = a;
            break;
          }
        }
        return n;
      },
      _updateOptionalFieldsStateByRange: function (t, i) {
        var n, a;
        for (a = t; a < i; a++) {
          n = this.aManualInput[a];
          if (
            n.bOptional === true &&
            this.byId(n.id).getValueState() === e.Error
          ) {
            this.updateInputWithDefault(n.id, "");
          }
        }
      },
      enableCartInteraction: function () {},
      disableCartInteraction: function () {},
      clearFollowingFields: function (t) {
        var e = this.aManualInput.length;
        var i = r.findIndex(this.aManualInput, function (e) {
          if (e.id === t) {
            return true;
          }
        });
        if (i < e - 1) {
          for (i = i + 1; i < e; i++) {
            this.updateInputWithDefault(this.aManualInput[i].id, "");
          }
        }
      },
      isAllGroupFinished: function () {
        var t = false;
        return t;
      },
      isAllTaskOfGroupFinished: function () {
        var t = true;
        return t;
      },
      goToNextGroup: function () {},
      goToNextTask: function () {},
      goToNextStage: function () {},
      onSubmit: function (t) {
        var i = r.trim(t.getParameter("value"));
        var n = t.getSource();
        var a;
        if (r.isEmpty(i)) {
          n.setValueState(e.Error);
          n.focus();
        } else if (n.getValueState() === e.Success) {
          a = n.getId();
          a = a.split("--")[1];
          this.moveFocus(a);
        }
      },
      verify: function (t, e, i, n) {
        this.updateInputWithDefault(e);
        this.focusDummyElement();
        t.then(
          function (t) {
            this.updateInputWithSuccess(e);
            if (i) {
              i(t);
            }
            if (this.isAllFieldsValid()) {
              this.confirmTask();
            }
            this.moveFocus(e);
          }.bind(this),
        ).catch(
          function (t) {
            var i;
            if (r.isString(t)) {
              i = t;
            }
            this.updateInputWithError(e, i);
            if (n) {
              n(t);
            }
            this.byId(e).focus();
            this.playAudio(o.ERROR);
          }.bind(this),
        );
      },
      transformErrors: function () {},
      focusDummyElement: function () {
        this.updateInputWithDefault(f, "");
        this.focusTo(f);
      },
      isAllFieldsValid: function () {
        var t = 0;
        var e = this.aManualInput.length;
        var i;
        var n = true;
        for (; t < e; t++) {
          i = this.aManualInput[t];
          if (this.isInputFocusable(i, true)) {
            n = false;
            break;
          }
        }
        return n;
      },
      confirmTask: function (t, e, i) {
        this.setBusy(true);
        var n;
        if (t) {
          n = t;
        } else {
          n = this.getConfirmPromise();
        }
        n.then(
          function (t) {
            var i = this.aManualInput[this.aManualInput.length - 1].id;
            this.updateInputWithDefault(i, "");
            if (e) {
              e(t);
            }
            this.onConfirmSuccess(t);
            this.setBusy(false);
          }.bind(this),
        ).catch(
          function (t) {
            if (i) {
              i(t);
            }
            this.onConfirmFail(t);
            this.setBusy(false);
          }.bind(this),
        );
      },
      getConfirmPromise: function () {
        return new Promise(function (t, e) {
          e();
        });
      },
      onConfirmFail: function () {},
      onConfirmSuccess: function () {
        if (this.isAllTaskOfGroupFinished()) {
          if (this.isAllGroupFinished()) {
            this.goToNextStage();
          } else {
            this.goToNextGroup();
            this.buildGroupHeaderInputConfig();
            this.clearPageState();
            this.moveFocus();
          }
        } else {
          this.goToNextTask();
        }
      },
      getDummyPromise: function (t) {
        return new Promise(function (e, i) {
          if (t) {
            e();
          } else {
            i();
          }
        });
      },
      getModel: function (t) {
        return this.getOwnerComponent().getModel(t);
      },
      setModel: function (t, e) {
        this.getView().setModel(t, e);
      },
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },
      navTo: function (t, e) {
        e.bRestore = false;
        this.getRouter().navTo(t, e, true);
      },
      setBusy: function (t) {
        this.getView().setBusy(!!t);
      },
      createPickcart: function (t) {
        var e = this.byId("PickCartTable");
        e.destroyColumns();
        for (var i = 0; i < t; i++) {
          e.addColumn(new sap.m.Column());
        }
      },
      _oTerminationDialog: null,
      onTerminate: function () {
        if (a.canTerminate()) {
          this.setBusy(true);
          var t = s.getWONumber();
          a.getWarehouseOrderStatus(t)
            .then(
              function (t) {
                if (
                  t.EWMWarehouseOrderStatus === o.WHO_STATUS.INITIAL ||
                  t.EWMWarehouseOrderStatus === o.WHO_STATUS.EMPTY
                ) {
                  this.terminateOrder(false, true);
                } else if (t.EWMWarehouseOrderStatus === o.WHO_STATUS.PICKING) {
                  this.setBusy(false);
                  var e = this.getBringHUToDestinationDialog();
                  e.open();
                } else if (
                  t.EWMWarehouseOrderStatus === o.WHO_STATUS.DROPPING
                ) {
                  this.setBusy(false);
                  var e = this.getTerminationDialog();
                  e.open();
                } else {
                  this.terminateOrder(false, true);
                }
              }.bind(this),
            )
            .catch(
              function (t) {
                this.setBusy(false);
              }.bind(this),
            );
        }
      },
      onTerminateBySplit: function () {
        this.terminateOrder(true, false);
      },
      onTerminateByBreak: function () {
        this.terminateOrder(false, false);
      },
      removeDuplicatedId: function () {
        var t = [
          "terminationDialog--terminationdialog-frag-def-text",
          "terminationDialog--terminationdialog-frag-def-btn-split",
          "terminationDialog--terminationdialog-frag-def-btn-break",
          "terminationDialog--terminationdialog-frag-def-btn-close",
          "terminationDialog--terminationdialog-frag-def-dialog",
        ];
        var e;
        t.forEach(function (t) {
          e = sap.ui.getCore().byId(t);
          if (e) {
            e.destroy();
          }
        });
      },
      getTerminationDialog: function () {
        var t = "terminationDialog";
        var e = this.getView();
        if (!this._oTerminationDialog) {
          this.removeDuplicatedId();
          this._oTerminationDialog = sap.ui.xmlfragment(
            t,
            "zscm.ewm.pickcarts1.view.dialog.TerminationDialog",
            this,
          );
          e.addDependent(this._oTerminationDialog);
        }
        return this._oTerminationDialog;
      },
      setBusyForTermination: function (t) {
        if (this._oTerminationDialog) {
          this._oTerminationDialog.setBusy(!!t);
        }
      },
      terminateOrder: function (t, e) {
        var i = s.getWONumber();
        this.setBusyForTermination(true);
        a.submitTerminate(i, t)
          .then(
            function () {
              this.closeTerminationDialog();
              s.setAppProgress(0);
              s.setWONumber("");
              s.setWoQueue("");
              n.setModeEditable(e);
              this.navTo("logon", {}, true);
              this.setBusyForTermination(false);
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function (t) {
              this.setBusyForTermination(false);
              this.setBusy(false);
            }.bind(this),
          );
      },
      closeTerminationDialog: function () {
        if (!this._oTerminationDialog || !this._oTerminationDialog.isOpen()) {
          return;
        }
        this._oTerminationDialog.close();
      },
      getBringHUToDestinationDialog: function () {
        var t = "BringHUToDestinationDialog";
        var e = this.getView();
        if (!this._oBringHUToDestinationDialog) {
          this.removeDuplicatedId();
          this._oBringHUToDestinationDialog = sap.ui.xmlfragment(
            t,
            "zscm.ewm.pickcarts1.view.dialog.BringHUToDestinationDialog",
            this,
          );
          e.addDependent(this._oBringHUToDestinationDialog);
        }
        return this._oBringHUToDestinationDialog;
      },
      closeBringHUToDestinationDialog: function () {
        if (
          !this._oBringHUToDestinationDialog ||
          !this._oBringHUToDestinationDialog.isOpen()
        ) {
          return;
        }
        this._oBringHUToDestinationDialog.close();
      },
      getI18nText: function (t, e) {
        var i = this.getModel("i18n");
        return i.getResourceBundle().getText(t, e);
      },
      getTitle: function (t) {
        return this.getI18nText("warehouseOrderNumber", [t]);
      },
      getLogicalPositionByHU: function () {},
      getDestHUByPosition: function () {},
      getValidPositionAndDestHUByInput: function (t, e) {
        var n = "";
        var a = "";
        var s = "";
        if (e === o.ROUT_NAME.PROCESS_TASKS) {
          s = o.HU_STATUS_PICK.NEED_MATERIAL;
        } else {
          s = o.HU_STATUS_PICK.NEED_DROP;
        }
        if (t !== "") {
          n = this.getLogicalPositionByHU(t);
          if (n !== undefined && n !== "" && i.getPickingStatusById(n) === s) {
            a = t;
            return [a, n];
          } else {
            n = i.getPositionByLable(t);
            if (
              n !== undefined &&
              n !== "" &&
              i.getPickingStatusById(n) === s
            ) {
              a = this.getDestHUByPosition(n);
              return [a, n];
            }
          }
        }
      },
      getInputValue: function (t) {
        var e = this.byId(t).getValue();
        return r.trim(e);
      },
      updateInputWithSuccess: function (t, i) {
        this._updateInput(t, e.Success, "", i);
      },
      updateInputWithError: function (t, i) {
        var n = "";
        if (i === undefined) {
          n = "";
        } else {
          n = i;
        }
        this._updateInput(t, e.Error, n, "");
      },
      updateInputWithDefault: function (t, i) {
        this._updateInput(t, e.None, "", i);
      },
      updateInputWithWarning: function (t, i, n) {
        this._updateInput(t, e.Warning, i, n);
      },
      isInputValid: function (t) {
        var i = false;
        var n = this.byId(t.id);
        if (n.getVisible() && n.getEnabled()) {
          if (
            n.getValueState() === e.Success ||
            n.getValueState() === e.Warning
          ) {
            i = true;
          }
        } else {
          i = true;
        }
        return i;
      },
      isInputFocusable: function (t, i) {
        var n = false;
        var a = this.byId(t.id);
        if (a.getVisible() && a.getEnabled()) {
          if (a.getValueState() === e.Error) {
            n = true;
          } else if (a.getValueState() === e.None) {
            if (t.bOptional) {
              if (!i) {
                n = true;
              }
            } else {
              n = true;
            }
          }
        }
        return n;
      },
      updateInputOptional: function (t, e) {
        var i = r.findIndex(this.aManualInput, function (e) {
          if (e.id === t) {
            return true;
          }
        });
        if (i >= 0) {
          this.aManualInput[i].bOptional = e;
        }
      },
      _updateInput: function (t, e, i, n) {
        var a = this.byId(t);
        a.setValueState(e);
        a.setValueStateText(i);
        if (n !== undefined) {
          a.setValue(n);
        }
      },
      onPressLegend: function () {
        var t = this.byId("legend-grid");
        var e = t.getVisible();
        t.setVisible(!e);
      },
      setErrorsFromConfirmResult: function (t, e) {
        var i = [];
        if (t && t.length) {
          t.forEach(function (t) {
            var e;
            if (t.Failed === "X" && t.FailedMsgJson.length > 0) {
              e = JSON.parse(t.FailedMsgJson);
              if (!r.isEmpty(e.ITAB)) {
                e.ITAB.TYPE = "Error";
              }
              i = i.concat(e.ITAB);
            }
          });
        }
        e.setErrors(i);
        if (i.length > 0) {
          this.onOpenMessagePopover();
        }
      },
      displayWarningInPopover: function (t, e) {
        var i = this.getErrorMessagePopover().getModel().getData();
        var n = { MESSAGE: t, TYPE: "Warning" };
        i.errors.push(n);
        this.getErrorMessagePopover().getModel().setData(i);
        this.getErrorMessagePopover().getModel().updateBindings(true);
        this.onOpenMessagePopover();
      },
      displayErrorInPopover: function (t, e) {
        var i = this.getErrorMessagePopover().getModel().getData();
        var n = { MESSAGE: t, TYPE: "Error" };
        i.errors.push(n);
        this.getErrorMessagePopover().getModel().setData(i);
        this.getErrorMessagePopover().getModel().updateBindings(true);
        this.onOpenMessagePopover();
      },
      onOpenMessagePopover: function () {
        var t = this.byId("errorMessagePopoverBtn");
        var e = this.getErrorMessagePopover();
        t.addDependent(e);
        jQuery.sap.delayedCall(100, this, function () {
          e.openBy(t);
        });
      },
      getErrorMessagePopover: function () {
        var t;
        var e;
        if (!this._oErrorMessagePopover) {
          t = new l({ type: "{TYPE}", title: "{MESSAGE}" });
          this._oErrorMessagePopover = new u({
            items: { path: "/errors", template: t },
          });
        } else {
          this._oErrorMessagePopover.destroyItems();
          e = this._oErrorMessagePopover.getModel().getData().errors;
          for (var i = 0; i < e.length; i++) {
            var n = new l();
            n.setType(s.getMessageType(e[i].TYPE));
            n.setTitle(e[i].MESSAGE);
            this._oErrorMessagePopover.addItem(n);
          }
        }
        return this._oErrorMessagePopover;
      },
      focusTo: function (t) {
        this.byId(t).focus();
      },
      setInputValue: function (t, e) {
        this.byId(t).setValue(e);
      },
      formatNumber: function (t) {
        return r.formatNumber(parseFloat(t), o.MaxDecimalDigits);
      },
      isValidNumberInput: function (t) {
        var e = r.parseNumber(t);
        var i = r.formatNumber(e);
        return r.isEmpty(i) ? false : true;
      },
      playAudio: function (t) {
        r.playAudio(this, t);
      },
    });
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/Drop.controller",
  [
    "scm/ewm/pickcarts1/controller/Base.controller",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/Drop",
    "scm/ewm/pickcarts1/model/PickCartLayout",
    "scm/ewm/pickcarts1/utils/Const",
    "scm/ewm/pickcarts1/utils/Util",
    "sap/m/MessageBox",
  ],
  function (t, i, e, s, n, r, o, a) {
    "use strict";
    var u = "actualBinInput";
    var l = "destHandlingUnitInput";
    var f = "0000000000";
    var c = "/SCWM/RF_EN/056";
    var h = "/SCWM/PICKCART/024";
    return t.extend("zscm.ewm.pickcarts1.controller.Drop", {
      sRouteName: "dropHandlingUnit",
      aManualInput: [{ id: u }, { id: l }],
      aPositionsToConfirm: [],
      init: function () {
        this.aWrongHandlingUnit = [];
        this.setModel(s.init(), "local");
        this.getErrorMessagePopover().setModel(s.init());
      },
      onRouteMatched: function (t) {
        this.toggleButtonStatus(false);
        s.clearData();
        e.getDropData(t.warehouseOrder, e.getWarehouseNumber())
          .then(
            function (t) {
              var i = t[0];
              var e = t[1];
              var o = t[2];
              if (i !== null) {
                n.setData(i);
              }
              if (e.length > 0) {
                s.setData(e, o);
                n.setStatusForDroppingByIds(
                  s.getAllPositions(),
                  r.HU_STATUS_DROP.VALID,
                );
                this.moveFocus();
              } else {
                this.showNoHandlingUnitMessage();
              }
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function (t) {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      onDestBinChange: function (t) {
        var i = o.trim(t.getParameter("newValue"));
        i = i.toUpperCase();
        var n = s.getCurrentExpectedBin();
        if (!o.isEmpty(i)) {
          var r = e.verifySourceBin(n, i);
          this.verify(
            r,
            u,
            function t() {
              this.setInputValue(u, n);
            }.bind(this),
            function t() {
              this.toggleButtonStatus(false);
            }.bind(this),
          );
        } else {
          this.toggleButtonStatus(false);
          this.updateInputWithDefault(u, "");
          this.focusTo(u);
        }
      },
      onDestHandlingUnitChange: function (t) {
        var i = this;
        var u = o.trim(t.getParameter("newValue"));
        u = u.toUpperCase();
        this.setBusy(true);
        e.convertHUID(u)
          .then(
            function (t) {
              this.setBusy(false);
              u = t.Huident;
              var e;
              var f = new Promise(
                function (t, i) {
                  e = this.transformDestHUInput(u);
                  var s = e[1];
                  if (!e) {
                    i();
                  } else if (this.isValidPosition(s)) {
                    t(s);
                  } else {
                    i(e);
                  }
                }.bind(this),
              );
              function c() {
                i.verify(
                  f,
                  l,
                  function t(e) {
                    i.fixWrongHandlingUnit();
                    i.setInputValue(l, u);
                  },
                  function t(e) {
                    if (e) {
                      var s = e[0];
                      var o = e[1];
                      if (s !== undefined) {
                        i.aWrongHandlingUnit.push(o);
                        n.setStatusForDroppingByIds(
                          [o],
                          r.HU_STATUS_DROP.WRONG,
                        );
                      }
                    }
                  },
                );
              }
              if (!o.isEmpty(u)) {
                f.then(
                  function t(e) {
                    if (i.isAllTaskOfGroupFinished()) {
                      var n = s.getHandlingUnitsWithSplitting();
                      var u = s.getCurrentExpectedBin();
                      if (!o.isEmpty(n)) {
                        var l = i.getI18nText("unloadingWithSplittingMsg", [
                          n,
                          u,
                        ]);
                        a.warning(l, { onClose: c });
                        i.playAudio(r.WARNING);
                      } else {
                        c();
                      }
                    } else {
                      c();
                    }
                  },
                  function t() {
                    c();
                  },
                );
              }
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      onDropAll: function () {
        var t = s.getHandlingUnitsWithSplitting();
        var i = s.getCurrentExpectedBin();
        if (!o.isEmpty(t)) {
          var e = this.getI18nText("unloadingWithSplittingMsg", [t, i]);
          a.warning(e, { onClose: this.afterDropAll.bind(this) });
          this.playAudio(r.WARNING);
        } else {
          this.afterDropAll();
        }
      },
      afterDropAll: function () {
        this.fixWrongHandlingUnit();
        this.toggleButtonStatus(false);
        var t = s.getConfirmData();
        var i = t[0];
        var n = t[1];
        if (i && i.length > 0) {
          this.aPositionsToConfirm = s.getPositionsOfCurrentGroup();
          this.confirmTask(
            e.submitTasksInBatch(i, n),
            function (t) {
              if (this.isConfirmSuccess(t)) {
                s.finishCurrentGroup();
              }
            }.bind(this),
          );
        }
      },
      isConfirmSuccess: function (t) {
        var i = true;
        o.find(t, function (t) {
          if (t.Failed === "X") {
            i = false;
            return true;
          }
          return false;
        });
        return i;
      },
      confirmTask: function (t, i, e) {
        this.setBusy(true);
        var o;
        if (t) {
          o = t;
        } else {
          o = this.getConfirmPromise();
        }
        o.then(
          function (t) {
            var e = this.aManualInput[this.aManualInput.length - 1].id;
            this.updateInputWithDefault(e, "");
            if (this.isConfirmSuccess(t)) {
              n.setStatusForDroppingByIds(
                this.aPositionsToConfirm,
                r.HU_STATUS_DROP.INVALID,
              );
              if (i) {
                i(t);
              }
              this.onConfirmSuccess(t);
            } else {
              n.setStatusForDroppingByIds(
                this.aPositionsToConfirm,
                r.HU_STATUS_DROP.WRONG,
              );
              this.aPositionsToConfirm.forEach(function (t) {
                s.updateTaskConfirmStatusByPosition(t, r.TASK_STATUS.INITIAL);
              });
            }
            this.setErrorsFromConfirmResult(t, s);
            this.setBusy(false);
            this.playAudio(r.INFO);
          }.bind(this),
        ).catch(
          function (t) {
            this.setBusy(false);
            this.playAudio(r.ERROR);
          }.bind(this),
        );
      },
      showNoHandlingUnitMessage: function () {
        var t = this.getI18nText(
          "noHandlingUnitUnloadMessage",
          i.getWONumber(),
        );
        a.warning(t, {
          onClose: this.onDropFinish.bind(this),
          textDirection: sap.ui.core.TextDirection.Inherit,
        });
      },
      enableCartInteraction: function () {
        var t = s.getPositionsOfCurrentGroup();
        n.setStatusForDroppingByIds(t, r.HU_STATUS_DROP.NEED_DROP);
        this.toggleButtonStatus(true);
      },
      getConfirmPromise: function () {
        var t = this.getInputValue(l);
        var i = this.transformDestHUInput(t);
        var n = i[0];
        var r = i[1];
        var o = s.getConfirmDataByHU(n);
        var a = o[0];
        var u = o[1];
        this.aPositionsToConfirm = [r];
        if (this.isAllTaskOfGroupFinished()) {
          var f = s.getConfirmDataForEmptyPosition();
          a = a.concat(f);
        }
        return e.submitTasksInBatch(a, u);
      },
      isAllTaskOfGroupFinished: function () {
        var t = true;
        t = s.isReadyToNextGroup();
        return t;
      },
      isAllGroupFinished: function () {
        var t = false;
        if (s.isLastGroup()) {
          t = true;
        }
        return t;
      },
      goToNextGroup: function () {
        s.goToNextGroup();
        this.toggleButtonStatus(false);
      },
      goToNextTask: function () {
        s.updateTaskProgress();
        this.focusTo(l);
      },
      goToNextStage: function () {
        this.onDropFinish();
      },
      fixWrongHandlingUnit: function () {
        if (this.aWrongHandlingUnit.length > 0) {
          n.setStatusForDroppingByIds(
            this.aWrongHandlingUnit,
            r.HU_STATUS_DROP.VALID,
          );
          this.aWrongHandlingUnit = [];
        }
      },
      transformDestHUInput: function (t) {
        var i;
        var e;
        var r = s.getAllDestHUs();
        if (o.includes(r, t)) {
          i = t;
          e = s.getPositionIdByHU(t);
          return [i, e];
        } else if ((e = n.getPositionByLable(t)) !== undefined) {
          i = s.getDestHUByPositionId(e);
          return [i, e];
        }
      },
      isValidPosition: function (t) {
        var i = false;
        var e = s.getPositionsOfCurrentGroup();
        if (
          o.includes(e, t) &&
          n.getDropingStatusById(t) === r.HU_STATUS_DROP.NEED_DROP
        ) {
          i = true;
        }
        return i;
      },
      toggleButtonStatus: function (t) {
        this.byId("dropAllButton").setEnabled(t);
      },
      formatPositionIcon: function (t) {
        var i = r.HU_STATUS_DROP;
        var e = "";
        switch (t) {
          case i.INVALID:
            e = "";
            break;
          case i.VALID:
            e = "sap-icon://add-product";
            break;
          case i.NEED_DROP:
            e = "sap-icon://less";
            break;
          case i.WRONG:
            e = "sap-icon://decline";
            break;
        }
        return e;
      },
      formatPositionType: function (t) {
        var i = r.HU_STATUS_DROP;
        var e = "Transparent";
        switch (t) {
          case i.INVALID:
            e = "Transparent";
            break;
          case i.VALID:
            e = "Default";
            break;
          case i.NEED_DROP:
            e = "Emphasized";
            break;
          case i.DROPPED:
            e = "Accept";
            break;
          case i.WRONG:
            e = "Reject";
            break;
        }
        return e;
      },
      formatProgressPercentValue: function (t, i) {
        if (i.length > 0) {
          return (t * 100) / i.length;
        }
        return 0;
      },
      formatProgressDisplayValue: function (t, i) {
        return t + "/" + i.length;
      },
      formatPositionEnabled: function (t) {
        var i = true;
        if (t === r.HU_STATUS_DROP.INVALID) {
          i = false;
        }
        return i;
      },
      onDropFinish: function () {
        if (i.getToLeaveAfterDrop() === true) {
          this.terminateOrder(true, false);
          return;
        }
        var t = !i.isSystemMode();
        this.setBusy(true);
        e.logonResource(t)
          .then(
            function (s) {
              if (s && s.EWMWarehouseOrder !== f) {
                i.setWONumber(s.EWMWarehouseOrder);
                var n = o.getNavParamsByStatus(s.PickcartWhoStatus, s, false);
                if (n.route) {
                  i.setAppProgress(n.progress);
                  this.navTo(n.route, n.param);
                }
              } else if (t) {
                var r = e.getResourceNumber();
                var a = e.getWarehouseNumber();
                i.setWONumber("");
                i.setAppProgress(1);
                this.navTo("warehouseOrderList", {
                  resourceId: r,
                  warehouseNumber: a,
                });
              }
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function (t) {
              if (!o.isString(t) && o.isJsonString(t.responseText)) {
                var i = JSON.parse(t.responseText).error.code;
                if (i.toUpperCase() === c) {
                  var e = this.getI18nText("noWarehouseOrderAvailableMsg");
                  a.information(e);
                  this.playAudio(r.INFO);
                } else if (i.toUpperCase() === h) {
                  var e = this.getI18nText("documentaryBatchesNotSupportedMsg");
                  a.information(e);
                  this.playAudio(r.INFO);
                } else {
                  this.playAudio(r.ERROR);
                }
              } else {
                this.playAudio(r.ERROR);
              }
              this.setBusy(false);
            }.bind(this),
          );
      },
    });
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/LogonResource.controller",
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ValueState",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/LogonResource",
    "scm/ewm/pickcarts1/utils/Const",
    "scm/ewm/pickcarts1/utils/Util",
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
          this.setBusy(true);
          r.logonResource(s)
            .then(
              function (e) {
                if (e && e.EWMWarehouseOrder !== l) {
                  i.setWONumber(e.EWMWarehouseOrder);
                  i.setWoQueue(e.Queue);
                  var t = a.getNavParamsByStatus(e.PickcartWhoStatus, e, false);
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
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/Main.controller",
  [
    "sap/ui/core/mvc/Controller",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/control/Audio",
  ],
  function (t, i, e) {
    "use strict";
    var o = "audio-player";
    return t.extend("zscm.ewm.pickcarts1.controller.Main", {
      onInit: function () {
        this.getView().setModel(i.init(), "global");
      },
      bindAudioList: function (t) {
        this.byId(o).bindItems({
          path: "/AudioURISet",
          template: new e({ src: "{AudioUri}", type: "{Msgty}" }),
          filters: t,
        });
      },
    });
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/PickCartConnection.controller",
  [
    "scm/ewm/pickcarts1/controller/Base.controller",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/model/PickCartConnection",
    "scm/ewm/pickcarts1/model/PickCartLayout",
    "sap/ui/core/ValueState",
    "sap/m/Dialog",
    "sap/m/ButtonType",
    "scm/ewm/pickcarts1/utils/Util",
    "scm/ewm/pickcarts1/utils/Const",
  ],
  function (t, i, e, n, s, o, a, r, u, l) {
    "use strict";
    var c = "connection-hu-input";
    var d = "connection-logical-position-input";
    return t.extend("zscm.ewm.pickcarts1.controller.PickCartConnection", {
      sRouteName: "connection",
      aManualInput: [{ id: c }, { id: d }],
      init: function () {
        this.setModel(n.init(), "local");
        this.getErrorMessagePopover().setModel(n.init());
      },
      onRouteMatched: function (t) {
        n.clearData();
        i.getPickcartConnectionData(t.warehouseOrder)
          .then(
            function (o) {
              var a = o[0];
              var r = o[1];
              s.setData(a);
              n.setHandlingUnit(r);
              var l = n.getConnectedPositions();
              if (l.length > 0) {
                s.setStatusForPreparationByIds(l, 1);
              }
              this.moveFocus();
              this.setBusy(false);
              if (!u.isEmpty(e.getQueue()) && !u.isEmpty(e.getWoQueue())) {
                if (
                  e.getQueue().toUpperCase() !== e.getWoQueue().toUpperCase()
                ) {
                  var c = this.getI18nText("hasWoFromdifferentQueue", [
                    i.getResourceNumber(),
                    t.warehouseOrder,
                    e.getWoQueue(),
                  ]);
                  this.displayWarningInPopover(c, n);
                }
              }
            }.bind(this),
          )
          .catch(
            function () {
              n.clearHandlingUnits();
              this.setBusy(false);
              this.playAudio(l.ERROR);
            }.bind(this),
          );
      },
      onHandlingUnitChange: function (t) {
        var e = u.trim(t.getParameter("newValue"));
        e = e.toUpperCase();
        this.setBusy(true);
        i.convertHUID(e)
          .then(
            function (t) {
              e = t.Huident;
              this.setInputValue(c, e);
              var i;
              var n = s.getPositionInfoByLable(e);
              var o = this.getI18nText("scanLogicPostionWhenInputPickHU", [e]);
              if (!u.isEmpty(e)) {
                i = this.getHandlingUnitVerifyPromise(e);
                this.verify(
                  i,
                  c,
                  function t() {
                    if (n) {
                      this.updateInputWithWarning(c, o, e);
                      this.playAudio(l.WARNING);
                    }
                  }.bind(this),
                );
              } else {
                this.focusTo(c);
                this.updateInputWithDefault(c, "");
              }
            }.bind(this),
          )
          .finally(
            function () {
              this.setBusy(false);
            }.bind(this),
          );
      },
      getHandlingUnitVerifyPromise: function (t) {
        var s = n.getCurrentHandlingUnit();
        var o = this.getI18nText("handlingUnitHasBeenOccupiedMsg", [t]);
        var a;
        if (n.isHandlingUnitReserved(t)) {
          a = new Promise(function (t, i) {
            i(o);
          });
        } else if (n.isContainsSpecialCharacter(t)) {
          a = new Promise(function (t, i) {
            i();
          });
        } else {
          a = i.validateHandlingUnit(
            e.getWONumber(),
            s.HndlgUnitNumberInWhseOrder,
            t,
          );
        }
        return a;
      },
      onLogicalPositionChange: function (t) {
        var i = u.trim(t.getParameter("newValue"));
        var e = s.getPositionInfoByLable(i);
        var o = this.getI18nText("logicalPositionHasBeenOccupiedMsg", [i]);
        var a = new Promise(function (t, i) {
          if (!e) {
            i();
          } else if (
            n.isLogicalPositionReserved(e.HandlingUnitLogicalPosition)
          ) {
            i(o);
          } else {
            n.updatePositionId(e.HandlingUnitLogicalPosition);
            t();
          }
        });
        this.verify(a, d);
      },
      onSelectPosition: function (t) {
        var i = t.getSource().getType();
        if (i === r.Emphasized) {
          var e = t.getSource().getText();
          var o = s.getPositionByLable(e);
          n.debundPreparation(o, e);
          if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment(
              "zscm.ewm.pickcarts1.view.dialog.DebundleHUAndPosition",
              this,
            );
          }
          this.getView().addDependent(this._oDialog);
          this._oDialog.open();
        }
      },
      formatMessage: function (t, i, e) {
        var n = this.getModel("i18n");
        return n.getResourceBundle().getText(t, [i, e]);
      },
      closeDialog: function () {
        n.debundFinished();
        this._oDialog.setBusy(false);
        this._oDialog.close();
      },
      onResetPressed: function () {
        this.setBusy(true);
        i.resetConnectionData()
          .then(
            function () {
              var t = n.getAllLogicalPositions();
              s.setStatusForPreparationByIds(t, 0);
              n.resetAllHandlingUnits();
              this.updateInputWithDefault(c, "");
              this.updateInputWithDefault(d, "");
              this.moveFocus();
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(l.ERROR);
            }.bind(this),
          );
      },
      debundlePosition: function () {
        var t = n.getDebundleHandlingUnit();
        var i = t.HandlingUnitLogicalPosition;
        var e = t.HandlingUnitNumber;
        n.clearHandlingUnit(t);
        this._oDialog.setBusy(true);
        this.confirmTask(t, true)
          .then(
            function () {
              this.closeDialog();
              this.updateInputWithDefault(c, "");
              this.updateInputWithDefault(d, "");
              this.moveFocus();
              this.playAudio(l.INFO);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.closeDialog();
              jQuery.sap.log.error("debund position error");
              n.restoreHandlingUnit(t, e, i);
              this.playAudio(l.ERROR);
            }.bind(this),
          );
      },
      formatProgressPercentValue: function (t, i) {
        if (i.length > 0) {
          return (t * 100) / i.length;
        }
        return 0;
      },
      formatProgressDisplayValue: function (t, i) {
        return t + "/" + i.length + " HUs";
      },
      formatValueState: function (t) {
        var i = o.None;
        if (t === "INVALID") {
          i = o.Error;
        }
        return i;
      },
      formatPackagingMaterial: function (t, i) {
        var e = t;
        if (u.isEmpty(t)) {
          e = i;
        }
        return e;
      },
      onNavToProcessTasks: function () {
        e.setAppProgress(3);
        this.navTo("processTasks", { warehouseOrder: e.getWONumber() });
      },
      confirmTask: function (t, e) {
        this.setBusy(true);
        if (!t) {
          t = n.getCurrentHandlingUnit();
        }
        return i
          .submitConnectiondData(t)
          .then(
            function () {
              var t;
              if (e) {
                var i = n.getDebundldPosition();
                t = s.getPositionInfoByLable(i);
                s.updatePositionStatus(t, 0);
              } else {
                var o = n.getCurrentHandlingUnitLogicalPosition();
                t = s.getPositionInfoById(o);
                s.updatePositionStatus(t, 1);
              }
              n.updateConnectionProgress(!e);
              n.prepareHandlingUnit();
              this.updateInputWithDefault(c, "");
              this.updateInputWithDefault(d, "");
              if (n.isHandlingUnitsReady()) {
                this.onNavToProcessTasks();
              }
              this.setBusy(false);
              this.moveFocus();
              this.playAudio(l.INFO);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(l.ERROR);
            }.bind(this),
          );
      },
    });
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/ProcessWarehouseTasks.controller",
  [
    "scm/ewm/pickcarts1/controller/Base.controller",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/model/ProcessWarehouseTasks",
    "scm/ewm/pickcarts1/model/SerialNumber",
    "scm/ewm/pickcarts1/model/PickCartLayout",
    "scm/ewm/pickcarts1/utils/Const",
    "sap/ui/core/ValueState",
    "scm/ewm/pickcarts1/utils/Util",
  ],
  function (t, e, i, n, s, a, r, u, o) {
    "use strict";
    var l = "source-bin-input";
    var c = "source-hu-input";
    var p = "product-input";
    var f = "batch-editable-input";
    var h = "dest-hu-input";
    var S = "id-serial-number";
    var d = "id-input-serialNumber";
    var T = "lowQtyCheck--id-input-serialNumber";
    var g = "quantityAdjustment--id-input-serialNumber";
    var y = "splitting-ok-btn";
    return t.extend("zscm.ewm.pickcarts1.controller.ProcessWarehouseTasks", {
      sRouteName: "processTasks",
      aManualInput: [{ id: l }, { id: c }, { id: p }, { id: f }, { id: h }],
      oDestHU: {},
      bInitException: true,
      init: function () {
        this.setModel(n.init(), "local");
        this.getErrorMessagePopover().setModel(n.init());
        this.setModel(s.init(), "serialNum");
        this.aWrongPositions = [];
      },
      onRouteMatched: function (t) {
        n.clearData();
        this.resetSerialNumber();
        e.getPickingData(t.warehouseOrder, e.getWarehouseNumber())
          .then(
            function (t) {
              var i = t[0];
              var s = t[1];
              var u = t[2];
              a.setData(i);
              n.setTaskGroups(s, u);
              this.initCartStatus(n.getAllTasks());
              this.buildGroupHeaderInputConfig();
              if (this.bInitException) {
                e.getExceptions()
                  .then(
                    function (t) {
                      n.setExceptions(t);
                      this.initExceptionButtons();
                      this.bInitException = false;
                    }.bind(this),
                  )
                  .catch(
                    function () {
                      this.playAudio(r.ERROR);
                    }.bind(this),
                  );
              }
              this.moveFocus();
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      buildGroupHeaderInputConfig: function () {
        if (n.isSourceHandlingUnitMandatory()) {
          this.aManualInput[1].bOptional = false;
        } else {
          this.aManualInput[1].bOptional = true;
        }
        if (n.isMultiSourceHUOfCurrentGroup()) {
          this.getStock();
        }
      },
      getStock: function () {
        var t = n.getProductOfCurrentGroup();
        var i = n.getSourceBinOfCurrentGroup();
        this.setBusy(true);
        e.verifySourceBinWithStock(i, t)
          .then(
            function (t) {
              n.setStocksOfCurrentGroup(t);
              if (!n.isSourceBinPickable()) {
                this.setSourceHUMandatory();
              }
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function (t) {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      onSourceBinChange: function (t) {
        var i = o.trim(t.getParameter("newValue"));
        i = i.toUpperCase();
        if (o.isEmpty(i)) {
          this.updateInputWithDefault(l, "");
          n.disableException();
          this.focusTo(l);
        } else {
          var a = n.getSourceBinOfCurrentGroup();
          var r;
          r = e.verifySourceBin(a, i);
          this.verify(
            r,
            l,
            function t(e) {
              this.setInputValue(l, a);
              if (
                !n.isSerialNumberEnabled() ||
                s.getSerialNumberCount() === 0
              ) {
                n.setFullDenialEnable(true);
              }
            }.bind(this),
            function t(e) {
              n.disableException();
            },
          );
        }
      },
      onSourceHUChange: function (t) {
        var i = o.trim(t.getParameter("newValue"));
        i = i.toUpperCase();
        var s = n.getSourceHUInitValue();
        var a = n.isMultiSourceHUOfCurrentGroup();
        var u;
        if (a) {
          this.clearFollowingFields(c);
          this.resetSerialNumber();
        }
        if (o.isEmpty(i)) {
          this.updateInputWithDefault(c, "");
          if (a && n.isSourceBinPickable()) {
            n.setSourceHU("");
            this.moveFocus(c);
          } else {
            this.focusTo(c);
          }
        } else {
          this.setBusy(true);
          e.convertHUID(i)
            .then(
              function (t) {
                this.setBusy(false);
                i = t.Huident;
                if (a) {
                  i = o.removeLeadingZeroinNumeric(i);
                  u = this.verifySourceHUForMulitHU(i);
                } else {
                  u = e.verifySourceHU(s, i);
                }
                this.verify(
                  u,
                  c,
                  function t() {
                    n.setSourceHU(i);
                    this.setInputValue(c, i);
                  }.bind(this),
                  function t() {
                    n.setSourceHU("");
                  },
                );
              }.bind(this),
            )
            .catch(
              function () {
                this.setBusy(false);
                this.playAudio(r.ERROR);
              }.bind(this),
            );
        }
      },
      verifySourceHUForMulitHU: function (t) {
        var e = false;
        if (n.isSourceHuPickable(t)) {
          e = true;
        }
        return this.createPromise(e);
      },
      createPromise: function (t) {
        var e;
        if (t) {
          e = new Promise(function (t, e) {
            t();
          });
        } else {
          e = new Promise(function (t, e) {
            e();
          });
        }
        return e;
      },
      onSourceHUSubmit: function (t) {
        var e = o.trim(t.getParameter("value"));
        var i = t.getSource();
        if (o.isEmpty(e)) {
          if (n.isSourceBinPickable()) {
            n.setSourceHU("");
            this.updateInputWithDefault(c, "");
            this.moveFocus(c);
          } else {
            i.setValueState(u.Error);
            i.focus();
          }
        } else if (i.getValueState() === u.Success) {
          this.moveFocus();
        }
      },
      onBatchChange: function (t) {
        var i = o.trim(t.getParameter("newValue"));
        i = i.toUpperCase();
        var s = n.getProductOfCurrentGroup();
        var a = n.getSourceBinOfCurrentGroup();
        var r = n.getSourceHUOfCurrentGroup();
        var u = n.getBatchInitValue();
        var l = n.isMultiSourceHUOfCurrentGroup();
        var c;
        if (o.isEmpty(i)) {
          this.updateInputWithDefault(f, "");
          this.focusTo(f);
        } else {
          if (l) {
            if (u.substr(1, 1) !== "0" && u !== "") {
              i = o.removeLeadingZeroinNumeric(i);
            }
            c = this.verifyBatchForMulitHU(r, u, i);
          } else {
            c = e.verifyBatch(u, i, s, a);
          }
          this.verify(
            c,
            f,
            function t() {
              n.setBatchNo(i);
              this.setInputValue(f, i);
            }.bind(this),
          );
        }
      },
      verifyBatchForMulitHU: function (t, e, i) {
        var s = false;
        if (!o.isEmpty(e) && e === i) {
          s = true;
        } else if (o.isEmpty(e) && n.IsBatchWithStock(t, i)) {
          s = true;
        }
        return this.createPromise(s);
      },
      onProductChange: function (t) {
        var i = o.trim(t.getParameter("newValue"));
        i = i.toUpperCase();
        var s = n.getProductOfCurrentGroup();
        var a;
        if (o.isEmpty(i)) {
          this.updateInputWithDefault(p, "");
          this.focusTo(p);
        } else {
          a = e.verifyProduct(s, i);
          this.verify(
            a,
            p,
            function t() {
              this.setInputValue(p, s);
            }.bind(this),
          );
        }
      },
      getLogicalPositionByHU: function (t) {
        return n.getLogicalPositionByHU(t);
      },
      getDestHUByPosition: function (t) {
        return n.getDestHUByPosition(t);
      },
      transformDestHUInput: function (t) {
        var e;
        var i;
        var s = n.getAllDestHUsFromTasks();
        if (o.includes(s, t)) {
          e = t;
          i = n.getPositionFromTasksByHU(t);
          return [e, i];
        } else if ((i = a.getPositionByLable(t)) !== undefined) {
          e = n.getDestHUFromTasksByPosition(i);
          return [e, i];
        }
      },
      fixWrongPosition: function () {
        var t = [];
        if (this.aWrongPositions.length > 0) {
          this.aWrongPositions.forEach(function (e) {
            if (a.getPickingSplitFlagById(e)) {
              a.setStatusForPickingById(
                e,
                r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION,
              );
            } else if (n.getTaskConfirmStatusByPosition(e)) {
              a.setStatusForPickingById(e, r.HU_STATUS_PICK.COMPLETED);
            } else {
              t.push(e);
            }
          });
          a.setStatusForPickingByIds(t, r.HU_STATUS_PICK.VALID);
          this.aWrongPositions = [];
        }
      },
      onDestHUChange: function (t) {
        var i = o.trim(t.getParameter("newValue"));
        i = i.toUpperCase();
        this.setBusy(true);
        e.convertHUID(i)
          .then(
            function (t) {
              this.setBusy(false);
              i = t.Huident;
              if (o.isEmpty(i)) {
                this.updateInputWithDefault(h, "");
                this.focusTo(h);
              } else {
                if (
                  n.isSerialNumberEnabled() &&
                  !this.isAllSerialNumberFinished()
                ) {
                  var e = this.getI18nText("missSerialNumMsg");
                  this.openSerialNumberPopover();
                  this.updateSerialNumInput(u.Warning, e, "");
                  this.updateInputWithDefault(h, "");
                  this.playAudio(r.WARNING);
                  return;
                }
                var s = this.getVerifyDestHUorPostionPromise(i);
                this.verify(
                  s,
                  h,
                  function t(e) {
                    this.fixWrongPosition();
                    this.setInputValue(h, i);
                  }.bind(this),
                  function t(e) {
                    this.updateInputWithError(h, e);
                  }.bind(this),
                );
              }
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      getVerifyDestHUorPostionPromise: function (t) {
        var e = this.getI18nText("invalidInput");
        var i = this.getValidPositionAndDestHUByInput(t, this.sRouteName);
        var n, s;
        return new Promise(
          function (u, l) {
            if (o.isEmpty(i)) {
              i = this.transformDestHUInput(t);
              n = a.getInvalidPickingPositions();
              s = a.getEmptyPositions();
              if (i !== undefined && o.includes(n, i[1])) {
                this.aWrongPositions.push(i[1]);
                a.setStatusForPickingById(i[1], r.HU_STATUS_PICK.WRONG);
              } else if (i !== undefined && o.includes(s, i[1])) {
                e = this.getI18nText("invalidPositionMsg");
              }
              l(e);
            } else {
              u(i);
            }
          }.bind(this),
        );
      },
      onBringHUToDestinationBeforeLeave: function () {
        this.goToDropping();
        i.setToLeaveAfterDrop(true);
        this.closeBringHUToDestinationDialog();
      },
      onShowTerminationDialog: function () {
        var t = this.getTerminationDialog();
        t.open();
        this.closeBringHUToDestinationDialog();
      },
      confirmTask: function () {
        var t = n.isMultiSourceHUOfCurrentGroup();
        var e = this.getInputValue(h);
        var i = this.transformDestHUInput(e);
        var s = i[0];
        var a = i[1];
        if (t) {
          this.confirmTaskForMultisourceHU(s, a);
        } else {
          this.confirmTaskForNormal(s, a);
        }
      },
      getConfirmData: function (t, e) {
        var i = [];
        var a = [];
        i = n.getConfirmData(t, e);
        if (n.isSerialNumberEnabled()) {
          var r = s.getSerialNumbers();
          a = n.getConfirmTasksWithSerialNumber(i[0], r);
        }
        i.push(a);
        return i;
      },
      getConfirmDataForMultipleSourceHU: function (t) {
        var e = [];
        var i = [];
        e = n.getConfirmDataForMultipleSourceHU(t);
        if (n.isSerialNumberEnabled()) {
          var a = s.getSerialNumbers();
          i = n.getConfirmTasksWithSerialNumber(e[0], a);
        }
        e.push(i);
        return e;
      },
      confirmTaskForNormal: function (t, i) {
        this.setBusy(true);
        var s = this.getConfirmData(t);
        e.submitTasksInBatch(s[0], s[1], s[2])
          .then(
            function (e) {
              if (n.isAllConfirmSuccess(e)) {
                if (n.needLowQuantityCheck(e)) {
                  this.oDestHU = { sDestHU: t, sLogicalPosition: i };
                  this.openLowQuantityCheckDialog();
                } else {
                  this.navToNextTaskOrDropping(t, i);
                }
                this.playAudio(r.INFO);
              } else {
                a.setStatusForPickingById(i, r.HU_STATUS_PICK.WRONG);
                this.updateInputWithDefault(h, "");
                this.focusTo(h);
                this.playAudio(r.ERROR);
              }
              this.setErrorsFromConfirmResult(e, n);
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      confirmTaskForMultisourceHU: function (t, i) {
        var s = n.getCurrentTaskGroup();
        var u = s.currentPickQty;
        this.setBusy(true);
        var o = this.getConfirmDataForMultipleSourceHU(t);
        e.submitTasksInBatch(o[0], o[1], o[3])
          .then(
            function (e) {
              if (n.isAllConfirmSuccess(e)) {
                if (n.isFinishedPickingOfTask() && n.needLowQuantityCheck(e)) {
                  this.oDestHU = { sDestHU: t, sLogicalPosition: i };
                  this.openLowQuantityCheckDialog();
                } else {
                  this.completeOneSourceHUPicking(i, u, o[0], o[2]);
                }
                this.playAudio(r.INFO);
              } else {
                a.setStatusForPickingById(i, r.HU_STATUS_PICK.WRONG);
                this.updateInputWithDefault(h, "");
                this.playAudio(r.ERROR);
              }
              this.setErrorsFromConfirmResult(e, n);
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      navToNextTaskOrDropping: function (t, e) {
        n.updateTasksConfirmStatusByHU(t);
        a.setStatusForPickingById(e, r.HU_STATUS_PICK.COMPLETED);
        n.updatePickingTaskProgress(t);
        this.updateInputWithDefault(h, "");
        this.focusTo(h);
        this.proceedAfterFinishOneTask();
      },
      proceedAfterFinishOneTask: function () {
        if (n.isSerialNumberEnabled()) {
          this.resetSerialNumber();
        }
        if (n.isAllWarehouseTasksReadyInOneGroup()) {
          n.updatePickingTaskGroupProgress();
          if (n.isAllGroupFinished()) {
            this.goToNextGroup();
          } else {
            this.goToDropping();
          }
        } else if (n.isSerialNumberEnabled()) {
          this.updateCartStatusForSerialManaged();
          n.enableException();
          n.setFullDenialEnable(true);
          this.enableSerialNumberIcon();
          this.openSerialNumberPopover();
        }
      },
      completeOneSourceHUPicking: function (t, e, i, s) {
        a.setStatusForPickingById(t, r.HU_STATUS_PICK.VALID);
        var u = n.isFinishedPickingOfTask();
        n.updataCurrentActualQuantity(e);
        n.updateCurrentStock(e);
        if (!n.isSourceBinPickable()) {
          this.setSourceHUMandatory();
        }
        if (s !== undefined && s.quantity !== 0) {
          i.pop();
          if (i.length > 0) {
            n.updatePickingTaskProgressForMulti(i);
            n.updateTasksConfirmStatus(i);
          }
          n.updateTaskByTaskItem(s);
        } else {
          n.updatePickingTaskProgressForMulti(i);
          n.updateTasksConfirmStatus(i);
        }
        if (n.isSerialNumberEnabled()) {
          this.resetSerialNumber();
        }
        if (u) {
          this.proceedAfterFinishOneTask();
        } else {
          this.initializeNextSourceHUPicking();
        }
      },
      initializeNextSourceHUPicking: function () {
        this.updateInputWithDefault(c, "");
        this.updateInputWithDefault(p, "");
        this.updateInputWithDefault(f, "");
        this.updateInputWithDefault(h, "");
        n.setCurrentPickQuantity(0);
        n.disableException();
        n.setSourceHU("");
        this.focusTo(c);
      },
      setSourceHUMandatory: function () {
        this.aManualInput[1].bOptional = false;
        n.setSourceHandlingUnitMandatory(true);
      },
      goToNextGroup: function () {
        n.updateCurrentTaskGroup();
        this.initCartStatus(n.getAllTasks());
        n.disableException();
        this.updateInputWithDefault(l, "");
        this.updateInputWithDefault(c, "");
        this.updateInputWithDefault(p, "");
        this.updateInputWithDefault(f, "");
        this.updateInputWithDefault(h, "");
        this.moveFocus();
        this.buildGroupHeaderInputConfig();
      },
      goToDropping: function (t) {
        i.setAppProgress(4);
        this.navTo("dropHandlingUnit", {
          warehouseOrder: i.getWONumber(),
          warehouseNumber: e.getWarehouseNumber(),
        });
        n.clearData();
      },
      onPressException: function (t) {
        var e = t.getSource().getBindingContext("local").getObject();
        var i = r.EXCEPTION_TYPE;
        var s = e.InternalProcessCode;
        n.setExceptionCode(e.WarehouseTaskExceptionCode);
        switch (s) {
          case i.BIDF:
            this.openFullDenialDialog();
            break;
          case i.BIDP:
            this.openPartialDenialDialog();
            break;
          case i.SPLT:
            this.openSplittingFromDialog();
            break;
          case i.DIFF:
            this.openDifferenceDenialDialog();
            break;
        }
      },
      isExceptionDestHUValid: function (t) {
        var e = n.getCurrentTaskGroup().tasks;
        var i = false;
        var s = o.find(e, function (e) {
          var i = n.getLogicalPositionByHU(e.destHU);
          if (
            e.destHU === t &&
            !o.isEmpty(i) &&
            a.getPickingStatusById(e.logicalPosition) ===
              r.HU_STATUS_PICK.NEED_MATERIAL
          ) {
            return true;
          }
          return false;
        });
        if (s) {
          i = true;
        }
        return i;
      },
      onCancelDialog: function (t) {
        t.getSource().getParent().close();
        n.clearExceptionInfo();
      },
      onPartialDenialDestHUChange: function (t) {
        var i = o.trim(t.getParameters().newValue);
        i = i.toUpperCase();
        this.setBusy(true);
        e.convertHUID(i)
          .then(
            function (t) {
              this.setBusy(false);
              i = t.Huident;
              this.setInputValue("partialDenial-destHU-input", i);
              var e = n.getExceptionPickedQuantity();
              var s;
              var a = this.getValidPositionAndDestHUByInput(i, this.sRouteName);
              var u;
              if (a !== undefined) {
                u = a[0];
                n.setExceptionDestHU(u);
                n.setExceptionDestHUState(r.CONTROL_STATUS.VALID);
                this.focusTo("partialDenial-quantity-input");
                if (!o.isEmpty(e)) {
                  s = Number(e);
                  if (s >= n.getTaskQuantityByDestHU(u)) {
                    n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
                    this.setInputValue("partialDenial-quantity-input", "");
                    this.focusTo("partialDenial-quantity-input");
                    this.playAudio(r.ERROR);
                  } else {
                    n.setExceptionPickedQuantity(s.toString());
                    n.setExceptionPickedQuantityState(r.CONTROL_STATUS.VALID);
                  }
                }
              } else {
                n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
                this.setInputValue("partialDenial-destHU-input", "");
                this.focusTo("partialDenial-destHU-input");
                this.playAudio(r.ERROR);
              }
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      isQuantityOverflow: function (t) {
        if (o.isInteger(t)) {
          return false;
        } else {
          return t.toString().split(".")[1].length > 3;
        }
      },
      getExceptionSerialInputId: function () {
        var t = n.getExceptionCode();
        var e = n.getInternalExceptionCode(t);
        var i = r.EXCEPTION_TYPE;
        switch (e) {
          case i.BIDP:
            return "partialDenial--id-input-serialNumber";
          case i.SPLT:
            return "splitting--id-input-serialNumber";
          case i.DIFF:
            return "difference--id-input-serialNumber";
          default:
            return "quantityAdjustment--id-input-serialNumber";
        }
      },
      addSerialNumber: function (t, e) {
        s.addSerialNumber(t, e);
        if (e) {
          if (s.getSerialNumberCount() !== 0) {
            n.setFullDenialEnable(false);
          }
          if (this.isAllSerialNumberFinished()) {
            n.disableException();
          }
        }
      },
      verifyExceptionSerialNumberInput: function (t, e) {
        var i = this.getSerialNumberVerifyPromise(t);
        i.then(
          function () {
            var i = n.getExceptionDestHU();
            var u = n.getPositionFromTasksByHU(i);
            var l;
            if (o.isEmpty(i)) {
              var c = n.getAlternativeUOMRatio();
              l = c * n.getCurrentPickQuantity();
              i = a.getUnprocessedPositions()[0];
            } else {
              l = n.getTasksBaseQuantityByPosition(u);
            }
            if (s.getSerialNumberCount() >= l - 1) {
              var p = this.getI18nText("serialNumExceedMsg", [i]);
              this.updateInputWithError(e, p);
              this.focusTo(e);
              this.playAudio(r.ERROR);
            } else {
              this.addSerialNumber(t, true);
              n.updateExceptionPickedUoM(s.getSerialNumberCount());
              this.updateInputWithDefault(e, "");
              this.focusTo(e);
            }
          }.bind(this),
        ).catch(
          function (t) {
            this.updateInputWithError(e, t);
            this.focusTo(e);
            this.playAudio(r.ERROR);
          }.bind(this),
        );
      },
      onExceptionSerialNumberChange: function (t) {
        var e = o.trim(t.getParameter("newValue"));
        e = e.toUpperCase();
        var i = this.getExceptionSerialInputId();
        if (o.isEmpty(e)) {
          this.updateInputWithDefault(i, "");
          this.focusTo(i);
        } else {
          this.verifyExceptionSerialNumberInput(e, i);
        }
      },
      onExceptionQuantitySubmit: function (t) {
        var e = o.trim(t.getParameter("value"));
        var i = Number(e);
        if (this.isQuantityOverflow(i)) {
          n.setExceptionPickedQuantity(n.roundQuantity(i).toString());
          n.setExceptionPickedQuantityState(r.CONTROL_STATUS.WARNING);
          this.playAudio(r.WARNING);
        }
      },
      onPartialDenialQuantityChange: function (t) {
        var e = o.trim(t.getParameters().newValue);
        var i = r.REGEX_NONNEGATIVE;
        var s = Number(e);
        var a = n.getExceptionDestHU();
        if (n.getExceptionDestHUState() === r.CONTROL_STATUS.VALID) {
          if (!i.test(e) || s >= n.getTaskQuantityByDestHU(a)) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.setInputValue("partialDenial-quantity-input", "");
            this.focusTo("partialDenial-quantity-input");
            this.playAudio(r.ERROR);
          } else {
            n.setExceptionPickedQuantity(s.toString());
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.VALID);
          }
        } else {
          if (!i.test(e) || s < 0) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.setInputValue("partialDenial-quantity-input", "");
            this.focusTo("partialDenial-quantity-input");
            this.playAudio(r.ERROR);
          } else {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.PENDING);
            this.focusTo("partialDenial-destHU-input");
          }
        }
      },
      getQuantityOrSerialNumberState: function (t) {
        var e;
        var i = s.getSerialNumberCount();
        if (n.isSerialNumberEnabled()) {
          if (i < n.getTasksBaseQuantityByPosition(t)) {
            e = r.CONTROL_STATUS.VALID;
          } else {
            e = r.CONTROL_STATUS.INVALID;
          }
          n.setExceptionPickedQuantity(i);
          n.setExceptionPickedQuantityState(e);
        } else {
          e = n.getExceptionPickedQuantityState();
        }
        return e;
      },
      getExceptionPickedQuantity: function () {
        var t;
        if (n.isSerialNumberEnabled()) {
          var e = n.getAlternativeUOMRatio();
          var i = s.getSerialNumberCount();
          t = n.roundQuantity(i / e).toString();
          n.setExceptionPickedQuantity(t);
        } else {
          t = n.getExceptionPickedQuantity();
        }
        return t;
      },
      onPartialOrDifferenceConfirm: function (t) {
        var i = t.getSource().getParent();
        var u = n.getExceptionDestHUState();
        var o = n.getExceptionDestHU();
        var l = n.getLogicalPositionByHU(o);
        var c = this.getQuantityOrSerialNumberState(l);
        var p = [];
        var f = [];
        var h = this.getExceptionPickedQuantity();
        var S = parseFloat(h);
        if (!e.canConfirmTasks()) {
          return;
        }
        if (
          u === r.CONTROL_STATUS.VALID &&
          (c === r.CONTROL_STATUS.VALID || c === r.CONTROL_STATUS.WARNING)
        ) {
          var d = n.getInternalExceptionCode(n.getExceptionCode());
          var T, g;
          if (d === r.EXCEPTION_TYPE.DIFF) {
            T = "difference-destHU-input";
            g = "difference-quantity-input";
          } else {
            T = "partialDenial-destHU-input";
            g = "partialDenial-quantity-input";
          }
          if (this.isQuantityOverflow(S)) {
            n.setExceptionPickedQuantity(n.roundQuantity(S).toString());
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.WARNING);
            this.focusTo(g);
            this.playAudio(r.WARNING);
            return;
          }
          i.close();
          this.setBusy(true);
          var y = this.getConfirmData(o);
          e.submitTasksInBatch(y[0], y[1], y[2])
            .then(
              function (t) {
                p = n.getCurrentUnconfirmTasks();
                f = n.getAllPositionsFromTasks(p);
                if (n.isAllConfirmSuccess(t)) {
                  n.updateTasksConfirmStatus(p);
                  a.setNumbersForPickingByIds(f, 0);
                  a.setStatusForPickingByIds(
                    f,
                    r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION,
                  );
                  a.setNumbersForPickingById(l, S);
                  this.processAfterFinishException(t);
                  this.playAudio(r.INFO);
                } else {
                  a.setStatusForPickingByIds(f, r.HU_STATUS_PICK.WRONG);
                  this.playAudio(r.ERROR);
                }
                this.setErrorsFromConfirmResult(t, n);
                s.clearData();
                this.setBusy(false);
              }.bind(this),
            )
            .catch(
              function () {
                i.close();
                s.clearData();
                this.setBusy(false);
                this.playAudio(r.ERROR);
              }.bind(this),
            );
        } else {
          if (u === r.CONTROL_STATUS.EMPTY && c === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.focusTo(T);
          } else if (u === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
            this.focusTo(T);
          } else if (c === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.focusTo(g);
          }
        }
      },
      processAfterFinishException: function (t) {
        n.updateTaskGroups(t);
        n.updatePickingTaskProgress();
        n.updatePickingTaskGroupProgress();
        if (n.isSerialNumberEnabled()) {
          this.resetSerialNumber();
        }
        if (n.isAllGroupFinished()) {
          this.goToNextGroup();
        } else {
          this.goToDropping();
        }
        n.clearExceptionInfo();
      },
      openPartialDenialDialog: function () {
        var t = this.getView();
        var e = t.byId("partialDenialDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.PartialDenialDialog",
            this,
          );
          t.addDependent(e);
        }
        e.open();
      },
      afterOpenPartialDenial: function () {
        this.initDialogInputs(
          "partialDenial-destHU-input",
          "partialDenial-quantity-input",
        );
      },
      afterOpenDifference: function () {
        this.initDialogInputs(
          "difference-destHU-input",
          "difference-quantity-input",
        );
      },
      afterOpenSplitting: function () {
        this.initDialogInputs(
          "splitting-destHU-input",
          "splitting-quantity-input",
        );
      },
      initDialogInputs: function (t, e) {
        if (a.getUnprocessedPositions().length === 1) {
          var i = n.getDestHUByPosition(a.getUnprocessedPositions()[0]);
          n.setExceptionDestHU(i);
          n.setExceptionDestHUState(r.CONTROL_STATUS.VALID);
          this.setInputValue(t, i);
          this.focusTo(e);
        } else {
          this.setInputValue(t, "");
        }
        if (n.isSerialNumberEnabled()) {
          this.updateExceptionDestHUInput(t, true);
          var u = s.getSerialNumberCount();
          n.updateExceptionPickedUoM(u);
          var o = this.getExceptionSerialInputId();
          this.updateInputWithDefault(o, "");
          this.focusTo(o);
        } else {
          this.updateInputWithDefault(e, "");
          this.updateExceptionDestHUInput(t, false);
        }
      },
      onFullDenialConfirm: function (t) {
        var i = t.getSource().getParent();
        var s = [];
        var u = [];
        if (!e.canConfirmTasks()) {
          return;
        }
        i.close();
        this.setBusy(true);
        var o = n.getConfirmData();
        e.submitTasksInBatch(o[0], o[1])
          .then(
            function (t) {
              u = n.getCurrentUnconfirmTasks();
              s = n.getAllPositionsFromTasks(u);
              if (n.isAllConfirmSuccess(t)) {
                n.updateTasksConfirmStatus(u);
                s = n.getAllPositionsFromTasks(u);
                a.setNumbersForPickingByIds(s, 0);
                a.setStatusForPickingByIds(
                  s,
                  r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION,
                );
                this.processAfterFinishException(t);
                this.playAudio(r.INFO);
              } else {
                a.setStatusForPickingByIds(s, r.HU_STATUS_PICK.WRONG);
                this.playAudio(r.ERROR);
              }
              this.setErrorsFromConfirmResult(t, n);
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              i.close();
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      openFullDenialDialog: function () {
        var t = this.getView();
        var e = t.byId("fullDenialDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.FullDenialDialog",
            this,
          );
          t.addDependent(e);
        }
        e.open();
      },
      onSplittingDestHUChange: function (t) {
        var i = o.trim(t.getParameters().newValue);
        i = i.toUpperCase();
        this.setBusy(true);
        e.convertHUID(i)
          .then(
            function (t) {
              this.setBusy(false);
              i = t.Huident;
              this.setInputValue("splitting-destHU-input", i);
              var e = n.getExceptionPickedQuantity();
              var s;
              var a = this.getValidPositionAndDestHUByInput(i, this.sRouteName);
              var u;
              if (a !== undefined) {
                u = a[0];
                n.setExceptionDestHU(u);
                n.setExceptionDestHUState(r.CONTROL_STATUS.VALID);
                this.focusTo("splitting-quantity-input");
                if (!o.isEmpty(e)) {
                  s = Number(e);
                  if (s >= n.getTaskQuantityByDestHU(u)) {
                    n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
                    this.setInputValue("splitting-quantity-input", "");
                    this.focusTo("splitting-quantity-input");
                    this.playAudio(r.ERROR);
                  } else {
                    n.setExceptionPickedQuantity(s.toString());
                    n.setExceptionPickedQuantityState(r.CONTROL_STATUS.VALID);
                  }
                }
              } else {
                n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
                this.setInputValue("splitting-destHU-input", "");
                this.focusTo("splitting-destHU-input");
                this.playAudio(r.ERROR);
              }
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      onSplittingQuantityChange: function (t) {
        var e = o.trim(t.getParameters().newValue);
        var i = r.REGEX_NONNEGATIVE;
        var s = Number(e);
        var a = n.getExceptionDestHU();
        if (n.getExceptionDestHUState() === r.CONTROL_STATUS.VALID) {
          if (!i.test(e) || s >= n.getTaskQuantityByDestHU(a)) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.setInputValue("splitting-quantity-input", "");
            this.focusTo("splitting-quantity-input");
            this.playAudio(r.ERROR);
          } else {
            n.setExceptionPickedQuantity(s.toString());
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.VALID);
          }
        } else {
          if (!i.test(e) || s < 0) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.setInputValue("splitting-quantity-input", "");
            this.focusTo("splitting-quantity-input");
            this.playAudio(r.ERROR);
          } else {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.PENDING);
            this.focusTo("splitting-destHU-input");
          }
        }
      },
      onNextSplittingDialog: function (t) {
        var i = t.getSource().getParent();
        var u = n.getExceptionDestHUState();
        var o = n.getExceptionDestHU();
        var l = n.getLogicalPositionByHU(o);
        var c = this.getQuantityOrSerialNumberState(l);
        var p = this.getExceptionPickedQuantity();
        var f = parseFloat(p, 10);
        var h = n.getExceptionCode();
        var S;
        var d;
        var T;
        if (!e.canConfirmTasks()) {
          return;
        }
        if (
          u === r.CONTROL_STATUS.VALID &&
          (c === r.CONTROL_STATUS.VALID || c === r.CONTROL_STATUS.WARNING)
        ) {
          if (this.isQuantityOverflow(f)) {
            n.setExceptionPickedQuantity(n.roundQuantity(f).toString());
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.WARNING);
            this.focusTo("splitting-quantity-input");
            this.playAudio(r.WARNING);
            return;
          }
          i.close();
          S = n.getCurrentUnconfirmTasksByDestHU(o);
          d = n.separateTasksFromException(S, p, h);
          if (f === 0) {
            n.updateTasksAfterSplittingConfirm(S, d);
            i.close();
            T = n.getPackageMaterialByDestHU(o);
            n.setExceptionPackageMaterial(T);
            this.openSplittingToDialog();
          } else {
            this.setBusy(true);
            var g = this.getConfirmData(o, d);
            e.submitTasksInBatch(g[0], g[1], g[2])
              .then(
                function (t) {
                  if (n.isAllConfirmSuccess(t)) {
                    n.updateTasksAfterSplittingConfirm(S, d);
                    T = n.getPackageMaterialByDestHU(o);
                    n.setExceptionPackageMaterial(T);
                    this.openSplittingToDialog();
                    this.playAudio(r.INFO);
                  } else {
                    i.close();
                    a.setStatusForPickingById(l, r.HU_STATUS_PICK.WRONG);
                    this.playAudio(r.ERROR);
                  }
                  this.setErrorsFromConfirmResult(t, n);
                  s.clearData();
                  this.setBusy(false);
                }.bind(this),
              )
              .catch(
                function () {
                  i.close();
                  this.setBusy(false);
                  this.playAudio(r.ERROR);
                }.bind(this),
              );
          }
        } else {
          if (u === r.CONTROL_STATUS.EMPTY && c === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.focusTo("splitting-destHU-input");
          } else if (u === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
            this.focusTo("splitting-destHU-input");
          } else if (c === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.focusTo("splitting-quantity-input");
          }
          this.playAudio(r.ERROR);
        }
      },
      openSplittingFromDialog: function () {
        var t = this.getView();
        var e = t.byId("splittingFromDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.SplittingFromDialog",
            this,
          );
          t.addDependent(e);
        }
        e.open();
      },
      preventEscap: function (t) {
        if (t.setEscapeHandler) {
          t.setEscapeHandler(function t() {});
        }
      },
      isPickingHUReserved: function (t) {
        var e = n.getAllTasks();
        var i = o.find(e, function (e) {
          if (e.destHU === t) {
            return true;
          }
          return false;
        });
        if (i) {
          return true;
        } else {
          return false;
        }
      },
      isPositionReserved: function (t, e) {
        if (a.getPickingSplitFlagById(t)) {
          return true;
        }
        var i = n.getAllTasks();
        var s = o.find(i, function (i) {
          if (i.logicalPosition === t && i.destHU !== e) {
            return true;
          }
          return false;
        });
        if (s) {
          return true;
        }
        return false;
      },
      onSplittingPickingHUChange: function (t) {
        var s = o.trim(t.getParameters().newValue);
        s = s.toUpperCase();
        this.setBusy(true);
        e.convertHUID(s)
          .then(
            function (t) {
              this.setBusy(false);
              s = t.Huident;
              this.setInputValue("splitting-pickHU-input", s);
              var a = n.getLineNumberByDestHU(n.getExceptionDestHU());
              if (s === "") {
                n.setExceptionPickingHUState(r.CONTROL_STATUS.EMPTY);
                this.focusTo("splitting-pickHU-input");
              } else if (
                !this.isPickingHUReserved(s) &&
                !n.isContainsSpecialCharacter(s)
              ) {
                e.validateHandlingUnit(i.getWONumber(), a, s)
                  .then(
                    function () {
                      n.setExceptionPickingHUState(r.CONTROL_STATUS.VALID);
                      this.focusTo("splitting-logicalPosition-input");
                    }.bind(this),
                  )
                  .catch(
                    function (t) {
                      n.setExceptionPickingHUState(r.CONTROL_STATUS.INVALID);
                      this.setInputValue("splitting-pickHU-input", "");
                      this.focusTo("splitting-pickHU-input");
                      this.playAudio(r.ERROR);
                    }.bind(this),
                  );
              } else {
                n.setExceptionPickingHUState(r.CONTROL_STATUS.INVALID);
                this.setInputValue("splitting-pickHU-input", "");
                this.focusTo("splitting-pickHU-input");
                this.playAudio(r.ERROR);
              }
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      onSplittingLogicalPositionChange: function (t) {
        var e = t.getParameters().newValue;
        var i = a.getPositionByLable(e);
        var s = n.getExceptionDestHU();
        if (i === undefined || this.isPositionReserved(i, s)) {
          n.setExceptionLogicalPositionState(r.CONTROL_STATUS.INVALID);
          this.setInputValue("splitting-logicalPosition-input", "");
          this.focusTo("splitting-logicalPosition-input");
          this.playAudio(r.ERROR);
        } else {
          n.setExceptionLogicalPositionState(r.CONTROL_STATUS.VALID);
          n.setExceptionLogicalPosition(i);
          this.focusTo("splitting-pickHU-input");
        }
      },
      onSplittingLogicalPositionSubmit: function () {
        if (
          n.getExceptionPickingHUState() === r.CONTROL_STATUS.VALID &&
          n.getExceptionLogicalPositionState() === r.CONTROL_STATUS.VALID
        ) {
          this.byId(y).firePress();
        }
      },
      onSplittingConfirm: function (t) {
        var s = t.getSource().getParent();
        var u = n.getExceptionDestHU();
        var o = n.getExceptionLogicalPosition();
        var l = n.getLogicalPositionByHU(u);
        var c = n.getExceptionPickingHU();
        var p = parseFloat(n.getExceptionPickedQuantity(), 10);
        var f;
        var h = n.getExceptionPickingHUState();
        var S = n.getExceptionLogicalPositionState();
        if (h === r.CONTROL_STATUS.VALID && S === r.CONTROL_STATUS.VALID) {
          s.close();
          if (n.isMultiSourceHUOfCurrentGroup()) {
            var d = n.updateCurrentStock(p);
            var T = n.roundQuantity(n.getCurrentNeedQuantity() - p);
            f = T > d ? d : T;
          } else {
            f = n.getUnconfirmTaskQuantityByDestHU(u);
          }
          n.updateRemainTasksForSplitting(u, c, o);
          a.setNumbersForPickingById(o, f);
          a.setStatusForPickingById(o, r.HU_STATUS_PICK.NEED_MATERIAL);
          n.setCurrentPickQuantity(f);
          if (o === l) {
            n.updateTaskPositionForSplitting(u);
            var g = n.roundQuantity(n.getCurrentTaskGroupTotalQuantity() - p);
            var y = n.getAlternativeUOMRatio();
            n.setCurrentTaskGroupTotalQuantity(g);
            n.setCurrentTaskGroupTotalBaseQuantity(g * y);
          } else {
            n.updataCurrentActualQuantity(p);
            a.setNumbersForPickingById(l, p);
            a.setStatusForPickingById(
              l,
              r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION,
            );
            a.setSplitForPickingById(l, true);
          }
          this.setBusy(true);
          e.bindNewHU(n.getAllUnconfirmTasksByDestHU(c), i.getWONumber())
            .then(
              function () {
                n.clearExceptionInfo();
                this.setBusy(false);
                if (n.isSerialNumberEnabled()) {
                  this.openSerialNumberPopover();
                  n.setFullDenialEnable(true);
                }
                this.playAudio(r.INFO);
              }.bind(this),
            )
            .catch(
              function (t) {
                s.close();
                this.setBusy(false);
                this.playAudio(r.ERROR);
              }.bind(this),
            );
        } else {
          if (h === r.CONTROL_STATUS.EMPTY && S === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionPickingHUState(r.CONTROL_STATUS.INVALID);
            n.setExceptionLogicalPositionState(r.CONTROL_STATUS.INVALID);
            this.focusTo("splitting-pickHU-input");
          } else if (h === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionPickingHUState(r.CONTROL_STATUS.INVALID);
            this.focusTo("splitting-pickHU-input");
          } else if (S === r.CONTROL_STATUS.EMPTY) {
            n.setExceptionLogicalPositionState(r.CONTROL_STATUS.INVALID);
            this.focusTo("splitting-logicalPosition-input");
          }
          this.playAudio(r.ERROR);
        }
      },
      openSplittingToDialog: function () {
        var t = this.getView();
        var e = t.byId("splittingToDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.SplittingToDialog",
            this,
          );
          t.addDependent(e);
          this.preventEscap(e);
        }
        e.open();
      },
      onDifferenceDestHUChange: function (t) {
        var i = o.trim(t.getParameters().newValue);
        i = i.toUpperCase();
        this.setBusy(true);
        e.convertHUID(i)
          .then(
            function (t) {
              this.setBusy(false);
              i = t.Huident;
              this.setInputValue("difference-destHU-input", i);
              var e = n.getExceptionPickedQuantity();
              var s;
              var a = this.getValidPositionAndDestHUByInput(i, this.sRouteName);
              var u;
              if (a !== undefined) {
                u = a[0];
                n.setExceptionDestHU(u);
                n.setExceptionDestHUState(r.CONTROL_STATUS.VALID);
                this.focusTo("difference-quantity-input");
                if (!o.isEmpty(e)) {
                  s = Number(e);
                  if (s >= n.getTaskQuantityByDestHU(u)) {
                    n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
                    this.setInputValue("difference-quantity-input", "");
                    this.focusTo("difference-quantity-input");
                    this.playAudio(r.ERROR);
                  } else {
                    n.setExceptionPickedQuantity(s.toString());
                    n.setExceptionPickedQuantityState(r.CONTROL_STATUS.VALID);
                  }
                }
              } else {
                n.setExceptionDestHUState(r.CONTROL_STATUS.INVALID);
                this.setInputValue("difference-destHU-input", "");
                this.focusTo("difference-destHU-input");
                this.playAudio(r.ERROR);
              }
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      onDifferenceQuantityChange: function (t) {
        var e = o.trim(t.getParameters().newValue);
        var i = r.REGEX_NONNEGATIVE;
        var s = Number(e);
        var a = n.getExceptionDestHU();
        if (n.getExceptionDestHUState() === r.CONTROL_STATUS.VALID) {
          if (!i.test(e) || s >= n.getTaskQuantityByDestHU(a)) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.setInputValue("difference-quantity-input", "");
            this.focusTo("difference-quantity-input");
            this.playAudio(r.ERROR);
          } else {
            n.setExceptionPickedQuantity(s.toString());
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.VALID);
          }
        } else {
          if (!i.test(e) || s < 0) {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.INVALID);
            this.setInputValue("difference-quantity-input", "");
            this.focusTo("difference-quantity-input");
            this.playAudio(r.ERROR);
          } else {
            n.setExceptionPickedQuantityState(r.CONTROL_STATUS.PENDING);
            this.focusTo("difference-destHU-input");
          }
        }
      },
      openDifferenceDenialDialog: function () {
        var t = this.getView();
        var e = t.byId("differenceDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.DifferenceDialog",
            this,
          );
          t.addDependent(e);
        }
        e.open();
      },
      formatProgressPercentValue: function (t, e) {
        if (e.length > 0) {
          return (t * 100) / e.length;
        }
        return 0;
      },
      formatProgressDisplayValue: function (t, e) {
        return t + "/" + e.length;
      },
      formatPlaceholder: function (t, e) {
        if (!e && t === "") {
          return this.getI18nText("optional");
        }
        return "";
      },
      formatButtonStatus: function (t) {
        var e;
        switch (t) {
          case r.HU_STATUS_PICK.INVALID:
            e = "Transparent";
            break;
          case r.HU_STATUS_PICK.NEED_MATERIAL_HOLDING:
          case r.HU_STATUS_PICK.VALID:
            e = "Default";
            break;
          case r.HU_STATUS_PICK.NEED_MATERIAL:
            e = "Emphasized";
            break;
          case r.HU_STATUS_PICK.COMPLETED:
            e = "Accept";
            break;
          case r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION:
            e = "Accept";
            break;
          case r.HU_STATUS_PICK.WRONG:
            e = "Reject";
            break;
        }
        return e;
      },
      formatButtonText: function (t, e, i) {
        var n;
        switch (t) {
          case r.HU_STATUS_PICK.INVALID:
          case r.HU_STATUS_PICK.VALID:
          case r.HU_STATUS_PICK.WRONG:
            n = e;
            break;
          case r.HU_STATUS_PICK.NEED_MATERIAL_HOLDING:
          case r.HU_STATUS_PICK.NEED_MATERIAL:
          case r.HU_STATUS_PICK.COMPLETED:
          case r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION:
            n = o.formatNumber(i, r.MaxDecimalDigits);
            break;
        }
        return n;
      },
      formatButtonIcon: function (t) {
        var e;
        switch (t) {
          case r.HU_STATUS_PICK.VALID:
            e = "sap-icon://add-product";
            break;
          case r.HU_STATUS_PICK.NEED_MATERIAL_HOLDING:
          case r.HU_STATUS_PICK.NEED_MATERIAL:
            e = "sap-icon://add";
            break;
          case r.HU_STATUS_PICK.COMPLETED:
            e = "sap-icon://accept";
            break;
          case r.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION:
            e = "sap-icon://warning";
            break;
          case r.HU_STATUS_PICK.WRONG:
            e = "sap-icon://decline";
            break;
          default:
            e = "";
        }
        return e;
      },
      formatEANVisible: function (t) {
        if (o.trim(t) === "") {
          return false;
        }
        return true;
      },
      formatBatchReadOnlyInputVisible: function (t, e) {
        this.updateBatchEditableInput(e);
        if (t === true && o.trim(e) !== "") {
          return true;
        }
        return false;
      },
      updateBatchEditableInput: function (t) {
        if (t === undefined) {
          return;
        }
        var e = "L3 M3 S3";
        if (o.isEmpty(t)) {
          e = "L9 M9 S9";
        }
        var i = this.byId(f).getLayoutData();
        if (i && i.getSpan() !== e) {
          i.setSpan(e);
          this.byId("task-group-info-form").rerender();
        }
      },
      updateSouceHuEditableInput: function (t) {
        if (t === undefined) {
          return;
        }
        var e = "L3 M3 S3";
        if (o.isEmpty(t)) {
          e = "L9 M9 S9";
        }
        var i = this.byId(c).getLayoutData();
        if (i && i.getSpan() !== e) {
          i.setSpan(e);
          this.byId("task-group-info-form").rerender();
        }
      },
      updateExceptionDestHUInput: function (t, e) {
        var i = "L10 M10 S10";
        if (e) {
          i = "L9 M9 S9";
        }
        var n = this.byId(t).getLayoutData();
        if (n && n.getSpan() !== i) {
          n.setSpan(i);
        }
      },
      formatValueState: function (t) {
        var e = u.None;
        if (t === "INVALID") {
          e = u.Error;
        } else if (t === "WARNING") {
          e = u.Warning;
        }
        return e;
      },
      formatValueText: function (t) {
        var e = this.getI18nText("invalidQuantity");
        if (t === "WARNING") {
          e = this.getI18nText("roundUpQuantity");
        }
        return e;
      },
      verifyBatch: function (t, i, s) {
        e.verifyBatch(t, i, s)
          .then(
            function () {
              if (t === "") {
                n.setBatchNo(i);
              }
              this.updateInputWithSuccess(f);
              this.moveFocus(f);
            }.bind(this),
          )
          .catch(
            function () {
              this.updateInputWithError(f);
              this.focusTo(f);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      verifySourceHU: function (t, i) {
        e.verifySourceHU(t, i)
          .then(
            function () {
              if (o.isEmpty(t)) {
                n.setSourceHU(i);
              }
              this.updateInputWithSuccess(c);
              this.moveFocus();
            }.bind(this),
          )
          .catch(
            function () {
              this.updateInputWithError(c);
              this.focusTo(c);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      hightlightDestHUinGrid: function () {
        if (n.isMultiSourceHUOfCurrentGroup()) {
          this.hightlightDestHUinGridForMulitpleSourceHU();
        } else {
          this.updateCartStatus();
        }
        n.enableException();
        if (!n.isSerialNumberEnabled() || s.getSerialNumberCount() === 0) {
          n.setFullDenialEnable(true);
        }
        if (n.isSerialNumberEnabled()) {
          this.enableSerialNumberIcon();
          this.openSerialNumberPopover();
        }
      },
      enableSerialNumberIcon: function () {
        var t = this.byId(S);
        t.attachPress(this.onPressSerialNum, this);
        t.setColor("Neutral");
      },
      disableSerialNumberIcon: function () {
        var t = this.byId(S);
        t.detachPress(this.onPressSerialNum, this);
        t.setColor("Default");
      },
      updateCartStatus: function () {
        if (n.isSerialNumberEnabled()) {
          this.updateCartStatusForSerialManaged();
        } else {
          this.updateCartStatusForNonSerialManaged();
        }
      },
      updateCartStatusForSerialManaged: function () {
        var t = n.getCurrentTaskGroup();
        var e = t.tasks;
        var i = n.getAllPositionsFromUnConfirmTasks(e);
        var s = a.getFirstPositionForSerialManaged(i);
        a.setStatusForPickingById(s, r.HU_STATUS_PICK.NEED_MATERIAL);
        var u = 0;
        u = n.getTasksQuantityByPosition(s);
        a.setNumbersForPickingById(s, u);
        i.forEach(function (t) {
          if (t !== s) {
            a.setStatusForPickingById(
              t,
              r.HU_STATUS_PICK.NEED_MATERIAL_HOLDING,
            );
            u = n.getTasksQuantityByPosition(t);
            a.setNumbersForPickingById(t, u);
          }
        });
      },
      updateCartStatusForNonSerialManaged: function () {
        var t = n.getCurrentTaskGroup();
        var e = t.tasks;
        var i = n.getAllPositionsFromTasks(e);
        var s = 0;
        i.forEach(function (t) {
          a.setStatusForPickingById(t, r.HU_STATUS_PICK.NEED_MATERIAL);
          s = n.getTasksQuantityByPosition(t);
          a.setNumbersForPickingById(t, s);
        });
      },
      hightlightDestHUinGridForMulitpleSourceHU: function () {
        var t = n.getCurrentTaskGroup();
        var e = n.roundQuantity(t.totalAlternativeQty - t.actualQuantity);
        var i = n.getSourceHUOfCurrentGroup();
        var s = i === "" ? true : false;
        var u = n.getBatchNo();
        var l = 0;
        var c = 0;
        var p = t.tasks[0];
        for (var f = 0; f < t.stock.length; f++) {
          var h = t.stock[f];
          if (u === h.batchNo) {
            if ((o.isEmpty(h.sourceHU) && s) || (!s && h.sourceHU === i)) {
              l = h.quantity;
              c = e > l ? l : e;
              break;
            }
          }
        }
        a.setStatusForPickingById(
          p.logicalPosition,
          r.HU_STATUS_PICK.NEED_MATERIAL,
        );
        a.setNumbersForPickingById(p.logicalPosition, c);
        t.currentPickQty = c;
      },
      verifyProduct: function (t, i) {
        e.verifyProduct(t, i)
          .then(
            function () {
              this.setInputValue(p, t);
              this.updateInputWithSuccess(p);
              this.moveFocus(p);
            }.bind(this),
          )
          .catch(
            function () {
              this.updateInputWithError(p);
              this.focusTo(p);
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      initCartStatus: function (t) {
        t.forEach(function (t) {
          a.setStatusForPickingById(t.logicalPosition, r.HU_STATUS_PICK.VALID);
          a.setSplitForPickingById(t.logicalPosition, false);
        });
        a.getPositionsWithPickingException().forEach(function (t) {
          a.setStatusForPickingById(t, r.HU_STATUS_PICK.VALID);
        });
      },
      formatQuantityDisplay: function (t, e, i) {
        if (t === undefined || e === undefined) {
          return "";
        }
        var n = t + "/" + e + i;
        var s = this.byId("product-quantity-title");
        if (n.length < 12) {
          s.setLevel("H2");
          s.setTitleStyle("H2");
        } else if (n.length < 15) {
          s.setLevel("H4");
          s.setTitleStyle("H4");
        } else {
          s.setLevel("H6");
          s.setTitleStyle("H6");
        }
        return this.formatNumber(t) + "/" + this.formatNumber(e) + " " + i;
      },
      formatUnitDisplay: function (t) {
        if (t === undefined) {
          return "";
        }
        return t;
      },
      formatNextButtonVisible: function (t, e) {
        return t !== e.length;
      },
      formatDroppingButtonVisible: function (t, e) {
        return t === e.length;
      },
      formatSourceHUReadOnlyInputVisible: function (t, e) {
        this.updateSouceHuEditableInput(e);
        if (t === true && !o.isEmpty(o.trim(e))) {
          return true;
        }
        return false;
      },
      formatSourceHURequired: function (t) {
        if (o.isEmpty(o.trim(t))) {
          return false;
        }
        return true;
      },
      formatImageVisible: function (t) {
        if (o.trim(t) === "") {
          return false;
        }
        return true;
      },
      formatDescriptionWidth: function (t) {
        if (o.trim(t) === "") {
          return "90%";
        }
        return "60%";
      },
      openLowQuantityCheckDialog: function () {
        var t = this.getView();
        var e = t.byId("lowQuantityCheckDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.LowQuantityCheckDialog",
            this,
          );
          t.addDependent(e);
          this.preventEscap(e);
        }
        this.updateInputWithDefault("actualQuantity-input", "");
        e.open();
        if (n.isSerialNumberEnabled()) {
          s.clearData(false);
          n.setLowQtyCheckUoM(s.getSerialNumberCount(false).toString());
        }
      },
      onLowQuantitySubmit: function (t) {
        var e = o.trim(t.getParameter("value"));
        var i = Number(e);
        if (this.isQuantityOverflow(i)) {
          n.setLowQuantity(n.roundQuantity(i).toString());
          n.setLowQuantityCheckState(r.CONTROL_STATUS.WARNING);
          this.playAudio(r.WARNING);
        }
      },
      onLowQuantityCheckChange: function (t) {
        var e = t.getParameters().newValue;
        var i = Number(e);
        var s = r.REGEX_NONNEGATIVE;
        if (s.test(e)) {
          n.setLowQuantity(i.toString());
          n.setLowQuantityCheckState(r.CONTROL_STATUS.VALID);
        } else {
          n.setLowQuantityCheckState(r.CONTROL_STATUS.INVALID);
          this.setInputValue("actualQuantity-input", "");
          this.focusTo("actualQuantity-input");
          this.playAudio(r.ERROR);
        }
      },
      onLowQuantityCheckConfirm: function (t) {
        var e = t.getSource().getParent();
        var i = 0;
        var s = n.getLowQuantityCheckState();
        if (!n.isSerialNumberEnabled()) {
          var a = n.getLowQuantity();
          i = parseFloat(a);
          if (s === r.CONTROL_STATUS.VALID || s === r.CONTROL_STATUS.WARNING) {
            if (this.isQuantityOverflow(i)) {
              n.setLowQuantity(n.roundQuantity(i).toString());
              n.setLowQuantityCheckState(r.CONTROL_STATUS.WARNING);
              this.focusTo("actualQuantity-input");
              this.playAudio(r.WARNING);
              return;
            }
            this.lowQuantityCheck(e, i);
          } else {
            n.setLowQuantityCheckState(r.CONTROL_STATUS.INVALID);
            this.focusTo("actualQuantity-input");
            this.playAudio(r.ERROR);
          }
        } else {
          var u = n.getSourceBinOfCurrentGroup();
          i = parseFloat(n.getLowQtyCheckUoM());
          if (i === 0) {
            if (s !== r.CONTROL_STATUS.WARNING) {
              n.setLowQuantityCheckState(r.CONTROL_STATUS.WARNING);
              var o = this.getI18nText("lowQtyCheckIsZeroWarningMsg", [u]);
              this.updateInputWithWarning(T, o, "");
              this.focusTo(T);
              this.playAudio(r.WARNING);
              return;
            } else {
              n.setLowQuantityCheckState(r.CONTROL_STATUS.VALID);
              this.updateInputWithDefault(T, "");
            }
          }
          this.lowQuantityCheck(e, i);
        }
      },
      onLowQuantityCheckCancel: function (t) {
        var e = t.getSource().getParent();
        var i = 0;
        n.setLowQuantityCheckState(r.CONTROL_STATUS.EMPTY);
        this.lowQuantityCheck(e, i);
      },
      getConfirmDataForLowStock: function (t, e) {
        var i = n.getConfirmDataForLowStock(t, e);
        var a = [];
        var r = [];
        if (n.isSerialNumberEnabled()) {
          a = n.getConfirmTasksWithSerialNumber(i[0], s.getSerialNumbers(true));
          r = n.getConfirmTasksWithSerialNumberForLowQtyCheck(
            i[0],
            s.getSerialNumbers(false),
          );
        }
        i.push(a);
        i.push(r);
        return i;
      },
      lowQuantityCheck: function (t, i) {
        var s = this.oDestHU.sDestHU;
        var u = this.oDestHU.sLogicalPosition;
        this.setBusyForLowqtyCheckDialog(true);
        var o = this.getConfirmDataForLowStock(i, s);
        e.submitTasksInBatch(o[0], o[1], o[2], o[3])
          .then(
            function (e) {
              t.close();
              if (n.isAllConfirmSuccess(e)) {
                var i = n.getCurrentTaskGroup();
                if (i.sourceHUMultiple === true) {
                  this.completeOneSourceHUPicking(u, i.currentPickQty, o[0]);
                } else {
                  this.navToNextTaskOrDropping(s, u);
                }
                n.setLowQuantity("");
                this.playAudio(r.INFO);
              } else {
                a.setStatusForPickingById(u, r.HU_STATUS_PICK.WRONG);
                this.playAudio(r.ERROR);
              }
              this.setErrorsFromConfirmResult(e, n);
              this.setBusyForLowqtyCheckDialog(false);
              this.setInputValue("actualQuantity-input", "");
            }.bind(this),
          )
          .catch(
            function () {
              t.close();
              this.setBusyForLowqtyCheckDialog(false);
              this.setInputValue("actualQuantity-input", "");
              this.playAudio(r.ERROR);
            }.bind(this),
          );
      },
      initExceptionButtons: function () {
        var t = n.getExceptions();
        var e = this.sortException(t);
        var i = {};
        var s = this.byId("processTasksTableToolbar");
        var a = function (t) {
          var e = t.getSource().getText();
          var i = r.EXCEPTION_TYPE;
          var s = n.getExternalExceptionCode(e);
          var a = n.getInternalExceptionCode(s);
          n.setExceptionCode(s);
          switch (a) {
            case i.BIDF:
              this.openFullDenialDialog();
              break;
            case i.BIDP:
              this.openPartialDenialDialog();
              break;
            case i.SPLT:
              this.openSplittingFromDialog();
              break;
            case i.DIFF:
              this.openDifferenceDenialDialog();
              break;
          }
        }.bind(this);
        var u = function (t) {
          this.openQuantityAdjustmentDialog();
        }.bind(this);
        e.forEach(function (t) {
          i = new sap.m.Button({
            text: t.ExceptionCodeName,
            enabled:
              t.InternalProcessCode === r.EXCEPTION_TYPE.BIDF
                ? "{path:'local>/enableFullDenial'}"
                : "{path:'local>/enableException'}",
            press: a,
          });
          s.addContent(i);
        });
        i = new sap.m.Button({
          text: "{i18n>quantityAdjustment}",
          enabled: "{path:'local>/enableException'}",
          visible: "{path:'local>/currentWarehouseTaskGroup/sourceHUMultiple'}",
          press: u,
        });
        s.addContent(i);
      },
      sortException: function (t) {
        var e = r.EXCEPTION_TYPE;
        var i = [];
        var n = [];
        var s = [];
        var a = [];
        t.forEach(function (t) {
          switch (t.InternalProcessCode) {
            case e.BIDF:
              s.push(t);
              break;
            case e.BIDP:
              i.push(t);
              break;
            case e.SPLT:
              a.push(t);
              break;
            case e.DIFF:
              n.push(t);
              break;
          }
        });
        return i.concat(n).concat(s).concat(a);
      },
      openQuantityAdjustmentDialog: function () {
        var t = this.getView();
        var e = t.byId("quantityAdjustmentDialog");
        if (!e) {
          e = sap.ui.xmlfragment(
            t.getId(),
            "zscm.ewm.pickcarts1.view.dialog.QuantityAdjustmentDialog",
            this,
          );
          t.addDependent(e);
        }
        this.updateInputWithDefault("quantityAdjustment-input", "");
        e.open();
      },
      onQuantityAdjustmentSubmit: function (t) {
        var e = o.trim(t.getParameter("value"));
        var i = Number(e);
        if (this.isQuantityOverflow(i)) {
          this.setInputValue(
            "quantityAdjustment-input",
            n.roundQuantity(i).toString(),
          );
          n.setQuantityAdjustmentState(r.CONTROL_STATUS.WARNING);
          this.playAudio(r.WARNING);
        }
      },
      onQuantityAdjustmentChange: function (t) {
        var e = t.getParameters().newValue;
        var i = r.REGEX_NONNEGATIVE;
        var s = Number(e);
        var a = n.getCurrentPickQuantity();
        if (!i.test(e) || n.roundQuantity(s) === 0 || s >= a) {
          n.setQuantityAdjustmentState(r.CONTROL_STATUS.INVALID);
          this.setInputValue("quantityAdjustment-input", "");
          this.focusTo("quantityAdjustment-input");
          this.playAudio(r.ERROR);
        } else {
          this.setInputValue("quantityAdjustment-input", s.toString());
          n.setQuantityAdjustmentState(r.CONTROL_STATUS.VALID);
        }
      },
      getQuantityAdjustmentState: function (t) {
        var e;
        var i;
        if (n.isSerialNumberEnabled()) {
          i = s.getSerialNumberCount();
          if (i > 0 && i < n.getTasksBaseQuantityByPosition(t)) {
            e = r.CONTROL_STATUS.VALID;
          } else {
            e = r.CONTROL_STATUS.INVALID;
          }
          n.setQuantityAdjustmentState(e);
        } else {
          e = n.getQuantityAdjustmentState();
        }
        return e;
      },
      onQuantityAdjustmentConfirm: function (t) {
        var i = t.getSource().getParent();
        var u = n.getCurrentDestHUForMulti();
        var o = 0;
        if (!n.isSerialNumberEnabled()) {
          var l = this.byId("quantityAdjustment-input").getValue();
          o = Number(l);
        } else {
          o = s.getSerialNumberCount();
          if (o === 0) {
            var c = this.getI18nText("noSerialNumForQtyAdjustmentMsg");
            this.updateInputWithError(g, c);
            this.focusTo(g);
            return;
          }
          o = parseFloat(n.getExceptionPickedUoM());
        }
        var p = n.getLogicalPositionByHU(u);
        var f = this.getQuantityAdjustmentState(p);
        if (f === r.CONTROL_STATUS.VALID || f === r.CONTROL_STATUS.WARNING) {
          if (this.isQuantityOverflow(o)) {
            this.setInputValue(
              "quantityAdjustment-input",
              n.roundQuantity(o).toString(),
            );
            n.setQuantityAdjustmentState(r.CONTROL_STATUS.WARNING);
            this.focusTo("quantityAdjustment-input");
            this.playAudio(r.WARNING);
            return;
          }
          n.setCurrentPickQuantity(o);
          i.close();
          this.setBusy(true);
          var S = this.getConfirmDataForMultipleSourceHU(u);
          e.submitTasksInBatch(S[0], S[1], S[3])
            .then(
              function (t) {
                if (n.isAllConfirmSuccess(t)) {
                  this.completeOneSourceHUPicking(p, o, S[0], S[2]);
                  this.playAudio(r.INFO);
                } else {
                  a.setStatusForPickingById(p, r.HU_STATUS_PICK.WRONG);
                  this.updateInputWithDefault(h, "");
                  this.playAudio(r.ERROR);
                }
                this.setInputValue("quantityAdjustment-input", "");
                this.setErrorsFromConfirmResult(t, n);
                this.setBusy(false);
              }.bind(this),
            )
            .catch(
              function () {
                this.setBusy(false);
                this.playAudio(r.ERROR);
              }.bind(this),
            );
        } else {
          n.setQuantityAdjustmentState(r.CONTROL_STATUS.INVALID);
          if (!n.isSerialNumberEnabled()) {
            this.focusTo("quantityAdjustment-input");
          } else {
            this.focusTo(g);
          }
          this.playAudio(r.ERROR);
        }
      },
      onQuantityAdjustmentCancel: function (t) {
        t.getSource().getParent().close();
        this.setInputValue("quantityAdjustment-input", "");
        n.setQuantityAdjustmentState(r.CONTROL_STATUS.EMPTY);
      },
      afterOpenQuantityAdjustment: function () {
        if (n.isSerialNumberEnabled()) {
          var t = s.getSerialNumberCount();
          n.updateExceptionPickedUoM(t);
          var e = this.getExceptionSerialInputId();
          this.updateInputWithDefault(e, "");
          this.focusTo(e);
        } else {
          this.updateInputWithDefault("quantityAdjustment-input", "");
        }
      },
      enableCartInteraction: function () {
        this.hightlightDestHUinGrid();
      },
      disableCartInteraction: function () {
        n.disableException();
      },
      setBusyForLowqtyCheckDialog: function (t) {
        this.byId("lowQuantityCheckDialog").setBusy(t);
      },
      getSerialNumberPopover: function () {
        if (!this._oSerialNumberPopover) {
          this._oSerialNumberPopover = sap.ui.xmlfragment(
            "sn_popover",
            "zscm.ewm.pickcarts1.view.dialog.SerialNumberPopover",
            this,
          );
          this.getView().addDependent(this._oSerialNumberPopover);
        }
        this.oSNInput = sap.ui.core.Fragment.byId("sn_popover", d);
        return this._oSerialNumberPopover;
      },
      openSerialNumberPopover: function () {
        var t = this.getView().getModel("serialNum");
        t.updateBindings(true);
        var e = this.getSerialNumberPopover();
        this.updateSerialNumInput(u.None, "", "");
        jQuery.sap.delayedCall(
          500,
          this,
          function () {
            var t = this.byId(S);
            e.openBy(t);
          }.bind(this),
        );
        var i = this.getSerialNumPopoverTitle();
        e.setTitle(i);
      },
      getSerialNumPopoverTitle: function () {
        var t = a.getUnprocessedPositions()[0];
        var e = n.getDestHUFromTasksByPosition(t);
        return this.getI18nText("serialNum", [e]);
      },
      closeSerialNumberPopover: function () {
        this.getSerialNumberPopover().close();
      },
      onSerialNumChange: function (t) {
        var e = o.trim(t.getParameter("newValue"));
        e = e.toUpperCase();
        var i;
        i = this.getSerialNumberVerifyPromise(e);
        i.then(
          function (t) {
            this.addSerialNumber(e, true);
            this.updateSerialNumInput(u.None, "", "");
            if (this.isAllSerialNumberFinished()) {
              this.closeSerialNumberPopover();
              this.focusTo(h);
            }
          }.bind(this),
        ).catch(
          function (t) {
            this.updateSerialNumInput(u.Error, t, "");
            this.playAudio(r.ERROR);
          }.bind(this),
        );
      },
      onSerialNumForLowQtyCheckChange: function (t) {
        var e = o.trim(t.getParameter("newValue"));
        e = e.toUpperCase();
        if (o.isEmpty(e)) {
          this.updateInputWithDefault(T, "");
          this.focusTo(T);
          return;
        }
        var i;
        i = this.getSerialNumberVerifyPromise(e, false);
        i.then(
          function (t) {
            this.addSerialNumber(e, false);
            this.updateInputWithDefault(T, "");
            this.focusTo(T);
            n.updateExceptionPickedUoM(s.getSerialNumberCount(false), false);
            n.setLowQuantityCheckState(r.CONTROL_STATUS.VALID);
          }.bind(this),
        ).catch(
          function (t) {
            this.updateInputWithError(T, t);
            this.focusTo(T);
            this.playAudio(r.ERROR);
          }.bind(this),
        );
      },
      getSerialNumberVerifyPromise: function (t, i) {
        var a = n.getProductOfCurrentGroup();
        var r = this.getI18nText("duplicateSNMsg");
        var u;
        if (s.hasSerialNumber(t, i)) {
          u = new Promise(function (t, e) {
            e(r);
          });
        } else {
          u = e.verifySerialNumber(a, t);
        }
        return u;
      },
      onPressSerialNum: function () {
        this.openSerialNumberPopover();
      },
      resetSerialNumber: function () {
        s.clearData();
        this.disableSerialNumberIcon();
      },
      onSerialNumberDeleteForTasksPicking: function (t) {
        var e = t.getParameter("listItem");
        var i = e.getTitle();
        s.removeSerialNumber(i);
        jQuery.sap.delayedCall(
          1,
          this,
          function () {
            this.updateSerialNumInput(u.None, "", "");
          }.bind(this),
        );
        n.enableException();
        n.updateExceptionPickedUoM(s.getSerialNumberCount());
        if (s.getSerialNumberCount() === 0) {
          n.setFullDenialEnable(true);
        }
        this.onSerialNumberDelete(i);
        jQuery.sap.delayedCall(
          1,
          this,
          function () {
            this.updateSerialNumInput(u.None, "", "");
          }.bind(this),
        );
        n.enableException();
        if (s.getSerialNumberCount() === 0) {
          n.setFullDenialEnable(true);
        }
      },
      onSerialNumberDeleteForLowQtyCheck: function (t) {
        var e = t.getParameter("listItem");
        var i = e.getTitle();
        this.onSerialNumberDelete(i, false);
        if (s.getSerialNumberCount(false) === 0) {
          n.setLowQuantityCheckState(r.CONTROL_STATUS.EMPTY);
        }
      },
      onSerialNumberDelete: function (t, e) {
        s.removeSerialNumber(t, e);
        n.updateExceptionPickedUoM(s.getSerialNumberCount(e), e);
      },
      onSerialNumClear: function () {
        s.clearData();
        this.updateSerialNumInput(u.None, "", "");
        n.enableException();
        n.setFullDenialEnable(true);
      },
      isAllSerialNumberFinished: function () {
        if (!n.isMultiSourceHUOfCurrentGroup()) {
          return (
            this.getUnConfirmQtyOfCurrentTasksForSerialManaged() <=
            s.getSerialNumberCount()
          );
        } else {
          return (
            n.getCurrentPickQuantity() * n.getAlternativeUOMRatio() <=
            s.getSerialNumberCount()
          );
        }
      },
      getUnConfirmQtyOfCurrentTasksForSerialManaged: function () {
        var t = 0;
        var e = n.getCurrentTaskGroup();
        var i = e.tasks || [];
        var s = n.getAllPositionsFromUnConfirmTasks(i);
        var r = a.getFirstPositionForSerialManaged(s);
        i.forEach(function (e) {
          if (e.confirm === false && e.logicalPosition === r) {
            t += e.baseQty;
          }
        });
        return t;
      },
      updateSerialNumInput: function (t, e, i) {
        this.oSNInput.setValueState(t);
        this.oSNInput.setValueStateText(e);
        if (i !== undefined) {
          this.oSNInput.setValue(i);
        }
        this.oSNInput.focus();
      },
      updateSerialNumForLowQtyCheckInput: function (t, e, i) {
        var n = sap.ui.core.Fragment.byId("lowQty_check", T);
        n.setValueState(t);
        n.setValueStateText(e);
        if (i !== undefined) {
          n.setValue(i);
        }
        n.focus();
      },
      getTotalQuantityForSerialNum: function () {
        if (n.isMultiSourceHUOfCurrentGroup()) {
          var t = n.getAlternativeUOMRatio();
          return t * n.getCurrentPickQuantity();
        } else {
          return this.getUnConfirmQtyOfCurrentTasksForSerialManaged();
        }
      },
      formatSerialNumInputVisible: function (t) {
        var e = this.getTotalQuantityForSerialNum();
        var i = t.length;
        return i < e;
      },
      formatSerialNumQtyDisplay: function (t, e) {
        var i = this.getTotalQuantityForSerialNum();
        var n = t.length;
        return n + "/" + i + " " + e;
      },
      formatExceptionUomVisible: function (t, e, i) {
        if (t && e / i !== 1) {
          return true;
        }
        return false;
      },
    });
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/controller/WarehouseOrderList.controller",
  [
    "sap/ui/core/mvc/Controller",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/utils/Const",
    "scm/ewm/pickcarts1/utils/Util",
    "sap/ui/core/ValueState",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator",
  ],
  function (e, t, r, i, a, s, o, n, l, u) {
    "use strict";
    return e.extend("zscm.ewm.pickcarts1.controller.WarehouseOrderList", {
      onInit: function () {
        this.table = this.getTable();
        this.oPersonalizationService =
          sap.ushell.Container.getService("Personalization");
        this.oTableTemplate = this.table.getItems()[0].clone();
        this.getRouter().attachRouteMatched(this.onRouteMatched, this);
      },
      onRouteMatched: function (e) {
        var t = e.getParameters("arguments");
        if (t.name === "warehouseOrderList") {
          this.clearSearchAndSort();
          this.initTable();
        }
      },
      initTable: function () {
        var e = t.getWarehouseOrders();
        e.then(
          function (e) {
            this.bindingItems(e);
          }.bind(this),
        );
      },
      clearSearchAndSort: function () {
        var e = this.byId("searchField");
        e.setValue("");
        if (this._oDialog) {
          this._oDialog.setSelectedSortItem("WhseOrderLatestStartDateTime");
          this._oDialog.setSortDescending(false);
        }
      },
      getTable: function () {
        return this.byId("warehouseOrderList");
      },
      bindingItems: function (e) {
        this.setTableTitle(e.length);
        var i = t.getWarehouseNumber();
        var s = t.getResourceNumber();
        var l = r.getQueue();
        var h = new o("EWMResource", u.EQ, s);
        var c = new o("EWMWarehouse", u.EQ, i);
        var m = new o("Queue", u.EQ, l);
        var g;
        if (a.isEmpty(l)) {
          g = [h, c];
        } else {
          g = [h, c, m];
        }
        this.oPersonalizationService
          .getContainer("zscm.ewm.pickcarts1")
          .fail(
            function () {
              this.oContainer =
                this.oPersonalizationService.createEmptyContainer(
                  "zscm.ewm.pickcarts1",
                );
              this.getTable().bindItems({
                path: "/WarehouseOrderSet",
                template: this.oTableTemplate,
                filters: g,
                sorter: new sap.ui.model.Sorter("WhseOrderLatestStartDateTime"),
              });
            }.bind(this),
          )
          .done(
            function (e) {
              this.oContainer = e;
              var t = [];
              var r = e.getItemValue("sortKey");
              var i = e.getItemValue("bDesc");
              if (r) {
                t.push(new n(r, i));
              } else {
                t.push(new n("WhseOrderLatestStartDateTime", false));
              }
              this.getTable().bindItems({
                path: "/WarehouseOrderSet",
                template: this.oTableTemplate,
                filters: g,
                sorter: t,
              });
            }.bind(this),
          );
      },
      setTableTitle: function (e) {
        var t = this.getView();
        var r = t.getModel("i18n");
        var i = r.getProperty("warehouseOrdersTitle");
        var a = r.getResourceBundle().getText(i, [e]);
        var s = t.byId("tableTitle");
        s.setText(a);
      },
      handleSortingDialogButtonPressed: function (e) {
        if (!this._oDialog) {
          this._oDialog = sap.ui.xmlfragment(
            "zscm.ewm.pickcarts1.view.dialog.SortWarehouseOrder",
            this,
          );
        }
        this.getView().addDependent(this._oDialog);
        if (this.oContainer.getItemValue("sortKey")) {
          this._oDialog.setSelectedSortItem(
            this.oContainer.getItemValue("sortKey"),
          );
          this._oDialog.setSortDescending(
            this.oContainer.getItemValue("bDesc"),
          );
        }
        this._oDialog.open();
      },
      handleConfirm: function (e) {
        var t = this.getTable();
        var r = e.getParameters();
        var i = t.getBinding("items");
        var a = [];
        if (r.sortItem) {
          var s = r.sortItem.getKey();
          var o = r.sortDescending;
          this.oContainer.setItemValue("sortKey", r.sortItem.getKey());
          this.oContainer.setItemValue("bDesc", r.sortDescending);
          this.oContainer.save();
          a.push(new n(s, o));
        }
        i.sort(a);
      },
      handleItemPress: function (e) {
        var s = e
          .getParameter("listItem")
          .getBindingContext()
          .getProperty("EWMWarehouseOrder");
        t.getWhoByMaulaSelection(s)
          .then(
            function (e) {
              r.setWONumber(s);
              var t = a.getNavParamsByStatus(e.PickcartWhoStatus, e, false);
              if (t.route) {
                r.setAppProgress(t.progress);
                this.navTo(t.route, t.param);
              }
            }.bind(this),
          )
          .catch(
            function (e) {
              a.playAudio(this, i.ERROR);
              r.showErrorMessage(e);
            }.bind(this),
          );
      },
      onSearch: function (e) {
        var t = [];
        var r = e.getSource().getValue();
        var i = this.getTable();
        var a = i.getBinding("items");
        if (r && r.length > 0) {
          var s = new o("EWMWarehouseOrder", u.Contains, r);
          t.push(s);
          var n = new sap.ui.model.Filter(t, true);
          a.filter(n);
        } else {
          a.filter([]);
        }
        a.attachDataReceived(function () {
          this.setTableTitle(a.getLength());
        }, this);
      },
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },
      navTo: function (e, t) {
        this.getOwnerComponent().getRouter().navTo(e, t, true);
      },
      formatDateTime: function (e, t) {
        return a.formatDateTime(a.convertDateTime(e), t);
      },
      formatInteger: function (e) {
        return a.formatInteger(parseInt(e));
      },
      formatNumber: function (e) {
        return a.formatNumber(parseFloat(e), i.MaxDecimalDigits);
      },
    });
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/localService/mockserver",
  ["sap/ui/core/util/MockServer"],
  function (e) {
    "use strict";
    var t,
      s = "scm/ewm/pickcarts1/",
      a = s + "localService/mockdata";
    return {
      init: function () {
        var r = jQuery.sap.getUriParameters(),
          u = jQuery.sap.getModulePath(a),
          n = jQuery.sap.getModulePath(s + "manifest", ".json"),
          i = jQuery.sap.syncGetJSON(n).data,
          o = i["sap.app"].dataSources.mainService,
          p = jQuery.sap.getModulePath(
            s + o.settings.localUri.replace(".xml", ""),
            ".xml",
          ),
          c = /.*\/$/.test(o.uri) ? o.uri : o.uri + "/";
        t = new e({ rootUri: c });
        e.config({
          autoRespond: true,
          autoRespondAfter: r.get("serverDelay") || 1,
        });
        t.simulate(p, { sMockdataBaseUrl: u, bGenerateMissingMockData: true });
        this.simulateVerifyResource();
        this.simulateLogonRSRC();
        this.simulateGetlayout();
        this.simulateGetHandlingUnits();
        this.simulateVerifyHandlingUnit();
        this.simulateGetWarehouseTaskGroups();
        this.simulateVerifySourceBin();
        this.simulateVerifySourceBinWithStock();
        this.simulateVerifySourceHU();
        this.simulateVerifyProduct();
        this.simulateVerifyBatch();
        this.simulateDropGroupSet();
        this.simulateDropTaskList();
        this.simulateConfirmTask();
        this.simulateConfirmTaskInBatch();
        this.simulateGetWHOBySelection();
        this.simulateAutoConfirmTask();
        this.simulateExceptionSet();
        this.simulateTerminate();
        this.simulateBindNewDestHU();
        this.simulateLogoff();
        this.simulateVerifySerialNumber();
        this.simulateResetPreparation();
        t.start();
        jQuery.sap.log.info("Running the app with mock data");
      },
      simulateVerifyResource: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("VerifyRSRC?(.*)"),
          response: function (e, t) {
            jQuery.sap.log.debug(
              "Function Import Test: Incoming request for VerifyRSRC",
            );
            var s = "/webapp/localService/mockdata/";
            if (t.indexOf("PICKCART_001") !== -1) {
              s += "VerifyRSRC_Succ.json";
            } else {
              s += "VerifyRSRC_Failed.json";
            }
            var a = jQuery.sap.sjax({ url: s });
            e.respondJSON(200, {}, JSON.stringify(a.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateLogonRSRC: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("LogonRSRC?(.*)"),
          response: function (e, t) {
            jQuery.sap.log.debug(
              "Function Import Test: Incoming request for VerifyRSRC",
            );
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/LogonRSRC.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateGetlayout: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("PickCartSet.*Layouts"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/Layout.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateGetHandlingUnits: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("WarehouseOrderSet.*HUs"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/HandlingUnits.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateResetPreparation: function () {
        var e = t.getRequests();
        e.push({
          method: "DELETE",
          path: new RegExp("RsrcHuAssignmentSet.*"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/HandlingUnits.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateVerifyHandlingUnit: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("BindHU?(.*)"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/VerifyPassed.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateGetWarehouseTaskGroups: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("WarehouseTaskGrpSet?(.*)"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/WarehouseTaskGrpSet.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateGetWarehouseTasks: function () {
        var e = t.getRequests();
        e.push({
          method: "GET",
          path: new RegExp("WarehouseTaskSet?(.*)"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/WarehouseTaskSet.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateVerifySourceBin: function () {
        var e = this;
        var s = t.getRequests();
        var a;
        s.push({
          method: "POST",
          path: new RegExp("VerifyBin(?!W)(.*)"),
          response: function (t, s) {
            var r = e.getParameterByName("EWMStorageBin", s);
            var u = e.getParameterByName("Verif", s);
            if (r === u) {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json",
              });
            } else {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json",
              });
            }
            t.respondJSON(200, {}, JSON.stringify(a.data));
            return true;
          },
        });
        t.setRequests(s);
      },
      simulateVerifySourceBinWithStock: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("VerifyBin(?=W)(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/VerifySourceBinWithStock_Succ.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateVerifySourceHU: function () {
        var e = this;
        var s = t.getRequests();
        var a;
        s.push({
          method: "POST",
          path: new RegExp("VerifyHU?(.*)"),
          response: function (t, s) {
            var r = e.getParameterByName("SourceHandlingUnit", s);
            var u = e.getParameterByName("VlenrVerif", s);
            if (r === u || r === "''") {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json",
              });
            } else {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json",
              });
            }
            t.respondJSON(200, {}, JSON.stringify(a.data));
            return true;
          },
        });
        t.setRequests(s);
      },
      simulateVerifyProduct: function () {
        var e = this;
        var s = t.getRequests();
        var a;
        s.push({
          method: "POST",
          path: new RegExp("VerifyProduct?(.*)"),
          response: function (t, s) {
            var r = e.getParameterByName("ProductName", s);
            var u = e.getParameterByName("Ean", s);
            if (r === u) {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json",
              });
            } else {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json",
              });
            }
            t.respondJSON(200, {}, JSON.stringify(a.data));
            return true;
          },
        });
        t.setRequests(s);
      },
      simulateVerifyBatch: function () {
        var e = this;
        var s = t.getRequests();
        var a;
        s.push({
          method: "POST",
          path: new RegExp("VerifyBatch?(.*)"),
          response: function (t, s) {
            var r = e.getParameterByName("Batch", s);
            var u = e.getParameterByName("BatchVerif", s);
            if (r === u || r === "''") {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json",
              });
            } else {
              a = jQuery.sap.sjax({
                url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json",
              });
            }
            t.respondJSON(200, {}, JSON.stringify(a.data));
            return true;
          },
        });
        t.setRequests(s);
      },
      simulateDropGroupSet: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("DropGrpSet?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/DropGrpSet.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateDropTaskList: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("WarehouseTaskSet?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/DropTaskList.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateConfirmTask: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("Confirm?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/ConfirmWT.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateConfirmTaskInBatch: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("ConfirmMulti?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/ConfirmWT.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateAutoConfirmTask: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("ConfirmAuto?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/WTConfirmationSet.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateExceptionSet: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("ExceptionSet?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/ExceptionSet.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateCheckOrderStatus: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("WarehouseOrderSet(.*)(?!/HUs)", "g"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/checkWarehouseOrderStatus.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateGetWHOBySelection: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("GetWHOBySelection(.*)(?!/HUs)$", "g"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/GetWHOBySelection.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateGetWarehouseOrderSet: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("WarehouseOrderSet(.*)$", "g"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/WarehouseOrderSet.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateTerminate: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "POST",
          path: new RegExp("LeaveTrans(.*)", "g"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/LeaveTrans.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        e.push({
          method: "POST",
          path: new RegExp("LeaveTrans(.*)", "g"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/LeaveTrans.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateBindNewDestHU: function () {
        var e = t.getRequests();
        e.push({
          method: "POST",
          path: new RegExp("BindNewHU?(.*)"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/VerifyPassed.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      getParameterByName: function (e, t) {
        var s = RegExp("[?&]" + e + "=([^&]*)").exec(t);
        return s && decodeURIComponent(s[1].replace(/\+/g, " "));
      },
      simulateLogoff: function () {
        var e = t.getRequests();
        var s;
        e.push({
          method: "GET",
          path: new RegExp("LogoffRSRC?(.*)"),
          response: function (e, t) {
            s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
      simulateVerifySerialNumber: function () {
        var e = t.getRequests();
        e.push({
          method: "POST",
          path: new RegExp("VerifySN?(.*)"),
          response: function (e, t) {
            var s = jQuery.sap.sjax({
              url: "/webapp/localService/mockdata/VerifyPassed.json",
            });
            e.respondJSON(200, {}, JSON.stringify(s.data));
            return true;
          },
        });
        t.setRequests(e);
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/Drop",
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ValueState",
    "scm/ewm/pickcarts1/utils/Const",
    "scm/ewm/pickcarts1/utils/Util",
  ],
  function (t, r, n, i) {
    "use strict";
    var o;
    var e = {};
    var s = {};
    var a = [];
    var u = [];
    return {
      init: function (i) {
        if (o === undefined) {
          o = new t({
            destBinValueState: r.None,
            destHUValueState: r.None,
            errors: [],
            taskGroups: [],
            currentGroup: {
              progress: 0,
              group: "",
              expectedBin: "",
              actualBin: "",
              isDropAll: false,
              destBinVerifyRequrired: true,
              tasksWithEmptyPosition: [
                { handlingUnit: "", logicalPosition: "", EWMWarehouseTask: "" },
              ],
              tasks: [
                {
                  handlingUnit: "",
                  logicalPosition: "",
                  EWMWarehouseTask: "",
                  confirmStatus: n.TASK_STATUS.INITIAL,
                },
              ],
            },
            progress: 0,
          });
        }
        return o;
      },
      destroy: function () {
        o = undefined;
        e = {};
        s = {};
        a = [];
        u = [];
      },
      setErrors: function (t) {
        o.setProperty("/errors", t);
      },
      getConfirmData: function () {
        var t = o.getProperty("/currentGroup");
        var r = [];
        t.tasks.forEach(function (i) {
          if (i.confirmStatus === n.TASK_STATUS.INITIAL) {
            i.confirmStatus = n.TASK_STATUS.CONFIRMING;
            r.push({
              TANUM: i.EWMWarehouseTask,
              VLENR: "",
              BATCH: "",
              NISTA: "",
              EXC: "",
              NLPLA: t.actualBin,
              RESTA: "",
            });
          }
        });
        var i = this.getConfirmDataForEmptyPosition();
        r = r.concat(i);
        return [r, n.CONF_MODE.NO_NEED_CHECK];
      },
      getConfirmDataByHU: function (t) {
        var r;
        var e = o.getProperty("/currentGroup");
        var s = i.find(e.tasks, function (r) {
          return (
            t === r.handlingUnit && r.confirmStatus === n.TASK_STATUS.INITIAL
          );
        });
        if (s) {
          s.confirmStatus = n.TASK_STATUS.CONFIRMING;
          r = {
            TANUM: s.EWMWarehouseTask,
            VLENR: "",
            BATCH: "",
            NISTA: "",
            EXC: "",
            NLPLA: e.actualBin,
            RESTA: "",
          };
        }
        return [[r], n.CONF_MODE.NO_NEED_CHECK];
      },
      getTaskByPosition: function (t) {
        var r = o.getProperty("/currentGroup").tasks;
        var n = i.find(r, function (r) {
          return t === r.logicalPosition;
        });
        if (n) {
          return n;
        }
      },
      updateTaskConfirmStatusByPosition: function (t, r) {
        var n = this.getTaskByPosition(t);
        if (!i.isEmpty(n)) {
          n.confirmStatus = r;
        }
      },
      getConfirmDataForEmptyPosition: function () {
        var t = [];
        var r = o.getProperty("/currentGroup");
        r.tasksWithEmptyPosition.forEach(function (n) {
          t.push({
            TANUM: n.EWMWarehouseTask,
            VLENR: "",
            BATCH: "",
            NISTA: "",
            EXC: "",
            NLPLA: r.actualBin,
            RESTA: "",
          });
        });
        return t;
      },
      clearData: function () {
        o.setProperty("/progress", 0);
        o.setProperty("/errors", []);
        e = {};
        s = {};
        a = [];
        u = [];
      },
      setData: function (t, r) {
        var p = [];
        r.forEach(function (t) {
          var r = t.DestinationHandlingUnit;
          if (t.HandlingUnitLogicalPosition !== "") {
            a.push(t.HandlingUnitLogicalPosition);
          }
          u.push(r);
          if (!e[r]) {
            e[r] = {
              logicalPosition: t.HandlingUnitLogicalPosition,
              group: t.WtgrpId,
            };
          }
          if (!s[t.HandlingUnitLogicalPosition]) {
            s[t.HandlingUnitLogicalPosition] = {
              handlingUnit: r,
              group: t.WtgrpId,
            };
          }
        });
        t.forEach(function (t) {
          var o = false;
          if (t.ConfirmMethod === "B") {
            o = true;
          }
          var e = {
            progress: 0,
            expectedBin: t.DestinationStorageBin,
            actualBin: "",
            destBinVerifyRequrired: t.NlplaVrf === n.ABAP_TRUE ? true : false,
            group: t.WtgrpId,
            isDropAll: o,
            tasksWithEmptyPosition: [],
            tasks: [],
          };
          r.forEach(function (r) {
            if (r.WtgrpId === t.WtgrpId) {
              if (i.isEmpty(r.HandlingUnitLogicalPosition)) {
                e.tasksWithEmptyPosition.push({
                  handlingUnit: r.DestinationHandlingUnit,
                  logicalPosition: r.HandlingUnitLogicalPosition,
                  EWMWarehouseTask: r.EWMWarehouseTask,
                });
              } else {
                e.tasks.push({
                  handlingUnit: r.DestinationHandlingUnit,
                  logicalPosition: r.HandlingUnitLogicalPosition,
                  EWMWarehouseTask: r.EWMWarehouseTask,
                  confirmStatus: n.TASK_STATUS.INITIAL,
                });
              }
            }
          });
          p.push(e);
        });
        o.setProperty("/taskGroups", p);
        o.setProperty("/currentGroup", p[0]);
      },
      getCurrentExpectedBin: function () {
        return o.getProperty("/currentGroup/expectedBin");
      },
      getAllPositions: function () {
        return a;
      },
      getAllDestHUs: function () {
        return u;
      },
      getPositionsOfCurrentGroup: function () {
        var t = [];
        var r = o.getProperty("/currentGroup/tasks");
        r.forEach(function (r) {
          t.push(r.logicalPosition);
        });
        return t;
      },
      getPositionIdByHU: function (t) {
        var r = e[t];
        return r && r.logicalPosition;
      },
      getCurrentTaskGroup: function () {
        return o.getProperty("/currentGroup");
      },
      getDestHUByPositionId: function (t) {
        var r = s[t];
        return r && r.handlingUnit;
      },
      isValideHandlingUnit: function (t) {
        var r = false;
        var n = e[t];
        if (
          n !== undefined &&
          n.group === o.getProperty("/currentGroup/group")
        ) {
          r = true;
        }
        return r;
      },
      isReadyToNextGroup: function () {
        var t = false;
        var r = o.getProperty("/currentGroup/progress");
        var n = o.getProperty("/currentGroup/tasks");
        if (r + 1 >= n.length) {
          t = true;
        }
        return t;
      },
      updateTaskProgress: function () {
        var t = o.getProperty("/currentGroup/progress");
        o.setProperty("/currentGroup/progress", ++t);
      },
      finishCurrentGroup: function () {
        var t = o.getProperty("/currentGroup/tasks");
        o.setProperty("/currentGroup/progress", t.length);
      },
      isLastGroup: function () {
        var t = o.getProperty("/progress");
        var r = o.getProperty("/taskGroups");
        var n = false;
        if (t >= r.length - 1) {
          n = true;
        }
        return n;
      },
      goToNextGroup: function () {
        var t = o.getProperty("/progress");
        var r = o.getProperty("/taskGroups");
        t += 1;
        o.setProperty("/progress", t);
        if (t < r.length) {
          o.setProperty("/currentGroup", r[t]);
        }
      },
      getHandlingUnitsWithSplitting: function () {
        var t = o.getProperty("/currentGroup");
        var r = t.tasksWithEmptyPosition;
        var n = [];
        r.forEach(function (t) {
          n.push(t.handlingUnit);
        });
        return n.join();
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/Global",
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "scm/ewm/pickcarts1/utils/Const",
    "sap/m/MessageBox",
  ],
  function (e, r, t, o) {
    "use strict";
    var n;
    var s = "System-Guided";
    var u = "Manual";
    return {
      i18nModel: {},
      init: function (t) {
        if (n === undefined) {
          this.i18nModel = t;
          n = new e({
            enableNext: false,
            woNumber: "",
            userName: "",
            appProgress: 0,
            selectedMode: s,
            pickModes: [
              { Name: s, Text: t.getObject("systemGuided") },
              { Name: u, Text: t.getObject("manualSelection") },
            ],
          });
          n.setDefaultBindingMode(r.TwoWay);
        }
        return n;
      },
      destroy: function () {
        n = undefined;
      },
      setQueue: function (e) {
        n.setProperty("/queue", e);
      },
      getQueue: function (e) {
        return n.getProperty("/queue");
      },
      setWoQueue: function (e) {
        n.setProperty("/woQueue", e);
      },
      getWoQueue: function () {
        return n.getProperty("/woQueue");
      },
      disableNext: function () {
        n.setProperty("/enableNext", false);
      },
      enableNext: function () {
        n.setProperty("/enableNext", true);
      },
      setWONumber: function (e) {
        n.setProperty("/woNumber", e);
      },
      getWONumber: function () {
        return n.getProperty("/woNumber");
      },
      setAppProgress: function (e) {
        n.setProperty("/appProgress", e);
      },
      getAppProgress: function () {
        return n.getProperty("/appProgress");
      },
      isSystemMode: function () {
        return n.getProperty("/selectedMode") === s;
      },
      setToLeaveAfterDrop: function (e) {
        n.setProperty("/bToLeaveAfterDrop", e);
      },
      getToLeaveAfterDrop: function () {
        return n.getProperty("/bToLeaveAfterDrop");
      },
      showErrorMsgIfInternetDisconnected: function (e) {
        if (e === t.ERR_INTERNET_DISCONNECTED) {
          var r = this.i18nModel
            .getResourceBundle()
            .getText("internetDisconnectedMsg");
          o.error(r);
        }
      },
      showErrorMessage: function (e) {
        if (e.statusCode === t.ERR_INTERNET_DISCONNECTED) {
          this.showErrorMsgIfInternetDisconnected(e.statusCode);
        } else {
          try {
            var r = JSON.parse(e.responseText);
            o.error(r.error.message.value);
          } catch (e) {}
        }
      },
      getMessageType: function (e) {
        var r;
        switch (e) {
          case "E":
            r = "Error";
            break;
          case "S":
            r = "Success";
            break;
          case "W":
            r = "Warning";
            break;
          case "I":
            r = "Information";
            break;
          case "A":
            r = "Error";
            break;
          case "X":
            r = "Error";
            break;
          default:
            r = "None";
            break;
        }
        return r;
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/LogonResource",
  ["sap/ui/model/json/JSONModel", "sap/ui/core/ValueState"],
  function (e, t) {
    "use strict";
    var o;
    return {
      init: function (n) {
        if (o === undefined) {
          o = new e({
            valueState: t.None,
            toolTip: "",
            editable: true,
            modeEditable: true,
          });
        }
        return o;
      },
      destroy: function () {
        o = undefined;
      },
      setError: function () {
        o.setProperty("/valueState", t.Error);
      },
      setNone: function () {
        o.setProperty("/valueState", t.None);
        o.setProperty("/toolTip", "");
      },
      setEditable: function (e) {
        o.setProperty("/editable", e);
      },
      setModeEditable: function (e) {
        o.setProperty("/modeEditable", e);
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/Models",
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/model/OData",
    "scm/ewm/pickcarts1/model/PickCartConnection",
    "scm/ewm/pickcarts1/model/ProcessWarehouseTasks",
    "scm/ewm/pickcarts1/model/Drop",
    "scm/ewm/pickcarts1/model/PickCartLayout",
    "scm/ewm/pickcarts1/model/LogonResource",
  ],
  function (e, s, c, o, t, i, r, a, m) {
    "use strict";
    return {
      createDeviceModel: function () {
        var c = new e(s);
        c.setDefaultBindingMode("OneWay");
        return c;
      },
      init: function (e, s) {
        o.destroy();
        c.destroy();
        t.destroy();
        i.destroy();
        r.destroy();
        a.destroy();
        m.destroy();
        c.init(s);
        o.init(e);
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/OData",
  [
    "scm/ewm/pickcarts1/model/PickCartLayout",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "scm/ewm/pickcarts1/utils/Util",
    "scm/ewm/pickcarts1/model/Global",
  ],
  function (e, r, t, n, s) {
    "use strict";
    var o;
    var u;
    var i;
    var a = "X";
    var c = false;
    var f = false;
    return {
      init: function (e) {
        if (n.isEmpty(o)) {
          o = e;
        }
        return o;
      },
      destroy: function () {
        o = null;
        u = null;
        i = null;
        c = false;
        f = false;
      },
      canTerminate: function () {
        return !c;
      },
      canConfirmTasks: function () {
        return !f;
      },
      getUserSettingPath: function () {
        var e;
        if (!n.isEmpty(u)) {
          e =
            "/UserSet(UserDataEntry='',IntralogisticsOperationsUser='" +
            u +
            "')";
        }
        return e;
      },
      getResourcePath: function () {
        var e;
        if (!n.isEmpty(u)) {
          e = this.getUserSettingPath() + "/EWMResource";
        }
        return e;
      },
      getWarehouseNumberPath: function () {
        var e;
        if (u !== undefined) {
          e = this.getUserSettingPath() + "/EWMWarehouse";
        }
        return e;
      },
      getUserSetting: function () {
        var e;
        if (!n.isEmpty(u)) {
          var r = o.getObject(this.getUserSettingPath());
          e = new Promise(function (e, t) {
            e(r);
          });
        } else {
          e = new Promise(function (e, r) {
            o.read(
              "/UserSet(UserDataEntry='',IntralogisticsOperationsUser='')",
              {
                success: function (r) {
                  u = r.IntralogisticsOperationsUser;
                  e(r);
                },
                error: function (e) {
                  s.showErrorMsgIfInternetDisconnected(e.statusCode);
                  r(e);
                },
              },
            );
          });
        }
        return e;
      },
      getWarehouseNumber: function () {
        return o.getObject(this.getUserSettingPath()).EWMWarehouse;
      },
      getResourceNumber: function () {
        return o.getObject(this.getUserSettingPath()).EWMResource;
      },
      setResourceNumber: function (e) {
        var r = this.getUserSettingPath();
        o.setProperty(r + "/EWMResource", e);
      },
      logonResource: function (e) {
        var r = s.getQueue();
        return new Promise(
          function (t, n) {
            o.read("/LogonRSRC", {
              urlParameters: {
                EWMWarehouse: "'" + this.getWarehouseNumber() + "'",
                EWMResource: "'" + this.getResourceNumber() + "'",
                ManualSel: !!e,
                Queue: "'" + r + "'",
              },
              success: function (e) {
                t(e);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                n(e);
              },
            });
          }.bind(this),
        );
      },
      getWhoByMaulaSelection: function (e) {
        return new Promise(
          function (r, t) {
            o.read("/GetWHOBySelection", {
              urlParameters: {
                EWMWarehouse: "'" + this.getWarehouseNumber() + "'",
                EWMResource: "'" + this.getResourceNumber() + "'",
                EWMWarehouseOrder: "'" + e + "'",
              },
              success: function (e) {
                r(e);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                t(e);
              },
            });
          }.bind(this),
        );
      },
      logoffResource: function () {
        return new Promise(
          function (e, r) {
            o.read("/LogoffRSRC", {
              urlParameters: {
                EWMWarehouse: "'" + this.getWarehouseNumber() + "'",
                EWMResource: "'" + this.getResourceNumber() + "'",
              },
              success: function (r) {
                e(r);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                r(e);
              },
            });
          }.bind(this),
        );
      },
      verifyResourceAndWarhouseNumber: function (e) {
        var r = this.getWarehouseNumber();
        var t = e;
        return new Promise(function (e, n) {
          o.read("/VerifyRSRC", {
            urlParameters: {
              EWMWarehouse: "'" + r + "'",
              EWMResource: "'" + t + "'",
            },
            success: function (r) {
              if (r.Failed === "X") {
                n(r.Msg);
              } else {
                e();
              }
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              n(e);
            },
          });
        });
      },
      resetPickcartConfig: function () {
        i = null;
      },
      getPickcartConfig: function () {
        var e = this.getWarehouseNumber();
        var r = this.getResourceNumber();
        if (!i) {
          i = new Promise(function (t, n) {
            if (e && r) {
              var u =
                "/PickCartSet(EWMWarehouse='" +
                e +
                "',EWMResource='" +
                r +
                "')/Layouts";
              o.read(u, {
                success: function (e) {
                  t(e.results);
                },
                error: function (e) {
                  s.showErrorMsgIfInternetDisconnected(e.statusCode);
                  n(e);
                },
              });
            } else {
              n();
            }
          });
        }
        return i;
      },
      getPickcartConnectionData: function (e) {
        var r = this.getWarehouseNumber();
        var t = this.getPickcartConfig();
        var n = new Promise(function (t, n) {
          if (r && e) {
            var u =
              "/WarehouseOrderSet(EWMWarehouse='" +
              r +
              "',EWMWarehouseOrder='" +
              e +
              "')/HUs";
            var i = o.getObject(u);
            if (i) {
              t(i);
            } else {
              o.read(u, {
                success: function (e) {
                  t(e.results);
                },
                error: function (e) {
                  s.showErrorMsgIfInternetDisconnected(e.statusCode);
                  n(e);
                },
              });
            }
          } else {
            n();
          }
        });
        return Promise.all([t, n]);
      },
      getWarehouseOrders: function () {
        var e = this.getWarehouseNumber();
        var u = this.getResourceNumber();
        var i;
        var a;
        var c = new r("EWMResource", t.EQ, u);
        var f = new r("EWMWarehouse", t.EQ, e);
        var d;
        if (!n.isEmpty(s.getQueue())) {
          i = s.getQueue();
          a = new r("Queue", t.EQ, i);
          d = [c, f, a];
        } else {
          d = [c, f];
        }
        var h = new Promise(function (e, r) {
          o.read("/WarehouseOrderSet", {
            filters: d,
            success: function (r) {
              e(r.results);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              r(e);
            },
          });
        });
        return h;
      },
      getWarehouseOrderStatus: function (e) {
        var r = this.getWarehouseNumber();
        var t = new Promise(function (t, n) {
          var u = "/CheckWHOStatus";
          o.read(u, {
            urlParameters: {
              EWMWarehouse: "'" + r + "'",
              EWMWarehouseOrder: "'" + e + "'",
            },
            success: function (e) {
              t(e);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              n(e);
            },
          });
        });
        return t;
      },
      validateHandlingUnit: function (e, r, t) {
        var n = this;
        return new Promise(function (u, i) {
          o.read("/BindHU", {
            urlParameters: {
              EWMWarehouse: "'" + n.getWarehouseNumber() + "'",
              EWMWarehouseOrder: "'" + e + "'",
              EWMResource: "''",
              Pmat: "''",
              HandlingUnitLogicalPosition: "''",
              HndlgUnitNumberInWhseOrder: "'" + r + "'",
              HandlingUnitNumber: "'" + t + "'",
              Checkonly: true,
            },
            success: function (e) {
              if (e.Failed === "X") {
                i(e.Msg);
              } else {
                u();
              }
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              i(e);
            },
          });
        });
      },
      resetConnectionData: function () {
        var e = s.getWONumber();
        var r = this.getWarehouseNumber();
        var t = this.getResourceNumber();
        var n =
          "/RsrcHuAssignmentSet(EWMWarehouse='" +
          r +
          "',EWMResource='" +
          t +
          "',EWMWarehouseOrder='" +
          e +
          "',HndlgUnitNumberInWhseOrder='')";
        return new Promise(function (e, r) {
          o.remove(n, {
            success: function (r) {
              e(r);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              r(e);
            },
          });
        });
      },
      submitConnectiondData: function (e) {
        return new Promise(function (r, t) {
          var n =
            "/HUSet(EWMWarehouse='" +
            e.EWMWarehouse +
            "',EWMWarehouseOrder='" +
            e.EWMWarehouseOrder +
            "',HndlgUnitNumberInWhseOrder='" +
            e.HndlgUnitNumberInWhseOrder +
            "')";
          o.update(n, e, {
            success: function () {
              r();
            },
            error: function (e) {
              s.showErrorMessage(e);
              t(e);
            },
          });
        });
      },
      submitTerminate: function (e, r) {
        var t = this.getWarehouseNumber();
        var n = this.getResourceNumber();
        var u = "";
        if (r) {
          u = a;
        }
        if (!c) {
          c = true;
          return new Promise(function (r, i) {
            var a = "/LeaveTrans";
            o.create(
              a,
              {},
              {
                urlParameters: {
                  EWMWarehouse: "'" + t + "'",
                  EWMResource: "'" + n + "'",
                  EWMWarehouseOrder: "'" + e + "'",
                  Split: "'" + u + "'",
                },
                success: function (e) {
                  c = false;
                  r(e);
                },
                error: function (e) {
                  s.showErrorMsgIfInternetDisconnected(e.statusCode);
                  c = false;
                  i(e);
                },
              },
            );
          });
        }
      },
      getExceptions: function () {
        var e = this.getWarehouseNumber();
        var n = new r("EWMWarehouse", t.EQ, e);
        return new Promise(function (r, t) {
          if (e) {
            o.read("/ExceptionSet", {
              filters: [n],
              success: function (e) {
                r(e.results);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                t(e);
              },
            });
          } else {
            t();
          }
        });
      },
      getWarehouseTaskGroup: function (e) {
        var n = this.getWarehouseNumber();
        var u = new r("EWMWarehouseOrder", t.EQ, e);
        var i = new r("EWMWarehouse", t.EQ, n);
        return new Promise(function (r, t) {
          if (n && e) {
            o.read("/WarehouseTaskGrpSet", {
              filters: [u, i],
              success: function (e) {
                r(e.results);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                t(e);
              },
            });
          } else {
            t();
          }
        });
      },
      getWarehouseTask: function (e) {
        var n = this.getWarehouseNumber();
        var u = new r("EWMWarehouseOrder", t.EQ, e);
        var i = new r("EWMWarehouse", t.EQ, n);
        var a = new r("IsHandlingUnitWarehouseTask", t.EQ, false);
        return new Promise(function (r, t) {
          if (n && e) {
            o.read("/WarehouseTaskSet", {
              filters: [u, i, a],
              success: function (e) {
                r(e.results);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                t(e);
              },
            });
          } else {
            t();
          }
        });
      },
      getPickingData: function (e, n) {
        var u = new r("EWMWarehouseOrder", t.EQ, e);
        var i = new r("EWMWarehouse", t.EQ, n);
        var a = new r("IsHandlingUnitWarehouseTask", t.EQ, false);
        var c = this.getPickcartConfig();
        var f = new Promise(function (e, r) {
          o.read("/WarehouseTaskGrpSet", {
            filters: [u, i],
            success: function (r) {
              e(r.results);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              r(e);
            },
          });
        });
        var d = new Promise(function (e, r) {
          o.read("/WarehouseTaskSet", {
            filters: [u, i, a],
            success: function (r) {
              e(r.results);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              r(e);
            },
          });
        });
        return Promise.all([c, f, d]);
      },
      verifySourceBin: function (e, r) {
        var t = this.getWarehouseNumber();
        return new Promise(function (n, u) {
          o.create(
            "/VerifyBin",
            {},
            {
              urlParameters: {
                EWMStorageBin: "'" + e + "'",
                EWMWarehouse: "'" + t + "'",
                Verif: "'" + r + "'",
              },
              success: function (e) {
                if (e.Failed === a) {
                  u(e.Msg);
                } else {
                  n(e);
                }
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                u(e);
              },
            },
          );
        });
      },
      verifySourceBinWithStock: function (e, r) {
        var t = this.getWarehouseNumber();
        return new Promise(function (n, u) {
          o.read("/VerifyBinWithStock", {
            urlParameters: {
              EWMStorageBin: "'" + e + "'",
              EWMWarehouse: "'" + t + "'",
              Verif: "''",
              ProductName: "'" + r + "'",
            },
            success: function (e) {
              if (e.results.length === 0) {
                u();
              } else {
                n(e.results);
              }
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              u(e);
            },
          });
        });
      },
      verifySourceHU: function (e, r) {
        var t = this.getWarehouseNumber();
        return new Promise(function (n, u) {
          o.create(
            "/VerifyHU",
            {},
            {
              urlParameters: {
                VlenrVerif: "'" + r + "'",
                SourceHandlingUnit: "'" + e + "'",
                EWMWarehouse: "'" + t + "'",
              },
              success: function (e) {
                if (e.Failed === a) {
                  u(e.Msg);
                } else {
                  n();
                }
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                u(e);
              },
            },
          );
        });
      },
      verifyBatch: function (e, r, t, n) {
        var u = this.getWarehouseNumber();
        return new Promise(function (i, c) {
          o.create(
            "/VerifyBatch",
            {},
            {
              urlParameters: {
                BatchVerif: "'" + r + "'",
                Batch: "'" + e + "'",
                EWMWarehouse: "'" + u + "'",
                ProductName: "'" + t + "'",
                EWMStorageBin: "'" + n + "'",
              },
              success: function (e) {
                if (e.Failed === a) {
                  c(e.Msg);
                } else {
                  i();
                }
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                c(e);
              },
            },
          );
        });
      },
      verifyProduct: function (e, r) {
        var t = this.getWarehouseNumber();
        return new Promise(function (n, u) {
          o.create(
            "/VerifyProduct",
            {},
            {
              urlParameters: {
                ProductName: "'" + e + "'",
                Ean: "'" + r + "'",
                EWMWarehouse: "'" + t + "'",
              },
              success: function (e) {
                if (e.Failed === "X") {
                  u(e.Msg);
                } else {
                  n();
                }
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                u(e);
              },
            },
          );
        });
      },
      verifySerialNumber: function (e, r) {
        var t = this.getWarehouseNumber();
        return new Promise(function (n, u) {
          o.create(
            "/VerifySN",
            {},
            {
              urlParameters: {
                ProductName: "'" + e + "'",
                EWMWarehouse: "'" + t + "'",
                Sernr: "'" + r + "'",
              },
              success: function (e) {
                if (e.Failed === a) {
                  u(e.Msg);
                } else {
                  n(e);
                }
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                u(e);
              },
            },
          );
        });
      },
      getQueueSet: function (e) {
        var r = this.getWarehouseNumber();
        return new Promise(function (t, n) {
          o.read("/GetQueueSet", {
            urlParameters: {
              EWMWarehouse: "'" + r + "'",
              EWMResource: "'" + e + "'",
            },
            success: function (e) {
              if (e.Failed === a) {
                n(e.Msg);
              } else {
                t(e);
              }
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              n(e);
            },
          });
        });
      },
      getPickData: function (e) {
        var r = this.getPickcartConfig();
        var t = this.getWarehouseTaskGroup(e);
        var n = this.getWarehouseTask(e);
        return Promise.all([r, t, n]);
      },
      getDropData: function (e, n) {
        var u = new r("EWMWarehouseOrder", t.EQ, e);
        var i = new r("EWMWarehouse", t.EQ, n);
        var a = new r("IsHandlingUnitWarehouseTask", t.EQ, true);
        var c = this.getPickcartConfig();
        var f = new Promise(function (e, r) {
          o.read("/DropGrpSet", {
            filters: [u, i],
            success: function (r) {
              e(r.results);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              r(e);
            },
          });
        });
        var d = new Promise(function (e, r) {
          o.read("/WarehouseTaskSet", {
            filters: [u, i, a],
            success: function (r) {
              e(r.results);
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              r(e);
            },
          });
        });
        return Promise.all([c, f, d]);
      },
      bindNewHU: function (e, r) {
        var t = [];
        var n = this;
        e.forEach(function (e, u) {
          t.push(
            new Promise(function (t, i) {
              o.create(
                "/BindNewHU",
                {},
                {
                  changeSetId: "" + u + "",
                  urlParameters: {
                    EWMWarehouse: "'" + n.getWarehouseNumber() + "'",
                    HandlingUnitNumber:
                      e.destHU === undefined ? "''" : "'" + e.destHU + "'",
                    HandlingUnitLogicalPosition:
                      e.logicalPosition === undefined
                        ? "''"
                        : "'" + e.logicalPosition + "'",
                    Pmat:
                      e.packageMaterial === undefined
                        ? "''"
                        : "'" + e.packageMaterial + "'",
                    EWMWarehouseOrder: "'" + r + "'",
                    EWMWarehouseTask:
                      e.taskNumber === undefined
                        ? "''"
                        : "'" + e.taskNumber + "'",
                  },
                  success: function (e) {
                    if (e.Failed === "X") {
                      i(e.VerifyHU.Msg);
                    } else {
                      t();
                    }
                  },
                  error: function (e) {
                    s.showErrorMsgIfInternetDisconnected(e.statusCode);
                    i();
                  },
                },
              );
            }),
          );
        });
        return Promise.all(t);
      },
      submitTasks: function (e) {
        var r = [];
        var t = this;
        if (!f) {
          f = true;
          e.forEach(function (e, n) {
            r.push(
              new Promise(function (r, u) {
                o.read("/Confirm", {
                  groupId: "" + n + "",
                  urlParameters: {
                    EWMWarehouse: "'" + t.getWarehouseNumber() + "'",
                    EWMWarehouseTask:
                      e.taskNumber === undefined
                        ? "''"
                        : "'" + e.taskNumber + "'",
                    Ndifa: "''",
                    ActualQuantityInAltvUnit:
                      e.quantity === undefined ? "''" : "'" + e.quantity + "'",
                    DestinationHandlingUnit:
                      e.destHU === undefined ? "''" : "'" + e.destHU + "'",
                    DestinationStorageBin:
                      e.destBin === undefined ? "''" : "'" + e.destBin + "'",
                    SourceHandlingUnit:
                      e.sourceHU === undefined ? "''" : "'" + e.sourceHU + "'",
                    Resta:
                      e.lowQuantity === undefined
                        ? "''"
                        : "'" + e.lowQuantity + "'",
                    Batch:
                      e.batchNo === undefined ? "''" : "'" + e.batchNo + "'",
                    Exc: e.Exc === undefined ? "''" : "'" + e.Exc + "'",
                    ConfMode:
                      e.ConfMode === undefined ? "'0'" : "'" + e.ConfMode + "'",
                  },
                  success: function (e) {
                    r(e.results);
                  },
                  error: function (e) {
                    s.showErrorMsgIfInternetDisconnected(e.statusCode);
                    u();
                  },
                });
              }),
            );
          });
        }
        return Promise.all(r)
          .then(function (e) {
            f = false;
            return e;
          })
          .catch(function (e) {
            f = false;
            return e;
          });
      },
      autoSubmitTasks: function (e) {
        var r = this.getWarehouseNumber();
        if (!f) {
          f = true;
          return new Promise(function (t, n) {
            o.read("/ConfirmAuto", {
              urlParameters: {
                EWMWarehouse: "'" + r + "'",
                ActualQuantityInAltvUnit:
                  e.pickedQuantity === undefined
                    ? "''"
                    : "'" + e.pickedQuantity + "'",
                SourceHandlingUnit:
                  e.sourceHU === undefined ? "''" : "'" + e.sourceHU + "'",
                EWMWarehouseTask:
                  e.taskNumber === undefined ? "''" : "'" + e.taskNumber + "'",
                Batch: e.batchNo === undefined ? "''" : "'" + e.batchNo + "'",
                Exc: e.Exc === undefined ? "''" : "'" + e.Exc + "'",
                RestWt: e.restWT === undefined ? "''" : "'" + e.restWT + "'",
              },
              success: function (e) {
                f = false;
                t(e.results);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                f = false;
                n();
              },
            });
          });
        }
      },
      submitTasksInBatch: function (e, r, t, n) {
        var u = this.getWarehouseNumber();
        var i = JSON.stringify({ DATA: e });
        var a = JSON.stringify({ DATA: t });
        var c = JSON.stringify({ DATA: n });
        if (!f) {
          f = true;
          return new Promise(function (e, t) {
            o.read("/ConfirmMulti", {
              urlParameters: {
                EWMWarehouse: "'" + u + "'",
                ConfMode: r === undefined ? "'0'" : "'" + r + "'",
                Combined: true,
                WTJson: "'" + i + "'",
                SERNRJson: "'" + a + "'",
                LCSERNRJson: "'" + c + "'",
              },
              success: function (r) {
                f = false;
                e(r.results);
              },
              error: function (e) {
                s.showErrorMsgIfInternetDisconnected(e.statusCode);
                f = false;
                t();
              },
            });
          });
        }
      },
      convertHUID: function (e) {
        var r = this.getWarehouseNumber();
        return new Promise(function (t, n) {
          o.read("/ConvertHUID", {
            urlParameters: {
              EWMWarehouse: "'" + r + "'",
              HandlingUnitNumber: "'" + e + "'",
            },
            success: function (e) {
              if (e.Failed === a) {
                n(e.Msg);
              } else {
                t(e);
              }
            },
            error: function (e) {
              s.showErrorMsgIfInternetDisconnected(e.statusCode);
              n(e);
            },
          });
        });
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/PickCartConnection",
  [
    "sap/ui/model/json/JSONModel",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/utils/Util",
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
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/PickCartLayout",
  ["sap/ui/model/json/JSONModel", "scm/ewm/pickcarts1/utils/Const"],
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
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/ProcessWarehouseTasks",
  [
    "sap/ui/model/json/JSONModel",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/utils/Const",
    "scm/ewm/pickcarts1/utils/Util",
    "sap/ui/core/format/NumberFormat",
  ],
  function (t, e, r, n, o) {
    "use strict";
    var a;
    return {
      init: function () {
        if (a === undefined) {
          a = new t({
            enableException: false,
            enableFullDenial: true,
            errors: [],
            sourceBinState: r.CONTROL_STATUS.EMPTY,
            sourceHUState: r.CONTROL_STATUS.EMPTY,
            destHUState: r.CONTROL_STATUS.EMPTY,
            productState: r.CONTROL_STATUS.EMPTY,
            batchState: r.CONTROL_STATUS.EMPTY,
            taskGroupProgress: 0,
            warehouseTaskGroups: [
              {
                key: "",
                pathSequence: -1,
                productDesc: "",
                sourceBin: "",
                sourceBinVerifyRequired: true,
                sourceHUDisplay: true,
                sourceHUMandatory: true,
                sourceHU: "",
                sourceHUInit: "",
                sourceHUMultiple: false,
                sourceHUVerifyRequired: true,
                product: "",
                productVerifyRequired: true,
                batchDisplay: true,
                batchNo: "",
                batchNoInit: "",
                batchNoVerifyRequired: true,
                totalAlternativeQty: 0,
                alternativeUom: "",
                totalBaseQty: 0,
                baseUom: "",
                actualQuantity: 0,
                lowQuantity: 0,
                lowQuantityState: r.CONTROL_STATUS.EMPTY,
                quantityAdjustState: r.CONTROL_STATUS.EMPTY,
                currentPickQty: 0,
                productImg: "",
                EAN: "",
                isSerialNumberEnabled: false,
                tasks: [
                  {
                    quantity: 0,
                    baseQty: 0,
                    logicalPosition: "",
                    destHU: "",
                    taskNumber: "",
                    sourceHu: "",
                    sourceBin: "",
                    matid: "",
                    batchNo: "",
                    exception: "",
                    packageMaterial: "",
                    lineNumber: "",
                    confirm: false,
                  },
                ],
                progress: 0,
                stock: [{ sourceHU: "", batchNo: "", quantity: 0 }],
              },
            ],
            currentWarehouseTaskGroup: {},
            exceptions: [],
            exceptionInfo: {
              destHU: "",
              pickedQuantity: "",
              destHUState: r.CONTROL_STATUS.EMPTY,
              pickedQuantityState: r.CONTROL_STATUS.EMPTY,
              pickingHU: "",
              pickingHUState: r.CONTROL_STATUS.EMPTY,
              positionLabel: "",
              logicalPosition: "",
              logicalPositionState: r.CONTROL_STATUS.EMPTY,
              exceptionCode: "",
              packageMaterial: "",
              pickedUoM: "0",
              lowQtyCheckUom: "0",
            },
          });
        }
        return a;
      },
      destroy: function () {
        a = undefined;
      },
      setErrors: function (t) {
        a.setProperty("/errors", t);
      },
      clearData: function () {
        a.setProperty("/taskGroupProgress", 0);
        a.setProperty("/warehouseTaskGroups", []);
        a.setProperty("/currentWarehouseTaskGroup", {});
        a.setProperty("/enableException", false);
        a.setProperty("/errors", []);
      },
      updateCurrentStock: function (t) {
        var e = this.getStockOfCurrentGroup();
        var r = this.getSourceHUOfCurrentGroup();
        var o = this.getBatchNo();
        var a = n.find(e, function (t) {
          if (t.sourceHU === r && t.batchNo === o) {
            return true;
          }
          return false;
        });
        if (a) {
          a.quantity -= t;
          return this.roundQuantity(a.quantity);
        }
      },
      getCurrentNeedQuantity: function () {
        var t = this.getCurrentTaskGroup();
        var e = t.totalAlternativeQty - t.actualQuantity;
        return this.roundQuantity(e);
      },
      getConfirmDataForMultipleSourceHU: function (t) {
        var e = this.getCurrentTaskGroup();
        var n = this.getCurrentUnconfirmTasksByDestHU(t);
        var o = this.getCurrentPickQuantity().toString();
        var a = this.separateTasksFromException(n, o, "");
        var i = r.CONF_MODE.NO_NEED_CHECK;
        if (this.isFinishedPickingOfTask()) {
          i = r.CONF_MODE.NEED_CHECK;
        }
        var u = [];
        a[0].forEach(function (t) {
          u.push({
            TANUM: t.taskNumber,
            VLENR: e.sourceHU,
            BATCH: e.batchNo,
            NISTA: t.quantity.toString(),
            EXC: "",
            NLPLA: "",
            RESTA: "",
          });
        });
        if (a[1].length > 0 && a[1][0].quantity !== 0) {
          u.push({
            TANUM: a[1][0].taskNumber,
            VLENR: e.sourceHU,
            BATCH: e.batchNo,
            NISTA: a[1][0].quantity.toString(),
            EXC: "",
            NLPLA: "",
            RESTA: "",
          });
        }
        return [u, i, a[1][0]];
      },
      isFinishedPickingOfTask: function () {
        var t = false;
        var e = this.getCurrentTaskGroup();
        var r = e.totalAlternativeQty - e.actualQuantity - e.currentPickQty;
        if (this.roundQuantity(r) === 0) {
          t = true;
        }
        return t;
      },
      isAllGroupFinished: function () {
        return this.getTaskGroupProgress() < this.getTaskGroups().length;
      },
      isSourceHandlingUnitMandatory: function () {
        return a.getProperty("/currentWarehouseTaskGroup/sourceHUMandatory");
      },
      setSourceHandlingUnitMandatory: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/sourceHUMandatory", t);
      },
      getConfirmData: function (t, e) {
        var n = this.getCurrentTaskGroup();
        var o = [];
        var a = [];
        var i = [];
        var u = [];
        var s = [];
        var c = this.getExceptionPickedQuantity();
        var f = this.getExceptionCode();
        var p = this.getInternalExceptionCode(f);
        var l = r.EXCEPTION_TYPE;
        var g = r.CONF_MODE.NO_NEED_CHECK;
        if (f === "") {
          a = this.getCurrentUnconfirmTasksByDestHU(t);
          if (n.progress === n.tasks.length - a.length) {
            for (var h = 0; h < a.length - 1; h++) {
              o.push({
                TANUM: a[h].taskNumber,
                VLENR: n.sourceHU,
                BATCH: n.batchNo,
                NISTA: a[h].quantity.toString(),
                EXC: "",
                NLPLA: "",
                RESTA: "",
              });
            }
            o.push({
              TANUM: a[h].taskNumber,
              VLENR: n.sourceHU,
              BATCH: n.batchNo,
              NISTA: a[h].quantity.toString(),
              EXC: "",
              NLPLA: "",
              RESTA: "",
            });
            g = r.CONF_MODE.NEED_CHECK;
          } else {
            a.forEach(function (t) {
              o.push({
                TANUM: t.taskNumber,
                VLENR: n.sourceHU,
                BATCH: n.batchNo,
                NISTA: t.quantity.toString(),
                EXC: "",
                NLPLA: "",
                RESTA: "",
              });
            });
          }
        } else {
          switch (p) {
            case l.BIDF:
              i = this.getCurrentUnconfirmTasks();
              i.forEach(function (t) {
                o.push({
                  TANUM: t.taskNumber,
                  VLENR: n.sourceHU,
                  BATCH: n.batchNo,
                  NISTA: "0",
                  EXC: f,
                  NLPLA: "",
                  RESTA: "",
                });
              });
              break;
            case l.BIDP:
            case l.DIFF:
              a = this.getCurrentUnconfirmTasksByDestHU(t);
              s = this.separateTasksFromException(a, c, f);
              u = this.getUnconfirmTasksExcludeExceptionHU(t);
              s[0].forEach(function (t) {
                o.push({
                  TANUM: t.taskNumber,
                  VLENR: n.sourceHU,
                  BATCH: n.batchNo,
                  NISTA: t.quantity.toString(),
                  EXC: "",
                  NLPLA: "",
                  RESTA: "",
                });
              });
              s[1].forEach(function (t) {
                o.push({
                  TANUM: t.taskNumber,
                  VLENR: n.sourceHU,
                  BATCH: n.batchNo,
                  NISTA: t.quantity.toString(),
                  EXC: f,
                  NLPLA: "",
                  RESTA: "",
                });
              });
              u.forEach(function (t) {
                o.push({
                  TANUM: t.taskNumber,
                  VLENR: n.sourceHU,
                  BATCH: n.batchNo,
                  NISTA: "0",
                  EXC: f,
                  NLPLA: "",
                  RESTA: "",
                });
              });
              break;
            case l.SPLT:
              e[0].forEach(function (t) {
                o.push({
                  TANUM: t.taskNumber,
                  VLENR: n.sourceHU,
                  BATCH: n.batchNo,
                  NISTA: t.quantity.toString(),
                  EXC: "",
                  NLPLA: "",
                  RESTA: "",
                });
              });
              if (e[1][0].quantity !== 0) {
                o.push({
                  TANUM: e[1][0].taskNumber,
                  VLENR: n.sourceHU,
                  BATCH: n.batchNo,
                  NISTA: e[1][0].quantity.toString(),
                  EXC: f,
                  NLPLA: "",
                  RESTA: "",
                });
              }
              break;
          }
        }
        return [o, g];
      },
      getConfirmTasksWithSerialNumber: function (t, e) {
        var r = this.getAlternativeUOMRatio();
        var n = [];
        var o;
        var a;
        var i = 0;
        t.forEach(
          function (t) {
            for (a = Number(t.NISTA) * r; a > 0; ) {
              o = e[i];
              i++;
              n.push({ TANUM: t.TANUM, SERID: o });
              a = this.roundQuantity(a - 1);
            }
          }.bind(this),
        );
        return n;
      },
      getConfirmTasksWithSerialNumberForLowQtyCheck: function (t, e) {
        var r = [];
        var n;
        var o = t[t.length - 1];
        for (var a = 0; a < e.length; a++) {
          n = e[a];
          r.push({ TANUM: o.TANUM, SERID: n });
        }
        return r;
      },
      getConfirmDataForLowStock: function (t, e) {
        var n = a.getProperty("/currentWarehouseTaskGroup");
        var o = r.CONF_MODE.REJECT_CHECK;
        var i = [];
        if (this.getLowQuantityCheckState() === r.CONTROL_STATUS.VALID) {
          o = r.CONF_MODE.CHECK_WITH_LOW_QTY;
        }
        var u = this.getCurrentUnconfirmTasksByDestHU(e);
        u.forEach(function (e) {
          i.push({
            TANUM: e.taskNumber,
            VLENR: n.sourceHU,
            BATCH: n.batchNo,
            NISTA: e.quantity,
            EXC: "",
            NLPLA: "",
            RESTA: t,
          });
        });
        return [i, o];
      },
      needLowQuantityCheck: function (t) {
        var e = n.find(t, function (t) {
          if (t.PopLowqtyCheck === "X") {
            return true;
          }
          return false;
        });
        if (e) {
          return true;
        }
        return false;
      },
      sortTasksByQuantity: function (t) {
        t.sort(function (t, e) {
          return t.quantity - e.quantity;
        });
        return t;
      },
      getTaskNumbers: function (t) {
        var e = [];
        t.forEach(function (t) {
          e.push(t.taskNumber);
        });
        return e;
      },
      getTaskNumbersByPosition: function (t, e) {
        var r = [];
        t.forEach(function (t) {
          if (t.logicalPosition === e) {
            r.push(t.taskNumber);
          }
        });
        return r;
      },
      jointTasksNumbers: function (t) {
        var e = "";
        var r = this.getTaskNumbers(t);
        if (r.length !== 0) {
          e = r[0];
        }
        r.slice(1).forEach(function (t) {
          e += "_" + t;
        });
        return e;
      },
      isAllTasksSuccessedInPosition: function (t) {
        var e = this.getCurrentTaskGroup().tasks;
        var r = n.find(e, function (e) {
          if (e.logicalPosition === t && e.confirm === false) {
            return true;
          }
          return false;
        });
        if (r) {
          return false;
        }
        return true;
      },
      isAllConfirmSuccess: function (t) {
        var e = n.find(t, function (t) {
          if (t.Failed === "X") {
            return true;
          }
          return false;
        });
        if (e) {
          return false;
        }
        return true;
      },
      getTaskByTaskNumber: function (t) {
        var e = {};
        var r = this.getCurrentTaskGroup().tasks;
        r.forEach(function (r) {
          if (r.taskNumber === t) {
            e = r;
          }
        });
        return e;
      },
      getMostNormalTasks: function (t, e) {
        var r = 0;
        var n = 0;
        var o = [];
        while (r < t.length) {
          n += t[r].quantity;
          if (this.roundQuantity(n) > e) {
            n -= t[r].quantity;
            break;
          }
          o.push(t[r]);
          r++;
        }
        return [o, this.roundQuantity(n)];
      },
      optimizeConfirmQuantity: function (t, e, r, n) {
        var o = e.length - 1;
        var a = o;
        var i = t.length - 1;
        var u = 0;
        var s = 0;
        var c = {};
        var f = 0;
        while (
          i > o &&
          r < this.roundQuantity(n + t[i].quantity - e[a].quantity)
        ) {
          i--;
        }
        if (i > o) {
          for (; i > o; i--) {
            while (
              a >= 0 &&
              r >= this.roundQuantity(n + t[i].quantity - e[a].quantity)
            ) {
              a--;
            }
            if (
              t[i].quantity !== e[a + 1].quantity &&
              u < this.roundQuantity(t[i].quantity - e[a + 1].quantity)
            ) {
              c = t[i];
              s = a + 1;
              u = this.roundQuantity(t[i].quantity - e[a + 1].quantity);
              a = o;
            }
          }
          if (c.quantity !== undefined) {
            f = n - e[s].quantity + c.quantity;
            e[s] = c;
          }
        }
        return [e, this.roundQuantity(f)];
      },
      separateTasksFromException: function (t, e, r) {
        var o = [];
        var a = [];
        var i = [];
        var u = [];
        var s = parseFloat(e, 10);
        var c;
        var f;
        var p = [];
        var l = [];
        this.sortTasksByQuantity(t).forEach(function (t) {
          var e = JSON.parse(JSON.stringify(t));
          o.push(e);
        });
        p = this.getMostNormalTasks(o, s);
        a = p[0];
        f = a.length - 1;
        c = p[1];
        if (f < o.length - 1 && f >= 0) {
          l = this.optimizeConfirmQuantity(o, a, s, c, f);
          if (l[1] > c) {
            a = l[0];
            c = l[1];
          }
        }
        u = this.getTaskNumbers(a);
        o.forEach(function (t) {
          if (!n.includes(u, t.taskNumber)) {
            t.quantity = 0;
            t.exception = r;
            i.push(t);
          }
        });
        if (i.length > 0) {
          i[0].quantity = this.roundQuantity(s - c);
        }
        return [a, i];
      },
      getAllPositionsFromTasks: function (t) {
        var e = [];
        t.forEach(function (t) {
          if (e.length === 0) {
            e.push(t.logicalPosition);
          } else {
            if (!n.includes(e, t.logicalPosition)) {
              e.push(t.logicalPosition);
            }
          }
        });
        return e;
      },
      getAllPositionsFromUnConfirmTasks: function (t) {
        var e = [];
        t.forEach(function (t) {
          if (t.confirm === false) {
            if (e.length === 0) {
              e.push(t.logicalPosition);
            } else {
              if (!n.includes(e, t.logicalPosition)) {
                e.push(t.logicalPosition);
              }
            }
          }
        });
        return e;
      },
      getPackageMaterialByDestHU: function (t) {
        var e;
        var r = this.getCurrentTaskGroup().tasks;
        var o = n.find(r, function (e) {
          if (e.destHU === t) {
            return true;
          }
          return false;
        });
        if (o) {
          e = o.packageMaterial;
        }
        return e;
      },
      getLineNumberByDestHU: function (t) {
        var e;
        var r = this.getCurrentTaskGroup().tasks;
        var o = n.find(r, function (e) {
          if (e.destHU === t) {
            return true;
          }
          return false;
        });
        if (o) {
          e = o.lineNumber;
        }
        return e;
      },
      getTaskNumbersByLogicalPosition: function (t) {
        var e;
        var r = this.getCurrentTaskGroup().tasks;
        r.forEach(function (r) {
          if (r.logicalPosition === t) {
            e.push(r.taskNumber);
          }
        });
        return e;
      },
      updateTasksWithExceptionByTaskIds: function (t, e, r) {
        var o = this.getCurrentTaskGroup().tasks;
        var a = n.find(o, function (e) {
          if (e.taskNumber === t) {
            return true;
          }
          return false;
        });
        if (a) {
          a.quantity = e;
          a.exception = r;
        }
      },
      updateTaskByTaskItem: function (t) {
        if (t !== undefined) {
          var e = this.getCurrentTaskGroup().tasks;
          var r = n.find(e, function (e) {
            if (t.taskNumber === e.taskNumber) {
              return true;
            }
            return false;
          });
          if (r) {
            r.quantity = r.quantity - t.quantity;
            r.baseQty = this.roundQuantity(
              r.quantity * this.getAlternativeUOMRatio(),
            );
            r.quantity = this.roundQuantity(r.quantity);
          }
        }
      },
      setExceptions: function (t) {
        a.setProperty("/exceptions", t);
      },
      getExceptions: function () {
        return a.getProperty("/exceptions");
      },
      getInternalExceptionCode: function (t) {
        var e = this.getExceptions();
        var r = n.find(e, function (e) {
          if (e.WarehouseTaskExceptionCode === t) {
            return true;
          }
          return false;
        });
        if (r) {
          return r.InternalProcessCode;
        }
      },
      getExternalExceptionCode: function (t) {
        var e = this.getExceptions();
        var r = n.find(e, function (e) {
          if (e.ExceptionCodeName === t) {
            return true;
          }
          return false;
        });
        if (r) {
          return r.WarehouseTaskExceptionCode;
        }
      },
      setExceptionCode: function (t) {
        a.setProperty("/exceptionInfo/exceptionCode", t);
      },
      clearExceptionInfo: function () {
        a.setProperty("/exceptionInfo", {
          destHU: "",
          pickedQuantity: "",
          destHUState: r.CONTROL_STATUS.EMPTY,
          pickedQuantityState: r.CONTROL_STATUS.EMPTY,
          pickingHU: "",
          pickingHUState: r.CONTROL_STATUS.EMPTY,
          positionLabel: "",
          logicalPosition: "",
          logicalPositionState: r.CONTROL_STATUS.EMPTY,
          exceptionCode: "",
        });
      },
      getExceptionDestHU: function () {
        return a.getProperty("/exceptionInfo/destHU");
      },
      setExceptionDestHU: function (t) {
        a.setProperty("/exceptionInfo/destHU", t);
      },
      getExceptionPickedQuantity: function () {
        return a.getProperty("/exceptionInfo/pickedQuantity");
      },
      getExceptionCode: function () {
        return a.getProperty("/exceptionInfo/exceptionCode");
      },
      getExceptionLogicalPosition: function () {
        return a.getProperty("/exceptionInfo/logicalPosition");
      },
      setExceptionLogicalPosition: function (t) {
        a.setProperty("/exceptionInfo/logicalPosition", t);
      },
      getExceptionPickingHU: function () {
        return a.getProperty("/exceptionInfo/pickingHU");
      },
      setExceptionPickingHU: function (t) {
        a.setProperty("/exceptionInfo/pickingHU", t);
      },
      setExceptionPickingHUState: function (t) {
        a.setProperty("/exceptionInfo/pickingHUState", t);
      },
      getExceptionPickingHUState: function () {
        return a.getProperty("/exceptionInfo/pickingHUState");
      },
      getExceptionDestHUState: function () {
        return a.getProperty("/exceptionInfo/destHUState");
      },
      setExceptionDestHUState: function (t) {
        a.setProperty("/exceptionInfo/destHUState", t);
      },
      setExceptionPickedQuantity: function (t) {
        a.setProperty("/exceptionInfo/pickedQuantity", t);
      },
      setExceptionPickedQuantityState: function (t) {
        a.setProperty("/exceptionInfo/pickedQuantityState", t);
      },
      getExceptionPickedQuantityState: function () {
        return a.getProperty("/exceptionInfo/pickedQuantityState");
      },
      setExceptionLogicalPositionState: function (t) {
        a.setProperty("/exceptionInfo/logicalPositionState", t);
      },
      getExceptionLogicalPositionState: function () {
        return a.getProperty("/exceptionInfo/logicalPositionState");
      },
      setExceptionPackageMaterial: function (t) {
        a.setProperty("/exceptionInfo/packageMaterial", t);
      },
      getExceptionPickedUoM: function () {
        return a.getProperty("/exceptionInfo/pickedUoM");
      },
      setLowQtyCheckUoM: function (t) {
        a.setProperty("/exceptionInfo/lowQtyCheckUom", t);
      },
      getLowQtyCheckUoM: function (t) {
        return a.getProperty("/exceptionInfo/lowQtyCheckUom");
      },
      getCurrentTasksByDestHU: function (t) {
        var e = this.getCurrentTaskGroup().tasks;
        var r = [];
        e.forEach(function (e) {
          if (e.destHU === t) {
            r.push(e);
          }
        });
        return r;
      },
      getCurrentUnconfirmTasksByDestHU: function (t) {
        var e = this.getCurrentTaskGroup().tasks;
        var r = [];
        e.forEach(function (e) {
          if (e.destHU === t && e.confirm === false) {
            r.push(e);
          }
        });
        return r;
      },
      getCurrentUnconfirmTasksByPosition: function (t) {
        var e = this.getCurrentTaskGroup().tasks;
        var r = [];
        e.forEach(function (e) {
          if (e.logicalPosition === t && e.confirm === false) {
            r.push(e);
          }
        });
        return r;
      },
      getCurrentUnconfirmTasks: function () {
        var t = this.getCurrentTaskGroup().tasks;
        var e = [];
        t.forEach(function (t) {
          if (t.confirm === false) {
            e.push(t);
          }
        });
        return e;
      },
      getUnconfirmTasksExcludeExceptionHU: function (t) {
        var e = this.getCurrentTaskGroup().tasks;
        var r = [];
        e.forEach(function (e) {
          if (e.destHU !== t && e.confirm === false) {
            r.push(e);
          }
        });
        return r;
      },
      getAllUnconfirmTasksByDestHU: function (t) {
        var e = this.getAllTasks();
        var r = [];
        e.forEach(function (e) {
          if (e.destHU === t && e.confirm === false) {
            r.push(e);
          }
        });
        return r;
      },
      getLogicalPositionByHU: function (t) {
        var e;
        var r = this.getCurrentTaskGroup().tasks;
        var o = n.find(r, function (e) {
          if (e.destHU === t) {
            return true;
          }
          return false;
        });
        if (o) {
          e = o.logicalPosition;
        }
        return e;
      },
      getDestHUByPosition: function (t) {
        var e = "";
        var r = this.getCurrentTaskGroup().tasks;
        var o = n.find(r, function (e) {
          if (e.logicalPosition === t) {
            return true;
          }
          return false;
        });
        if (o) {
          e = o.destHU;
        }
        return e;
      },
      getTaskConfirmStatusByPosition: function (t) {
        var e;
        var r = this.getCurrentTaskGroup().tasks;
        var o = n.find(r, function (e) {
          if (e.logicalPosition === t) {
            return true;
          }
          return false;
        });
        if (o) {
          e = o.confirm;
        }
        return e;
      },
      getAllDestHUsFromTasks: function () {
        var t = [];
        var e = this.getAllTasks();
        e.forEach(function (e) {
          if (t.length === 0) {
            t.push(e.destHU);
          } else {
            if (!n.includes(t, e.destHU)) {
              t.push(e.destHU);
            }
          }
        });
        return t;
      },
      getPositionFromTasksByHU: function (t) {
        var e;
        var r = this.getAllTasks();
        var o = n.find(r, function (e) {
          if (e.destHU === t) {
            return true;
          }
          return false;
        });
        if (o) {
          e = o.logicalPosition;
        }
        return e;
      },
      getDestHUFromTasksByPosition: function (t) {
        var e = "";
        var r = this.getAllTasks();
        var o = n.find(r, function (e) {
          if (e.logicalPosition === t && e.confirm === false) {
            return true;
          }
          return false;
        });
        if (!o) {
          o = n.find(r, function (e) {
            if (e.logicalPosition === t) {
              return true;
            }
            return false;
          });
        }
        if (o) {
          e = o.destHU;
        }
        return e;
      },
      getTaskQuantityByDestHU: function (t) {
        var e = 0;
        var r = this.getCurrentTaskGroup().tasks;
        r.forEach(function (r) {
          if (r.destHU === t) {
            e += r.quantity;
          }
        });
        return this.roundQuantity(e);
      },
      getUnconfirmTaskQuantityByDestHU: function (t) {
        var e = 0;
        var r = this.getCurrentTaskGroup().tasks;
        r.forEach(function (r) {
          if (r.destHU === t && r.confirm === false) {
            e += r.quantity;
          }
        });
        return e;
      },
      getTasksQuantityByPosition: function (t) {
        var e = 0;
        var r = this.getCurrentTaskGroup().tasks;
        r.forEach(function (r) {
          if (r.logicalPosition === t) {
            e += r.quantity;
          }
        });
        return this.roundQuantity(e);
      },
      getTasksBaseQuantityByPosition: function (t) {
        var e = 0;
        var r = this.getCurrentTaskGroup().tasks;
        r.forEach(function (r) {
          if (r.confirm === false && r.logicalPosition === t) {
            e += r.baseQty;
          }
        });
        return this.roundQuantity(e);
      },
      getUnprocessedDestHU: function (t) {
        var e = this.getCurrentTaskGroup().tasks;
        var r = [];
        t.forEach(function (t) {
          e.forEach(function (e) {
            if (e.logicalPosition === t) {
              r.push(e.destHU);
            }
          });
        });
        return r;
      },
      updateTasksWithExceptionByHandlingUnit: function (t, e, r) {
        var o = this.getCurrentTaskGroup().tasks;
        t.forEach(function (t) {
          var a = n.find(o, function (e) {
            if (e.destHU === t) {
              return true;
            }
            return false;
          });
          if (a) {
            a.quantity = e;
            a.exception = r;
          }
        });
        a.setProperty("/currentWarehouseTaskGroup/tasks", o);
      },
      updateTasksConfirmStatusByHU: function (t) {
        var e = this.getCurrentUnconfirmTasksByDestHU(t);
        e.forEach(function (t) {
          t.confirm = true;
        });
      },
      updateTasksConfirmStatus: function (t) {
        var e = this.getCurrentUnconfirmTasks();
        var r;
        t.forEach(function (t) {
          r = n.find(e, function (e) {
            if (
              e.taskNumber === t.taskNumber ||
              e.taskNumber === t.EWMWarehouseTask
            ) {
              return true;
            }
            return false;
          });
          if (r) {
            r.confirm = true;
          }
        });
      },
      updatePickingTaskGroupProgress: function () {
        var t = this.getTaskGroupProgress();
        var e = this.getTaskGroups();
        if (t < e.length) {
          t++;
        }
        a.setProperty("/taskGroupProgress", t);
      },
      updateCurrentTaskGroup: function () {
        var t = this.getTaskGroupProgress();
        var e = this.getTaskGroups();
        if (e[t]) {
          a.setProperty("/currentWarehouseTaskGroup", e[t]);
        }
      },
      updatePickingTaskProgress: function (t) {
        var e = this.getCurrentTaskGroup();
        var r = e.tasks;
        var n = e.progress;
        var o = e.actualQuantity;
        if (t) {
          o += this.getTaskQuantityByDestHU(t);
          n += this.getCurrentTasksByDestHU(t).length;
        } else {
          if (this.getExceptionPickedQuantity() !== "") {
            o += parseFloat(this.getExceptionPickedQuantity(), 10);
          }
          n = r.length;
        }
        a.setProperty("/currentWarehouseTaskGroup/progress", n);
        a.setProperty(
          "/currentWarehouseTaskGroup/actualQuantity",
          this.roundQuantity(o),
        );
      },
      updatePickingTaskProgressForMulti: function (t) {
        var e = this.getCurrentTaskGroup().progress;
        e += t.length;
        a.setProperty("/currentWarehouseTaskGroup/progress", e);
      },
      increasePickingTaskProgress: function () {
        var t = this.getCurrentTaskGroup();
        var e = t.progress;
        e++;
        a.setProperty("/currentWarehouseTaskGroup/progress", e);
      },
      updateTasksAfterSplittingConfirm: function (t, e) {
        var r = this.getCurrentGroupProgress();
        var o = e[0];
        var a = e[1];
        o.forEach(function (e) {
          var r = n.find(t, function (t) {
            if (t.taskNumber === e.taskNumber) {
              return true;
            }
            return false;
          });
          if (r) {
            r.confirm = true;
          }
        });
        a.forEach(
          function (e) {
            var r = n.find(t, function (t) {
              if (t.taskNumber === e.taskNumber) {
                return true;
              }
              return false;
            });
            if (r) {
              r.quantity = this.roundQuantity(r.quantity - e.quantity);
              var o = this.getAlternativeUOMRatio();
              r.baseQty = this.roundQuantity(r.quantity * o);
            }
          }.bind(this),
        );
        r += o.length;
        this.setCurrentGroupProgress(r);
      },
      isSourceBinPickable: function () {
        return this.isSourceHuPickable("");
      },
      isSourceHuPickable: function (t) {
        var e = this.getStockOfCurrentGroup();
        var r = this.getBatchInitValue();
        var o = n.find(e, function (e) {
          if (t === e.sourceHU && e.quantity !== 0) {
            if ((r !== "" && r === e.batchNo) || r === "") {
              return true;
            }
          }
        });
        if (o) {
          return true;
        }
        return false;
      },
      IsBatchWithStock: function (t, e) {
        var r = this.getCurrentTaskGroup();
        var o = r.stock;
        var a = n.find(o, function (r) {
          if (t === r.sourceHU && e === r.batchNo && r.quantity !== 0) {
            return true;
          }
          return false;
        });
        if (a) {
          return true;
        }
        return false;
      },
      updateTaskPositionForSplitting: function (t) {
        var e = this.getAllTasks();
        e.forEach(function (e) {
          if (e.destHU === t) {
            e.logicalPosition = "";
          }
        });
      },
      updateCurrentTasksForSplitting: function (t, e, r) {
        var n = this.getCurrentUnconfirmTasksByDestHU(t);
        n.forEach(function (t) {
          t.destHU = e;
          t.logicalPosition = r;
          t.exception = "";
        });
      },
      updateRemainTasksForSplitting: function (t, e, r) {
        var n = this.getAllTasks();
        n.forEach(function (n) {
          if (n.destHU === t && n.confirm === false) {
            n.destHU = e;
            n.logicalPosition = r;
            n.exception = "";
          }
        });
      },
      isAllWarehouseTasksReadyInOneGroup: function () {
        var t = this.getCurrentTaskGroup();
        var e = t.progress;
        var r = t.tasks;
        return e === r.length;
      },
      isAllWarehouseTaskGroupsReady: function () {
        var t = this.getTaskGroupProgress();
        var e = this.getTaskGroups();
        return t === e.length;
      },
      setTaskGroups: function (t, e) {
        var r = [];
        var n;
        var o = {};
        for (var i = 0; i < t.length; i++) {
          n = this.transformGroupData(t[i]);
          for (var u = 0; u < e.length; u++) {
            if (t[i].WtgrpId === e[u].WtgrpId) {
              o = this.transformTaskData(e[u]);
              n.tasks.push(o);
            }
          }
          r.push(n);
        }
        a.setProperty("/warehouseTaskGroups", r);
        a.setProperty("/currentWarehouseTaskGroup", r[0]);
      },
      getTaskGroups: function () {
        return a.getProperty("/warehouseTaskGroups");
      },
      setStocksOfCurrentGroup: function (t) {
        var e = [];
        var r = this.getUomOfCurrentGroup().trim().toUpperCase();
        t.forEach(function (t) {
          var n = 0;
          if (t.Quan !== "") {
            if (t.BaseUnit.trim().toUpperCase() === r) {
              n = parseFloat(t.Quan, 10);
            } else if (
              t.StockKeepingAlternativeUoM.trim().toUpperCase() === r
            ) {
              n = parseFloat(t.PackedQuantityInAltvUnit, 10);
            }
          }
          e.push({
            sourceHU: t.HandlingUnitNumber,
            batchNo: t.Batch,
            quantity: n,
          });
        });
        a.setProperty("/currentWarehouseTaskGroup/stock", e);
      },
      updateTaskGroups: function (t) {
        var e = this.getTaskGroupProgress();
        var r = t.filter(function (t) {
          var e = false;
          if (t.WtgrpKey) {
            e = true;
          }
          return e;
        });
        r.forEach(
          function (t) {
            var r = this.getTaskGroups();
            var o;
            var i = n.find(r, function (r, n) {
              var o = false;
              if (r.key === t.WtgrpKey && e < n) {
                o = true;
              }
              return o;
            });
            if (i) {
              o = this.transformTaskData(t);
              i.tasks.push(o);
              i.totalAlternativeQty = this.roundQuantity(
                i.totalAlternativeQty + o.quantity,
              );
              i.totalBaseQty = this.roundQuantity(i.totalBaseQty + o.baseQty);
            } else {
              i = this.transformGroupData(t);
              i.tasks = [this.transformTaskData(t)];
              var u = n.findIndex(r, function (t, r) {
                if (t.pathSequence > i.pathSequence && e < r) {
                  return true;
                }
                return false;
              });
              if (u === -1) {
                u = r.length;
              }
              r.splice(u, 0, i);
            }
            a.setProperty("/warehouseTaskGroups", r);
          }.bind(this),
        );
      },
      transformGroupData: function (t) {
        var e = { tasks: [] };
        e.key = t.WtgrpKey;
        e.pathSequence = t.WhseTaskSortingSequence;
        e.productDesc = t.Maktx;
        e.sourceBin = t.SourceStorageBin;
        e.sourceHU = t.SourceHandlingUnit;
        e.sourceHUDisplay = t.VlenrAllowed === r.ABAP_TRUE ? true : false;
        e.sourceHUMandatory = t.VlenrObligatory === r.ABAP_TRUE ? true : false;
        e.sourceHUInit = t.SourceHandlingUnit;
        e.productImg = t.PicURL;
        e.sourceHUMultiple = false;
        if (e.sourceHUDisplay === true && e.sourceHUInit === "") {
          e.sourceHUMultiple = true;
        }
        e.product = t.ProductName;
        e.EAN = t.Ean;
        e.isSerialNumberEnabled = t.SnReq;
        e.batchDisplay = t.BatchReq === r.ABAP_TRUE ? true : false;
        e.batchNo = t.Batchno;
        e.batchNoInit = t.Batchno;
        e.alternativeUom = t.AlternativeUnit;
        e.baseUom = t.BaseUnit;
        e.totalAlternativeQty = parseFloat(t.TargetQuantityInAltvUnit, 10);
        e.totalBaseQty = parseFloat(t.TargetQuantityInBaseUnit, 10);
        e.actualQuantity = 0;
        e.progress = 0;
        e.stock = [];
        e.sourceBinVerifyRequired = t.VlplaVrf === r.ABAP_TRUE ? true : false;
        e.sourceHUVerifyRequired = t.VlenrVrf === r.ABAP_TRUE ? true : false;
        e.batchNoVerifyRequired = t.BatchnoVrf === r.ABAP_TRUE ? true : false;
        e.productVerifyRequired = t.MatnrVrf === r.ABAP_TRUE ? true : false;
        return e;
      },
      transformTaskData: function (t) {
        var e = {
          taskNumber: t.EWMWarehouseTask,
          quantity: parseFloat(t.TargetQuantityInAltvUnit, 10),
          baseQty: parseFloat(t.TargetQuantityInBaseUnit, 10),
          logicalPosition: t.HandlingUnitLogicalPosition,
          destHU: t.DestinationHandlingUnit,
          sourceHU: t.SourceHandlingUnit,
          sourceBin: t.SourceStorageBin,
          batchNo: t.Batchno,
          exception: "",
          packageMaterial: t.Pmat,
          lineNumber: t.HndlgUnitNumberInWhseOrder,
          confirm: false,
        };
        return e;
      },
      getAllTasks: function () {
        var t = this.getTaskGroups();
        var e = [];
        t.forEach(function (t) {
          t.tasks.forEach(function (t) {
            e.push(t);
          });
        });
        return e;
      },
      getAllTasksFromCurrentGroup: function () {
        return this.getCurrentTaskGroup().tasks;
      },
      getCurrentTaskGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup");
      },
      getStockOfCurrentGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup/stock");
      },
      getSourceBinOfCurrentGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup/sourceBin");
      },
      getProductOfCurrentGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup/product");
      },
      getUomOfCurrentGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup/alternativeUom");
      },
      getSourceHUOfCurrentGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup/sourceHU");
      },
      getSourceHUInitValue: function () {
        return a.getProperty("/currentWarehouseTaskGroup/sourceHUInit");
      },
      getBatchInitValue: function () {
        return a.getProperty("/currentWarehouseTaskGroup/batchNoInit");
      },
      isMultiSourceHUOfCurrentGroup: function () {
        return a.getProperty("/currentWarehouseTaskGroup/sourceHUMultiple");
      },
      getTaskGroupProgress: function () {
        return a.getProperty("/taskGroupProgress");
      },
      setTaskGroupProgress: function (t) {
        a.setProperty("/taskGroupProgress", t);
      },
      getCurrentGroupProgress: function () {
        return a.getProperty("/currentWarehouseTaskGroup/progress");
      },
      setCurrentGroupProgress: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/progress", t);
      },
      getCurrentTaskGroupTotalQuantity: function () {
        return a.getProperty("/currentWarehouseTaskGroup/totalAlternativeQty");
      },
      getCurrentTaskGroupTotalBaseQuantity: function () {
        return a.getProperty("/currentWarehouseTaskGroup/totalBaseQty");
      },
      getCurrentTaskGroupAcutalQuantity: function () {
        return a.getProperty("/currentWarehouseTaskGroup/actualQuantity");
      },
      setCurrentTaskGroupTotalQuantity: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/totalAlternativeQty", t);
      },
      setCurrentTaskGroupTotalBaseQuantity: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/totalBaseQty", t);
      },
      getEnableException: function () {
        return a.getProperty("/enableException");
      },
      disableException: function () {
        a.setProperty("/enableException", false);
      },
      enableException: function () {
        a.setProperty("/enableException", true);
      },
      setFullDenialEnable: function (t) {
        a.setProperty("/enableFullDenial", t);
      },
      getSourceBinState: function () {
        return a.getProperty("/sourceBinState");
      },
      setSourceBinState: function (t) {
        a.setProperty("/sourceBinState", t);
      },
      getSourceHUState: function () {
        return a.getProperty("/sourceHUState");
      },
      setSourceHUState: function (t) {
        a.setProperty("/sourceHUState", t);
      },
      getDestHUState: function () {
        return a.getProperty("/destHUState");
      },
      setDestHUState: function (t) {
        a.setProperty("/destHUState", t);
      },
      getProductState: function () {
        return a.getProperty("/productState");
      },
      setProductState: function (t) {
        a.setProperty("/productState", t);
      },
      getBatchState: function () {
        return a.getProperty("/batchState");
      },
      setBatchNo: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/batchNo", t);
      },
      getBatchNo: function (t) {
        return a.getProperty("/currentWarehouseTaskGroup/batchNo");
      },
      setSourceHU: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/sourceHU", t);
      },
      setBatchState: function (t) {
        a.setProperty("/batchState", t);
      },
      setLowQuantity: function (t) {
        return a.setProperty("/currentWarehouseTaskGroup/lowQuantity", t);
      },
      getLowQuantity: function () {
        return a.getProperty("/currentWarehouseTaskGroup/lowQuantity");
      },
      setLowQuantityCheckState: function (t) {
        return a.setProperty("/currentWarehouseTaskGroup/lowQuantityState", t);
      },
      getLowQuantityCheckState: function () {
        return a.getProperty("/currentWarehouseTaskGroup/lowQuantityState");
      },
      updataCurrentActualQuantity: function (t) {
        var e = a.getProperty("/currentWarehouseTaskGroup/actualQuantity");
        var r = e + t;
        a.setProperty(
          "/currentWarehouseTaskGroup/actualQuantity",
          this.roundQuantity(r),
        );
      },
      setCurrentPickQuantity: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/currentPickQty", t);
      },
      getCurrentPickQuantity: function () {
        return a.getProperty("/currentWarehouseTaskGroup/currentPickQty");
      },
      setQuantityAdjustmentState: function (t) {
        a.setProperty("/currentWarehouseTaskGroup/quantityAdjustState", t);
      },
      getQuantityAdjustmentState: function () {
        return a.getProperty("/currentWarehouseTaskGroup/quantityAdjustState");
      },
      getCurrentDestHUForMulti: function () {
        var t = this.getCurrentTaskGroup();
        return t.tasks[0].destHU;
      },
      isContainsSpecialCharacter: function (t) {
        var e = "$*+";
        for (var r = 0; r < t.length; r++) {
          if (e.indexOf(t.charAt(r)) !== -1) {
            return true;
          }
        }
      },
      roundQuantity: function (t, e) {
        if (n.isEmpty(e)) {
          e = 3;
        }
        if (!n.isInteger(t)) {
          var r = o.getFloatInstance({ decimals: e });
          return r.parse(r.format(t));
        }
        return t;
      },
      isSerialNumberEnabled: function () {
        return a.getProperty(
          "/currentWarehouseTaskGroup/isSerialNumberEnabled",
        );
      },
      isAlternativeUomIdenticalToBase: function () {
        var t = this.getAlternativeUOMRatio();
        return t === 1;
      },
      getAlternativeUOMRatio: function () {
        var t = this.getCurrentTaskGroupTotalQuantity();
        var e = this.getCurrentTaskGroupTotalBaseQuantity();
        return this.roundQuantity(e / t);
      },
      updateExceptionPickedUoM: function (t, e) {
        var r = this.getAlternativeUOMRatio();
        var n = this.roundQuantity(t / r, 2).toString();
        if (e === false) {
          this.setLowQtyCheckUoM(n);
        } else {
          a.setProperty("/exceptionInfo/pickedUoM", n);
        }
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/model/SerialNumber",
  ["sap/ui/model/json/JSONModel", "scm/ewm/pickcarts1/utils/Util"],
  function (e, r) {
    "use strict";
    var t;
    return {
      init: function () {
        if (t === undefined) {
          t = new e({ forTasksPicking: [], forLowQtyCheck: [] });
        }
        return t;
      },
      destroy: function () {
        t = undefined;
      },
      getSerialNumbers: function (e) {
        if (e === false) {
          return t.getProperty("/forLowQtyCheck");
        } else {
          return t.getProperty("/forTasksPicking");
        }
      },
      setSerialNumbers: function (e, r) {
        if (r === false) {
          t.setProperty("/forLowQtyCheck", e);
        } else {
          t.setProperty("/forTasksPicking", e);
        }
      },
      hasSerialNumber: function (e, t) {
        var i = this.getSerialNumbers(t);
        var n = false;
        r.find(i, function (r) {
          if (r === e) {
            n = true;
            return true;
          }
          return false;
        });
        return n;
      },
      verifySerialNumberDuplicated: function (e) {
        var r = new Promise(
          function (r, t) {
            if (!this.hasSerialNumber(e)) {
              r();
            } else {
              t();
            }
          }.bind(this),
        );
        return r;
      },
      removeSerialNumber: function (e, r) {
        var i = this.getSerialNumbers(r);
        var n = i.indexOf(e);
        if (n > -1) {
          i.splice(n, 1);
        }
        this.setSerialNumbers(i, r);
        t.updateBindings(true);
        return this;
      },
      clearData: function (e) {
        if (e === false) {
          t.setProperty("/forLowQtyCheck", []);
        } else {
          t.setProperty("/forTasksPicking", []);
        }
        t.updateBindings(true);
      },
      addSerialNumber: function (e, r) {
        var i = this.getSerialNumbers(r);
        i.splice(0, 0, e);
        this.setSerialNumbers(i, r);
        t.updateBindings(true);
        return this;
      },
      getSerialNumberCount: function (e) {
        return this.getSerialNumbers(e).length;
      },
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/utils/Const",
  ["sap/ui/core/ValueState"],
  function (I) {
    "use strict";
    return {
      CONTROL_STATUS: {
        EMPTY: "EMPTY",
        PENDING: "PENDING",
        VALID: "VALID",
        INVALID: "INVALID",
        WARNING: "WARNING",
      },
      HU_STATUS_PICK: {
        INVALID: 1,
        VALID: 2,
        NEED_MATERIAL: 3,
        COMPLETED: 4,
        COMPLETED_WITH_EXCEPTION: 5,
        WRONG: 6,
        NEED_MATERIAL_HOLDING: 7,
      },
      HU_STATUS_DROP: {
        INVALID: 1,
        VALID: 2,
        NEED_DROP: 3,
        DROPPED: 4,
        WRONG: 5,
      },
      EXCEPTION_TYPE: {
        BIDP: "BIDP",
        BIDF: "BIDF",
        DIFF: "DIFF",
        SPLT: "SPLT",
      },
      WHO_STATUS: {
        EMPTY: "",
        INITIAL: "I",
        PICKING: "P",
        DROPPING: "D",
        COMPLETE: "C",
      },
      CONF_MODE: {
        NO_NEED_CHECK: "0",
        CHECK_WITH_LOW_QTY: "1",
        REJECT_CHECK: "2",
        NEED_CHECK: "3",
      },
      ROUT_NAME: {
        LOGON: "logon",
        CONNECTION: "connection",
        PROCESS_TASKS: "processTasks",
        DROP_HU: "dropHandlingUnit",
        WO_LIST: "warehouseOrderList",
      },
      ABAP_TRUE: "X",
      REGEX_NONNEGATIVE: /^\+?(:?(:?\d+\.\d+)|(:?\d+))$/,
      ERR_INTERNET_DISCONNECTED: 0,
      TASK_STATUS: {
        CONFIRMED: "CONFIRMED",
        CONFIRMING: "CONFIRMING",
        INITIAL: "INITIAL",
        FAILED: "FAILED",
      },
      MaxIntegerDigits: 17,
      MaxDecimalDigits: 3,
      ERROR: "E",
      INFO: "I",
      WARNING: "W",
    };
  },
);
/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine(
  "scm/ewm/pickcarts1/utils/Util",
  [
    "sap/ui/core/ValueState",
    "scm/ewm/pickcarts1/model/Global",
    "scm/ewm/pickcarts1/utils/Const",
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
sap.ui.require.preload({
  "scm/ewm/pickcarts1/i18n/i18n.properties":
    '# FIORI_PickByCart\n#__ldi.translation.uuid=72f01af0-2a83-11e7-9598-0800200c9a66\n\n#XTIT, 50: title or caption\nappTitle=Pick by Cart\n\n#YDES, 50: description\nappDescription=Multi-Order Picking\n\n#XFLD, 20: Label\nwarehouseOrderNumber=Warehouse Order {0}\n\n#XBUT, 20: button\ncancel=Cancel\n\n#XBUT, 20: button\nstartPicking=Start Picking\n\n#XBUT, 20: button\nlogoff=Log Off Cart\n\n#XBUT, 20: button\nreject=Reject\n\n#XBUT, 20: button\nreset=Reset\n\n#XBUT\nyes=Yes\n\n#XBUT\nno=No\n\n#XBUT\nok=OK\n\n#XBUT: Save button\nbtnTextSave=Save\n\n#XFLD, 20: Label\nqueueLabel=Queue\n\n\n#XBUT: Close button text\nbtnTextClose=Close\n\n#XTIT: Default Parameters\ndefaultParameters=Default Parameters\n\n#XMSG\ninvalidInput=Invalid Input\n\n#XMSG\nhaveWOIntheCart=Resource {0} is already assigned to warehouse order {1}. Complete or leave the current order before changing the picking mode and queue. \n\n#XMSG\nhasWoFromdifferentQueue=Resource {0} is already assigned to warehouse order {1} of queue {2}. \n\n#XMSG\ninvalidQuantity=Provide a correct quantity\n\n#XMSG\nroundUpQuantity=System automatically rounds this number to the nearest thousandths place\n\n#XFLD, 20: Label\nresource=Resource\n\n#XFLD, 20: Label\npickingMode=Picking Mode\n\n#XLST, 50: Item in an enumeration, such as a list or a drop-down list\nmanualSelection=Manual Selection\n\n#XLST, 50: Item in an enumeration, such as a list or a drop-down list\nsystemGuided=System-Guided\n\n#XMSG: Message text\nresourceHasBeenUsed=Pick cart {0} is being used by others; try another resource\n\n#XFLD, 20: Label\npreparationSteps=Preparation Steps\n\n#XFLD, 30: Label\npreparation=Prepare Handling Units\n\n#XFLD, 20: Label\npackageMaterial=Packaging Material\n\n#XFLD, 20: Label\npickHU=Pick-Handling Unit\n\n#XFLD, 20: Label\nlogicalPosition=Logical Position\n\n#XLGD, 20: Legend\nfullBox=Occupied\n\n#XLGD, 20: Legend\nemptyPosition=Empty Position\n\n#XMSG: Message text\ndebundleHandlingUnitMessage=Do you want to remove pick-handling unit {0} from logical position {1}?\n\n#XMSG: Message text\nhandlingUnitHasBeenOccupiedMsg=The HU {0} has been put on a logical position; provide another pick-HU\n\n#XMSG: Message text\nlogicalPositionHasBeenOccupiedMsg=The Logical Position {0} has been occupied; provide another empty position\n\n#XFLD, 20: Label\nean=EAN\n\n#XFLD, 20: Label\nsourceBin=Source Bin\n\n#XFLD, 20: Label\nsourceHU=Source Handling Unit\n\n#XFLD, 20: Placeholder\noptional=Optional\n\n#XFLD, 20: Label\nproduct=Product\n\n#XFLD, 20: Label\npickProducts=Pick Products\n\n#XFLD, 20: Label\nbatch=Batch Number\n\n#XFLD, 40: Label\ndestHU=Destination Handling Unit/Position\n\n#XFLD, 20: Label\npickSteps=Pick Steps\n\n#XFLD, 20: Label\nunit=EA\n\n#XBUT, 50: exception button\nexception=Exception\n\n#XBUT, 50: exception button\nfullDenial=Full Denial\n\n#XBUT, 50: exception button\npartialDenial=Partial Denial\n\n#XBUT, 50: exception button\nsplitting=Splitting\n\n#XBUT, 50: exception button\ndifference=Difference\n\n#XLGD, 50: Legend\nvalidHU=Wait-Listed\n\n#XLGD, 50: Legend\nneedMaterial=Picking\n\n#XLGD, 50: Legend\ncompleteHU=Picked\n\n#XLGD, 50: Legend\nincorrectPickedHU=Unsuccessful Pick\n\n#XLGD, 50: Legend\nonHoldingHU=Picked with Exception\n\n#XMSG: Message text\nscanIncorrectPickingHUMsg=Put products into the correct handling unit\n\n#XFLD: Label for exception dialogs\nfullDenialDialogText=The quantity is automatically set to "0" for the remaining HUs.\n\n#XFLD: Label for exception dialogs\ndifferenceDialogText=Provide the destination HU and the picked quantity.\n\n#XFLD: Label for exception dialogs\npatialDenialDialogText=Provide the destination HU and the picked quantity. And remember that the quantity is automatically set to "0" for the remaining HUs.\n\n#XFLD: Label for exception dialogs\npickQuantity=Picked Quantity\n\n#XFLD: Label\nsplittingFromDialogText=Provide the destination HU that you want to remove and the picked quantity.\n\n#XFLD: Label\nsplittingToDialogText=Provide a new pick-handling unit for the logical position.\n\n#XBUT, 10\nnext=Next\n\n#XFLD: Label for low quantity check dialog\nlowQuantityCheck=Low Quantity Check\n\n#XFLD: Label for low quantity check dialog\nactualQuantity=Actual Quantity\n\n#XFLD: Label for low quantity check dialog\nlowQuantityCheckText=Count and enter the actual quantity for the source bin.\n\n#XFLD, 50: Label\ndropSteps=Unloading Steps\n\n#XFLD, 50: Label\ndestBin=Destination Bin\n\n#XFLD, 50: Label\nunloading=Unload Handling Units\n\n#XLGD, 50: Legend\nneedToDropHandlingUnit=Unloading\n\n#XLGD, 50: Legend\nincorrectDroppedHU=Unsuccessful Unloading\n\n#XBUT\ndropAll=Unload All\n\n#XMSG: Message text\ndropWrongHandlingUnitMsg=Unload the correct handling unit.\n\n#XBUT: Terminate button\nterminate=Leave Order\n\n#XMSG\nterminateMessage=Do you just want to send the rest of the work back to the pool?\n\n#XFLD\nterminateText=Leave Order\n\n#XTIT: Warning text\nwarning=Warning\n\n#XCOL: table column heading\nwarehouseOrders=Warehouse Order\n\n#XCOL: table column heading\nplannedHUs=Planned HU\n\n#XCOL: table column heading\nlatestStartTime=Latest Start Time\n\n#XCOL: table column heading\nplannedDuration=Planned Duration\n\n#XCOL: table column heading\nQueue=Queue\n\n#XTIT: Legend Title\nlegend=Legend\n\n#XTIT: Warehouse Order Table Title\nwarehouseOrdersTitle=Warehouse Orders ( {0} )\n\n#XMSG: Message text\nnoHandlingUnitUnloadMessage=You have no handling units to unload for warehouse order {0}; choose OK to close the order\n\n#XFLD: Label for quantity adjuctment dialog\nquantityAdjustment=Quantity Adjustment\n\n#XFLD: Label for quantity adjuctment dialog\nactualPickedQuantity=Actual Picked Quantity\n\n#XFLD: Label for low quantity check dialog\nquantityAdjustmentText=Count and enter the actual quantity that you have picked from the source handling unit.\n\n#XMSG: Message text\ninvalidPositionMsg=Scan a logical position with a pick-handling unit\n\n#XMSG: Message for unloading with splitting\nunloadingWithSplittingMsg=Make sure that you unload handling units {0} together into the destination bin {1}.\n\n#XMSG: Message for server is unreachable\ninternetDisconnectedMsg=Cannot connect to server\n\n#XMSG: Message for scan a logical position in Pick-HU field\nscanLogicPostionWhenInputPickHU={0} can be a logical position instead of a pick-handling unit.\n\n#XFLD: Label for serial number popOver\nserialNum=Serial Number for {0}\n\n#XBUT, 20: button\nclear=Clear\n\n#XMSG: Message for duplicate serial number\nduplicateSNMsg=Serial number already scanned\n\n#XMSG: Message for number of serial number exceeds require quantity\nserialNumExceedMsg=Number of serial numbers exceeds the quantity to be picked for HU {0}\n\n#XMSG: Message for some serial numbers are missing\nmissSerialNumMsg=Some serial numbers are missing; continue to scan or use exceptions\n\n#XFLD: Label for exception serial number input field\nserialNumber=Serial Number\n\n#XMSG: Message for no serial number input for the  quantity adjustment pop up\nnoSerialNumForQtyAdjustmentMsg=You must provide at least one serial number\n\n#XFLD: Popup Title for quantity adjustment  when it is serial number managed\nqtyAdjustmentTitleForSerailNumMsg=Provide the serial numbers of the picked products.\n\n#XFLD: Popup Title for low qty check  when it is serial number managed\nlowQtyCheckTitleForSerailNumMsg=Provide the serial numbers of the remaining products in the source bin.\n\n#XMSG: Message for no serial number in  low qty check popup\nlowQtyCheckIsZeroWarningMsg=You have not scanned any serial numbers; choose OK if there are no products in source bin {0}\n\n#XFLD: Label for Product description field\nproductDescription=Product Description\\:\n\n#XMSG: Message for split exception\nputToNewPosition=Put the split product quantity into a new pick-handling unit.\n\n#XMSG: Message for no warehouse orders info\nnoWarehouseOrderAvailableMsg=No more available warehouse orders. Please exit the app.\n\n#XMSG: Message for documentary batches not supported\ndocumentaryBatchesNotSupportedMsg=The next warehouse order in the processed queue is documentary-batch related. Documentary batches are not supported. Contact your supervisor or warehouse operator to remove these warehouse orders from the queue. Please exit the app.\n\n#XMSG\nbringHuToDestMessage=Carry picked products to destination before leaving and send the rest of the work back to the pool?\n\n#XFLD\nbringHuToDestText=Unload HUs\n',
  "scm/ewm/pickcarts1/manifest.json":
    '{"_version":"1.11.0","sap.app":{"id":"zscm.ewm.pickcarts1","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"2025.0.17"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","ach":"SCM-EWM-WOP-PCK","sourceTemplate":{"id":"ui5template.basicSAPUI5ApplicationProject","version":"1.40.12"},"dataSources":{"mainService":{"uri":"/sap/opu/odata/SCWM/PICKCART_SRV","type":"OData","settings":{"odataVersion":"2.0","localUri":"localService/metadata.xml"}},"defaultParametersService":{"uri":"/sap/opu/odata/SCWM/USER_DEFAULTPARAMETER_SRV/","type":"OData","settings":{"odataVersion":"2.0","localUri":"localService/defaultParamsMetadata.xml"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"sap-icon://cart","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_belize"]},"sap.ui5":{"flexEnabled":true,"config":{"sapFiori2Adaptation":true},"rootView":{"viewName":"zscm.ewm.pickcarts1.view.Main","type":"XML","id":"main"},"dependencies":{"minUI5Version":"1.136.1","libs":{"sap.m":{},"sap.ui.core":{},"sap.ui.layout":{"lazy":true},"sap.tl.ewm.lib.reuses1":{"lazy":true},"sap.ui.comp":{"lazy":true}}},"contentDensities":{"compact":false,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"zscm.ewm.pickcarts1.i18n.i18n"}},"":{"dataSource":"mainService","settings":{"defaultUpdateMethod":"PUT","defaultBindingMode":"TwoWay","refreshAfterChange":true},"preload":false},"defaultParameters":{"dataSource":"defaultParametersService","settings":{"metadataUrlParams":{"sap-documentation":"heading"},"defaultBindingMode":"TwoWay","defaultOperationMode":"Server","defaultCountMode":"Inline","refreshAfterChange":true},"preload":false}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.ui.core.routing.Router","viewType":"XML","viewPath":"zscm.ewm.pickcarts1.view","controlId":"appContainer","controlAggregation":"pages","clearControlAggregation":true,"bypassed":{"target":["logonResource"]},"async":true},"routes":[{"pattern":"","name":"logon","target":"logonResource"},{"pattern":"connection/{warehouseOrder}/{bRestore}","name":"connection","target":"pickCartConnection"},{"pattern":"processTasks/{warehouseOrder}/{bRestore}","name":"processTasks","target":"processTasks"},{"pattern":"dropHandlingUnit/{warehouseOrder}/{warehouseNumber}/{bRestore}","name":"dropHandlingUnit","target":"dropHandlingUnit"},{"pattern":"warehouseOrderList/{resourceId}/{warehouseNumber}","name":"warehouseOrderList","target":"warehouseOrderList"}],"targets":{"logonResource":{"viewName":"LogonResource","controlAggregation":"pages","viewId":"logonresource-view"},"pickCartConnection":{"viewName":"PickCartConnection","controlAggregation":"pages","viewId":"connection-view"},"processTasks":{"viewName":"ProcessWarehouseTasks","controlAggregation":"pages","viewId":"processtasks-view"},"dropHandlingUnit":{"viewName":"Drop","controlAggregation":"pages","viewId":"drop-view"},"warehouseOrderList":{"viewName":"WarehouseOrderList","controlAggregation":"pages","viewId":"warehouseorderlist-view"}}}},"sap.fiori":{"registrationIds":["F2793"],"archeType":"transactional"},"sap.platform.hcp":{"uri":""}}',
  "scm/ewm/pickcarts1/view/Drop.view.xml":
    '\n<mvc:View id="drop-view" controllerName="zscm.ewm.pickcarts1.controller.Drop" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core"\n\txmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"><Page id="drop-page" showHeader="false" backgroundDesign="Solid"><subHeader><Toolbar id="drop-sub-toolbar" design="Transparent"><layout:HorizontalLayout id="drop-sub-toolbar-hlayout"><Title id="drop-sub-toolbar-hlayout-title" text="{path:\'global>/woNumber\', formatter:\'.getTitle\'}" titleStyle="H2" level="H2" class="sapUiMediumMarginEnd"></Title></layout:HorizontalLayout><Label text="{i18n>dropSteps}" id="id_label_dropSteps" labelFor="id-progress"/><ProgressIndicator id="id-progress" state="{= ${local>/progress} > 0 ? \'Success\' : \'None\'}"\n\t\t\t\t\tpercentValue="{parts:[{path:\'local>/progress\'},{path:\'local>/taskGroups\'}], formatter:\'.formatProgressPercentValue\'}" showValue="true"\n\t\t\t\t\tdisplayValue="{parts:[{path:\'local>/progress\'},{path:\'local>/taskGroups\'}], formatter:\'.formatProgressDisplayValue\'}"\n\t\t\t\t\tclass="sapUiTinyMarginTop" width="30%"></ProgressIndicator><ToolbarSpacer id="drop-sub-toolbar-hlayout-toolbarspacer" /></Toolbar></subHeader><content><layout:DynamicSideContent id="drop-content" sideContentPosition="Begin" showMainContent="true" showSideContent="true"\n\t\t\t\tclass="sapUiDSCExplored sapUiContentPadding" containerQuery="true"><layout:sideContent><form:SimpleForm id="drop-content-simpleform" class="sapUiNoMarginBottom" maxContainerCols="2" layout="ResponsiveGridLayout" adjustLabelSpan="false" labelSpanL="1"\n\t\t\t\t\t\tlabelSpanM="2" labelSpanS="3" emptySpanL="0" emptySpanM="0" title="{i18n>unloading}"><Label id="drop-content-simpleform-actualbin-label" text="{i18n>destBin}" labelFor="actualBinInput"><layoutData><layout:GridData id="drop-content-simpleform-actualbin-grid" span="L12 M12 S12"/></layoutData></Label><Input id="origionalDesbin" enabled="false" value="{local>/currentGroup/expectedBin}"><layoutData><layout:GridData id="origionalDesbin-grid" span="L9 M9 S9"/></layoutData></Input><Input id="actualBinInput" value="{local>/currentGroup/actualBin}" change="onDestBinChange" submit="onSubmit"\n\t\t\t\t\t\t\tvisible="{path:\'local>/currentGroup/destBinVerifyRequrired\'}"><layoutData><layout:GridData id="actualBinInput-grid" span="L3 M3 S3"/></layoutData></Input><Label id="drop-content-simpleform-desthu-label" text="{i18n>destHU}" labelFor="destHandlingUnitInput"><layoutData><layout:GridData id="drop-content-simpleform-desthu-label-grid" span="L12 M12 S12"/></layoutData></Label><Input id="destHandlingUnitInput" change="onDestHandlingUnitChange"><layoutData><layout:GridData id="destHandlingUnitInput-grid" span="L9 M9 S9"/></layoutData></Input></form:SimpleForm></layout:sideContent><layout:mainContent><Table id="PickCartTable" items="{path:\'cart>/layout\'}" backgroundDesign="Transparent"><headerToolbar><OverflowToolbar id="connectionTableToolbar"><core:Icon id="drop-main-icon" src="sap-icon://cart" size="26px"/><Title id="PickcartTitle" level="H4" titleStyle="H4"></Title><ToolbarSpacer id="drop-main-toolbarspacer"/><Button id="drop-main-legend-btn" icon="sap-icon://legend" press="onPressLegend" tooltip="{i18n>legend}"/><Button id="dropAllButton" text="{i18n>dropAll}" press="onDropAll" visible="{local>/currentGroup/isDropAll}" type="Transparent"\n\t\t\t\t\t\t\t\t\tenabled="false"></Button></OverflowToolbar></headerToolbar><layoutData><layout:GridData id="drop-main-table-grid" span="L8 M8 S8"></layout:GridData></layoutData><columns></columns><items><ColumnListItem id="drop-main-col-listitem" cells="{path:\'cart>cells\',templateShareable:true}"><cells><Button id="column-cell-button" icon="{path:\'cart>dropping/status\', formatter:\'.formatPositionIcon\'}"\n\t\t\t\t\t\t\t\t\t\tenabled="{path:\'cart>dropping/status\', formatter:\'.formatPositionEnabled\'}" press="onSelectPosition" width="100%"\n\t\t\t\t\t\t\t\t\t\ttype="{path:\'cart>dropping/status\', formatter:\'.formatPositionType\'}" text="{cart>Lab}"></Button></cells></ColumnListItem></items></Table><layout:Grid id="legend-grid" class="sapUiLargeMarginTop" position="Right" hSpacing="0" visible="true"><Title id="drop-main-legend-grid-title" level="H6" titleStyle="H6" text="{i18n>legend}"><layoutData><layout:GridData id="legend-grid-title-grid" span="L12 M12 S12"/></layoutData></Title><Button id="unloading-legend" icon="sap-icon://less" text="{i18n>needToDropHandlingUnit}" type="Emphasized"><layoutData><layout:GridData id="unloading-legend-grid" span="L3 M3 S3"/></layoutData></Button><ObjectStatus id="empty-legend" text="{i18n>emptyPosition}" class="sapUiSmallMarginTop" state="None"><layoutData><layout:GridData id="empty-legend-grid" span="L3 M3 S3"/></layoutData></ObjectStatus><ObjectStatus id="validHU-legend" icon="sap-icon://add-product" text="{i18n>validHU}" state="None" class="sapUiSmallMarginTop"><layoutData><layout:GridData id="validHU-legend-grid" span="L3 M3 S3"/></layoutData></ObjectStatus><ObjectStatus id="decline-legend" icon="sap-icon://decline" text="{i18n>incorrectDroppedHU}" state="Error" class="sapUiSmallMarginTop"><layoutData><layout:GridData id="decline-legend-grid" span="L3 M3 S3"/></layoutData></ObjectStatus></layout:Grid></layout:mainContent></layout:DynamicSideContent></content><Input id="dummy-input" visible="true" class="dummyCss"></Input><footer><OverflowToolbar id="drop-footer-overflowtoolbar"><Button id="errorMessagePopoverBtn" icon="sap-icon://message-popup" text="{= ${local>/errors}.length}"\n\t\t\t\t\tvisible="{= ${local>/errors}.length === 0 ? false : true}" press="onOpenMessagePopover" type="Emphasized"></Button><ToolbarSpacer id="drop-footer-overflowtoolbar-toolbarspacer"/><Button id="terminateButton" text="{i18n>terminate}" press="onTerminate" type="Transparent"></Button></OverflowToolbar></footer></Page></mvc:View>',
  "scm/ewm/pickcarts1/view/LogonResource.view.xml":
    '\n<mvc:View id="logon-view" controllerName="zscm.ewm.pickcarts1.controller.LogonResource" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"\n\txmlns:core="sap.ui.core" xmlns:form="sap.ui.layout.form" xmlns:layout="sap.ui.layout" xmlns:smartField="sap.ui.comp.smartfield"><Page id="logon-page" showHeader="false" backgroundDesign="Solid"><content><form:SimpleForm id="logon-form" class="sapUiLargeMarginTop" editable="true" layout="ResponsiveGridLayout" labelSpanXL="5" labelSpanL="5"\n\t\t\t\tlabelSpanM="5" labelSpanS="12" adjustLabelSpan="false" emptySpanXL="4" emptySpanL="4" emptySpanM="4" emptySpanS="0" columnsXL="1"\n\t\t\t\tcolumnsL="1" columnsM="1" singleContainerFullSize="false"><smartField:SmartLabel id="pbc---logon--EWMResource--lable" labelFor="pbc---logon--EWMResource" text="{/#ShRsrc/EWMResource/@sap:label}"/><smartField:SmartField id="pbc---logon--EWMResource" value="{EWMResource}" editable="true" visible="true" change="onResourceInputChanged"\n\t\t\t\t\ttooltipLabel="{local>/toolTip}" valueState="{local>/valueState}"></smartField:SmartField><Label text="{i18n>pickingMode}" id="id-label-pick-mode" labelFor="pickingModesSelect"/><Select id="pickingModesSelect" change="pickingModesChanged" enabled="{local>/modeEditable}" selectedKey="{global>/selectedMode}"\n\t\t\t\t\titems="{ path: \'global>/pickModes\' }" ariaLabelledBy="id-label-pick-mode"><core:Item id="pickingModesSelect-item" key="{global>Name}" text="{global>Text}"/></Select><Label text="{i18n>queueLabel}" id="id-queue-label" labelFor="id-queue-select"/><ComboBox id="id-queue-select" items="{path: \'QueueModel>/items\'}" editable="{local>/modeEditable}" change="onQueueChange"><core:ListItem id="id-queue-item" key="{QueueModel>Queue}" text="{QueueModel>Queue}"/></ComboBox><Label id="startpicking-label" text="{i18n>startPicking}" visible="false"/><layout:HorizontalLayout id="startpicking-layout"><Button id="startPickBtn" text="{i18n>startPicking}" enabled="{global>/enableNext}" press="onPressNext" type="Emphasized"/></layout:HorizontalLayout></form:SimpleForm><Input id="dummy-input" visible="false" class="dummyCss"></Input></content><footer><OverflowToolbar id="logon-footer-overflowtoolbar"><ToolbarSpacer id="logon-toolbarspacer"/><Button id="logoffCartBtn" text="{i18n>logoff}" enabled="{= ${local>/editable} === false ? true : false}" press="onPressLogoff"\n\t\t\t\t\ttype="Default"></Button></OverflowToolbar></footer></Page></mvc:View>',
  "scm/ewm/pickcarts1/view/Main.view.xml":
    '\n<mvc:View id="main" controllerName="zscm.ewm.pickcarts1.controller.Main" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" displayBlock="true"\n\txmlns:custom="zscm.ewm.pickcarts1.control"><custom:AudioList id="audio-player"><custom:items><custom:Audio type="{Msgty}" src="{AudioUri}" id="pbc---app--audio"></custom:Audio></custom:items></custom:AudioList><App id="appContainer" busy="{global>/busy}"><pages></pages></App></mvc:View>',
  "scm/ewm/pickcarts1/view/PickCartConnection.view.xml":
    '\n<mvc:View id="connection-view" xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"\n\txmlns:suite="sap.suite.ui.commons" controllerName="zscm.ewm.pickcarts1.controller.PickCartConnection"\n\txmlns:html="http://www.w3.org/1999/xhtml"><Page id="connection-page" showHeader="false" backgroundDesign="Solid"><subHeader><Toolbar id="connection-subheader-toolbar" design="Transparent"><layout:HorizontalLayout id="connection-subheader-layout"><Title id="connection-subheader-layout-title" text="{path:\'global>/woNumber\', formatter:\'.getTitle\'}" titleStyle="H2" level="H2" class="sapUiTinyMarginTop sapUiMediumMarginEnd"/></layout:HorizontalLayout><Label text="{i18n>preparationSteps}" id="id_label_preparationSteps" labelFor="id-progress"/><ProgressIndicator id="id-progress" state="{= ${local>/progress} > 0 ? \'Success\' : \'None\'}" class="sapUiTinyMarginTop" width="30%"\n\t\t\t\t\tpercentValue="{parts:[{path:\'local>/progress\'},{path:\'local>/handlingUnits\'}], formatter:\'.formatProgressPercentValue\'}" showValue="true"\n\t\t\t\t\tdisplayValue="{parts:[{path:\'local>/progress\'},{path:\'local>/handlingUnits\'}], formatter:\'.formatProgressDisplayValue\'}"></ProgressIndicator><ToolbarSpacer id="connection-subheader-toolbarspacer"/></Toolbar></subHeader><content><layout:DynamicSideContent id="connection-dynamicsidecontent" sideContentPosition="Begin" showMainContent="true" showSideContent="true"\n\t\t\t\tclass="sapUiDSCExplored sapUiContentPadding" containerQuery="true"><layout:sideContent id="connection-sidecontent"><form:SimpleForm id="connection-simpleform" class="sapUiSmallMarginTop" maxContainerCols="2" layout="ResponsiveGridLayout" adjustLabelSpan="false" labelSpanL="1"\n\t\t\t\t\t\tlabelSpanM="2" labelSpanS="3" emptySpanL="0" emptySpanM="0" title="{i18n>preparation}"><Label text="{i18n>packageMaterial}" id="id-label-package-material" labelFor="id-input-package-material"><layoutData><layout:GridData id="connection-simpleform-grid-pakmat" span="L12 M12 S12"/></layoutData></Label><Input\n\t\t\t\t\t\t\tid="id-input-package-material"\n\t\t\t\t\t\t\tvalue="{parts:[{path:\'local>/currentHandlingUnit/Maktx\'}, {path:\'local>/currentHandlingUnit/ProductName\'}], formatter:\'.formatPackagingMaterial\'}"\n\t\t\t\t\t\t\tenabled="false"><layoutData><layout:GridData  id="connection-simpleform-grid-pakmat-input" span="L9 M9 S9"/></layoutData></Input><Label text="{i18n>pickHU}" id="id-label-pick-hu" labelFor="connection-hu-input"><layoutData><layout:GridData  id="connection-simpleform-grid-pickhu" span="L12 M12 S12"/></layoutData></Label><Input id="connection-hu-input"\n\t\t\t\t\t\t\tariaLabelledBy="id-label-pick-hu"\n\t\t\t\t\t\t\tvalue="{path:\'local>/currentHandlingUnit/HandlingUnitNumber\'}" valueStateText=""\n\t\t\t\t\t\t\tvalueState="{path:\'local>/handlingUnitState\', formatter:\'.formatValueState\'}"\n\t\t\t\t\t\t\tenabled="{= ${local>/progress} === ${local>/handlingUnits}.length ? false : true}"\n\t\t\t\t\t\t\tchange="onHandlingUnitChange" submit="onSubmit"><layoutData><layout:GridData id="connection-simpleform-grid-hu-input" span="L9 M9 S9"/></layoutData></Input><Label id="id-label-logical-position" text="{i18n>logicalPosition}" labelFor="connection-logical-position-input"><layoutData><layout:GridData id="connection-simpleform-grid-logpos" span="L12 M12 S12"/></layoutData></Label><Input id="connection-logical-position-input" \n\t\t\t\t\t\t\tariaLabelledBy="id-label-logical-position"\n\t\t\t\t\t\t\tvalueState="{path:\'local>/logicalPositionState\', formatter:\'.formatValueState\'}"\n\t\t\t\t\t\t\tenabled="{= ${local>/progress} === ${local>/handlingUnits}.length ? false : true}"\n\t\t\t\t\t\t\tchange="onLogicalPositionChange"><layoutData><layout:GridData id="connection-simpleform-grid-logpos-input" span="L9 M9 S9"/></layoutData></Input></form:SimpleForm></layout:sideContent><layout:mainContent id="connection-maincontent"><Table id="PickCartTable" items="{path:\'cart>/layout\'}" backgroundDesign="Transparent"><headerToolbar><OverflowToolbar id="connectionTableToolbar"><core:Icon id="connection-tabletoolbar-icon" src="sap-icon://cart" size="26px"/><Title id="PickcartTitle" level="H4" titleStyle="H4"></Title><ToolbarSpacer id="connection-tabletoolbar-toolbarspacer"/><Button id="connection-tabletoolbar-btn" icon="sap-icon://legend" press="onPressLegend" tooltip="{i18n>legend}"/></OverflowToolbar></headerToolbar><layoutData><layout:GridData id="connection-tabletoolbar-grid" span="L8 M8 S8"></layout:GridData></layoutData><columns></columns><items><ColumnListItem id="connection-columnlistitem" cells="{path:\'cart>cells\',templateShareable:true}"><cells><Button id="column-cell-button" icon="{= ${cart>connection/status} === 1 ? \'sap-icon://add-product\' : \'\'}" enabled="true" press="onSelectPosition" width="100%"\n\t\t\t\t\t\t\t\t\t\ttype="{= ${cart>connection/status} === 1 ? \'Emphasized\' : \'Transparent\'}" text="{cart>Lab}"></Button></cells></ColumnListItem></items></Table><Input id="dummy-input" visible="true" class="dummyCss"></Input><layout:Grid id="legend-grid" class="sapUiLargeMarginTop" position="Right" hSpacing="0" visible="true"><Title id="connection-title-legend" level="H6" titleStyle="H6" text="{i18n>legend}"><layoutData><layout:GridData id="connection-title-legend-grid" span="L12 M12 S12"/></layoutData></Title><Button id="connection-legend-grid-fullbox-btn" icon="sap-icon://add-product" enabled="true" text="{i18n>fullBox}" type="Emphasized"><layoutData><layout:GridData id="connection-legend-grid-fullbox-btn-grid" span="L2 M2 S2"/></layoutData></Button><Button id="connection-legend-grid-emptypos-btn" enabled="true" text="{i18n>emptyPosition}" type="Transparent"><layoutData><layout:GridData id="connection-legend-grid-emptypos-grid" span="L2 M2 S2"/></layoutData></Button></layout:Grid></layout:mainContent></layout:DynamicSideContent></content><footer><OverflowToolbar id="connection-overflowtoolbar"><Button id="errorMessagePopoverBtn" icon="sap-icon://message-popup" text="{= ${local>/errors}.length}"\n\t\t\t\t\tvisible="{= ${local>/errors}.length === 0 ? false : true}" press="onOpenMessagePopover" type="Emphasized"></Button><ToolbarSpacer id="connection-toolbarspacer"/><Button id="terminateBtn" text="{i18n>terminate}" press="onTerminate"></Button><Button id="resetBtn" text="{i18n>reset}" press="onResetPressed" visible="{= ${local>/progress} > 0 ? true : false}"></Button><Button id="nextBtn" text="{i18n>next}" press="onNavToProcessTasks" visible="{= ${local>/progress} === ${local>/handlingUnits}.length ? true : false}"></Button></OverflowToolbar></footer></Page></mvc:View>',
  "scm/ewm/pickcarts1/view/ProcessWarehouseTasks.view.xml":
    '\n<mvc:View id="processtasks-view" xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:layout="sap.ui.layout"\n\txmlns:form="sap.ui.layout.form" xmlns:suite="sap.suite.ui.commons" xmlns:html="http://www.w3.org/1999/xhtml"\n\tcontrollerName="zscm.ewm.pickcarts1.controller.ProcessWarehouseTasks"><Page id="processtasks-page" showHeader="false" backgroundDesign="Solid"><subHeader><Toolbar id="processtasks-subheader-toolbar" design="Transparent"><layout:HorizontalLayout id="processtasks-subheader-horizontallayout"><Title id="processtasks-subheader-title" text="{path:\'global>/woNumber\', formatter:\'.getTitle\'}" titleStyle="H2" level="H2"\n\t\t\t\t\t\tclass="sapUiTinyMarginTop sapUiMediumMarginEnd"/></layout:HorizontalLayout><Label text="{i18n>pickSteps}" id="id_label_pickSteps" labelFor="id-progress"/><ProgressIndicator id="id-progress" class="sapUiTinyMarginTop" width="30%" state="Success"\n\t\t\t\t\tpercentValue="{parts:[{path:\'local>/taskGroupProgress\'},{path:\'local&gt;/warehouseTaskGroups\'}], formatter:\'.formatProgressPercentValue\'}"\n\t\t\t\t\tshowValue="true"\n\t\t\t\t\tdisplayValue="{parts:[{path:\'local>/taskGroupProgress\'},{path:\'local&gt;/warehouseTaskGroups\'}], formatter:\'.formatProgressDisplayValue\'}"/><ToolbarSpacer id="processtasks-subheader-toolbarspacer"/></Toolbar></subHeader><content><layout:DynamicSideContent id="processtasks-side" sideContentPosition="Begin" showMainContent="true" showSideContent="true"\n\t\t\t\tclass="sapUiDSCExplored sapUiContentPadding" containerQuery="true"><layout:sideContent><OverflowToolbar id="picking-header-toolbar"><Title id="processtasks-side-title" class="sapUiSmallMarginBegin" level="H4" titleStyle="H4" text="{i18n>pickProducts}"/><ToolbarSpacer id="processtasks-side-toolbarspacer"/><Title id="product-quantity-title" class="sapUiTinyMarginBegin" level="H2" titleStyle="H2"\n\t\t\t\t\t\t\ttext="{parts:[{path:\'local>/currentWarehouseTaskGroup/actualQuantity\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'},{path:\'local>/currentWarehouseTaskGroup/alternativeUom\'}], formatter:\'.formatQuantityDisplay\'}"/></OverflowToolbar><Image id="processtasks-side-image" class="sapUiTinyMarginBegin sapUiTinyMarginTop sapUiTinyMarginBottom custLeft" width="30%"\n\t\t\t\t\t\tsrc="{path:\'local>/currentWarehouseTaskGroup/productImg\'}"\n\t\t\t\t\t\tvisible="{path:\'local>/currentWarehouseTaskGroup/productImg\',formatter:\'.formatImageVisible\'}" tooltip="pic"></Image><Label text="{i18n>productDescription}" id="id-label-product-description" labelFor="processtasks-side-text"\n\t\t\t\t\t\tclass="sapUiSmallMarginBegin sapUiTinyMarginTop"\n\t\t\t\t\t\twidth="{path:\'local>/currentWarehouseTaskGroup/productImg\',formatter:\'.formatDescriptionWidth\'}" wrapping="true"></Label><Text id="processtasks-side-text" width="{path:\'local>/currentWarehouseTaskGroup/productImg\',formatter:\'.formatDescriptionWidth\'}"\n\t\t\t\t\t\twrapping="true" text="{path:\'local>/currentWarehouseTaskGroup/productDesc\'}" class="sapUiSmallMarginBegin sapUiTinyMarginTop"/><ObjectAttribute id="processtasks-side-oa-ean" title="{i18n>ean}" text="{path:\'local>/currentWarehouseTaskGroup/EAN\'}"\n\t\t\t\t\t\tclass="sapUiSmallMarginBegin sapUiTinyMarginTop custEanStyle"\n\t\t\t\t\t\tvisible="{path:\'local>/currentWarehouseTaskGroup/EAN\',formatter:\'.formatEANVisible\'}"></ObjectAttribute><form:SimpleForm id="task-group-info-form" class="sapUiNoMarginBottom" maxContainerCols="2" layout="ResponsiveGridLayout"\n\t\t\t\t\t\tadjustLabelSpan="false" labelSpanL="1" labelSpanM="2" labelSpanS="3" emptySpanL="0" emptySpanM="0"><Label text="{i18n>sourceBin}" id="id-label-source-bin" labelFor="source-bin-input"><layoutData><layout:GridData id="grid-sourcebin-label" span="L12 M12 S12"/></layoutData></Label><Input id="source-bin-readonly" ariaLabelledBy="id-label-source-bin" value="{path:\'local>/currentWarehouseTaskGroup/sourceBin\'}"\n\t\t\t\t\t\t\tenabled="false"><layoutData><layout:GridData id="grid-sourcebin-readonly-input" span="L9 M9 S9"/></layoutData></Input><Input id="source-bin-input" value="" change="onSourceBinChange" submit="onSubmit"\n\t\t\t\t\t\t\tvisible="{path:\'local>/currentWarehouseTaskGroup/sourceBinVerifyRequired\'}" ariaLabelledBy="id-label-source-bin"><layoutData><layout:GridData id="grid-sourcebin-input" span="L3 M3 S3"/></layoutData></Input><Label text="{i18n>sourceHU}" visible="{path:\'local>/currentWarehouseTaskGroup/sourceHUDisplay\'}" id="id-label-sourcehu"\n\t\t\t\t\t\t\tlabelFor="source-hu-input"><layoutData><layout:GridData id="grid-sourcehu-label" span="L12 M12 S12"/></layoutData></Label><Input ariaLabelledBy="id-label-sourcehu" id="sourceHU-readonly-input" value="{path:\'local>/currentWarehouseTaskGroup/sourceHUInit\'}"\n\t\t\t\t\t\t\tenabled="false"\n\t\t\t\t\t\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/sourceHUDisplay\'},{path:\'local>/currentWarehouseTaskGroup/sourceHUInit\'}], formatter:\'.formatSourceHUReadOnlyInputVisible\'}"><layoutData><layout:GridData id="grid-sourcehu-readonlyinput" span="L9 M9 S9"/></layoutData></Input><Input id="source-hu-input"\n\t\t\t\t\t\t\tplaceholder="{parts:[{path:\'local>/currentWarehouseTaskGroup/sourceHUInit\'},{path:\'local>/currentWarehouseTaskGroup/sourceHUMandatory\'}],formatter:\'.formatPlaceholder\'}"\n\t\t\t\t\t\t\tvalue="" change="onSourceHUChange" submit="onSourceHUSubmit" visible="{path:\'local>/currentWarehouseTaskGroup/sourceHUVerifyRequired\'}"\n\t\t\t\t\t\t\tariaLabelledBy="id-label-sourcehu"><layoutData><layout:GridData id="grid-sourcehu-mandatoryinput" span="L3 M3 S3"/></layoutData></Input><layout:HorizontalLayout id="horizontallayout-product"><Label text="{i18n>product}" class="sapUiTinyMarginBottom sapUiTinyMarginTop" id="id-label-product" labelFor="product-input"></Label><core:Icon id="id-serial-number" src="sap-icon://numbered-text" class="sapUiSmallMarginBegin sapUiTinyMarginBottom sapUiTinyMarginTop"\n\t\t\t\t\t\t\t\tcolor="Default" visible="{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'}"/></layout:HorizontalLayout><Input id="product-readonly" ariaLabelledBy="id-label-product" value="{path:\'local>/currentWarehouseTaskGroup/product\'}" enabled="false"><layoutData><layout:GridData id="grid-product-readonly-input" span="L9 M9 S9"/></layoutData></Input><Input id="product-input" value="" change="onProductChange" submit="onSubmit"\n\t\t\t\t\t\t\tvisible="{path:\'local>/currentWarehouseTaskGroup/productVerifyRequired\'}" ariaLabelledBy="id-label-product"><layoutData><layout:GridData id="grid-product-input" span="L3 M3 S3"/></layoutData></Input><Label id="batch-label" text="{i18n>batch}" visible="{path:\'local>/currentWarehouseTaskGroup/batchDisplay\'}" labelFor="batch-editable-input"><layoutData><layout:GridData id="grid-batch-label" span="L12 M12 S12"/></layoutData></Label><Input ariaLabelledBy="batch-label" id="batch-readonly-input" value="{path:\'local>/currentWarehouseTaskGroup/batchNoInit\'}" enabled="false"\n\t\t\t\t\t\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/batchDisplay\'},{path:\'local>/currentWarehouseTaskGroup/batchNoInit\'}], formatter:\'.formatBatchReadOnlyInputVisible\'}"><layoutData><layout:GridData id="grid-batch-readonly-input" span="L9 M9 S9"/></layoutData></Input><Input id="batch-editable-input" change="onBatchChange" submit="onSubmit"\n\t\t\t\t\t\t\tvisible="{path:\'local>/currentWarehouseTaskGroup/batchNoVerifyRequired\'}" ariaLabelledBy="batch-label"><layoutData><layout:GridData id="grid-batch-editable-input" span="L3 M3 S3"/></layoutData></Input><Label text="{i18n>destHU}" id="id-label-desthu" labelFor="dest-hu-input"><layoutData><layout:GridData id="grid-desthu-label" span="L12 M12 S12"/></layoutData></Label><Input id="dest-hu-input" change="onDestHUChange" enabled="true" ariaLabelledBy="id-label-desthu"><layoutData><layout:GridData id="grid-desthu-input" span="L9 M9 S9"/></layoutData></Input></form:SimpleForm></layout:sideContent><layout:mainContent><Table id="PickCartTable" items="{path:\'cart>/layout\'}" backgroundDesign="Transparent"><headerToolbar><OverflowToolbar id="processTasksTableToolbar"><core:Icon id="processwarehousetask-toolbar-icon" src="sap-icon://cart" size="26px"/><Title id="PickcartTitle" level="H4" titleStyle="H4"></Title><ToolbarSpacer id="pwt-main-toolbarspacer"/><Button id="pwt-main-btn-legend" icon="sap-icon://legend" press="onPressLegend" tooltip="{i18n>legend}"/></OverflowToolbar></headerToolbar><layoutData><layout:GridData id="pwt-main-grid" span="L8 M8 S8"></layout:GridData></layoutData><columns/><items><ColumnListItem id="pwt-main-items" cells="{path:\'cart>cells\',templateShareable:true}"><cells><Button id="column-cell-button" enabled="true" press="onSelectPosition" width="100%"\n\t\t\t\t\t\t\t\t\t\ttype="{path:\'cart>picking/status\', formatter:\'.formatButtonStatus\'}"\n\t\t\t\t\t\t\t\t\t\ttext="{parts: [{path:\'cart>picking/status\'}, {path:\'cart>Lab\'}, {path:\'cart>picking/actual\'}], formatter:\'.formatButtonText\'}"\n\t\t\t\t\t\t\t\t\t\ticon="{path:\'cart>picking/status\', formatter:\'.formatButtonIcon\'}"/></cells></ColumnListItem></items></Table><Input id="dummy-input" visible="true" class="dummyCss"></Input><layout:Grid id="legend-grid" class="sapUiLargeMarginTop" position="Right" hSpacing="0" visible="true"><Title id="pwt-main-legend-grid-title" level="H6" titleStyle="H6" text="{i18n>legend}"><layoutData><layout:GridData id="pwt-main-legend-grid" span="L12 M12 S12"/></layoutData></Title><layout:VerticalLayout id="pwt-main-verticallayout-1"><layout:layoutData><layout:GridData id="pwt-main-verticallayout-grid-1" span="L3 M3 S3"></layout:GridData></layout:layoutData><Button id="id_picking" enabled="true" icon="sap-icon://add" text="{i18n>needMaterial}" type="Emphasized"></Button><ObjectStatus id="id_emptyPosition" text="{i18n>emptyPosition}" class="sapUiTinyMarginTop"/></layout:VerticalLayout><layout:VerticalLayout id="pwt-main-verticallayout-2"><layout:layoutData><layout:GridData id="pwt-main-verticallayout-grid-2" span="L3 M3 S3"></layout:GridData></layout:layoutData><ObjectStatus id="id_completeHU" text="{i18n>completeHU}" state="Success" icon="sap-icon://accept" class="sapUiSmallMarginTop"/><ObjectStatus id="validHU" text="{i18n>validHU}" icon="sap-icon://add-product" class="sapUiSmallMarginTop"/></layout:VerticalLayout><layout:VerticalLayout id="pwt-main-verticallayout-3"><layout:layoutData><layout:GridData id="pwt-main-verticallayout-grid-3" span="L3 M3 S3"></layout:GridData></layout:layoutData><ObjectStatus id="id_onHoldingHU" text="{i18n>onHoldingHU}" state="Success" icon="sap-icon://warning" class="sapUiSmallMarginTop"/><ObjectStatus id="id_incorrectPickedHU" text="{i18n>incorrectPickedHU}" state="Error" icon="sap-icon://decline" class="sapUiSmallMarginTop"/></layout:VerticalLayout></layout:Grid></layout:mainContent></layout:DynamicSideContent></content><footer><OverflowToolbar id="pwt-footer-overflowtoolbar"><Button id="errorMessagePopoverBtn" icon="sap-icon://message-popup" text="{= ${local>/errors}.length}"\n\t\t\t\t\tvisible="{= ${local>/errors}.length === 0 ? false : true}" press="onOpenMessagePopover" type="Emphasized"></Button><ToolbarSpacer id="pwt-footer-toolbarspacer"/><Button id="terminateBtn" text="{i18n>terminate}" press="onTerminate" type="Transparent"></Button></OverflowToolbar></footer></Page></mvc:View>',
  "scm/ewm/pickcarts1/view/WarehouseOrderList.view.xml":
    '\n<mvc:View id="warehouseorderlist-view" controllerName="zscm.ewm.pickcarts1.controller.WarehouseOrderList"\n\t\t\txmlns:mvc="sap.ui.core.mvc"\n\t\t\txmlns="sap.m"\n\t\t\txmlns:core="sap.ui.core"\n\t\t\txmlns:form="sap.ui.layout.form"><Page id="wholist-page" showHeader="false" backgroundDesign="Solid"><content><Table id="warehouseOrderList"\n\t\t\t\tinset="true"\n\t\t\t\tgrowing="true"\n\t\t\t\tgrowingThreshold="20"\n\t\t\t\tenableBusyIndicator="true"\n\t\t\t\tgrowingScrollToLoad="false"\n\t\t\t\tbusyIndicatorDelay="200"\n\t\t\t\titemPress="handleItemPress"\n\t\t\t\twidth="100%"><headerToolbar><Toolbar id="wholist-toolbar"><Title id="tableTitle"/><ToolbarSpacer id="wholist-toolbarspacer"></ToolbarSpacer><SearchField id="searchField" liveChange="onSearch" width="30%"></SearchField><Button id="wholist-btn" tooltip="" icon="sap-icon://sort" press="handleSortingDialogButtonPressed" /></Toolbar></headerToolbar><columns><Column id="wholist-column-1" width="12em"><Label id="wholist-column-label-1" design="Bold" text="{i18n>warehouseOrders}" /></Column><Column id="wholist-column-2" width="12em"><Label id="wholist-column-label-2" design="Bold" text="{i18n>plannedHUs}" /></Column><Column id="wholist-column-3" width="12em"><Label id="wholist-column-label-3" design="Bold" text="{i18n>latestStartTime}" /></Column><Column id="wholist-column-4" width="12em"><Label id="wholist-column-label-4" design="Bold" text="{i18n>plannedDuration}" /></Column><Column id="wholist-column-5" width="12em"><Label id="wholist-column-label-5" design="Bold" text="{i18n>Queue}" /></Column></columns><items><ColumnListItem id="wholist-columnlistitem" type="Navigation"><cells><Text id="wholist-columnlistitem-who" text="{EWMWarehouseOrder}"></Text><Text id="wholist-columnlistitem-huamount" text="{path:\'HuAmount\', formatter:\'.formatInteger\'}"></Text><Text id="wholist-columnlistitem-lsd" text="{parts:[{path:\'WhseOrderLatestStartDateTime\'},{path:\'IANA_TIMEZONE\'}], formatter:\'.formatDateTime\'}"></Text><Text id="wholist-columnlistitem-plandura" text="{path:\'WarehouseOrderPlannedDuration\', formatter:\'.formatNumber\'}"></Text><Text id="wholist-columnlistitem-queue" text="{Queue}"></Text></cells></ColumnListItem></items></Table></content></Page></mvc:View>',
  "scm/ewm/pickcarts1/view/dialog/BringHUToDestinationDialog.fragment.xml":
    '\r\n<core:FragmentDefinition id="bringhutodestinationdialog-frag-def"\r\n\txmlns="sap.m"\r\n\txmlns:core="sap.ui.core"\r\n\txmlns:layout="sap.ui.layout"\r\n\txmlns:form="sap.ui.layout.form"><Dialog id="bringhutodestinationdialog-frag-def-dialog" title="{i18n>bringHuToDestText}" contentWidth="300px" draggable="true"><Text id="bringhutodestinationdialog-frag-def-text" text="{i18n>bringHuToDestMessage}" class="sapUiMediumMarginBottom"/><buttons><Button id="bringhutodestinationdialog-frag-def-btn-yes" text="{i18n>yes}" press="onBringHUToDestinationBeforeLeave"/><Button id="bringhutodestinationdialog-frag-def-btn-no" text="{i18n>no}" press="onShowTerminationDialog"/><Button id="bringhutodestinationdialog-frag-def-btn-close" text="{i18n>cancel}" press="closeBringHUToDestinationDialog"/></buttons></Dialog></core:FragmentDefinition>\r\n\r\n',
  "scm/ewm/pickcarts1/view/dialog/DebundleHUAndPosition.fragment.xml":
    '\r\n<core:FragmentDefinition id="debundlehu-frg-def"\r\n\txmlns="sap.m"\r\n\txmlns:core="sap.ui.core"><Dialog\r\n\tid="debundelHUAndPosition"\r\n\ttitle="{i18n>warning}"\r\n\tcontentWidth="400px"\r\n\tstate="{i18n>warning}"\r\n\tafterClose="closeDialog"><content><Text id="debundelHUAndPosition-text" class="sapUiMediumMarginBottom sapUiSmallMarginBegin sapUiSmallMarginEnd" text="{parts:[{path: \'i18n>debundleHandlingUnitMessage\'}, {path: \'local>/debundleHUId\'}, {path: \'local>/debundlePosition\'}], formatter: \'.formatMessage\'}"></Text></content><beginButton><Button id="debundelHUAndPosition-ok-btn" text="{i18n>ok}" press="debundlePosition"></Button></beginButton><endButton><Button id="debundelHUAndPosition-cancel-btn" text="{i18n>cancel}" press="closeDialog"></Button></endButton></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/DifferenceDialog.fragment.xml":
    '\n<core:FragmentDefinition id="diff-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"><Dialog id="differenceDialog" title="{i18n>difference}" contentWidth="450px"\n\t\tcontentHeight="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? \'515px\' : \'300px\'}" draggable="true"\n\t\tafterOpen="afterOpenDifference"><Text id="diff-dialog-text" text="{i18n>differenceDialogText}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginTop"/><form:SimpleForm id="diff-simpleform" layout="ResponsiveGridLayout"><layout:Grid id="diff-grid" position="Left" defaultSpan="L10 M10 S10" vSpacing="0"><Label id="diff-desthu-label" text="{i18n>destHU}" labelFor="difference-destHU-input"><layoutData><layout:GridData id="diff-desthu-label-grid" span="L8 M8 S8"/></layoutData></Label><Input id="difference-destHU-input" change="onDifferenceDestHUChange" value=""\n\t\t\t\t\teditable="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/destHUState\',formatter:\'.formatValueState\'}" valueStateText="{i18n>invalidInput}"><layoutData><layout:GridData id="difference-destHU-input-grid" span="L10 M10 S10"/></layoutData></Input><Label id="difference-pickqty-label" text="{i18n>pickQuantity}" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tlabelFor="difference-quantity-input" class="sapUiSmallMarginTop"><layoutData><layout:GridData id="difference-pickqty-label-grid" span="L5 M5 S5"/></layoutData></Label><Input id="difference-quantity-input" value="{local>/exceptionInfo/pickedQuantity}"\n\t\t\t\t\tvisible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}" type="Number"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/pickedQuantityState\',formatter:\'.formatValueState\'}"\n\t\t\t\t\tvalueStateText="{path:\'local>/exceptionInfo/pickedQuantityState\',formatter:\'.formatValueText\'}" class="sapUiSmallMarginBottom"\n\t\t\t\t\tchange="onDifferenceQuantityChange" submit="onExceptionQuantitySubmit"><layoutData><layout:GridData id="difference-quantity-input-grid" span="L10 M10 S10"/></layoutData></Input><core:Fragment id="difference" fragmentName="zscm.ewm.pickcarts1.view.dialog.ExceptionSerialNumber" type="XML"/></layout:Grid></form:SimpleForm><buttons><Button id="diff-ok-btn"  text="{i18n>ok}" press="onPartialOrDifferenceConfirm"/><Button id="diff-cancel-btn" text="{i18n>cancel}" press="onCancelDialog"/></buttons></Dialog></core:FragmentDefinition>\n',
  "scm/ewm/pickcarts1/view/dialog/ExceptionSerialNumber.fragment.xml":
    '\n<core:FragmentDefinition id="except-sn-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"\n\tcontrollerName="zscm.ewm.pickcarts1.controller.ProcessWarehouseTasks"><Label id="except-sn-actualpickqty" text="{i18n>actualPickedQuantity}"\n\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'},{path:\'local>/currentWarehouseTaskGroup/totalBaseQty\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'}], formatter:\'.formatExceptionUomVisible\'}"\n\t\tlabelFor="exception-alternative-UoM"><layoutData><layout:GridData id="except-sn-actualpickqty-grid" span="L8 M8 S8"/></layoutData></Label><Input id="exception-alternative-UoM"\n\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'},{path:\'local>/currentWarehouseTaskGroup/totalBaseQty\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'}], formatter:\'.formatExceptionUomVisible\'}"\n\t\tvalue="{local>/exceptionInfo/pickedUoM}" editable="false"><layoutData><layout:GridData id="exception-alternative-UoM-grid" span="L9 M9 S9"/></layoutData></Input><Label id="except-sn-altuom" text="{local>/currentWarehouseTaskGroup/alternativeUom}" class="sapUiTinyMarginBegin sapUiSmallMarginTop"\n\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'},{path:\'local>/currentWarehouseTaskGroup/totalBaseQty\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'}], formatter:\'.formatExceptionUomVisible\'}"><layoutData><layout:GridData id="except-sn-altuom-grid" span="L2 M2 S2"/></layoutData></Label><Label id="except-sn-sn" text="{i18n>serialNumber}" visible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}" labelFor="id-input-serialNumber"><layoutData><layout:GridData id="except-sn-sn-grid" span="L8 M8 S8"/></layoutData></Label><Input id="id-input-serialNumber" change="onExceptionSerialNumberChange" visible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"\n\t\tvalue="" class="sapUiSmallMarginBottom"><layoutData><layout:GridData id="id-input-serialNumber-grid" span="L9 M9 S9"/></layoutData></Input><Label id="except-sn-length" text="{= ${serialNum>/forTasksPicking}.length}" class="sapUiTinyMarginBegin sapUiSmallMarginTop"\n\t\tvisible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"><layoutData><layout:GridData id="except-sn-length-grid" span="L2 M2 S2"/></layoutData></Label><core:Fragment fragmentName="zscm.ewm.pickcarts1.view.dialog.SerialNumberList" type="XML"/></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/FullDenialDialog.fragment.xml":
    '\n<core:FragmentDefinition id="fulldenial-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"><Dialog id="fullDenialDialog" title="{i18n>fullDenial}" contentWidth="300px" draggable="true"><Text id="fulldenial-text" text="{i18n>fullDenialDialogText}" class="sapUiSmallMarginTop sapUiMediumMarginBottom sapUiSmallMarginBegin sapUiSmallMarginEnd"/><buttons><Button id="fulldenial-confirm-btn" text="{i18n>ok}" press="onFullDenialConfirm"/><Button id="fulldenial-cancel-btn" text="{i18n>cancel}" press="onCancelDialog"/></buttons></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/LowQuantityCheckDialog.fragment.xml":
    '\n<core:FragmentDefinition id="lowqtycheck-frag-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"><Dialog id="lowQuantityCheckDialog" title="{i18n>lowQuantityCheck}" contentWidth="450px"\n\t\tcontentHeight="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? \'515px\' : \'300px\'}" draggable="true"><Text id="lowqtycheck-dialog-text-1" text="{i18n>lowQuantityCheckText}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginBottom sapUiSmallMarginTop" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"/><Text id="lowqtycheck-dialog-text-2" text="{i18n>lowQtyCheckTitleForSerailNumMsg}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginTop" visible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"/><form:SimpleForm id="lowqtycheck-simpleform" layout="ResponsiveGridLayout"><layout:Grid id="lowqtycheck-grid" position="Left" defaultSpan="L10 M10 S10" vSpacing="0"><Label id="lowqtycheck-label-actualqty" text="{i18n>actualQuantity}" labelFor="actualQuantity-input" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"><layoutData><layout:GridData id="lowqtycheck-grid-actualqty" span="L6 M6 S6"/></layoutData></Label><Input id="actualQuantity-input" change="onLowQuantityCheckChange" value="{local>/currentWarehouseTaskGroup/lowQuantity}" type="Number"\n\t\t\t\t\tvalueState="{path:\'local>/currentWarehouseTaskGroup/lowQuantityState\',formatter:\'.formatValueState\'}"\n\t\t\t\t\tvalueStateText="{path:\'local>/currentWarehouseTaskGroup/lowQuantityState\',formatter:\'.formatValueText\'}" class="sapUiSmallMarginBottom"\n\t\t\t\t\tsubmit="onLowQuantitySubmit" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"><layoutData><layout:GridData id="lowqtycheck-grid-actualqtyinput" span="L10 M10 S10"/></layoutData></Input><core:Fragment id="lowQtyCheck" fragmentName="zscm.ewm.pickcarts1.view.dialog.SerialNumberListForLowQtyCheck" type="XML"/></layout:Grid></form:SimpleForm><buttons><Button id="lowQuantityCheck-confirm-btn" text="{i18n>ok}" press="onLowQuantityCheckConfirm"/><Button id="lowqtycheck-cancel-btn" text="{i18n>cancel}" press="onLowQuantityCheckCancel"/></buttons></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/PartialDenialDialog.fragment.xml":
    '\n<core:FragmentDefinition id="partial-denial-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"><Dialog id="partialDenialDialog" title="{i18n>partialDenial}" contentWidth="450px" contentHeight="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? \'525px\' : \'300px\'}" draggable="true"\n\t\tafterOpen="afterOpenPartialDenial"><Text id="partialDenialDialog-text" text="{i18n>patialDenialDialogText}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginTop"/><form:SimpleForm id="partialDenialDialog-simpleform" layout="ResponsiveGridLayout"><layout:Grid id="partialDenialDialog-grid" position="Left" defaultSpan="L10 M10 S10" vSpacing="0"><Label id="partialDenialDialog-desthu" text="{i18n>destHU}" labelFor="partialDenial-destHU-input"><layoutData><layout:GridData id="partialDenialDialog-desthu-grid" span="L8 M8 S8"/></layoutData></Label><Input id="partialDenial-destHU-input" change="onPartialDenialDestHUChange" value=""\n\t\t\t\t\teditable="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/destHUState\',formatter:\'.formatValueState\'}" valueStateText="{i18n>invalidInput}"><layoutData><layout:GridData id="partialDenial-destHU-input-grid" span="L10 M10 S10"/></layoutData></Input><Label id="partialDenial-pickQty" text="{i18n>pickQuantity}" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tlabelFor="partialDenial-quantity-input" class="sapUiSmallMarginTop"><layoutData><layout:GridData id="partialDenial-pickQty-grid" span="L8 M8 S8"/></layoutData></Label><Input id="partialDenial-quantity-input" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tvalue="{local>/exceptionInfo/pickedQuantity}" type="Number"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/pickedQuantityState\',formatter:\'.formatValueState\'}"\n\t\t\t\t\tvalueStateText="{path:\'local>/exceptionInfo/pickedQuantityState\',formatter:\'.formatValueText\'}" class="sapUiSmallMarginBottom"\n\t\t\t\t\tchange="onPartialDenialQuantityChange" submit="onExceptionQuantitySubmit"><layoutData><layout:GridData id="partialDenial-quantity-input-grid" span="L10 M10 S10"/></layoutData></Input><core:Fragment id="partialDenial" fragmentName="zscm.ewm.pickcarts1.view.dialog.ExceptionSerialNumber" type="XML"/></layout:Grid></form:SimpleForm><buttons><Button id="partialDenial-confirm-btn" text="{i18n>ok}" press="onPartialOrDifferenceConfirm"/><Button id="partialDenial-cancel-btn" text="{i18n>cancel}" press="onCancelDialog"/></buttons></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/QuantityAdjustmentDialog.fragment.xml":
    '\n<core:FragmentDefinition id="qty-adj-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"><Dialog id="quantityAdjustmentDialog" title="{i18n>quantityAdjustment}" afterOpen="afterOpenQuantityAdjustment"\n\t\tcontentWidth="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? \'450px\' : \'300px\'}"\n\t\tcontentHeight="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? \'515px\' : \'300px\'}" draggable="true"><Text id="quantityAdjustmentDialog-qtyadj" text="{i18n>quantityAdjustmentText}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginBottom sapUiSmallMarginTop" visible = "{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"/><Text id="quantityAdjustmentDialog-qtyadjtitleforsn" text="{i18n>qtyAdjustmentTitleForSerailNumMsg}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginTop" visible = "{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"/><form:SimpleForm id="qty-adj-simple-form" layout="ResponsiveGridLayout"><layout:Grid id="qty-adj-simple-form-grid" position="Left" defaultSpan="L10 M10 S10" vSpacing="0"><Label id="qty-adj-actpickqty" text="{i18n>actualPickedQuantity}" labelFor="quantityAdjustment-input" visible = "{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"><layoutData><layout:GridData id="qty-adj-actpickqty-grid" span="L10 M10 S10"/></layoutData></Label><Input id="quantityAdjustment-input" change="onQuantityAdjustmentChange" value="" type="Number"\n\t\t\t\t\tvalueState="{path:\'local>/currentWarehouseTaskGroup/quantityAdjustState\',formatter:\'.formatValueState\'}"\n\t\t\t\t\tvalueStateText="{path:\'local>/currentWarehouseTaskGroup/quantityAdjustState\',formatter:\'.formatValueText\'}" class="sapUiSmallMarginBottom"\n\t\t\t\t\tsubmit="onQuantityAdjustmentSubmit" visible = "{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"><layoutData><layout:GridData id="quantityAdjustment-input-grid" span="L10 M10 S10"/></layoutData></Input><core:Fragment id="quantityAdjustment"  fragmentName="zscm.ewm.pickcarts1.view.dialog.ExceptionSerialNumber" type="XML"></core:Fragment></layout:Grid></form:SimpleForm><buttons><Button id="quantityAdjustment-confirm-btn" text="{i18n>ok}" press="onQuantityAdjustmentConfirm"/><Button id="quantityAdjustment-cancel-btn" text="{i18n>cancel}" press="onQuantityAdjustmentCancel"/></buttons></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/SerialNumberList.fragment.xml":
    '\n<core:FragmentDefinition id="snlist-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"><List id="snlist-list" mode="Delete" delete="onSerialNumberDeleteForTasksPicking" items="{path: \'serialNum>/forTasksPicking\' }"\n\t\tvisible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"><StandardListItem id="snlist-stdn-listitm" title="{serialNum>}"/></List></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/SerialNumberListForLowQtyCheck.fragment.xml":
    '\n<core:FragmentDefinition id="snlist-lowqty-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"><Label id="snlist-lowqty-actualqty" text="{i18n>actualQuantity}" visible="{parts:[{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'},{path:\'local>/currentWarehouseTaskGroup/totalBaseQty\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'}], formatter:\'.formatExceptionUomVisible\'}"\n\t\tlabelFor="partialDenial-alternative"><layoutData><layout:GridData id="snlist-lowqty-actualqty-grid" span="L8 M8 S8"/></layoutData></Label><Input id="exception-alternative-UoM"\n\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'},{path:\'local>/currentWarehouseTaskGroup/totalBaseQty\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'}], formatter:\'.formatExceptionUomVisible\'}"\n\t\tvalue="{local>/exceptionInfo/lowQtyCheckUom}" editable="false" ><layoutData><layout:GridData id="exception-alternative-UoM-grid" span="L9 M9 S9"/></layoutData></Input><Label id="snlist-lowqty-altuom" text="{local>/currentWarehouseTaskGroup/alternativeUom}" class="sapUiTinyMarginBegin sapUiSmallMarginTop"\n\t\t\tvisible="{parts:[{path:\'local>/currentWarehouseTaskGroup/isSerialNumberEnabled\'},{path:\'local>/currentWarehouseTaskGroup/totalBaseQty\'},{path:\'local>/currentWarehouseTaskGroup/totalAlternativeQty\'}], formatter:\'.formatExceptionUomVisible\'}"><layoutData><layout:GridData id="snlist-lowqty-altuom-grid" span="L2 M2 S2"/></layoutData></Label><Label id="snlist-lowqty-sn" text="{i18n>serialNumber}" visible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}" labelFor="exception-serial-number"><layoutData><layout:GridData id="snlist-lowqty-sn-grid" span="L8 M8 S8"/></layoutData></Label><Input id="id-input-serialNumber" change="onSerialNumForLowQtyCheckChange"\n\t\tvisible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}" value="" class="sapUiSmallMarginBottom"><layoutData><layout:GridData id="id-input-serialNumber-grid" span="L9 M9 S9"/></layoutData></Input><Label  id="snlist-lowqty-check" text="{= ${serialNum>/forLowQtyCheck}.length}" class="sapUiTinyMarginBegin sapUiSmallMarginTop"\n\t\tvisible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"><layoutData><layout:GridData id="snlist-lowqty-check-grid" span="L2 M2 S2"/></layoutData></Label><List id="snlist-lowqty-list" mode="Delete" delete="onSerialNumberDeleteForLowQtyCheck" items="{path: \'serialNum>/forLowQtyCheck\' }" visible="{local>/currentWarehouseTaskGroup/isSerialNumberEnabled}"><StandardListItem id="snlist-lowqty-listitem" title="{serialNum>}"/></List></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/SerialNumberPopover.fragment.xml":
    '\n<core:FragmentDefinition id="sn-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"><Popover id="sn-popover" title="{i18n>serialNum}" class="sapUiContentPadding" placement="Bottom"><HBox id="sn-hbox"><Input id="id-input-serialNumber" change="onSerialNumChange"\n\t\t\t\tenabled="{path: \'serialNum>/forTasksPicking\', formatter:\'.formatSerialNumInputVisible\'}"/><Label id="sn-hbox-label"\n\t\t\t\ttext="{parts:[{path: \'serialNum>/forTasksPicking\'}, {path: \'local>/currentWarehouseTaskGroup/baseUom\'}], formatter:\'.formatSerialNumQtyDisplay\'}"\n\t\t\t\tclass="sapUiSmallMarginTop"/></HBox><core:Fragment fragmentName="zscm.ewm.pickcarts1.view.dialog.SerialNumberList" type="XML"></core:Fragment><footer><Toolbar id="sn-footer-toolbar"><ToolbarSpacer id="sn-footer-toolbarspacer"/><Button id="sn-footer-btn" text="{i18n>clear}" press="onSerialNumClear"/></Toolbar></footer></Popover></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/SortWarehouseOrder.fragment.xml":
    '\r\n<core:FragmentDefinition id="sort-frag-def"\r\n\txmlns="sap.m"\r\n\txmlns:core="sap.ui.core"><ViewSettingsDialog\r\n\t\tid="sortWarehouseOrder"\r\n\t\tconfirm="handleConfirm"><sortItems><ViewSettingsItem id="sortwho-item-who" text="{i18n>warehouseOrders}" key="EWMWarehouseOrder" /><ViewSettingsItem id="sortwho-item-huamount" text="{i18n>plannedHUs}" key="HuAmount" /><ViewSettingsItem id="sortwho-item-lsd" text="{i18n>latestStartTime}" key="WhseOrderLatestStartDateTime" selected="true" /><ViewSettingsItem id="sortwho-item-planneduration" text="{i18n>plannedDuration}" key="WarehouseOrderPlannedDuration"/><ViewSettingsItem id="sortwho-item-queue" text="{i18n>Queue}" key="Queue" /></sortItems></ViewSettingsDialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/SplittingFromDialog.fragment.xml":
    '\n<core:FragmentDefinition id="spltfromdialog-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout" xmlns:form="sap.ui.layout.form"><Dialog id="splittingFromDialog" title="{i18n>splitting}" contentWidth="450px"\n\t\tcontentHeight="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? \'515px\' : \'300px\'}" draggable="true"\n\t\tafterOpen="afterOpenSplitting"><Text id="spltfromdialog-text" text="{i18n>splittingFromDialogText}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginTop"/><form:SimpleForm  id="spltfromdialog-simpleform" layout="ResponsiveGridLayout"><layout:Grid  id="spltfromdialog-simpleform-grid" position="Left" defaultSpan="L10 M10 S10" vSpacing="0"><Label id="spltfromdialog-label-desthu" text="{i18n>destHU}" labelFor="splitting-destHU-input"><layoutData><layout:GridData id="spltfromdialog-label-desthu-grid" span="L8 M8 S8"/></layoutData></Label><Input id="splitting-destHU-input" change="onSplittingDestHUChange" value=""\n\t\t\t\t\teditable="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/destHUState\',formatter:\'.formatValueState\'}" valueStateText="{i18n>invalidInput}"><layoutData><layout:GridData id="spltfromdialog-input-desthu-grid" span="L10 M10 S10"/></layoutData></Input><Label id="spltfromdialog-label-pickqty" text="{i18n>pickQuantity}" visible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tlabelFor="splitting-quantity-input" class="sapUiSmallMarginTop"><layoutData><layout:GridData id="spltfromdialog-label-pickqty-grid" span="L5 M5 S5"/></layoutData></Label><Input id="splitting-quantity-input" change="onSplittingQuantityChange" value="{local>/exceptionInfo/pickedQuantity}" type="Number"\n\t\t\t\t\tvisible="{= ${local>/currentWarehouseTaskGroup/isSerialNumberEnabled} ? false : true}"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/pickedQuantityState\',formatter:\'.formatValueState\'}"\n\t\t\t\t\tvalueStateText="{path:\'local>/exceptionInfo/pickedQuantityState\',formatter:\'.formatValueText\'}" class="sapUiSmallMarginBottom"\n\t\t\t\t\tsubmit="onExceptionQuantitySubmit"><layoutData><layout:GridData id="spltfromdialog-label-splitqty-input-grid" span="L10 M10 S10"/></layoutData></Input><core:Fragment id="splitting" fragmentName="zscm.ewm.pickcarts1.view.dialog.ExceptionSerialNumber" type="XML"/></layout:Grid></form:SimpleForm><buttons><Button id="spltfromdialog-next-splitting-dialog-btn" text="{i18n>next}" press="onNextSplittingDialog"/><Button id="spltfromdialog-cancel-dialog-btn" text="{i18n>cancel}" press="onCancelDialog"/></buttons></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/SplittingToDialog.fragment.xml":
    '\n<core:FragmentDefinition id="splttodialog-frg-def" xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"\n\txmlns:form="sap.ui.layout.form"><Dialog id="splittingToDialog" title="{i18n>splitting}" contentWidth="450px" draggable="true"><Text id="splttodialog-text" text="{i18n>splittingToDialogText}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginTop"/><Text id="splttodialog-text2" text="{i18n>putToNewPosition}" class="sapUiMediumMarginBegin sapUiMediumMarginEnd sapUiSmallMarginBottom"/><form:SimpleForm id="splttodialog-simpleform" layout="ResponsiveGridLayout"><layout:Grid id="splttodialog-simpleform-grid" position="Left" defaultSpan="XL10 L10 M10 S10" vSpacing="0"><Label id="splttodialog-simpleform-label-patmat" text="{i18n>packageMaterial}" labelFor="splitting-material-input"><layoutData><layout:GridData id="splttodialog-simpleform-label-patmat-grid" span="L5 M5 S5"/></layoutData></Label><Input id="splitting-material-input" value="{local>/exceptionInfo/packageMaterial}" enabled="false" class="sapUiMediumMarginEnd"><layoutData><layout:GridData id="splitting-material-input-grid" span="L10 M10 S10"/></layoutData></Input><Label id="splttodialog-simpleform-label-pickhu" text="{i18n>pickHU}" labelFor="splitting-pickHU-input" class="sapUiSmallMarginTop"><layoutData><layout:GridData id="splttodialog-simpleform-label-pickhu-grid" span="L5 M5 S5"/></layoutData></Label><Input id="splitting-pickHU-input" value="{local>/exceptionInfo/pickingHU}"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/pickingHUState\',formatter:\'.formatValueState\'}" valueStateText="{i18n>invalidInput}"\n\t\t\t\t\tchange="onSplittingPickingHUChange"><layoutData><layout:GridData id="splitting-pickHU-input-grid" span="L10 M10 S10"/></layoutData></Input><Label id="splttodialog-simpleform-label-logpos" text="{i18n>logicalPosition}" labelFor="splitting-logicalPosition-input"\n\t\t\t\t\tclass="sapUiSmallMarginTop"><layoutData><layout:GridData id="splttodialog-simpleform-label-logpos-grid" span="L5 M5 S5"/></layoutData></Label><Input id="splitting-logicalPosition-input" value="{local>/exceptionInfo/positionLabel}"\n\t\t\t\t\tvalueState="{path:\'local>/exceptionInfo/logicalPositionState\',formatter:\'.formatValueState\'}" valueStateText="{i18n>invalidInput}"\n\t\t\t\t\tclass="sapUiSmallMarginBottom" change="onSplittingLogicalPositionChange" submit="onSplittingLogicalPositionSubmit"><layoutData><layout:GridData id="splitting-logicalPosition-input-grid" span="L10 M10 S10"/></layoutData></Input></layout:Grid></form:SimpleForm><buttons><Button id="splitting-ok-btn" text="{i18n>ok}" press="onSplittingConfirm"/></buttons></Dialog></core:FragmentDefinition>',
  "scm/ewm/pickcarts1/view/dialog/TerminationDialog.fragment.xml":
    '\r\n<core:FragmentDefinition id="terminationdialog-frag-def"\r\n\txmlns="sap.m"\r\n\txmlns:core="sap.ui.core"\r\n\txmlns:layout="sap.ui.layout"\r\n\txmlns:form="sap.ui.layout.form"><Dialog id="terminationdialog-frag-def-dialog" title="{i18n>terminateText}" contentWidth="300px" draggable="true"><Text id="terminationdialog-frag-def-text" text="{i18n>terminateMessage}" class="sapUiMediumMarginBottom"/><buttons><Button id="terminationdialog-frag-def-btn-split" text="{i18n>yes}" press="onTerminateBySplit"/><Button id="terminationdialog-frag-def-btn-break" text="{i18n>no}" press="onTerminateByBreak"/><Button id="terminationdialog-frag-def-btn-close" text="{i18n>cancel}" press="closeTerminationDialog"/></buttons></Dialog></core:FragmentDefinition>',
});
//# sourceMappingURL=Component-preload.js.map
