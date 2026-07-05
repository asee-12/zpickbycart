/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";

	var oMockServer,
		_sAppModulePath = "scm/ewm/pickcarts1/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";
	// _aSimulateArrary = [{
	// 	oSourceReg: new RegExp([val]),
	// 	sDestURL: "",
	// 	sDescription:""
	// }];

	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */

		init: function() {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.mainService,
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";

			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1)
			});

			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true
			});
			this.simulateVerifyResource();
			this.simulateLogonRSRC();
			this.simulateGetlayout();
			this.simulateGetHandlingUnits();
			this.simulateVerifyHandlingUnit();
			this.simulateGetWarehouseTaskGroups();
			//this.simulateGetWarehouseOrderSet();
			// this.simulateGetWarehouseTasks();
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

			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
		},

		simulateVerifyResource: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("VerifyRSRC?(.*)"),
				response: function(oXhr, sUrlParams) {
					jQuery.sap.log.debug("Function Import Test: Incoming request for VerifyRSRC");
					var verifyURL = "/webapp/localService/mockdata/";
					if (sUrlParams.indexOf("PICKCART_001") !== -1) { //resource is correct
						verifyURL += "VerifyRSRC_Succ.json";
					} else {
						verifyURL += "VerifyRSRC_Failed.json";
					}

					var oResponse = jQuery.sap.sjax({
						url: verifyURL
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateLogonRSRC: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("LogonRSRC?(.*)"),
				response: function(oXhr, sUrlParams) {
					jQuery.sap.log.debug("Function Import Test: Incoming request for VerifyRSRC");

					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/LogonRSRC.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateGetlayout: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("PickCartSet.*Layouts"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/Layout.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateGetHandlingUnits: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("WarehouseOrderSet.*HUs"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/HandlingUnits.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateResetPreparation: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "DELETE",
				path: new RegExp("RsrcHuAssignmentSet.*"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/HandlingUnits.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		
		simulateVerifyHandlingUnit: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("BindHU?(.*)"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/VerifyPassed.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateGetWarehouseTaskGroups: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("WarehouseTaskGrpSet?(.*)"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/WarehouseTaskGrpSet.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateGetWarehouseTasks: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("WarehouseTaskSet?(.*)"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/WarehouseTaskSet.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateVerifySourceBin: function() {
			var that = this;
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "POST",
				path: new RegExp("VerifyBin(?!W)(.*)"),
				response: function(oXhr, sUrlParams) {
					var sSourceBin = that.getParameterByName("EWMStorageBin", sUrlParams);
					var sInputBin = that.getParameterByName("Verif", sUrlParams);
					if (sSourceBin === sInputBin) {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json"
						});
					} else {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json"
						});
					}
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateVerifySourceBinWithStock: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("VerifyBin(?=W)(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/VerifySourceBinWithStock_Succ.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateVerifySourceHU: function() {
			var that = this;
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "POST",
				path: new RegExp("VerifyHU?(.*)"),
				response: function(oXhr, sUrlParams) {
					var sSourceHU = that.getParameterByName("SourceHandlingUnit", sUrlParams);
					var sInputHU = that.getParameterByName("VlenrVerif", sUrlParams);
					if (sSourceHU === sInputHU || sSourceHU === "''") {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json"
						});
					} else {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json"
						});
					}
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateVerifyProduct: function() {
			var that = this;
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "POST",
				path: new RegExp("VerifyProduct?(.*)"),
				response: function(oXhr, sUrlParams) {
					var sProduct = that.getParameterByName("ProductName", sUrlParams);
					var sInputProduct = that.getParameterByName("Ean", sUrlParams);
					if (sProduct === sInputProduct) {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json"
						});
					} else {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json"
						});
					}
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateVerifyBatch: function() {
			var that = this;
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "POST",
				path: new RegExp("VerifyBatch?(.*)"),
				response: function(oXhr, sUrlParams) {
					var sBatch = that.getParameterByName("Batch", sUrlParams);
					var sInputBatch = that.getParameterByName("BatchVerif", sUrlParams);
					if (sBatch === sInputBatch || sBatch === "''") {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json"
						});
					} else {
						oResponse = jQuery.sap.sjax({
							url: "/webapp/localService/mockdata/VerifyRSRC_Failed.json"
						});
					}
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateDropGroupSet: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("DropGrpSet?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/DropGrpSet.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateDropTaskList: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("WarehouseTaskSet?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/DropTaskList.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateConfirmTask: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("Confirm?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/ConfirmWT.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateConfirmTaskInBatch: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("ConfirmMulti?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/ConfirmWT.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateAutoConfirmTask: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("ConfirmAuto?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/WTConfirmationSet.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateExceptionSet: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("ExceptionSet?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/ExceptionSet.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateCheckOrderStatus: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("WarehouseOrderSet\(.*\)(?!/HUs)", "g"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/checkWarehouseOrderStatus.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateGetWHOBySelection: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("GetWHOBySelection\(.*\)(?!/HUs)$", "g"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/GetWHOBySelection.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateGetWarehouseOrderSet: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("WarehouseOrderSet\(.*\)$", "g"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/WarehouseOrderSet.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateTerminate: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "POST",
				path: new RegExp("LeaveTrans(.*)", "g"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/LeaveTrans.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			aRequests.push({
				method: "POST",
				path: new RegExp("LeaveTrans(.*)", "g"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/LeaveTrans.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},
		simulateBindNewDestHU: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "POST",
				path: new RegExp("BindNewHU?(.*)"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/VerifyPassed.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		getParameterByName: function(name, url) {
			var match = RegExp("[?&]" + name + "=([^&]*)").exec(url);
			return match && decodeURIComponent(match[1].replace(/\+/g, " "));
		},
		simulateLogoff: function() {
			var aRequests = oMockServer.getRequests();
			var oResponse;
			aRequests.push({
				method: "GET",
				path: new RegExp("LogoffRSRC?(.*)"),
				response: function(oXhr, sUrlParams) {
					oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/VerifyRSRC_Succ.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		},

		simulateVerifySerialNumber: function() {
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "POST",
				path: new RegExp("VerifySN?(.*)"),
				response: function(oXhr, sUrlParams) {
					var oResponse = jQuery.sap.sjax({
						url: "/webapp/localService/mockdata/VerifyPassed.json"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		}


	};

});