/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ValueState",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/model/OData",
	"zscm/ewm/pickcarts1/model/LogonResource",
	"zscm/ewm/pickcarts1/utils/Const",
	"zscm/ewm/pickcarts1/utils/Util",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (Controller, JSONModel, ValueState, Global, OData, LogonResource, Const, Util, Filter, FilterOperator, MessageBox) {
	"use strict";
	var emptyOrder = "0000000000";
	var dummyId = "dummy-input";
	var resourceId = "pbc---logon--EWMResource";
	var queue_select_id = "id-queue-select";
	return Controller.extend("zscm.ewm.pickcarts1.controller.LogonResource", {

		onInit: function () {
			this.initModes();
			this.initUserSettings();
			this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched, this);
		},
		initModes: function () {
			var i18n = this.getModel("i18n");
			this.setModel(LogonResource.init(i18n), "local");
		},

		onRouteMatched: function (oParameter) {
			if (oParameter.getParameters().config.target === "logonResource") {
				if (Global.getWONumber()) {
					var sInfo = this.getI18nText("haveWOIntheCart", [OData.getResourceNumber(), Global.getWONumber()]);
					this.displayMessage(sInfo, true);
				} else {
					LogonResource.setModeEditable(true);
				}
			}
		},

		initUserSettings: function () {
			this.setBusy(true);
			OData
				.getUserSetting()
				.then(function (oResult) {
					if (oResult.EWMWarehouse) {
						this.bindAudioAggregation(OData.getWarehouseNumber());
					}
					this.bindResource(oResult.IntralogisticsOperationsUser);
					if (oResult.EWMWarehouse && oResult.EWMResource) {
						this.verifyResourceAndWarehouseNum(oResult.EWMResource);
					} else {
						this.setBusy(false);
					}
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},
		initQueue: function (sResource) {
			var aItems = [];
			aItems.push({
				Queue: ""
			});
			var oQueueModel = new JSONModel({
				items: aItems
			});
			this.byId(queue_select_id).setValue("");
			this.byId(queue_select_id).setSelectedKey("");
			if (Util.isEmpty(sResource)) {
				this.setModel(oQueueModel, "QueueModel");

				return;
			}
			this.setBusy(true);
			OData
				.getQueueSet(sResource)
				.then(function (aResult) {
					for (var i = 0; i < aResult.results.length; i++) {
						aItems.push({
							Queue: aResult.results[i].Queue
						});
					}
					oQueueModel = new JSONModel({
						items: aItems
					});
					this.setModel(oQueueModel, "QueueModel");
				}.bind(this))
				.finally(function () {
					this.setBusy(false);
				}.bind(this));
		},
		bindAudioAggregation: function (sWarehouse) {
			var sComponentId = this.getOwnerComponent().getId();
			var oAudioView = sap.ui.getCore().byId(sComponentId + "---main");
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouse);
			oAudioView.getController().bindAudioList([oWarehouseNumberFilter]);
		},
		playAudio: function (sMsgType) {
			Util.playAudio(this, sMsgType);
		},
		/**
		 * Bind the model value of Resource with the view control
		 */
		bindResource: function (sUser) {
			var oView = this.getView();
			oView.bindElement("/UserSet(UserDataEntry='',IntralogisticsOperationsUser='" + sUser + "')");
		},

		/**
		 * Disable Next button once resource value changed
		 * 
		 */
		onResourceInputLiveChanged: function () {
			//disable Next button if resource changed
			Global.disableNext();
		},
		/**
		 * verify the resource and warehouse number once the resource value changed, generally triggered by lose focuse.
		 */
		onResourceInputChanged: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("newValue"));
			sInput = sInput.toUpperCase();
			this.setResourceInput(sInput);
			LogonResource.setModeEditable(true);
			OData.resetPickcartConfig();
			OData
				.getUserSetting()
				.then(function (oResult) {
					this.verifyResourceAndWarehouseNum(sInput);
				}.bind(this));
		},

		verifyResourceAndWarehouseNum: function (sEWMResource) {
			this.focusDummyElement();
			this.setBusy(true);
			OData
				.verifyResourceAndWarhouseNumber(sEWMResource)
				.then(function () {
					this.setBusy(false);
					Global.setWONumber("");
					Global.setQueue("");
					OData.setResourceNumber(sEWMResource);
					LogonResource.setNone();
					Global.enableNext();
					this.initQueue(sEWMResource);
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					Global.disableNext();
					this.displayMessage(oError);
					setTimeout(function () {
						this.playAudio(Const.ERROR);
					}.bind(this), 0);
					this.initQueue("");
				}.bind(this));
		},
		displayMessage: function (oError, bInfo) {
			var sMessage = this.getI18nText("invalidInput");
			if (Util.isString(oError)) {
				sMessage = oError;
			} else {
				if (Util.isJsonString(oError.responseText)) {
					sMessage = JSON.parse(oError.responseText).error.message.value;
				}
			}
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (bInfo) {
				MessageBox.information(
					sMessage, {
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function () {
							var oResource = this.byId(resourceId);
							oResource.focus();
						}.bind(this)
					}
				);

			} else {
				MessageBox.error(
					sMessage, {
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function () {
							var oResource = this.byId(resourceId);
							oResource.focus();
						}.bind(this)
					}
				);
			}
		},

		focusDummyElement: function () {
			this.byId(dummyId).setValue("");
			this.byId(dummyId).focus();
		},
		getModel: function (sModelName) {
			return this.getOwnerComponent().getModel(sModelName);
		},
		setModel: function (oModel, sModelName) {
			this.getView().setModel(oModel, sModelName);
		},

		onPressLogoff: function () {
			this.setBusy(true);
			OData
				.logoffResource()
				.then(function () {
					Global.setAppProgress(0);
					OData.setResourceNumber("");
					OData.resetPickcartConfig();
					Global.setWONumber("");
					Global.setQueue("");
					Global.setWoQueue("");
					this.initQueue("");
					Global.disableNext();
					LogonResource.setEditable(true);
					LogonResource.setModeEditable(true);
					this.setBusy(false);
					this.playAudio(Const.INFO);
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onPressNext: function () {
			Global.setToLeaveAfterDrop(false);
			//if it has warehouse order: means enterred the page via 'back' button, not from termination or newly entered
			if (Global.getWONumber()) {
				var oNavParam = this.getNavParamByAppProgress();
				var oNavParams = Util.getNavParamsByStatus(oNavParam.sStatus, oNavParam.oParam, true);
				if (oNavParams.route) {
					Global.setAppProgress(oNavParams.progress);
					this.navTo(oNavParams.route, oNavParams.param);
				}
			} else {
				var bManual = !Global.isSystemMode();
				this.setBusy(true);
				OData
					.logonResource(bManual)
					.then(function (data) {
						if (data && data.EWMWarehouseOrder !== emptyOrder) {
							Global.setWONumber(data.EWMWarehouseOrder);
							Global.setWoQueue(data.Queue);
							var oNavParamsObj = Util.getNavParamsByStatus(data.PickcartWhoStatus, data, false);
							if (oNavParamsObj.route) {
								Global.setAppProgress(oNavParamsObj.progress);
								this.navTo(oNavParamsObj.route, oNavParamsObj.param);
							}
						} else if (bManual) {
							var sResourceNumber = OData.getResourceNumber();
							var sWarehouseNumber = OData.getWarehouseNumber();
							Global.setAppProgress(1);
							this.navTo("warehouseOrderList", {
								resourceId: sResourceNumber,
								warehouseNumber: sWarehouseNumber
							});
						}
						LogonResource.setEditable(false);
						LogonResource.setModeEditable(false);
						this.setBusy(false);
					}.bind(this))
					.catch(function (oError) {
						this.setBusy(false);
						this.displayMessage(oError);
						this.playAudio(Const.ERROR);
					}.bind(this));
			}
		},
		onQueueChange: function (oEvent) {
			var oQueueSelect = this.byId(queue_select_id);
			var sQueue = oQueueSelect.getValue();
			if (!Util.isEmpty(sQueue) && Util.isEmpty(oQueueSelect.getSelectedKey())) {
				sQueue = "";
				oQueueSelect.setValueState(ValueState.Error);
				oQueueSelect.setValueStateText(this.getI18nText("invalidInput"));
				this.playAudio(Const.ERROR);
			} else {
				oQueueSelect.setValueState(ValueState.None);
				oQueueSelect.setValueStateText("");
			}
			oQueueSelect.setValue(sQueue);
			Global.setQueue(oQueueSelect.getSelectedKey());
		},
		/**
		 * get the navigation parameters by app progress
		 * 
		 * @return {object} The navigation parameters which contains who status and parameters which will be used by navigation
		 */
		getNavParamByAppProgress: function () {
			var sWarehouseOrderStatus;
			var oParam = {};
			var iAppProgress = Global.getAppProgress();
			var WHO_STATUS = Const.WHO_STATUS;
			var sWarehouseOrder = Global.getWONumber();
			switch (iAppProgress) {
			case 2:
				sWarehouseOrderStatus = WHO_STATUS.INITIAL;
				oParam.EWMWarehouseOrder = sWarehouseOrder;
				break;
			case 3:
				sWarehouseOrderStatus = WHO_STATUS.PICKING;
				oParam.EWMWarehouseOrder = sWarehouseOrder;
				break;
			case 4:
				sWarehouseOrderStatus = WHO_STATUS.DROPPING;
				oParam.EWMWarehouseOrder = sWarehouseOrder;
				oParam.EWMWarehouse = OData.getWarehouseNumber();
				break;
			}
			return {
				sStatus: sWarehouseOrderStatus,
				oParam: oParam
			};
		},
		navTo: function (sRoute, oParam) {
			this
				.getOwnerComponent()
				.getRouter()
				.navTo(sRoute, oParam);
		},
		setBusy: function (bBusy) {
			this.getView().setBusy(!!bBusy);
		},
		setResourceError: function (oError) {
			var oResource = this.byId(resourceId); //clear resource Input if verify failed
			oResource.setValue("");
			LogonResource.setError();
			if (Util.isString(oError)) {
				oResource.setValueStateText(oError);
			} else if (oError) {
				var oResponseText = JSON.parse(oError.responseText);
				oResource.setValueStateText(oResponseText.error.message.value);
			}
			oResource.focus();
		},
		setResourceInput: function (sInput) {
			this.byId(resourceId).setValue(sInput);
		},
		getI18nText: function (sText, aParameter) {
			var i18n = this.getModel("i18n");
			return i18n.getResourceBundle().getText(sText, aParameter);
		},
	});
});