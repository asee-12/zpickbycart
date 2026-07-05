/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"zscm/ewm/pickcarts1/controller/Base.controller",
	"zscm/ewm/pickcarts1/model/OData",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/model/PickCartConnection",
	"zscm/ewm/pickcarts1/model/PickCartLayout",
	"sap/ui/core/ValueState",
	"sap/m/Dialog",
	"sap/m/ButtonType",
	"zscm/ewm/pickcarts1/utils/Util",
	"zscm/ewm/pickcarts1/utils/Const"
], function (Controller, ODataHelper, Global, PickCartConnection, PickCartLayout, ValueState, Dialog, ButtonType, Util, Const) {
	"use strict";
	var pickHUId = "connection-hu-input";
	var logicalPositionId = "connection-logical-position-input";
	return Controller.extend("zscm.ewm.pickcarts1.controller.PickCartConnection", {
		sRouteName: "connection",
		aManualInput: [{
			id: pickHUId
		}, {
			id: logicalPositionId
		}],

		init: function () {
			this.setModel(PickCartConnection.init(), "local");
			this.getErrorMessagePopover().setModel(PickCartConnection.init());
		},
		onRouteMatched: function (oParameter) {
			PickCartConnection.clearData();
			ODataHelper
				.getPickcartConnectionData(oParameter.warehouseOrder)
				.then(function (aResult) {
					var aLayoutData = aResult[0];
					var handlingUnits = aResult[1];
					PickCartLayout.setData(aLayoutData);
					PickCartConnection.setHandlingUnit(handlingUnits);
					//highlight prepared handling units in pickcart layout if has
					var aPostions = PickCartConnection.getConnectedPositions();
					if (aPostions.length > 0) {
						PickCartLayout.setStatusForPreparationByIds(aPostions, 1);
					}
					this.moveFocus();
					this.setBusy(false);
					if (!Util.isEmpty(Global.getQueue()) && !Util.isEmpty(Global.getWoQueue())) {
						//Global.getQueue():user sepecified queue, 	Global.getWoQueue():current wo's Queue			
						if (Global.getQueue().toUpperCase() !== Global.getWoQueue().toUpperCase()) {
							var sMsg = this.getI18nText("hasWoFromdifferentQueue", [ODataHelper.getResourceNumber(), oParameter.warehouseOrder, Global.getWoQueue()]);
							this.displayWarningInPopover(sMsg, PickCartConnection);
						}
					}
				}.bind(this))
				.catch(function () {
					PickCartConnection.clearHandlingUnits();
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},
		/**
		 * Triggered when handling unit changed
		 * 
		 * @param {object} oEvent The Button Event
		 */
		onHandlingUnitChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("newValue"));
			sInput = sInput.toUpperCase();
			this.setBusy(true);
			ODataHelper.convertHUID(sInput)
				.then(function (oResult) {
					sInput = oResult.Huident;
					this.setInputValue(pickHUId, sInput);
					var oVerifyPromise;
					var oPositionInfo = PickCartLayout.getPositionInfoByLable(sInput);
					var sWarningMsg = this.getI18nText("scanLogicPostionWhenInputPickHU", [sInput]);
					if (!Util.isEmpty(sInput)) {
						oVerifyPromise = this.getHandlingUnitVerifyPromise(sInput);
						this.verify(oVerifyPromise, pickHUId, function onSuccess() {
							if (oPositionInfo) { //show a warning message if the scanned pick HU input = logical postion
								this.updateInputWithWarning(pickHUId, sWarningMsg, sInput);
								this.playAudio(Const.WARNING);
							}
						}.bind(this));
					} else {
						this.focusTo(pickHUId);
						this.updateInputWithDefault(pickHUId, "");
					}
				}.bind(this))
				.finally(function () {
					this.setBusy(false);
				}.bind(this));
		},

		getHandlingUnitVerifyPromise: function (sInput) {
			var oWorkingItem = PickCartConnection.getCurrentHandlingUnit();
			var reservedMsg = this.getI18nText("handlingUnitHasBeenOccupiedMsg", [sInput]);
			var oVerifyPromise;
			if (PickCartConnection.isHandlingUnitReserved(sInput)) {
				oVerifyPromise = new Promise(function (resolve, reject) {
					reject(reservedMsg);
				});
			} else if (PickCartConnection.isContainsSpecialCharacter(sInput)) {
				oVerifyPromise = new Promise(function (resolve, reject) {
					reject();
				});
			} else {
				oVerifyPromise = ODataHelper.validateHandlingUnit(Global.getWONumber(), oWorkingItem.HndlgUnitNumberInWhseOrder, sInput);
			}
			return oVerifyPromise;
		},

		/**
		 * Triggered when logical position changed
		 * 
		 * @param {object} oEvent The ui5 Event object
		 */
		onLogicalPositionChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("newValue"));
			var oPositionInfo = PickCartLayout.getPositionInfoByLable(sInput);
			var reservedMsg = this.getI18nText("logicalPositionHasBeenOccupiedMsg", [sInput]);
			var oVerifyPromise = new Promise(function (resolve, reject) {
				if (!oPositionInfo) {
					reject();
				} else if (PickCartConnection.isLogicalPositionReserved(oPositionInfo.HandlingUnitLogicalPosition)) {
					reject(reservedMsg);
				} else {
					PickCartConnection.updatePositionId(oPositionInfo.HandlingUnitLogicalPosition);
					resolve();
				}
			});
			this.verify(oVerifyPromise, logicalPositionId);
		},

		onSelectPosition: function (oEvent) {
			var type = oEvent.getSource().getType();
			if (type === ButtonType.Emphasized) {
				var sLogicalPositionLabel = oEvent.getSource().getText();
				var sLogicalPosition = PickCartLayout.getPositionByLable(sLogicalPositionLabel);

				PickCartConnection.debundPreparation(sLogicalPosition, sLogicalPositionLabel);
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("zscm.ewm.pickcarts1.view.dialog.DebundleHUAndPosition", this);
				}
				this.getView().addDependent(this._oDialog);
				this._oDialog.open();
			}
		},
		formatMessage: function (sMessage, sHUId, sPosition) {
			var i18n = this.getModel("i18n");
			return i18n.getResourceBundle().getText(sMessage, [sHUId, sPosition]);
		},
		closeDialog: function () {
			PickCartConnection.debundFinished();
			this._oDialog.setBusy(false);
			this._oDialog.close();
		},
		onResetPressed: function () {
			this.setBusy(true);
			ODataHelper
				.resetConnectionData()
				.then(function () {
					var aPosition = PickCartConnection.getAllLogicalPositions();
					PickCartLayout.setStatusForPreparationByIds(aPosition, 0);

					PickCartConnection.resetAllHandlingUnits();
					this.updateInputWithDefault(pickHUId, "");
					this.updateInputWithDefault(logicalPositionId, "");

					this.moveFocus();
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},
		debundlePosition: function () {
			var mHandlingUnit = PickCartConnection.getDebundleHandlingUnit();
			var sPositionId = mHandlingUnit.HandlingUnitLogicalPosition;
			var sHandlingUnit = mHandlingUnit.HandlingUnitNumber;
			PickCartConnection.clearHandlingUnit(mHandlingUnit);
			this._oDialog.setBusy(true); //close debund dialogue
			this
				.confirmTask(mHandlingUnit, true)
				.then(function () {
					this.closeDialog();
					this.updateInputWithDefault(pickHUId, "");
					this.updateInputWithDefault(logicalPositionId, "");
					this.moveFocus();
					this.playAudio(Const.INFO);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.closeDialog();
					//todo:: how to display error
					jQuery.sap.log.error("debund position error");
					PickCartConnection.restoreHandlingUnit(mHandlingUnit, sHandlingUnit, sPositionId);
					this.playAudio(Const.ERROR);
				}.bind(this));

		},
		formatProgressPercentValue: function (iProgress, aHandlingUnits) {
			if (aHandlingUnits.length > 0) {
				return iProgress * 100 / aHandlingUnits.length;
			}
			return 0;
		},
		formatProgressDisplayValue: function (iProgress, aHandlingUnits) {
			return iProgress + "/" + aHandlingUnits.length + " HUs";
		},
		formatValueState: function (sStatus) {
			var sValueState = ValueState.None;
			if (sStatus === "INVALID") {
				sValueState = ValueState.Error;
			}
			return sValueState;
		},
		formatPackagingMaterial: function (sDesc, sId) {
			var sPackageMaterial = sDesc;
			if (Util.isEmpty(sDesc)) {
				sPackageMaterial = sId;
			}
			return sPackageMaterial;
		},
		onNavToProcessTasks: function () {
			Global.setAppProgress(3);
			this.navTo("processTasks", {
				warehouseOrder: Global.getWONumber()
			});
		},

		confirmTask: function (mHandlingUnit, bClear) {
			this.setBusy(true);
			if (!mHandlingUnit) {
				mHandlingUnit = PickCartConnection.getCurrentHandlingUnit();
			}
			return ODataHelper
				.submitConnectiondData(mHandlingUnit)
				.then(function () {
					var oPositionInfo;
					if (bClear) {
						var sLabel = PickCartConnection.getDebundldPosition();
						oPositionInfo = PickCartLayout.getPositionInfoByLable(sLabel);
						PickCartLayout.updatePositionStatus(oPositionInfo, 0);
					} else {
						var sLogicalPosition = PickCartConnection.getCurrentHandlingUnitLogicalPosition();
						oPositionInfo = PickCartLayout.getPositionInfoById(sLogicalPosition);
						PickCartLayout.updatePositionStatus(oPositionInfo, 1);
					}

					PickCartConnection.updateConnectionProgress(!bClear);
					PickCartConnection.prepareHandlingUnit();
					this.updateInputWithDefault(pickHUId, "");
					this.updateInputWithDefault(logicalPositionId, "");
					if (PickCartConnection.isHandlingUnitsReady()) {
						this.onNavToProcessTasks();
					}
					this.setBusy(false);
					this.moveFocus();
					this.playAudio(Const.INFO);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		}
	});
});