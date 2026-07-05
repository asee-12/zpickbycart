/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
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
//# sourceMappingURL=Global.js.map
