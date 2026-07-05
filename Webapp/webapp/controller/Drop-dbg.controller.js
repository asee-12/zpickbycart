/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"zscm/ewm/pickcarts1/controller/Base.controller",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/model/OData",
	"zscm/ewm/pickcarts1/model/Drop",
	"zscm/ewm/pickcarts1/model/PickCartLayout",
	"zscm/ewm/pickcarts1/utils/Const",
	"zscm/ewm/pickcarts1/utils/Util",
	"sap/m/MessageBox"
], function (Controller, Global, OData, Drop, PickCartLayout, Const, Util, MessageBox) {
	"use strict";
	var sBinId = "actualBinInput";
	var sHandlingUnitId = "destHandlingUnitInput";
	var emptyOrder = "0000000000";
	var rfErrorCode = "/SCWM/RF_EN/056"; //error: No more available warehouse orders
	var pbC24ErrorCode = "/SCWM/PICKCART/024"; //error: Documentary batches not supported
	return Controller.extend("zscm.ewm.pickcarts1.controller.Drop", {
		sRouteName: "dropHandlingUnit",
		aManualInput: [{
			id: sBinId
		}, {
			id: sHandlingUnitId
		}],
		//cache the positons which need to drop
		aPositionsToConfirm: [],
		/**
		 * init function, execute only once
		 * 
		 * @override
		 */
		init: function () {
			this.aWrongHandlingUnit = [];
			this.setModel(Drop.init(), "local");
			this.getErrorMessagePopover().setModel(Drop.init());
		},
		/**
		 * callback function when entered the page
		 * 
		 * @override
		 * @param {object} oParameter route parameters
		 */
		onRouteMatched: function (oParameter) {
			this.toggleButtonStatus(false);
			Drop.clearData();
			OData
				.getDropData(oParameter.warehouseOrder, OData.getWarehouseNumber())
				.then(function (aResult) {
					var aLayoutData = aResult[0];
					var aGroup = aResult[1];
					var aTask = aResult[2];
					if (aLayoutData !== null) {
						PickCartLayout.setData(aLayoutData);
					}
					if (aGroup.length > 0) {
						Drop.setData(aGroup, aTask);
						PickCartLayout.setStatusForDroppingByIds(Drop.getAllPositions(), Const.HU_STATUS_DROP.VALID);
						this.moveFocus();
					} else {
						this.showNoHandlingUnitMessage();
					}
					this.setBusy(false);
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onDestBinChange: function (oEvent) {
			var sValue = Util.trim(oEvent.getParameter("newValue"));
			sValue = sValue.toUpperCase();
			var sOriginalBin = Drop.getCurrentExpectedBin();
			if (!Util.isEmpty(sValue)) {
				var oVerifyPromise = OData.verifySourceBin(sOriginalBin, sValue);
				this.verify(oVerifyPromise, sBinId, function onSuccess() {
					this.setInputValue(sBinId, sOriginalBin);
				}.bind(this), function onError() {
					this.toggleButtonStatus(false);
				}.bind(this));
			} else {
				this.toggleButtonStatus(false);
				this.updateInputWithDefault(sBinId, "");
				this.focusTo(sBinId);
			}
		},

		onDestHandlingUnitChange: function (oEvent) {
			var that = this;
			var sValue = Util.trim(oEvent.getParameter("newValue"));
			sValue = sValue.toUpperCase();
			this.setBusy(true);
			OData.convertHUID(sValue)
				.then(function (oResult) {
					this.setBusy(false);
					sValue = oResult.Huident;
					var aPositionInfo;
					var oVerifyPromise = new Promise(function (resolve, reject) {
						aPositionInfo = this.transformDestHUInput(sValue);
						var sPositionId = aPositionInfo[1];
						if (!aPositionInfo) {
							reject();
						} else if (this.isValidPosition(sPositionId)) {
							resolve(sPositionId);
						} else {
							reject(aPositionInfo);
						}
					}.bind(this));

					function verifyDestHU() {
						that.verify(oVerifyPromise, sHandlingUnitId, function onSuccess(sPosition) {
							that.fixWrongHandlingUnit();
							that.setInputValue(sHandlingUnitId, sValue);
						}, function onError(aPosition) {
							if (aPosition) {
								var sHandlingUnit = aPosition[0];
								var sPosition = aPosition[1];
								if (sHandlingUnit !== undefined) {
									that.aWrongHandlingUnit.push(sPosition);
									PickCartLayout.setStatusForDroppingByIds([sPosition], Const.HU_STATUS_DROP.WRONG);
								}
							}
						});
					}

					if (!Util.isEmpty(sValue)) {
						oVerifyPromise
							.then(function onSuccess(sPosition) {
								if (that.isAllTaskOfGroupFinished()) {
									var sSplittingHUs = Drop.getHandlingUnitsWithSplitting();
									var sOriginalBin = Drop.getCurrentExpectedBin();
									if (!Util.isEmpty(sSplittingHUs)) {
										var sWarningMsg = that.getI18nText("unloadingWithSplittingMsg", [sSplittingHUs, sOriginalBin]);
										MessageBox.warning(sWarningMsg, {
											onClose: verifyDestHU
										});
										that.playAudio(Const.WARNING);
									} else {
										verifyDestHU();
									}
								} else {
									verifyDestHU();
								}
							}, function onError() {
								verifyDestHU();
							});
					}
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));

		},

		onDropAll: function () {
			var sSplittingHUs = Drop.getHandlingUnitsWithSplitting();
			var sOriginalBin = Drop.getCurrentExpectedBin();
			if (!Util.isEmpty(sSplittingHUs)) {
				var sWarningMsg = this.getI18nText("unloadingWithSplittingMsg", [sSplittingHUs, sOriginalBin]);
				MessageBox.warning(sWarningMsg, {
					onClose: this.afterDropAll.bind(this)
				});
				this.playAudio(Const.WARNING);
			} else {
				this.afterDropAll();
			}
		},

		afterDropAll: function () {
			this.fixWrongHandlingUnit();
			this.toggleButtonStatus(false);
			var aConfirmData = Drop.getConfirmData();
			var aTask = aConfirmData[0];
			var sConfirmMode = aConfirmData[1];
			if (aTask && aTask.length > 0) {
				this.aPositionsToConfirm = Drop.getPositionsOfCurrentGroup();
				this.confirmTask(OData.submitTasksInBatch(aTask, sConfirmMode), function (aResult) {
					if (this.isConfirmSuccess(aResult)) {
						Drop.finishCurrentGroup();
					}
				}.bind(this));
			}
		},
		/**
		 * check if  confrim really succed. as there is a Failed flag even response is 200
		 * 
		 * @param {array} aResult The confirm request
		 * @return {bool} bSuccess true if confirm succed, otherwise false
		 */
		isConfirmSuccess: function (aResult) {
			var bSuccess = true;
			Util.find(aResult, function (oItem) {
				if (oItem.Failed === "X") {
					bSuccess = false;
					return true;
				}
				return false;
			});
			return bSuccess;
		},
		/**
		 * The method of confirm task.
		 * 
		 * @public override
		 * @param {Promise} oPromise optional The confirm promise
		 * @param {function} fnConfirmSuccess optional The callback function 
		 * @param {function} fnConfirmError optional The callback function 
		 */
		confirmTask: function (oPromise, fnConfirmSuccess, fnConfirmError) {
			this.setBusy(true);
			var oConfirmPromise;
			if (oPromise) {
				oConfirmPromise = oPromise;
			} else {
				oConfirmPromise = this.getConfirmPromise();
			}

			oConfirmPromise
				.then(function (aResult) {
					var sId = this.aManualInput[this.aManualInput.length - 1].id;
					this.updateInputWithDefault(sId, "");
					if (this.isConfirmSuccess(aResult)) {
						PickCartLayout.setStatusForDroppingByIds(this.aPositionsToConfirm, Const.HU_STATUS_DROP.INVALID);
						if (fnConfirmSuccess) {
							fnConfirmSuccess(aResult);
						}
						this.onConfirmSuccess(aResult);
					} else {
						PickCartLayout.setStatusForDroppingByIds(this.aPositionsToConfirm, Const.HU_STATUS_DROP.WRONG);
						this.aPositionsToConfirm.forEach(function (sPosition) {
							Drop.updateTaskConfirmStatusByPosition(sPosition, Const.TASK_STATUS.INITIAL);
						});
					}
					this.setErrorsFromConfirmResult(aResult, Drop);
					this.setBusy(false);
					this.playAudio(Const.INFO);
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},
		/**
		 * show no handling unit to load message
		 */
		showNoHandlingUnitMessage: function () {
			var sText = this.getI18nText("noHandlingUnitUnloadMessage", Global.getWONumber());
			MessageBox.warning(sText, {
				onClose: this.onDropFinish.bind(this),
				textDirection: sap.ui.core.TextDirection.Inherit
			});
		},

		/**
		 * enable cart interaction mode when group header information scanned correctly.highlight cart position/enable drop all.
		 * 
		 * @public override
		 */
		enableCartInteraction: function () {
			var aPositionIds = Drop.getPositionsOfCurrentGroup();
			PickCartLayout.setStatusForDroppingByIds(aPositionIds, Const.HU_STATUS_DROP.NEED_DROP);
			this.toggleButtonStatus(true);
		},
		/**
		 * get the confirm promise for drop
		 * 
		 * @protected override
		 * @return {Promise} The confirm promise object
		 */
		getConfirmPromise: function () {
			var sInput = this.getInputValue(sHandlingUnitId);
			//suppose the input verification passed.
			var aHandlingUnitAndPosition = this.transformDestHUInput(sInput);
			var sHandlingUnit = aHandlingUnitAndPosition[0];
			var sPosition = aHandlingUnitAndPosition[1];
			var aTaskNeedConfirmed = Drop.getConfirmDataByHU(sHandlingUnit);
			var aTask = aTaskNeedConfirmed[0];
			var sConfirmMode = aTaskNeedConfirmed[1];
			this.aPositionsToConfirm = [sPosition];
			if (this.isAllTaskOfGroupFinished()) {
				var aTasksWithEmptyPosition = Drop.getConfirmDataForEmptyPosition();
				aTask = aTask.concat(aTasksWithEmptyPosition);
			}
			return OData
				.submitTasksInBatch(aTask, sConfirmMode);
		},
		/**
		 * determine if all the tasks in the current group is done or not
		 * 
		 * @public override
		 * @return {bool} bFinished true, if all tasks of the current group is done. otherwise false.
		 */
		isAllTaskOfGroupFinished: function () {
			var bFinished = true;
			bFinished = Drop.isReadyToNextGroup();
			return bFinished;
		},
		/**
		 * determine if all the tasks in the current group is done or not
		 * 
		 * @public interface
		 * @return {bool} bFinished true, if all tasks of the current group is done. otherwise false.
		 */
		isAllGroupFinished: function () {
			var bFinished = false;
			if (Drop.isLastGroup()) {
				bFinished = true;
			}
			return bFinished;
		},
		/**
		 * go to next group.
		 * 
		 * @public override
		 */
		goToNextGroup: function () {
			Drop.goToNextGroup();
			this.toggleButtonStatus(false);
		},
		/**
		 * go to next task 
		 * 
		 * @public override
		 */
		goToNextTask: function () {
			Drop.updateTaskProgress();
			this.focusTo(sHandlingUnitId);
		},
		/**
		 * go to next stage. the stages includes: connection, picking, dropping, or warehouse order list page
		 * 
		 * @public override
		 */
		goToNextStage: function () {
			this.onDropFinish();
		},
		/**
		 * Update all Wrong HU to Open position, then clear the wrong list
		 */
		fixWrongHandlingUnit: function () {
			if (this.aWrongHandlingUnit.length > 0) {
				PickCartLayout.setStatusForDroppingByIds(this.aWrongHandlingUnit, Const.HU_STATUS_DROP.VALID);
				this.aWrongHandlingUnit = [];
			}
		},

		transformDestHUInput: function (sInput) {
			var sDestHU;
			var sLogicalPosition;
			var aAllDestHUs = Drop.getAllDestHUs();
			if (Util.includes(aAllDestHUs, sInput)) {
				sDestHU = sInput;
				sLogicalPosition = Drop.getPositionIdByHU(sInput);
				return [sDestHU, sLogicalPosition];
			} else if ((sLogicalPosition = PickCartLayout.getPositionByLable(sInput)) !== undefined) {
				sDestHU = Drop.getDestHUByPositionId(sLogicalPosition);
				return [sDestHU, sLogicalPosition];
			}
		},
		isValidPosition: function (sPositionId) {
			var bValide = false;
			var aPositions = Drop.getPositionsOfCurrentGroup();
			if (Util.includes(aPositions, sPositionId) && PickCartLayout.getDropingStatusById(sPositionId) === Const.HU_STATUS_DROP.NEED_DROP) {
				bValide = true;
			}
			return bValide;
		},
		toggleButtonStatus: function (bEnable) {
			this.byId("dropAllButton").setEnabled(bEnable);
		},

		formatPositionIcon: function (sStatus) {
			var lengend = Const.HU_STATUS_DROP;
			var sIcon = "";
			switch (sStatus) {
			case lengend.INVALID:
				sIcon = "";
				break;
			case lengend.VALID:
				sIcon = "sap-icon://add-product";
				break;
			case lengend.NEED_DROP:
				sIcon = "sap-icon://less";
				break;
			case lengend.WRONG:
				sIcon = "sap-icon://decline";
				break;
			}
			return sIcon;
		},
		formatPositionType: function (sStatus) {
			var lengend = Const.HU_STATUS_DROP;
			var sType = "Transparent";
			switch (sStatus) {
			case lengend.INVALID:
				sType = "Transparent";
				break;
			case lengend.VALID:
				sType = "Default";
				break;
			case lengend.NEED_DROP:
				sType = "Emphasized";
				break;
			case lengend.DROPPED:
				sType = "Accept";
				break;
			case lengend.WRONG:
				sType = "Reject";
				break;
			}
			return sType;
		},
		formatProgressPercentValue: function (iProgress, aHandlingUnits) {
			if (aHandlingUnits.length > 0) {
				return iProgress * 100 / aHandlingUnits.length;
			}
			return 0;
		},
		formatProgressDisplayValue: function (iProgress, aHandlingUnits) {
			return iProgress + "/" + aHandlingUnits.length;
		},
		formatPositionEnabled: function (iStatus) {
			var bEnable = true;
			if (iStatus === Const.HU_STATUS_DROP.INVALID) {
				bEnable = false;
			}
			return bEnable;
		},

		/**
		 * navigate to the connection page if system-guided mode, otherwise nav to warehouse order list page
		 */
		onDropFinish: function () {
			if (Global.getToLeaveAfterDrop() === true) {
				this.terminateOrder(true, false);
				return;
			}
			var bManual = !Global.isSystemMode();
			this.setBusy(true);
			OData
				.logonResource(bManual)
				.then(function (data) {
					if (data && data.EWMWarehouseOrder !== emptyOrder) {
						Global.setWONumber(data.EWMWarehouseOrder);
						var oNavParamsObj = Util.getNavParamsByStatus(data.PickcartWhoStatus, data, false);
						if (oNavParamsObj.route) {
							Global.setAppProgress(oNavParamsObj.progress);
							this.navTo(oNavParamsObj.route, oNavParamsObj.param);
						}
					} else if (bManual) {
						var sResourceNumber = OData.getResourceNumber();
						var sWarehouseNumber = OData.getWarehouseNumber();
						Global.setWONumber("");
						Global.setAppProgress(1);
						this.navTo("warehouseOrderList", {
							resourceId: sResourceNumber,
							warehouseNumber: sWarehouseNumber
						});
					}
					this.setBusy(false);
				}.bind(this))
				.catch(function (oError) {
					if (!Util.isString(oError) && Util.isJsonString(oError.responseText)) {
						var sErrorCode = JSON.parse(oError.responseText).error.code;
						if (sErrorCode.toUpperCase() === rfErrorCode) {
							// No more available warehouse orders
							var sInfoMsg = this.getI18nText("noWarehouseOrderAvailableMsg");
							MessageBox.information(sInfoMsg);
							this.playAudio(Const.INFO);
						} else if (sErrorCode.toUpperCase() === pbC24ErrorCode) {
							// Documentory batches not supported  
							var sInfoMsg = this.getI18nText("documentaryBatchesNotSupportedMsg");
							MessageBox.information(sInfoMsg);
							this.playAudio(Const.INFO);
						} else {
							this.playAudio(Const.ERROR);
						}
					} else {
						this.playAudio(Const.ERROR);
					}
					this.setBusy(false);
				}.bind(this));
		}
	});
});