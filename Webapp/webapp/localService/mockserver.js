/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/util/MockServer"], function (e) {
  "use strict";
  var t,
    s = "zscm/ewm/pickcarts1/",
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
});
//# sourceMappingURL=mockserver.js.map
