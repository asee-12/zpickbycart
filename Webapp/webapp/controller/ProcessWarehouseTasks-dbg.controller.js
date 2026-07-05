/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"scm/ewm/pickcarts1/controller/Base.controller",
	"scm/ewm/pickcarts1/model/OData",
	"scm/ewm/pickcarts1/model/Global",
	"scm/ewm/pickcarts1/model/ProcessWarehouseTasks",
	"scm/ewm/pickcarts1/model/SerialNumber",
	"scm/ewm/pickcarts1/model/PickCartLayout",
	"scm/ewm/pickcarts1/utils/Const",
	"sap/ui/core/ValueState",
	"scm/ewm/pickcarts1/utils/Util"
], function (Controller, ODataHelper, Global, ProcessWarehouseTasks, SerialNumber, PickCartLayout, Const, ValueState, Util) {
	"use strict";
	var sourceBinId = "source-bin-input";
	var sourceHUId = "source-hu-input";
	var productId = "product-input";
	var batchId = "batch-editable-input";
	var destHUId = "dest-hu-input";
	var serialNumberIconId = "id-serial-number";
	var serialNumberInputId = "id-input-serialNumber";
	var serialNumberForLowQtyCheckInputId = "lowQtyCheck--id-input-serialNumber";
	var serialNumberForQtyAdjustmentId = "quantityAdjustment--id-input-serialNumber";
	var splitOKButtonId = "splitting-ok-btn";

	return Controller.extend("scm.ewm.pickcarts1.controller.ProcessWarehouseTasks", {
		sRouteName: "processTasks",
		aManualInput: [{
			id: sourceBinId
		}, {
			id: sourceHUId
		}, {
			id: productId
		}, {
			id: batchId
		}, {
			id: destHUId
		}],
		oDestHU: {},
		bInitException: true,
		init: function () {
			this.setModel(ProcessWarehouseTasks.init(), "local");

			this.getErrorMessagePopover().setModel(ProcessWarehouseTasks.init());
			this.setModel(SerialNumber.init(), "serialNum");
			this.aWrongPositions = [];
		},

		onRouteMatched: function (oParameter) {
			ProcessWarehouseTasks.clearData();
			this.resetSerialNumber();
			ODataHelper
				.getPickingData(oParameter.warehouseOrder, ODataHelper.getWarehouseNumber())
				.then(function (aResult) {
					var aLayoutData = aResult[0];
					var aGroupData = aResult[1];
					var aTaskData = aResult[2];
					PickCartLayout.setData(aLayoutData);

					ProcessWarehouseTasks.setTaskGroups(aGroupData, aTaskData);
					this.initCartStatus(ProcessWarehouseTasks.getAllTasks());
					this.buildGroupHeaderInputConfig();
					if (this.bInitException) {
						ODataHelper
							.getExceptions()
							.then(function (oResult) {
								ProcessWarehouseTasks.setExceptions(oResult);
								this.initExceptionButtons();
								this.bInitException = false;
							}.bind(this))
							.catch(function () {
								this.playAudio(Const.ERROR);
							}.bind(this));
					}
					this.moveFocus();
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},
		/**
		 * regenreate the group input header(aManualInput) based on model information.
		 *
		 * @public override
		 */
		buildGroupHeaderInputConfig: function () {
			if (ProcessWarehouseTasks.isSourceHandlingUnitMandatory()) {
				this.aManualInput[1].bOptional = false;
			} else {
				this.aManualInput[1].bOptional = true;
			}

			if (ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup()) {
				this.getStock();
			}

		},

		getStock: function () {
			var product = ProcessWarehouseTasks.getProductOfCurrentGroup();
			var sourceBin = ProcessWarehouseTasks.getSourceBinOfCurrentGroup();
			this.setBusy(true);
			ODataHelper
				.verifySourceBinWithStock(sourceBin, product)
				.then(function (oResult) {
					ProcessWarehouseTasks.setStocksOfCurrentGroup(oResult);
					if (!ProcessWarehouseTasks.isSourceBinPickable()) {
						//source bin does not have stock, then the hu should be mandatory.
						this.setSourceHUMandatory();
					}
					this.setBusy(false);
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		/**
		 * triggered when source bin changed. should consider two cases: with/without multisource handling unit
		 *
		 * @param {sap.ui.base.Event} oEvent The Input change event
		 */
		onSourceBinChange: function (oEvent) {
			var sInputValue = Util.trim(oEvent.getParameter("newValue"));
			sInputValue = sInputValue.toUpperCase();
			if (Util.isEmpty(sInputValue)) {
				this.updateInputWithDefault(sourceBinId, "");
				ProcessWarehouseTasks.disableException();
				this.focusTo(sourceBinId);
			} else {
				var sourceBin = ProcessWarehouseTasks.getSourceBinOfCurrentGroup();
				var oVerifyPromise;
				oVerifyPromise = ODataHelper
					.verifySourceBin(sourceBin, sInputValue);
				this.verify(oVerifyPromise, sourceBinId, function onSuccess(oResult) {
					this.setInputValue(sourceBinId, sourceBin);
					if (!ProcessWarehouseTasks.isSerialNumberEnabled() || SerialNumber.getSerialNumberCount() === 0) {
						ProcessWarehouseTasks.setFullDenialEnable(true);
					}
				}.bind(this), function onError(oResult) {
					ProcessWarehouseTasks.disableException();
				});
			}
		},

		/**
		 * Triggered when source HU changed
		 *
		 * @param {sap.ui.base.Event} oEvent The input change event
		 */
		onSourceHUChange: function (oEvent) {
			var newValue = Util.trim(oEvent.getParameter("newValue"));
			newValue = newValue.toUpperCase();
			var sSourceHUInit = ProcessWarehouseTasks.getSourceHUInitValue();
			var bMultiSourceHU = ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup();
			var oVerifyPromise;

			if (bMultiSourceHU) {
				this.clearFollowingFields(sourceHUId);
				this.resetSerialNumber();
			}

			if (Util.isEmpty(newValue)) {
				this.updateInputWithDefault(sourceHUId, "");
				if (bMultiSourceHU && ProcessWarehouseTasks.isSourceBinPickable()) {
					ProcessWarehouseTasks.setSourceHU("");
					this.moveFocus(sourceHUId);
				} else {
					this.focusTo(sourceHUId);
				}
			} else {
				this.setBusy(true);
				ODataHelper.convertHUID(newValue)
					.then(function (oResult) {
						this.setBusy(false);
						newValue = oResult.Huident;
						if (bMultiSourceHU) {
							newValue = Util.removeLeadingZeroinNumeric(newValue);
							oVerifyPromise = this.verifySourceHUForMulitHU(newValue);
						} else {
							oVerifyPromise = ODataHelper.verifySourceHU(sSourceHUInit, newValue);
						}

						this.verify(oVerifyPromise, sourceHUId, function onSuccess() {
							ProcessWarehouseTasks.setSourceHU(newValue);
							this.setInputValue(sourceHUId, newValue);
						}.bind(this), function onFail() {
							ProcessWarehouseTasks.setSourceHU("");
						});
					}.bind(this))
					.catch(function () {
						this.setBusy(false);
						this.playAudio(Const.ERROR);
					}.bind(this));
			}
		},

		verifySourceHUForMulitHU: function (newValue) {
			var valid = false;
			if (ProcessWarehouseTasks.isSourceHuPickable(newValue)) {
				valid = true;
			}
			return this.createPromise(valid);
		},

		createPromise: function (success) {
			var promise;
			if (success) {
				promise = new Promise(function (resolve, reject) {
					resolve();
				});
			} else {
				promise = new Promise(function (resolve, reject) {
					reject();
				});
			}
			return promise;
		},

		/**
		 * handle the event press enter key: if the value is empty and is optional, move focus to next field
		 *
		 * @param {sap.ui.base.Event} oEvent The enter key event
		 */
		onSourceHUSubmit: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("value"));
			var oInput = oEvent.getSource();
			if (Util.isEmpty(sInput)) {
				if (ProcessWarehouseTasks.isSourceBinPickable()) {
					ProcessWarehouseTasks.setSourceHU("");
					this.updateInputWithDefault(sourceHUId, "");
					this.moveFocus(sourceHUId);
				} else {
					oInput.setValueState(ValueState.Error);
					oInput.focus();
				}
			} else if (oInput.getValueState() === ValueState.Success) {
				this.moveFocus();
			}
		},

		onBatchChange: function (oEvent) {
			var newValue = Util.trim(oEvent.getParameter("newValue"));
			newValue = newValue.toUpperCase();
			var sProduct = ProcessWarehouseTasks.getProductOfCurrentGroup();
			var sSourceBin = ProcessWarehouseTasks.getSourceBinOfCurrentGroup();
			var sSourceHU = ProcessWarehouseTasks.getSourceHUOfCurrentGroup();
			var sBatchInit = ProcessWarehouseTasks.getBatchInitValue();
			var bMultiSourceHU = ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup();
			var oVerifyPromise;
			if (Util.isEmpty(newValue)) {
				this.updateInputWithDefault(batchId, "");
				this.focusTo(batchId);
			} else {
				if (bMultiSourceHU) {
					// Only if sBatchInit has no leading zeroes and is not empty, batch conversion exit might exist
					// -> remove leading zeroes **/
					if (sBatchInit.substr(1,1) !== "0" && sBatchInit !== "") {
					  newValue = Util.removeLeadingZeroinNumeric(newValue);
					}
					oVerifyPromise = this.verifyBatchForMulitHU(sSourceHU, sBatchInit, newValue);
				} else {
					oVerifyPromise = ODataHelper.verifyBatch(sBatchInit, newValue, sProduct, sSourceBin);
				}
				this.verify(oVerifyPromise, batchId, function onSuccess() {
					ProcessWarehouseTasks.setBatchNo(newValue);
					this.setInputValue(batchId, newValue);
				}.bind(this));
			}
		},

		verifyBatchForMulitHU: function (sourceHu, sBatchInit, batchInput) {
			var valid = false;
			if (!Util.isEmpty(sBatchInit) && sBatchInit === batchInput) {
				valid = true;
			} else
			if (Util.isEmpty(sBatchInit) && ProcessWarehouseTasks.IsBatchWithStock(sourceHu, batchInput)) {
				valid = true;
			}
			return this.createPromise(valid);
		},

		onProductChange: function (oEvent) {
			var sInputValue = Util.trim(oEvent.getParameter("newValue"));
			sInputValue = sInputValue.toUpperCase();
			var sProduct = ProcessWarehouseTasks.getProductOfCurrentGroup();
			var oVerifyPromise;
			if (Util.isEmpty(sInputValue)) {
				this.updateInputWithDefault(productId, "");
				this.focusTo(productId);
			} else {
				oVerifyPromise = ODataHelper
					.verifyProduct(sProduct, sInputValue);
				this.verify(oVerifyPromise, productId, function onSuccess() {
					this.setInputValue(productId, sProduct);
				}.bind(this));
			}
		},

		getLogicalPositionByHU: function (sHandlingUnit) {
			return ProcessWarehouseTasks.getLogicalPositionByHU(sHandlingUnit);
		},

		getDestHUByPosition: function (sLogicalPosition) {
			return ProcessWarehouseTasks.getDestHUByPosition(sLogicalPosition);
		},

		transformDestHUInput: function (sInput) {
			var sDestHU;
			var sLogicalPosition;
			var aAllDestHUsFromTasks = ProcessWarehouseTasks.getAllDestHUsFromTasks();
			if (Util.includes(aAllDestHUsFromTasks, sInput)) {
				sDestHU = sInput;
				sLogicalPosition = ProcessWarehouseTasks.getPositionFromTasksByHU(sInput);
				return [sDestHU, sLogicalPosition];
			} else if ((sLogicalPosition = PickCartLayout.getPositionByLable(sInput)) !== undefined) {
				sDestHU = ProcessWarehouseTasks.getDestHUFromTasksByPosition(sLogicalPosition);
				return [sDestHU, sLogicalPosition];
			}
		},

		fixWrongPosition: function () {
			var aBackToValidPositions = [];
			if (this.aWrongPositions.length > 0) {
				this.aWrongPositions.forEach(function (sPosition) {
					if (PickCartLayout.getPickingSplitFlagById(sPosition)) {
						PickCartLayout.setStatusForPickingById(sPosition, Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION);
					} else if (ProcessWarehouseTasks.getTaskConfirmStatusByPosition(sPosition)) {
						PickCartLayout.setStatusForPickingById(sPosition, Const.HU_STATUS_PICK.COMPLETED);
					} else {
						aBackToValidPositions.push(sPosition);
					}
				});
				PickCartLayout.setStatusForPickingByIds(aBackToValidPositions, Const.HU_STATUS_PICK.VALID);
				this.aWrongPositions = [];
			}
		},

		onDestHUChange: function (oEvent) {
			var sInputValue = Util.trim(oEvent.getParameter("newValue"));
			sInputValue = sInputValue.toUpperCase();
			this.setBusy(true);
			ODataHelper.convertHUID(sInputValue)
				.then(function (oResult) {
					this.setBusy(false);
					sInputValue = oResult.Huident;
					if (Util.isEmpty(sInputValue)) {
						this.updateInputWithDefault(destHUId, "");
						this.focusTo(destHUId);
					} else {
						//auto open serial num popover if not all serial numbers finished
						if (ProcessWarehouseTasks.isSerialNumberEnabled() && !this.isAllSerialNumberFinished()) {
							var sWarningMsg = this.getI18nText("missSerialNumMsg");
							this.openSerialNumberPopover();
							this.updateSerialNumInput(ValueState.Warning, sWarningMsg, "");
							this.updateInputWithDefault(destHUId, "");
							this.playAudio(Const.WARNING);
							return;
						}
						var oVerifyPromise = this.getVerifyDestHUorPostionPromise(sInputValue);
						this.verify(oVerifyPromise, destHUId, function onSuccess(aPositionInfo) {
							this.fixWrongPosition();
							this.setInputValue(destHUId, sInputValue);
						}.bind(this), function onError(sErrorText) {
							this.updateInputWithError(destHUId, sErrorText);
						}.bind(this));
					}
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},
		/**
		 * get the promise object of verify the dest hu/logical position object
		 *
		 * @param {string} sInput The input value
		 * @return {Promise} The promise object of verify dest hu/logical position field
		 */
		getVerifyDestHUorPostionPromise: function (sInput) {
			var sErrorMsg = this.getI18nText("invalidInput");
			var aPositionInfo = this.getValidPositionAndDestHUByInput(sInput, this.sRouteName);
			var aInvalidePickingPositions, aEmptyPosition;
			return new Promise(function (resolve, reject) {
				if (Util.isEmpty(aPositionInfo)) {
					aPositionInfo = this.transformDestHUInput(sInput);
					aInvalidePickingPositions = PickCartLayout.getInvalidPickingPositions();
					aEmptyPosition = PickCartLayout.getEmptyPositions();
					if (aPositionInfo !== undefined && Util.includes(aInvalidePickingPositions, aPositionInfo[1])) {
						this.aWrongPositions.push(aPositionInfo[1]);
						PickCartLayout.setStatusForPickingById(aPositionInfo[1], Const.HU_STATUS_PICK.WRONG);
					} else if (aPositionInfo !== undefined && Util.includes(aEmptyPosition, aPositionInfo[1])) {
						sErrorMsg = this.getI18nText("invalidPositionMsg");
					}
					reject(sErrorMsg);
				} else {
					resolve(aPositionInfo);
				}
			}.bind(this));
		},
		
		onBringHUToDestinationBeforeLeave: function(){
          this.goToDropping();
          Global.setToLeaveAfterDrop(true);
          this.closeBringHUToDestinationDialog();
        },
        
         onShowTerminationDialog  :  function(){
             var oDialog = this.getTerminationDialog();
				oDialog.open();
			this.closeBringHUToDestinationDialog();
        },
 
		/**
		 * confirm task, will call when all group header field passed verification. triggerrd when dest hu/postion field changed and passed verification
		 *
		 * @public override
		 */
		confirmTask: function () {
			var bMultiSourceHU = ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup();
			var sInput = this.getInputValue(destHUId);
			var aPositionInfo = this.transformDestHUInput(sInput);
			var sDestHU = aPositionInfo[0];
			var sLogicalPosition = aPositionInfo[1];
			if (bMultiSourceHU) {
				this.confirmTaskForMultisourceHU(sDestHU, sLogicalPosition);
			} else {
				this.confirmTaskForNormal(sDestHU, sLogicalPosition);
			}
		},

		getConfirmData: function (sDestHandlingUnit, aSeparateTasks) {
			var aConfirmInfo = [];
			var aSerialTasks = [];
			aConfirmInfo = ProcessWarehouseTasks.getConfirmData(sDestHandlingUnit, aSeparateTasks);
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				var aSerialNumbers = SerialNumber.getSerialNumbers();
				aSerialTasks = ProcessWarehouseTasks.getConfirmTasksWithSerialNumber(aConfirmInfo[0], aSerialNumbers);
			}
			aConfirmInfo.push(aSerialTasks);
			return aConfirmInfo;
		},

		getConfirmDataForMultipleSourceHU: function (sDestHandlingUnit) {
			var aConfirmInfo = [];
			var aSerialTasks = [];
			aConfirmInfo = ProcessWarehouseTasks.getConfirmDataForMultipleSourceHU(sDestHandlingUnit);
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				var aSerialNumbers = SerialNumber.getSerialNumbers();
				aSerialTasks = ProcessWarehouseTasks.getConfirmTasksWithSerialNumber(aConfirmInfo[0], aSerialNumbers);
			}
			aConfirmInfo.push(aSerialTasks);
			return aConfirmInfo;
		},

		confirmTaskForNormal: function (sDestHandlingUnit, sLogicalPosition) {
			this.setBusy(true);
			var aConfirmInfo = this.getConfirmData(sDestHandlingUnit);
			ODataHelper
				.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1], aConfirmInfo[2])
				.then(function (aResults) {
					//todo can simplify
					if (ProcessWarehouseTasks.isAllConfirmSuccess(aResults)) {
						if (ProcessWarehouseTasks.needLowQuantityCheck(aResults)) {
							this.oDestHU = {
								sDestHU: sDestHandlingUnit,
								sLogicalPosition: sLogicalPosition
							};
							this.openLowQuantityCheckDialog();
						} else {
							this.navToNextTaskOrDropping(sDestHandlingUnit, sLogicalPosition);
						}
						this.playAudio(Const.INFO);
					} else {
						PickCartLayout.setStatusForPickingById(sLogicalPosition, Const.HU_STATUS_PICK.WRONG);
						this.updateInputWithDefault(destHUId, "");
						this.focusTo(destHUId);
						this.playAudio(Const.ERROR);
					}
					this.setErrorsFromConfirmResult(aResults, ProcessWarehouseTasks);
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		confirmTaskForMultisourceHU: function (sDestHandlingUnit, sLogicalPosition) {
			var oCurrentTaskGroup = ProcessWarehouseTasks.getCurrentTaskGroup();
			var pickQty = oCurrentTaskGroup.currentPickQty;
			this.setBusy(true);
			var aConfirmInfo = this.getConfirmDataForMultipleSourceHU(sDestHandlingUnit);
			ODataHelper
				.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1], aConfirmInfo[3])
				.then(function (aResult) {
					if (ProcessWarehouseTasks.isAllConfirmSuccess(aResult)) {
						if (ProcessWarehouseTasks.isFinishedPickingOfTask() && ProcessWarehouseTasks.needLowQuantityCheck(aResult)) { // if low quantity check needed
							this.oDestHU = {
								sDestHU: sDestHandlingUnit,
								sLogicalPosition: sLogicalPosition
							};
							this.openLowQuantityCheckDialog();
						} else {
							this.completeOneSourceHUPicking(sLogicalPosition, pickQty, aConfirmInfo[0], aConfirmInfo[2]);
						}
						this.playAudio(Const.INFO);
					} else {
						PickCartLayout.setStatusForPickingById(sLogicalPosition, Const.HU_STATUS_PICK.WRONG);
						this.updateInputWithDefault(destHUId, "");
						this.playAudio(Const.ERROR);
					}
					this.setErrorsFromConfirmResult(aResult, ProcessWarehouseTasks);
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		navToNextTaskOrDropping: function (sDestHU, sLogicalPosition) {
			ProcessWarehouseTasks.updateTasksConfirmStatusByHU(sDestHU);
			PickCartLayout.setStatusForPickingById(sLogicalPosition, Const.HU_STATUS_PICK.COMPLETED);
			ProcessWarehouseTasks.updatePickingTaskProgress(sDestHU);
			this.updateInputWithDefault(destHUId, "");
			this.focusTo(destHUId);
			this.proceedAfterFinishOneTask();
		},

		proceedAfterFinishOneTask: function () {
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.resetSerialNumber();
			}
			if (ProcessWarehouseTasks.isAllWarehouseTasksReadyInOneGroup()) {
				ProcessWarehouseTasks.updatePickingTaskGroupProgress();
				if (ProcessWarehouseTasks.isAllGroupFinished()) {
					this.goToNextGroup();
				} else {
					this.goToDropping();
				}
			} else if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.updateCartStatusForSerialManaged();
				ProcessWarehouseTasks.enableException();
				ProcessWarehouseTasks.setFullDenialEnable(true);
				this.enableSerialNumberIcon();
				this.openSerialNumberPopover();
			}
		},

		/**
		 * @param {string} sLogicalPostiion The logicalPosition of current confrim dest hu
		 * @param {integer} iPickQuantity The picked quantity to confirm
		 * @param {array} aConfirmTasks The tasks to confirm, include all normal confirm tasks
		 * and may have partial confrim task as the last element
		 * @param {object} oUpdateTask The task that is partial confirm
		 */
		completeOneSourceHUPicking: function (sLogicalPostiion, iPickQuantity, aConfirmTasks, oUpdateTask) {
			PickCartLayout.setStatusForPickingById(sLogicalPostiion, Const.HU_STATUS_PICK.VALID);
			var bFinished = ProcessWarehouseTasks.isFinishedPickingOfTask();
			ProcessWarehouseTasks.updataCurrentActualQuantity(iPickQuantity);
			ProcessWarehouseTasks.updateCurrentStock(iPickQuantity);
			if (!ProcessWarehouseTasks.isSourceBinPickable()) {
				this.setSourceHUMandatory();
			}
			if (oUpdateTask !== undefined && oUpdateTask.quantity !== 0) {
				aConfirmTasks.pop();
				if (aConfirmTasks.length > 0) {
					ProcessWarehouseTasks.updatePickingTaskProgressForMulti(aConfirmTasks);
					ProcessWarehouseTasks.updateTasksConfirmStatus(aConfirmTasks);
				}
				ProcessWarehouseTasks.updateTaskByTaskItem(oUpdateTask);
			} else {
				ProcessWarehouseTasks.updatePickingTaskProgressForMulti(aConfirmTasks);
				ProcessWarehouseTasks.updateTasksConfirmStatus(aConfirmTasks);
			}
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.resetSerialNumber();
			}
			if (bFinished) {
				this.proceedAfterFinishOneTask();
			} else {
				this.initializeNextSourceHUPicking();
			}
		},

		initializeNextSourceHUPicking: function () {
			this.updateInputWithDefault(sourceHUId, "");
			this.updateInputWithDefault(productId, "");
			this.updateInputWithDefault(batchId, "");
			this.updateInputWithDefault(destHUId, "");
			ProcessWarehouseTasks.setCurrentPickQuantity(0);
			ProcessWarehouseTasks.disableException();

			ProcessWarehouseTasks.setSourceHU("");

			this.focusTo(sourceHUId);
		},

		setSourceHUMandatory: function () {
			this.aManualInput[1].bOptional = false;
			ProcessWarehouseTasks.setSourceHandlingUnitMandatory(true);
		},

		/**
		 * go to next task group
		 */
		goToNextGroup: function () {
			ProcessWarehouseTasks.updateCurrentTaskGroup();
			this.initCartStatus(ProcessWarehouseTasks.getAllTasks());
			ProcessWarehouseTasks.disableException();

			this.updateInputWithDefault(sourceBinId, "");
			this.updateInputWithDefault(sourceHUId, "");
			this.updateInputWithDefault(productId, "");
			this.updateInputWithDefault(batchId, "");
			this.updateInputWithDefault(destHUId, "");

			this.moveFocus();
			this.buildGroupHeaderInputConfig();
		},

		goToDropping: function (oEvent) {
			Global.setAppProgress(4);
			this.navTo("dropHandlingUnit", {
				warehouseOrder: Global.getWONumber(),
				warehouseNumber: ODataHelper.getWarehouseNumber()
			});
			ProcessWarehouseTasks.clearData();
		},

		onPressException: function (oEvent) {
			var oEventObject = oEvent.getSource().getBindingContext("local").getObject();
			var oExceptionType = Const.EXCEPTION_TYPE;
			var sName = oEventObject.InternalProcessCode;
			ProcessWarehouseTasks.setExceptionCode(oEventObject.WarehouseTaskExceptionCode);
			switch (sName) {
			case oExceptionType.BIDF:
				this.openFullDenialDialog();
				break;
			case oExceptionType.BIDP:
				this.openPartialDenialDialog();
				break;
			case oExceptionType.SPLT:
				this.openSplittingFromDialog();
				break;
			case oExceptionType.DIFF:
				this.openDifferenceDenialDialog();
				break;
			}
		},

		isExceptionDestHUValid: function (sDestHU) {
			var aTasks = ProcessWarehouseTasks.getCurrentTaskGroup().tasks;
			var bValid = false;
			var oResult = Util.find(aTasks, function (oTask) {
				var sPosition = ProcessWarehouseTasks.getLogicalPositionByHU(oTask.destHU);
				if (oTask.destHU === sDestHU && !Util.isEmpty(sPosition) && PickCartLayout.getPickingStatusById(oTask.logicalPosition) === Const
					.HU_STATUS_PICK
					.NEED_MATERIAL) {
					return true;
				}
				return false;
			});
			if (oResult) {
				bValid = true;
			}
			return bValid;
		},

		onCancelDialog: function (oEvent) {
			oEvent.getSource().getParent().close();
			ProcessWarehouseTasks.clearExceptionInfo();
		},

		onPartialDenialDestHUChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameters().newValue);
			sInput = sInput.toUpperCase();
			this.setBusy(true);
			ODataHelper.convertHUID(sInput)
				.then(function (oResult) {
					this.setBusy(false);
					sInput = oResult.Huident;
					this.setInputValue("partialDenial-destHU-input", sInput);
					var sPickedQuantity = ProcessWarehouseTasks.getExceptionPickedQuantity();
					var iPickedQuantity;
					var aPositionInfo = this.getValidPositionAndDestHUByInput(sInput, this.sRouteName);
					var sDestHU;
					if (aPositionInfo !== undefined) {
						sDestHU = aPositionInfo[0];
						ProcessWarehouseTasks.setExceptionDestHU(sDestHU);
						ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.VALID);
						this.focusTo("partialDenial-quantity-input");
						if (!Util.isEmpty(sPickedQuantity)) {
							iPickedQuantity = Number(sPickedQuantity);
							if (iPickedQuantity >= ProcessWarehouseTasks.getTaskQuantityByDestHU(sDestHU)) {
								ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
								this.setInputValue("partialDenial-quantity-input", "");
								this.focusTo("partialDenial-quantity-input");
								this.playAudio(Const.ERROR);
							} else {
								ProcessWarehouseTasks.setExceptionPickedQuantity(iPickedQuantity.toString());
								ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.VALID);
							}
						}
					} else {
						ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
						this.setInputValue("partialDenial-destHU-input", "");
						this.focusTo("partialDenial-destHU-input");
						this.playAudio(Const.ERROR);
					}
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		isQuantityOverflow: function (iQuantity) {
			if (Util.isInteger(iQuantity)) {
				return false;
			} else {
				return iQuantity.toString().split(".")[1].length > 3;
			}
		},

		getExceptionSerialInputId: function () {
			var sExternalCode = ProcessWarehouseTasks.getExceptionCode();
			var sInternalCode = ProcessWarehouseTasks.getInternalExceptionCode(sExternalCode);
			var oExceptionType = Const.EXCEPTION_TYPE;
			switch (sInternalCode) {
			case oExceptionType.BIDP:
				return "partialDenial--id-input-serialNumber";
			case oExceptionType.SPLT:
				return "splitting--id-input-serialNumber";
			case oExceptionType.DIFF:
				return "difference--id-input-serialNumber";
			default:
				return "quantityAdjustment--id-input-serialNumber";
			}

		},

		addSerialNumber: function (sInput, bForTaskPicking) {
			SerialNumber.addSerialNumber(sInput, bForTaskPicking);
			if (bForTaskPicking) {
				if (SerialNumber.getSerialNumberCount() !== 0) {
					ProcessWarehouseTasks.setFullDenialEnable(false);
				}
				if (this.isAllSerialNumberFinished()) {
					ProcessWarehouseTasks.disableException();
				}
			}
		},

		verifyExceptionSerialNumberInput: function (sInput, sInputId) {
			var oPromise = this.getSerialNumberVerifyPromise(sInput);
			oPromise.then(function () {
					var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
					var sPosition = ProcessWarehouseTasks.getPositionFromTasksByHU(sDestHU);
					var fTotalQuantity;
					if (Util.isEmpty(sDestHU)) {
						var fRatio = ProcessWarehouseTasks.getAlternativeUOMRatio();
						fTotalQuantity = fRatio * ProcessWarehouseTasks.getCurrentPickQuantity();
						sDestHU = PickCartLayout.getUnprocessedPositions()[0];
					} else {
						fTotalQuantity = ProcessWarehouseTasks.getTasksBaseQuantityByPosition(sPosition);
					}
					if (SerialNumber.getSerialNumberCount() >= fTotalQuantity - 1) {
						var sErrorMsg = this.getI18nText("serialNumExceedMsg", [sDestHU]);
						this.updateInputWithError(sInputId, sErrorMsg);
						this.focusTo(sInputId);
						this.playAudio(Const.ERROR);
					} else {
						this.addSerialNumber(sInput, true);
						ProcessWarehouseTasks.updateExceptionPickedUoM(SerialNumber.getSerialNumberCount());
						this.updateInputWithDefault(sInputId, "");
						this.focusTo(sInputId);
					}
				}.bind(this))
				.catch(function (sError) {
					this.updateInputWithError(sInputId, sError);
					this.focusTo(sInputId);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onExceptionSerialNumberChange: function (oEvent) {
			var sInputValue = Util.trim(oEvent.getParameter("newValue"));
			sInputValue = sInputValue.toUpperCase();
			var sInputId = this.getExceptionSerialInputId();
			if (Util.isEmpty(sInputValue)) {
				this.updateInputWithDefault(sInputId, "");
				this.focusTo(sInputId);
			} else {
				this.verifyExceptionSerialNumberInput(sInputValue, sInputId);
			}
		},

		onExceptionQuantitySubmit: function (oEvent) {
			var sPickedQuantity = Util.trim(oEvent.getParameter("value"));
			var iPickedQuantity = Number(sPickedQuantity);
			if (this.isQuantityOverflow(iPickedQuantity)) {
				ProcessWarehouseTasks.setExceptionPickedQuantity(ProcessWarehouseTasks.roundQuantity(iPickedQuantity).toString());
				ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.WARNING);
				this.playAudio(Const.WARNING);
			}
		},

		onPartialDenialQuantityChange: function (oEvent) {
			var sPickedQuantity = Util.trim(oEvent.getParameters().newValue);
			// if (!this.isValidNumberInput(sPickedQuantity)) {
			// 	ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
			// 	this.setInputValue("partialDenial-quantity-input", "");
			// 	this.focusTo("partialDenial-quantity-input");
			// 	return;
			// }
			var regex = Const.REGEX_NONNEGATIVE;
			var iPickedQuantity = Number(sPickedQuantity);
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			if (ProcessWarehouseTasks.getExceptionDestHUState() === Const.CONTROL_STATUS.VALID) {
				if (!regex.test(sPickedQuantity) || iPickedQuantity >=
					ProcessWarehouseTasks.getTaskQuantityByDestHU(sDestHU)) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.setInputValue("partialDenial-quantity-input", "");
					this.focusTo("partialDenial-quantity-input");
					this.playAudio(Const.ERROR);
				} else {
					ProcessWarehouseTasks.setExceptionPickedQuantity(iPickedQuantity.toString());
					// this.setInputValue("partialDenial-quantity-input", this.formatNumber(iPickedQuantity));
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.VALID);
				}
			} else {
				if (!regex.test(sPickedQuantity) || iPickedQuantity < 0) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.setInputValue("partialDenial-quantity-input", "");
					this.focusTo("partialDenial-quantity-input");
					this.playAudio(Const.ERROR);
				} else {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.PENDING);
					this.focusTo("partialDenial-destHU-input");
				}
			}
		},

		getQuantityOrSerialNumberState: function (sPosition) {
			var sState;
			var iSerialCount = SerialNumber.getSerialNumberCount();
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				//todo consider base unit
				if (iSerialCount < ProcessWarehouseTasks.getTasksBaseQuantityByPosition(sPosition)) {
					sState = Const.CONTROL_STATUS.VALID;
				} else {
					sState = Const.CONTROL_STATUS.INVALID;
				}
				ProcessWarehouseTasks.setExceptionPickedQuantity(iSerialCount);
				ProcessWarehouseTasks.setExceptionPickedQuantityState(sState);
			} else {
				sState = ProcessWarehouseTasks.getExceptionPickedQuantityState();
			}
			return sState;
		},

		getExceptionPickedQuantity: function () {
			var sPickedQuantity;
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				var fRatio = ProcessWarehouseTasks.getAlternativeUOMRatio();
				var iSerialCount = SerialNumber.getSerialNumberCount();
				sPickedQuantity = ProcessWarehouseTasks.roundQuantity(iSerialCount / fRatio).toString();
				ProcessWarehouseTasks.setExceptionPickedQuantity(sPickedQuantity);
			} else {
				sPickedQuantity = ProcessWarehouseTasks.getExceptionPickedQuantity();
			}
			return sPickedQuantity;
		},

		/**
		 * confirm partial denial. Suppose dest hu & picked quantity are  already passed verification.
		 *
		 * @param {Object} oEvent The event object which triggered by confirm button
		 */
		onPartialOrDifferenceConfirm: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var sDestHUState = ProcessWarehouseTasks.getExceptionDestHUState();
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			var sPosition = ProcessWarehouseTasks.getLogicalPositionByHU(sDestHU);
			var sPickedQuantityState = this.getQuantityOrSerialNumberState(sPosition);

			var aTasks = [];
			var aPositions = [];
			var sPickedQuantity = this.getExceptionPickedQuantity();
			var iPickedQuantity = parseFloat(sPickedQuantity);

			if (!ODataHelper.canConfirmTasks()) {
				return;
			}

			if (sDestHUState === Const.CONTROL_STATUS.VALID && (sPickedQuantityState === Const.CONTROL_STATUS.VALID || sPickedQuantityState ===
					Const.CONTROL_STATUS.WARNING)) {
				var sInternalCode = ProcessWarehouseTasks.getInternalExceptionCode(ProcessWarehouseTasks.getExceptionCode());
				var sDestHUId, sQuantityId;
				if (sInternalCode === Const.EXCEPTION_TYPE.DIFF) {
					sDestHUId = "difference-destHU-input";
					sQuantityId = "difference-quantity-input";
				} else {
					sDestHUId = "partialDenial-destHU-input";
					sQuantityId = "partialDenial-quantity-input";
				}
				if (this.isQuantityOverflow(iPickedQuantity)) {
					ProcessWarehouseTasks.setExceptionPickedQuantity(ProcessWarehouseTasks.roundQuantity(iPickedQuantity).toString());
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.WARNING);
					this.focusTo(sQuantityId);
					this.playAudio(Const.WARNING);
					return;
				}
				oDialog.close();
				this.setBusy(true);
				var aConfirmInfo = this.getConfirmData(sDestHU);
				ODataHelper
					.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1], aConfirmInfo[2])
					.then(function (aResults) {
						aTasks = ProcessWarehouseTasks.getCurrentUnconfirmTasks();
						aPositions = ProcessWarehouseTasks.getAllPositionsFromTasks(aTasks);

						if (ProcessWarehouseTasks.isAllConfirmSuccess(aResults)) {
							ProcessWarehouseTasks.updateTasksConfirmStatus(aTasks);
							PickCartLayout.setNumbersForPickingByIds(aPositions, 0);
							PickCartLayout.setStatusForPickingByIds(aPositions, Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION);
							PickCartLayout.setNumbersForPickingById(sPosition, iPickedQuantity);
							this.processAfterFinishException(aResults);
							this.playAudio(Const.INFO);
						} else {
							PickCartLayout.setStatusForPickingByIds(aPositions, Const.HU_STATUS_PICK.WRONG);
							this.playAudio(Const.ERROR);
						}
						this.setErrorsFromConfirmResult(aResults, ProcessWarehouseTasks);
						SerialNumber.clearData();
						this.setBusy(false);
					}.bind(this))
					.catch(function () {
						oDialog.close();
						SerialNumber.clearData();
						this.setBusy(false);
						this.playAudio(Const.ERROR);
					}.bind(this));
			} else {
				if (sDestHUState === Const.CONTROL_STATUS.EMPTY && sPickedQuantityState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.focusTo(sDestHUId);
				} else if (sDestHUState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
					this.focusTo(sDestHUId);
				} else if (sPickedQuantityState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.focusTo(sQuantityId);
				}
			}
		},

		processAfterFinishException: function (aResults) {
			ProcessWarehouseTasks.updateTaskGroups(aResults);
			ProcessWarehouseTasks.updatePickingTaskProgress();
			ProcessWarehouseTasks.updatePickingTaskGroupProgress();
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.resetSerialNumber();
			}
			if (ProcessWarehouseTasks.isAllGroupFinished()) {
				this.goToNextGroup();
			} else {
				this.goToDropping();
			}
			ProcessWarehouseTasks.clearExceptionInfo();
		},

		openPartialDenialDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("partialDenialDialog");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.PartialDenialDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},

		afterOpenPartialDenial: function () {
			this.initDialogInputs("partialDenial-destHU-input", "partialDenial-quantity-input");
		},

		afterOpenDifference: function () {
			this.initDialogInputs("difference-destHU-input", "difference-quantity-input");
		},

		afterOpenSplitting: function () {
			this.initDialogInputs("splitting-destHU-input", "splitting-quantity-input");
		},

		initDialogInputs: function (sDestHUId, sQuantityId) {
			if (PickCartLayout.getUnprocessedPositions().length === 1) {
				var sDestHU = ProcessWarehouseTasks.getDestHUByPosition(PickCartLayout.getUnprocessedPositions()[0]);
				ProcessWarehouseTasks.setExceptionDestHU(sDestHU);
				ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.VALID);
				this.setInputValue(sDestHUId, sDestHU);
				this.focusTo(sQuantityId);
			} else {
				this.setInputValue(sDestHUId, "");
			}
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.updateExceptionDestHUInput(sDestHUId, true);
				var iSerialNumberCount = SerialNumber.getSerialNumberCount();
				ProcessWarehouseTasks.updateExceptionPickedUoM(iSerialNumberCount);
				var sSerialInputId = this.getExceptionSerialInputId();
				this.updateInputWithDefault(sSerialInputId, "");
				this.focusTo(sSerialInputId);
			} else {
				this.updateInputWithDefault(sQuantityId, "");
				this.updateExceptionDestHUInput(sDestHUId, false);
			}
		},

		onFullDenialConfirm: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var aPositions = [];
			var aTasks = [];
			if (!ODataHelper.canConfirmTasks()) {
				return;
			}
			oDialog.close();
			this.setBusy(true);
			var aConfirmInfo = ProcessWarehouseTasks.getConfirmData();
			ODataHelper
				.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1])
				.then(function (aResult) {
					aTasks = ProcessWarehouseTasks.getCurrentUnconfirmTasks();
					aPositions = ProcessWarehouseTasks.getAllPositionsFromTasks(aTasks);
					if (ProcessWarehouseTasks.isAllConfirmSuccess(aResult)) {
						ProcessWarehouseTasks.updateTasksConfirmStatus(aTasks);
						aPositions = ProcessWarehouseTasks.getAllPositionsFromTasks(aTasks);
						PickCartLayout.setNumbersForPickingByIds(aPositions, 0);
						PickCartLayout.setStatusForPickingByIds(aPositions, Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION);
						this.processAfterFinishException(aResult);
						this.playAudio(Const.INFO);
					} else {
						PickCartLayout.setStatusForPickingByIds(aPositions, Const.HU_STATUS_PICK.WRONG);
						this.playAudio(Const.ERROR);
					}
					this.setErrorsFromConfirmResult(aResult, ProcessWarehouseTasks);
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					oDialog.close();
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		openFullDenialDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("fullDenialDialog");

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.FullDenialDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},

		onSplittingDestHUChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameters().newValue);
			sInput = sInput.toUpperCase();
			this.setBusy(true);
			ODataHelper.convertHUID(sInput)
				.then(function (oResult) {
					this.setBusy(false);
					sInput = oResult.Huident;
					this.setInputValue("splitting-destHU-input", sInput);
					var sPickedQuantity = ProcessWarehouseTasks.getExceptionPickedQuantity();
					var iPickedQuantity;
					var aPositionInfo = this.getValidPositionAndDestHUByInput(sInput, this.sRouteName);
					var sDestHU;
					if (aPositionInfo !== undefined) {
						sDestHU = aPositionInfo[0];
						ProcessWarehouseTasks.setExceptionDestHU(sDestHU);
						ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.VALID);
						this.focusTo("splitting-quantity-input");
						if (!Util.isEmpty(sPickedQuantity)) {
							iPickedQuantity = Number(sPickedQuantity);
							if (iPickedQuantity >= ProcessWarehouseTasks.getTaskQuantityByDestHU(sDestHU)) {
								ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
								this.setInputValue("splitting-quantity-input", "");
								this.focusTo("splitting-quantity-input");
								this.playAudio(Const.ERROR);
							} else {
								ProcessWarehouseTasks.setExceptionPickedQuantity(iPickedQuantity.toString());
								ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.VALID);
							}
						}
					} else {
						ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
						this.setInputValue("splitting-destHU-input", "");
						this.focusTo("splitting-destHU-input");
						this.playAudio(Const.ERROR);
					}
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onSplittingQuantityChange: function (oEvent) {
			var sPickedQuantity = Util.trim(oEvent.getParameters().newValue);
			var regex = Const.REGEX_NONNEGATIVE;
			var iPickedQuantity = Number(sPickedQuantity);
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			if (ProcessWarehouseTasks.getExceptionDestHUState() === Const.CONTROL_STATUS.VALID) {
				if (!regex.test(sPickedQuantity) || iPickedQuantity >=
					ProcessWarehouseTasks.getTaskQuantityByDestHU(sDestHU)) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.setInputValue("splitting-quantity-input", "");
					this.focusTo("splitting-quantity-input");
					this.playAudio(Const.ERROR);
				} else {
					ProcessWarehouseTasks.setExceptionPickedQuantity(iPickedQuantity.toString());
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.VALID);
				}
			} else {
				if (!regex.test(sPickedQuantity) || iPickedQuantity < 0) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.setInputValue("splitting-quantity-input", "");
					this.focusTo("splitting-quantity-input");
					this.playAudio(Const.ERROR);
				} else {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.PENDING);
					this.focusTo("splitting-destHU-input");
				}
			}

		},

		onNextSplittingDialog: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var sDestHUState = ProcessWarehouseTasks.getExceptionDestHUState();
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			var sPosition = ProcessWarehouseTasks.getLogicalPositionByHU(sDestHU);
			var sPickedQuantityState = this.getQuantityOrSerialNumberState(sPosition);

			var sPickedQuantity = this.getExceptionPickedQuantity();
			var iPickedQuantity = parseFloat(sPickedQuantity, 10);

			var sExceptionCode = ProcessWarehouseTasks.getExceptionCode();
			var aCurrentTasks;
			var aSeparateTasks;
			var sPackageMaterial;
			if (!ODataHelper.canConfirmTasks()) {
				return;
			}
			if (sDestHUState === Const.CONTROL_STATUS.VALID && (sPickedQuantityState === Const.CONTROL_STATUS.VALID || sPickedQuantityState ===
					Const.CONTROL_STATUS.WARNING)) {
				if (this.isQuantityOverflow(iPickedQuantity)) {
					ProcessWarehouseTasks.setExceptionPickedQuantity(ProcessWarehouseTasks.roundQuantity(iPickedQuantity).toString());
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.WARNING);
					this.focusTo("splitting-quantity-input");
					this.playAudio(Const.WARNING);
					return;
				}
				oDialog.close();
				aCurrentTasks = ProcessWarehouseTasks.getCurrentUnconfirmTasksByDestHU(sDestHU);
				aSeparateTasks = ProcessWarehouseTasks.separateTasksFromException(aCurrentTasks, sPickedQuantity, sExceptionCode);
				if (iPickedQuantity === 0) {
					ProcessWarehouseTasks.updateTasksAfterSplittingConfirm(aCurrentTasks, aSeparateTasks);
					oDialog.close();
					sPackageMaterial = ProcessWarehouseTasks.getPackageMaterialByDestHU(sDestHU);
					ProcessWarehouseTasks.setExceptionPackageMaterial(sPackageMaterial);
					this.openSplittingToDialog();
				} else {
					this.setBusy(true);
					var aConfirmInfo = this.getConfirmData(sDestHU, aSeparateTasks);
					ODataHelper
						.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1], aConfirmInfo[2])
						.then(function (aResults) {
							if (ProcessWarehouseTasks.isAllConfirmSuccess(aResults)) {
								ProcessWarehouseTasks.updateTasksAfterSplittingConfirm(aCurrentTasks, aSeparateTasks);
								sPackageMaterial = ProcessWarehouseTasks.getPackageMaterialByDestHU(sDestHU);
								ProcessWarehouseTasks.setExceptionPackageMaterial(sPackageMaterial);
								this.openSplittingToDialog();
								this.playAudio(Const.INFO);
							} else {
								oDialog.close();
								PickCartLayout.setStatusForPickingById(sPosition, Const.HU_STATUS_PICK.WRONG);
								this.playAudio(Const.ERROR);
							}
							this.setErrorsFromConfirmResult(aResults, ProcessWarehouseTasks);
							SerialNumber.clearData();
							this.setBusy(false);
						}.bind(this))
						.catch(function () {
							//todo
							oDialog.close();
							this.setBusy(false);
							this.playAudio(Const.ERROR);
						}.bind(this));
				}
			} else {
				if (sDestHUState === Const.CONTROL_STATUS.EMPTY && sPickedQuantityState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("splitting-destHU-input");
				} else if (sDestHUState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("splitting-destHU-input");
				} else if (sPickedQuantityState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("splitting-quantity-input");
				}
				this.playAudio(Const.ERROR);
			}
		},

		openSplittingFromDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("splittingFromDialog");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.SplittingFromDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},

		preventEscap: function (oDialog) {
			if (oDialog.setEscapeHandler) {
				oDialog.setEscapeHandler(function dummyFun() {});
			}
		},

		isPickingHUReserved: function (sPickingHU) {
			var aTasks = ProcessWarehouseTasks.getAllTasks();
			var oResult = Util.find(aTasks, function (oTask) {
				if (oTask.destHU === sPickingHU) {
					return true;
				}
				return false;
			});
			if (oResult) {
				return true;
			} else {
				return false;
			}
		},

		//refine rule out current splitting hu
		isPositionReserved: function (sPosition, sDestHU) {
			if (PickCartLayout.getPickingSplitFlagById(sPosition)) {
				return true;
			}
			var aTasks = ProcessWarehouseTasks.getAllTasks();
			var oResult = Util.find(aTasks, function (oTask) {
				if (oTask.logicalPosition === sPosition && oTask.destHU !== sDestHU) {
					return true;
				}
				return false;
			});
			if (oResult) {
				return true;
			}
			return false;
		},

		onSplittingPickingHUChange: function (oEvent) {
			var sPickingHU = Util.trim(oEvent.getParameters().newValue);
			sPickingHU = sPickingHU.toUpperCase();
			this.setBusy(true);
			ODataHelper.convertHUID(sPickingHU)
				.then(function (oResult) {
					this.setBusy(false);
					sPickingHU = oResult.Huident;
					this.setInputValue("splitting-pickHU-input", sPickingHU);
					var sLineNumber = ProcessWarehouseTasks.getLineNumberByDestHU(ProcessWarehouseTasks.getExceptionDestHU());
					if (sPickingHU === "") {
						ProcessWarehouseTasks.setExceptionPickingHUState(Const.CONTROL_STATUS.EMPTY);
						this.focusTo("splitting-pickHU-input");
					} else if (!this.isPickingHUReserved(sPickingHU) && !ProcessWarehouseTasks.isContainsSpecialCharacter(sPickingHU)) {
						ODataHelper
							.validateHandlingUnit(Global.getWONumber(), sLineNumber, sPickingHU)
							.then(function () {
								ProcessWarehouseTasks.setExceptionPickingHUState(Const.CONTROL_STATUS.VALID);
								this.focusTo("splitting-logicalPosition-input");
							}.bind(this))
							.catch(function (oError) {
								ProcessWarehouseTasks.setExceptionPickingHUState(Const.CONTROL_STATUS.INVALID);
								this.setInputValue("splitting-pickHU-input", "");
								this.focusTo("splitting-pickHU-input");
								this.playAudio(Const.ERROR);
							}.bind(this));
					} else {
						ProcessWarehouseTasks.setExceptionPickingHUState(Const.CONTROL_STATUS.INVALID);
						this.setInputValue("splitting-pickHU-input", "");
						this.focusTo("splitting-pickHU-input");
						this.playAudio(Const.ERROR);
					}
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onSplittingLogicalPositionChange: function (oEvent) {
			var sPositionLabel = oEvent.getParameters().newValue;
			var sLogicalPosition = PickCartLayout.getPositionByLable(sPositionLabel);
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			if (sLogicalPosition === undefined || this.isPositionReserved(sLogicalPosition, sDestHU)) {
				ProcessWarehouseTasks.setExceptionLogicalPositionState(Const.CONTROL_STATUS.INVALID);
				this.setInputValue("splitting-logicalPosition-input", "");
				this.focusTo("splitting-logicalPosition-input");
				this.playAudio(Const.ERROR);
			} else {
				ProcessWarehouseTasks.setExceptionLogicalPositionState(Const.CONTROL_STATUS.VALID);
				ProcessWarehouseTasks.setExceptionLogicalPosition(sLogicalPosition);
				this.focusTo("splitting-pickHU-input");
			}
		},

		onSplittingLogicalPositionSubmit: function () {
			if (ProcessWarehouseTasks.getExceptionPickingHUState() === Const.CONTROL_STATUS.VALID && ProcessWarehouseTasks.getExceptionLogicalPositionState() ===
				Const.CONTROL_STATUS.VALID) {
				this.byId(splitOKButtonId).firePress();
			}
		},

		onSplittingConfirm: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			var sLogicalPosition = ProcessWarehouseTasks.getExceptionLogicalPosition();
			var oldPosition = ProcessWarehouseTasks.getLogicalPositionByHU(sDestHU);
			var sPickingHU = ProcessWarehouseTasks.getExceptionPickingHU();
			var iPickedQuantity = parseFloat(ProcessWarehouseTasks.getExceptionPickedQuantity(), 10);

			var iQuantity;
			var sPickingHUState = ProcessWarehouseTasks.getExceptionPickingHUState();
			var sLogicalPositionState = ProcessWarehouseTasks.getExceptionLogicalPositionState();
			if (sPickingHUState === Const.CONTROL_STATUS.VALID && sLogicalPositionState === Const.CONTROL_STATUS.VALID) {
				oDialog.close();
				if (ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup()) {
					var iStockQuantity = ProcessWarehouseTasks.updateCurrentStock(iPickedQuantity);
					var iNeedQuantity = ProcessWarehouseTasks.roundQuantity(ProcessWarehouseTasks.getCurrentNeedQuantity() - iPickedQuantity);
					iQuantity = iNeedQuantity > iStockQuantity ? iStockQuantity : iNeedQuantity;
				} else {
					iQuantity = ProcessWarehouseTasks.getUnconfirmTaskQuantityByDestHU(sDestHU);
				}
				ProcessWarehouseTasks.updateRemainTasksForSplitting(sDestHU, sPickingHU, sLogicalPosition);
				PickCartLayout.setNumbersForPickingById(sLogicalPosition, iQuantity);
				PickCartLayout.setStatusForPickingById(sLogicalPosition, Const.HU_STATUS_PICK.NEED_MATERIAL);
				ProcessWarehouseTasks.setCurrentPickQuantity(iQuantity);

				if (sLogicalPosition === oldPosition) {
					ProcessWarehouseTasks.updateTaskPositionForSplitting(sDestHU);
					var iTotalQuantity = ProcessWarehouseTasks.roundQuantity(ProcessWarehouseTasks.getCurrentTaskGroupTotalQuantity() -
						iPickedQuantity);
					var fRatio = ProcessWarehouseTasks.getAlternativeUOMRatio();
					ProcessWarehouseTasks.setCurrentTaskGroupTotalQuantity(iTotalQuantity);
					ProcessWarehouseTasks.setCurrentTaskGroupTotalBaseQuantity(iTotalQuantity * fRatio);
				} else {
					ProcessWarehouseTasks.updataCurrentActualQuantity(iPickedQuantity);
					PickCartLayout.setNumbersForPickingById(oldPosition, iPickedQuantity);
					PickCartLayout.setStatusForPickingById(oldPosition, Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION);
					PickCartLayout.setSplitForPickingById(oldPosition, true);
				}
				this.setBusy(true);
				ODataHelper
					.bindNewHU(ProcessWarehouseTasks.getAllUnconfirmTasksByDestHU(sPickingHU), Global.getWONumber())
					.then(function () {
						ProcessWarehouseTasks.clearExceptionInfo();
						this.setBusy(false);
						if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
							this.openSerialNumberPopover();
							ProcessWarehouseTasks.setFullDenialEnable(true);
						}
						this.playAudio(Const.INFO);
					}.bind(this))
					.catch(function (oError) {
						oDialog.close();
						this.setBusy(false);
						this.playAudio(Const.ERROR);
					}.bind(this));
			} else {
				if (sPickingHUState === Const.CONTROL_STATUS.EMPTY && sLogicalPositionState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionPickingHUState(Const.CONTROL_STATUS.INVALID);
					ProcessWarehouseTasks.setExceptionLogicalPositionState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("splitting-pickHU-input");
				} else if (sPickingHUState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionPickingHUState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("splitting-pickHU-input");
				} else if (sLogicalPositionState === Const.CONTROL_STATUS.EMPTY) {
					ProcessWarehouseTasks.setExceptionLogicalPositionState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("splitting-logicalPosition-input");
				}
				this.playAudio(Const.ERROR);
			}
		},

		openSplittingToDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("splittingToDialog");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.SplittingToDialog", this);
				oView.addDependent(oDialog);
				this.preventEscap(oDialog);
			}

			oDialog.open();
		},

		onDifferenceDestHUChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameters().newValue);
			sInput = sInput.toUpperCase();
			this.setBusy(true);
			ODataHelper.convertHUID(sInput)
				.then(function (oResult) {
					this.setBusy(false);
					sInput = oResult.Huident;
					this.setInputValue("difference-destHU-input", sInput);
					var sPickedQuantity = ProcessWarehouseTasks.getExceptionPickedQuantity();
					var iPickedQuantity;
					var aPositionInfo = this.getValidPositionAndDestHUByInput(sInput, this.sRouteName);
					var sDestHU;
					if (aPositionInfo !== undefined) {
						sDestHU = aPositionInfo[0];
						ProcessWarehouseTasks.setExceptionDestHU(sDestHU);
						ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.VALID);
						this.focusTo("difference-quantity-input");
						if (!Util.isEmpty(sPickedQuantity)) {
							iPickedQuantity = Number(sPickedQuantity);
							if (iPickedQuantity >= ProcessWarehouseTasks.getTaskQuantityByDestHU(sDestHU)) {
								ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
								this.setInputValue("difference-quantity-input", "");
								this.focusTo("difference-quantity-input");
								this.playAudio(Const.ERROR);
							} else {
								ProcessWarehouseTasks.setExceptionPickedQuantity(iPickedQuantity.toString());
								ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.VALID);
							}
						}
					} else {
						ProcessWarehouseTasks.setExceptionDestHUState(Const.CONTROL_STATUS.INVALID);
						this.setInputValue("difference-destHU-input", "");
						this.focusTo("difference-destHU-input");
						this.playAudio(Const.ERROR);
					}
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onDifferenceQuantityChange: function (oEvent) {
			var sPickedQuantity = Util.trim(oEvent.getParameters().newValue);
			var regex = Const.REGEX_NONNEGATIVE;
			var iPickedQuantity = Number(sPickedQuantity);
			var sDestHU = ProcessWarehouseTasks.getExceptionDestHU();
			if (ProcessWarehouseTasks.getExceptionDestHUState() === Const.CONTROL_STATUS.VALID) {
				if (!regex.test(sPickedQuantity) || iPickedQuantity >=
					ProcessWarehouseTasks.getTaskQuantityByDestHU(sDestHU)) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.setInputValue("difference-quantity-input", "");
					this.focusTo("difference-quantity-input");
					this.playAudio(Const.ERROR);
				} else {
					ProcessWarehouseTasks.setExceptionPickedQuantity(iPickedQuantity.toString());
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.VALID);
				}
			} else {
				if (!regex.test(sPickedQuantity) || iPickedQuantity < 0) {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.INVALID);
					this.setInputValue("difference-quantity-input", "");
					this.focusTo("difference-quantity-input");
					this.playAudio(Const.ERROR);
				} else {
					ProcessWarehouseTasks.setExceptionPickedQuantityState(Const.CONTROL_STATUS.PENDING);
					this.focusTo("difference-destHU-input");
				}
			}

		},

		openDifferenceDenialDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("differenceDialog");
			if (!oDialog) {

				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.DifferenceDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},

		formatProgressPercentValue: function (iProgress, aTaskGroups) {
			if (aTaskGroups.length > 0) {
				return iProgress * 100 / aTaskGroups.length;
			}
			return 0;
		},
		formatProgressDisplayValue: function (iProgress, aTaskGroups) {
			return iProgress + "/" + aTaskGroups.length;
		},
		formatPlaceholder: function (sSourceHu, sourceHUMandatory) {
			if (!sourceHUMandatory && sSourceHu === "") {
				return this.getI18nText("optional");
			}
			return "";

		},

		formatButtonStatus: function (iStatus) {
			var buttonType;
			switch (iStatus) {
			case Const.HU_STATUS_PICK.INVALID:
				buttonType = "Transparent";
				break;
			case Const.HU_STATUS_PICK.NEED_MATERIAL_HOLDING:
			case Const.HU_STATUS_PICK.VALID:
				buttonType = "Default";
				break;
			case Const.HU_STATUS_PICK.NEED_MATERIAL:
				buttonType = "Emphasized";
				break;
			case Const.HU_STATUS_PICK.COMPLETED:
				buttonType = "Accept";
				break;
			case Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION:
				buttonType = "Accept";
				break;
			case Const.HU_STATUS_PICK.WRONG:
				buttonType = "Reject";
				break;
			}
			return buttonType;
		},

		formatButtonText: function (iStatus, sLab, iQuantity) {
			var buttonText;
			switch (iStatus) {
			case Const.HU_STATUS_PICK.INVALID:
			case Const.HU_STATUS_PICK.VALID:
			case Const.HU_STATUS_PICK.WRONG:
				buttonText = sLab;
				break;
			case Const.HU_STATUS_PICK.NEED_MATERIAL_HOLDING:
			case Const.HU_STATUS_PICK.NEED_MATERIAL:
			case Const.HU_STATUS_PICK.COMPLETED:
			case Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION:
				buttonText = Util.formatNumber(iQuantity, Const.MaxDecimalDigits);
				break;
			}
			return buttonText;
		},

		formatButtonIcon: function (iStatus) {
			var buttonIcon;
			switch (iStatus) {
			case Const.HU_STATUS_PICK.VALID:
				buttonIcon = "sap-icon://add-product";
				break;

			case Const.HU_STATUS_PICK.NEED_MATERIAL_HOLDING:
			case Const.HU_STATUS_PICK.NEED_MATERIAL:
				buttonIcon = "sap-icon://add";
				break;
			case Const.HU_STATUS_PICK.COMPLETED:
				buttonIcon = "sap-icon://accept";
				break;
			case Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION:
				buttonIcon = "sap-icon://warning";
				break;
			case Const.HU_STATUS_PICK.WRONG:
				buttonIcon = "sap-icon://decline";
				break;
			default:
				buttonIcon = "";
			}
			return buttonIcon;
		},

		formatEANVisible: function (sEAN) {
			if (Util.trim(sEAN) === "") {
				return false;
			}
			return true;
		},

		formatBatchReadOnlyInputVisible: function (display, batchNo) {
			this.updateBatchEditableInput(batchNo);
			if (display === true && Util.trim(batchNo) !== "") {
				return true;
			}
			return false;
		},

		updateBatchEditableInput: function (batchNo) {
			if (batchNo === undefined) {
				return;
			}
			var sSpan = "L3 M3 S3";
			if (Util.isEmpty(batchNo)) {
				sSpan = "L9 M9 S9";
			}
			var oLayout = this.byId(batchId).getLayoutData();

			if (oLayout && oLayout.getSpan() !== sSpan) {
				oLayout.setSpan(sSpan);
				this.byId("task-group-info-form").rerender();
			}
		},

		updateSouceHuEditableInput: function (targetSourceHU) {
			if (targetSourceHU === undefined) {
				return;
			}
			var sSpan = "L3 M3 S3";
			if (Util.isEmpty(targetSourceHU)) {
				sSpan = "L9 M9 S9";
			}
			var oLayout = this.byId(sourceHUId).getLayoutData();

			if (oLayout && oLayout.getSpan() !== sSpan) {
				oLayout.setSpan(sSpan);
				this.byId("task-group-info-form").rerender();
			}
		},

		updateExceptionDestHUInput: function (sDestHUId, bSerialEnabled) {
			var sSpan = "L10 M10 S10";
			if (bSerialEnabled) {
				sSpan = "L9 M9 S9";
			}
			var oLayout = this.byId(sDestHUId).getLayoutData();
			if (oLayout && oLayout.getSpan() !== sSpan) {
				oLayout.setSpan(sSpan);
			}
		},

		formatValueState: function (sStatus) {
			var sValueState = ValueState.None;
			if (sStatus === "INVALID") {
				sValueState = ValueState.Error;
			} else if (sStatus === "WARNING") {
				sValueState = ValueState.Warning;
			}
			return sValueState;
		},

		formatValueText: function (sStatus) {
			var sValueText = this.getI18nText("invalidQuantity");
			if (sStatus === "WARNING") {
				sValueText = this.getI18nText("roundUpQuantity");
			}
			return sValueText;
		},

		verifyBatch: function (sBatchNo, sInpuBatchNo, sProduct) {
			ODataHelper
				.verifyBatch(sBatchNo, sInpuBatchNo, sProduct)
				.then(function () {
					if (sBatchNo === "") {
						ProcessWarehouseTasks.setBatchNo(sInpuBatchNo);
					}
					this.updateInputWithSuccess(batchId);
					this.moveFocus(batchId);
				}.bind(this))
				.catch(function () {
					this.updateInputWithError(batchId);
					this.focusTo(batchId);
					this.playAudio(Const.ERROR);
				}.bind(this));

		},

		verifySourceHU: function (sSourceHU, sInputSourceHU) {
			ODataHelper
				.verifySourceHU(sSourceHU, sInputSourceHU)
				.then(function () {
					if (Util.isEmpty(sSourceHU)) {
						ProcessWarehouseTasks.setSourceHU(sInputSourceHU);
					}
					this.updateInputWithSuccess(sourceHUId);
					this.moveFocus();
				}.bind(this))
				.catch(function () {
					this.updateInputWithError(sourceHUId);
					this.focusTo(sourceHUId);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		hightlightDestHUinGrid: function () {
			if (ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup()) {
				this.hightlightDestHUinGridForMulitpleSourceHU();
			} else {
				this.updateCartStatus();
			}
			ProcessWarehouseTasks.enableException();
			if (!ProcessWarehouseTasks.isSerialNumberEnabled() || SerialNumber.getSerialNumberCount() === 0) {
				ProcessWarehouseTasks.setFullDenialEnable(true);
			}
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.enableSerialNumberIcon();
				this.openSerialNumberPopover();
			}
		},
		enableSerialNumberIcon: function () {
			var oIcon = this.byId(serialNumberIconId);
			oIcon.attachPress(this.onPressSerialNum, this);
			oIcon.setColor("Neutral");
		},
		disableSerialNumberIcon: function () {
			var oIcon = this.byId(serialNumberIconId);
			oIcon.detachPress(this.onPressSerialNum, this);
			oIcon.setColor("Default");
		},
		updateCartStatus: function () {
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				this.updateCartStatusForSerialManaged();
			} else {
				this.updateCartStatusForNonSerialManaged();
			}
		},
		updateCartStatusForSerialManaged: function () {
			var oCurrentTaskGroup = ProcessWarehouseTasks.getCurrentTaskGroup();
			var aTasks = oCurrentTaskGroup.tasks;
			var aLogicalPositions = ProcessWarehouseTasks.getAllPositionsFromUnConfirmTasks(aTasks);
			var sFirstPosition = PickCartLayout.getFirstPositionForSerialManaged(aLogicalPositions);
			PickCartLayout.setStatusForPickingById(sFirstPosition, Const.HU_STATUS_PICK.NEED_MATERIAL);
			var fQuantity = 0;
			fQuantity = ProcessWarehouseTasks.getTasksQuantityByPosition(sFirstPosition);
			PickCartLayout.setNumbersForPickingById(sFirstPosition, fQuantity);
			aLogicalPositions.forEach(function (sPosition) {
				if (sPosition !== sFirstPosition) {
					PickCartLayout.setStatusForPickingById(sPosition, Const.HU_STATUS_PICK.NEED_MATERIAL_HOLDING);
					fQuantity = ProcessWarehouseTasks.getTasksQuantityByPosition(sPosition);
					PickCartLayout.setNumbersForPickingById(sPosition, fQuantity);
				}
			});
		},
		updateCartStatusForNonSerialManaged: function () {
			var oCurrentTaskGroup = ProcessWarehouseTasks.getCurrentTaskGroup();
			var aTasks = oCurrentTaskGroup.tasks;
			var aLogicalPositions = ProcessWarehouseTasks.getAllPositionsFromTasks(aTasks);
			var fQuantity = 0;
			aLogicalPositions.forEach(function (sPosition) {
				PickCartLayout.setStatusForPickingById(sPosition, Const.HU_STATUS_PICK.NEED_MATERIAL);
				fQuantity = ProcessWarehouseTasks.getTasksQuantityByPosition(sPosition);
				PickCartLayout.setNumbersForPickingById(sPosition, fQuantity);
			});
		},

		hightlightDestHUinGridForMulitpleSourceHU: function () {
			var oCurrentTaskGroup = ProcessWarehouseTasks.getCurrentTaskGroup();
			var needQty = ProcessWarehouseTasks.roundQuantity(oCurrentTaskGroup.totalAlternativeQty - oCurrentTaskGroup.actualQuantity);
			var sourceHU = ProcessWarehouseTasks.getSourceHUOfCurrentGroup();
			var pickFromSourceBin = sourceHU === "" ? true : false;
			var batchNo = ProcessWarehouseTasks.getBatchNo();
			var stockQty = 0;
			var pickQty = 0;
			var aTask = oCurrentTaskGroup.tasks[0];
			for (var i = 0; i < oCurrentTaskGroup.stock.length; i++) {
				var aStock = oCurrentTaskGroup.stock[i];
				if (batchNo === aStock.batchNo) {
					if ((Util.isEmpty(aStock.sourceHU) && pickFromSourceBin) || (!pickFromSourceBin && aStock.sourceHU === sourceHU)) {
						stockQty = aStock.quantity;
						pickQty = needQty > stockQty ? stockQty : needQty;
						break;
					}
				}
			}

			PickCartLayout.setStatusForPickingById(aTask.logicalPosition, Const.HU_STATUS_PICK.NEED_MATERIAL);
			PickCartLayout.setNumbersForPickingById(aTask.logicalPosition, pickQty);
			oCurrentTaskGroup.currentPickQty = pickQty;
		},

		verifyProduct: function (sProduct, sInputProduct) {
			ODataHelper
				.verifyProduct(sProduct, sInputProduct)
				.then(function () {
					this.setInputValue(productId, sProduct);
					this.updateInputWithSuccess(productId);
					this.moveFocus(productId);
				}.bind(this))
				.catch(function () {
					this.updateInputWithError(productId);
					this.focusTo(productId);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		initCartStatus: function (aWarehouseTasks) {
			aWarehouseTasks.forEach(function (oTask) {
				PickCartLayout.setStatusForPickingById(oTask.logicalPosition, Const.HU_STATUS_PICK.VALID);
				PickCartLayout.setSplitForPickingById(oTask.logicalPosition, false);
			});
			PickCartLayout.getPositionsWithPickingException().forEach(function (sPosition) {
				PickCartLayout.setStatusForPickingById(sPosition, Const.HU_STATUS_PICK.VALID);
			});
		},

		formatQuantityDisplay: function (iActualQuantity, iTotalQuantity, sUnit) {
			if (iActualQuantity === undefined || iTotalQuantity === undefined) {
				return "";
			}
			var sDisplayValue = iActualQuantity + "/" + iTotalQuantity + sUnit;
			var oTitle = this.byId("product-quantity-title");
			if (sDisplayValue.length < 12) {
				oTitle.setLevel("H2");
				oTitle.setTitleStyle("H2");
			} else if (sDisplayValue.length < 15) {
				oTitle.setLevel("H4");
				oTitle.setTitleStyle("H4");
			} else {
				oTitle.setLevel("H6");
				oTitle.setTitleStyle("H6");
			}
			return this.formatNumber(iActualQuantity) + "/" + this.formatNumber(iTotalQuantity) + " " + sUnit;
		},

		formatUnitDisplay: function (sUnit) {
			if (sUnit === undefined) {
				return "";
			}
			return sUnit;
		},

		formatNextButtonVisible: function (iProgress, aTaskGroups) {
			return iProgress !== aTaskGroups.length;
		},

		formatDroppingButtonVisible: function (iProgress, aTaskGroups) {
			return iProgress === aTaskGroups.length;
		},

		formatSourceHUReadOnlyInputVisible: function (display, targetSourceHU) {
			this.updateSouceHuEditableInput(targetSourceHU);
			if (display === true && !Util.isEmpty(Util.trim(targetSourceHU))) {
				return true;
			}
			return false;
		},

		formatSourceHURequired: function (sourceHU) {
			if (Util.isEmpty(Util.trim(sourceHU))) {
				return false;
			}
			return true;
		},

		formatImageVisible: function (sImgSrc) {
			if (Util.trim(sImgSrc) === "") {
				return false;
			}
			return true;
		},

		formatDescriptionWidth: function (sImgSrc) {
			if (Util.trim(sImgSrc) === "") {
				return "90%";
			}
			return "60%";
		},
		openLowQuantityCheckDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("lowQuantityCheckDialog");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.LowQuantityCheckDialog", this);
				oView.addDependent(oDialog);
				this.preventEscap(oDialog);
			}
			this.updateInputWithDefault("actualQuantity-input", "");
			oDialog.open();
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				SerialNumber.clearData(false);
				ProcessWarehouseTasks.setLowQtyCheckUoM(SerialNumber.getSerialNumberCount(false).toString());
			}

		},

		onLowQuantitySubmit: function (oEvent) {
			var sLowQuantity = Util.trim(oEvent.getParameter("value"));
			var iLowQuantity = Number(sLowQuantity);
			if (this.isQuantityOverflow(iLowQuantity)) {
				ProcessWarehouseTasks.setLowQuantity(ProcessWarehouseTasks.roundQuantity(iLowQuantity).toString());
				ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.WARNING);
				this.playAudio(Const.WARNING);
			}
		},

		onLowQuantityCheckChange: function (oEvent) {
			var sLowQuantity = oEvent.getParameters().newValue;
			var iLowQuantity = Number(sLowQuantity);
			var regex = Const.REGEX_NONNEGATIVE; //should input positive integers
			if (regex.test(sLowQuantity)) {
				ProcessWarehouseTasks.setLowQuantity(iLowQuantity.toString());
				ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.VALID);
			} else {
				ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.INVALID);
				this.setInputValue("actualQuantity-input", "");
				this.focusTo("actualQuantity-input");
				this.playAudio(Const.ERROR);
			}
		},

		onLowQuantityCheckConfirm: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var fLowQuantity = 0;
			var lowQuantityState = ProcessWarehouseTasks.getLowQuantityCheckState();
			if (!ProcessWarehouseTasks.isSerialNumberEnabled()) {
				var sLowQuantity = ProcessWarehouseTasks.getLowQuantity();
				fLowQuantity = parseFloat(sLowQuantity);
				if (lowQuantityState === Const.CONTROL_STATUS.VALID || lowQuantityState === Const.CONTROL_STATUS.WARNING) {
					if (this.isQuantityOverflow(fLowQuantity)) {
						ProcessWarehouseTasks.setLowQuantity(ProcessWarehouseTasks.roundQuantity(fLowQuantity).toString());
						ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.WARNING);
						this.focusTo("actualQuantity-input");
						this.playAudio(Const.WARNING);
						return;
					}
					this.lowQuantityCheck(oDialog, fLowQuantity);
				} else {
					ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.INVALID);
					this.focusTo("actualQuantity-input");
					this.playAudio(Const.ERROR);
				}
			} else {
				var sSourceBin = ProcessWarehouseTasks.getSourceBinOfCurrentGroup();
				fLowQuantity = parseFloat(ProcessWarehouseTasks.getLowQtyCheckUoM());
				if (fLowQuantity === 0) {
					if (lowQuantityState !== Const.CONTROL_STATUS.WARNING) {
						ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.WARNING);
						var sWarningMsg = this.getI18nText("lowQtyCheckIsZeroWarningMsg", [sSourceBin]);
						this.updateInputWithWarning(serialNumberForLowQtyCheckInputId, sWarningMsg, "");
						this.focusTo(serialNumberForLowQtyCheckInputId);
						this.playAudio(Const.WARNING);
						return;
					} else {
						ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.VALID);
						this.updateInputWithDefault(serialNumberForLowQtyCheckInputId, "");
					}
				}

				this.lowQuantityCheck(oDialog, fLowQuantity);
			}
		},

		onLowQuantityCheckCancel: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var iLowQuantity = 0; //Backend not check the actual quantity if cancel low stock check
			ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.EMPTY);
			this.lowQuantityCheck(oDialog, iLowQuantity);
		},

		getConfirmDataForLowStock: function (fLowQuantity, sDestHU) {
			var aConfirmInfo = ProcessWarehouseTasks.getConfirmDataForLowStock(fLowQuantity, sDestHU);
			var aSerialTasksForPicking = [];
			var aSerialNumberTasksForLowQtyCheck = [];
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				aSerialTasksForPicking = ProcessWarehouseTasks.getConfirmTasksWithSerialNumber(aConfirmInfo[0], SerialNumber.getSerialNumbers(true));
				aSerialNumberTasksForLowQtyCheck = ProcessWarehouseTasks.getConfirmTasksWithSerialNumberForLowQtyCheck(aConfirmInfo[0],
					SerialNumber.getSerialNumbers(
						false));
			}
			aConfirmInfo.push(aSerialTasksForPicking);
			aConfirmInfo.push(aSerialNumberTasksForLowQtyCheck);
			return aConfirmInfo;
		},

		lowQuantityCheck: function (oDialog, iLowQuantity) {
			var sDestHU = this.oDestHU.sDestHU;
			var sLogicalPosition = this.oDestHU.sLogicalPosition;
			this.setBusyForLowqtyCheckDialog(true);
			var aConfirmInfo = this.getConfirmDataForLowStock(iLowQuantity, sDestHU);
			ODataHelper
				.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1], aConfirmInfo[2], aConfirmInfo[3])
				.then(function (aResult) {
					oDialog.close();
					if (ProcessWarehouseTasks.isAllConfirmSuccess(aResult)) {
						var oCurrentTaskGroup = ProcessWarehouseTasks.getCurrentTaskGroup();
						if (oCurrentTaskGroup.sourceHUMultiple === true) {
							this.completeOneSourceHUPicking(sLogicalPosition, oCurrentTaskGroup.currentPickQty, aConfirmInfo[0]);
						} else {
							this.navToNextTaskOrDropping(sDestHU, sLogicalPosition);
						}
						ProcessWarehouseTasks.setLowQuantity(""); //clear actual quantity input
						this.playAudio(Const.INFO);
					} else {
						PickCartLayout.setStatusForPickingById(sLogicalPosition, Const.HU_STATUS_PICK.WRONG);
						this.playAudio(Const.ERROR);
					}
					this.setErrorsFromConfirmResult(aResult, ProcessWarehouseTasks);
					this.setBusyForLowqtyCheckDialog(false);
					this.setInputValue("actualQuantity-input", "");
				}.bind(this))
				.catch(function () {
					oDialog.close();
					this.setBusyForLowqtyCheckDialog(false);
					this.setInputValue("actualQuantity-input", "");
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		initExceptionButtons: function () {
			var aExceptions = ProcessWarehouseTasks.getExceptions();
			var aSortExceptions = this.sortException(aExceptions);
			var oButton = {};
			var oToolbar = this.byId("processTasksTableToolbar");
			var onPressException = function (oEvent) {
				var sExternalDescription = oEvent.getSource().getText();
				var oExceptionType = Const.EXCEPTION_TYPE;
				var sExternalCode = ProcessWarehouseTasks.getExternalExceptionCode(sExternalDescription);
				var sName = ProcessWarehouseTasks.getInternalExceptionCode(sExternalCode);
				ProcessWarehouseTasks.setExceptionCode(sExternalCode);
				switch (sName) {
				case oExceptionType.BIDF:
					this.openFullDenialDialog();
					break;
				case oExceptionType.BIDP:
					this.openPartialDenialDialog();
					break;
				case oExceptionType.SPLT:
					this.openSplittingFromDialog();
					break;
				case oExceptionType.DIFF:
					this.openDifferenceDenialDialog();
					break;
				}
			}.bind(this);
			var openQuantityAdjustment = function (oEvent) {
				this.openQuantityAdjustmentDialog();
			}.bind(this);
			aSortExceptions.forEach(function (oException) {
				oButton = new sap.m.Button({
					text: oException.ExceptionCodeName,
					enabled: oException.InternalProcessCode === Const.EXCEPTION_TYPE.BIDF ? "{path:'local>/enableFullDenial'}" : "{path:'local>/enableException'}",
					press: onPressException
				});
				oToolbar.addContent(oButton);
			});
			oButton = new sap.m.Button({
				text: "{i18n>quantityAdjustment}",
				enabled: "{path:'local>/enableException'}",
				visible: "{path:'local>/currentWarehouseTaskGroup/sourceHUMultiple'}",
				press: openQuantityAdjustment
			});
			oToolbar.addContent(oButton);
		},

		sortException: function (aExceptions) {
			var oExceptionType = Const.EXCEPTION_TYPE;
			var aPartialDenial = [];
			var aDifference = [];
			var aFullDenial = [];
			var aSplitting = [];
			aExceptions.forEach(function (oException) {
				switch (oException.InternalProcessCode) {
				case oExceptionType.BIDF:
					aFullDenial.push(oException);
					break;
				case oExceptionType.BIDP:
					aPartialDenial.push(oException);
					break;
				case oExceptionType.SPLT:
					aSplitting.push(oException);
					break;
				case oExceptionType.DIFF:
					aDifference.push(oException);
					break;
				}
			});
			return aPartialDenial.concat(aDifference).concat(aFullDenial).concat(aSplitting);
		},

		openQuantityAdjustmentDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("quantityAdjustmentDialog");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "scm.ewm.pickcarts1.view.dialog.QuantityAdjustmentDialog", this);
				oView.addDependent(oDialog);
			}
			this.updateInputWithDefault("quantityAdjustment-input", "");
			oDialog.open();
		},

		onQuantityAdjustmentSubmit: function (oEvent) {
			var sPickedQuantity = Util.trim(oEvent.getParameter("value"));
			var iPickedQuantity = Number(sPickedQuantity);
			if (this.isQuantityOverflow(iPickedQuantity)) {
				this.setInputValue("quantityAdjustment-input", ProcessWarehouseTasks.roundQuantity(iPickedQuantity).toString());
				ProcessWarehouseTasks.setQuantityAdjustmentState(Const.CONTROL_STATUS.WARNING);
				this.playAudio(Const.WARNING);
			}
		},

		onQuantityAdjustmentChange: function (oEvent) {
			var sPickedQuantity = oEvent.getParameters().newValue;
			var regex = Const.REGEX_NONNEGATIVE;
			var iPickedQuantity = Number(sPickedQuantity);
			var iRequireQuantity = ProcessWarehouseTasks.getCurrentPickQuantity();
			if (!regex.test(sPickedQuantity) || ProcessWarehouseTasks.roundQuantity(iPickedQuantity) === 0 || iPickedQuantity >=
				iRequireQuantity) {
				ProcessWarehouseTasks.setQuantityAdjustmentState(Const.CONTROL_STATUS.INVALID);
				this.setInputValue("quantityAdjustment-input", "");
				this.focusTo("quantityAdjustment-input");
				this.playAudio(Const.ERROR);
			} else {
				this.setInputValue("quantityAdjustment-input", iPickedQuantity.toString());
				ProcessWarehouseTasks.setQuantityAdjustmentState(Const.CONTROL_STATUS.VALID);
			}
		},

		getQuantityAdjustmentState: function (sPosition) {
			var sState;
			var iSerialNumberCount;
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				iSerialNumberCount = SerialNumber.getSerialNumberCount();
				if (iSerialNumberCount > 0 && iSerialNumberCount < ProcessWarehouseTasks.getTasksBaseQuantityByPosition(sPosition)) {
					sState = Const.CONTROL_STATUS.VALID;
				} else {
					sState = Const.CONTROL_STATUS.INVALID;
				}
				ProcessWarehouseTasks.setQuantityAdjustmentState(sState);
			} else {
				sState = ProcessWarehouseTasks.getQuantityAdjustmentState();
			}
			return sState;
		},

		onQuantityAdjustmentConfirm: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			var sDestHU = ProcessWarehouseTasks.getCurrentDestHUForMulti();
			var iPickedQuantity = 0;
			if (!ProcessWarehouseTasks.isSerialNumberEnabled()) {
				var sPickedQuantity = this.byId("quantityAdjustment-input").getValue();
				iPickedQuantity = Number(sPickedQuantity);
			} else {
				iPickedQuantity = SerialNumber.getSerialNumberCount();
				if (iPickedQuantity === 0) {
					var sErrorMsg = this.getI18nText("noSerialNumForQtyAdjustmentMsg");
					this.updateInputWithError(serialNumberForQtyAdjustmentId, sErrorMsg);
					this.focusTo(serialNumberForQtyAdjustmentId);
					return;
				}
				iPickedQuantity = parseFloat(ProcessWarehouseTasks.getExceptionPickedUoM());
			}
			var sLogicalPosition = ProcessWarehouseTasks.getLogicalPositionByHU(sDestHU);
			var sInputState = this.getQuantityAdjustmentState(sLogicalPosition);
			if (sInputState === Const.CONTROL_STATUS.VALID || sInputState === Const.CONTROL_STATUS.WARNING) {
				if (this.isQuantityOverflow(iPickedQuantity)) {
					this.setInputValue("quantityAdjustment-input", ProcessWarehouseTasks.roundQuantity(iPickedQuantity).toString());
					ProcessWarehouseTasks.setQuantityAdjustmentState(Const.CONTROL_STATUS.WARNING);
					this.focusTo("quantityAdjustment-input");
					this.playAudio(Const.WARNING);
					return;
				}
				ProcessWarehouseTasks.setCurrentPickQuantity(iPickedQuantity);
				oDialog.close();
				this.setBusy(true);
				var aConfirmInfo = this.getConfirmDataForMultipleSourceHU(sDestHU);
				ODataHelper
					.submitTasksInBatch(aConfirmInfo[0], aConfirmInfo[1], aConfirmInfo[3])
					.then(function (aResult) {
						if (ProcessWarehouseTasks.isAllConfirmSuccess(aResult)) {
							this.completeOneSourceHUPicking(sLogicalPosition, iPickedQuantity, aConfirmInfo[0], aConfirmInfo[2]);
							this.playAudio(Const.INFO);
						} else {
							PickCartLayout.setStatusForPickingById(sLogicalPosition, Const.HU_STATUS_PICK.WRONG);
							this.updateInputWithDefault(destHUId, "");
							this.playAudio(Const.ERROR);
						}
						this.setInputValue("quantityAdjustment-input", "");
						this.setErrorsFromConfirmResult(aResult, ProcessWarehouseTasks);
						this.setBusy(false);
					}.bind(this))
					.catch(function () {
						this.setBusy(false);
						this.playAudio(Const.ERROR);
					}.bind(this));
			} else {
				ProcessWarehouseTasks.setQuantityAdjustmentState(Const.CONTROL_STATUS.INVALID);
				if (!ProcessWarehouseTasks.isSerialNumberEnabled()) {
					this.focusTo("quantityAdjustment-input");
				} else {
					this.focusTo(serialNumberForQtyAdjustmentId);
				}
				this.playAudio(Const.ERROR);
			}
		},

		onQuantityAdjustmentCancel: function (oEvent) {
			oEvent.getSource().getParent().close();
			this.setInputValue("quantityAdjustment-input", "");
			ProcessWarehouseTasks.setQuantityAdjustmentState(Const.CONTROL_STATUS.EMPTY);
		},

		afterOpenQuantityAdjustment: function () {
			if (ProcessWarehouseTasks.isSerialNumberEnabled()) {
				// this.updateExceptionDestHUInput(sDestHUId, true);
				var iSerialNumberCount = SerialNumber.getSerialNumberCount();
				ProcessWarehouseTasks.updateExceptionPickedUoM(iSerialNumberCount);
				var sSerialInputId = this.getExceptionSerialInputId();
				this.updateInputWithDefault(sSerialInputId, "");
				this.focusTo(sSerialInputId);
			} else {
				this.updateInputWithDefault("quantityAdjustment-input", "");
				// this.updateExceptionDestHUInput(sDestHUId, false);
			}
		},

		/**
		 * enable cart interaction mode when group header information scanned correctly.highlight cart position.
		 * @public override
		 */
		enableCartInteraction: function () {
			this.hightlightDestHUinGrid();
		},

		disableCartInteraction: function () {
			//this.initCartStatus(ProcessWarehouseTasks.getAllTasks());
			ProcessWarehouseTasks.disableException();
		},

		setBusyForLowqtyCheckDialog: function (bBusy) {
			this.byId("lowQuantityCheckDialog").setBusy(bBusy);
		},

		/******* serial number popover begin*********/
		getSerialNumberPopover: function () {
			if (!this._oSerialNumberPopover) {
				this._oSerialNumberPopover = sap.ui.xmlfragment("sn_popover", "scm.ewm.pickcarts1.view.dialog.SerialNumberPopover", this);
				this.getView().addDependent(this._oSerialNumberPopover);
			}
			this.oSNInput = sap.ui.core.Fragment.byId("sn_popover", serialNumberInputId);
			return this._oSerialNumberPopover;
		},

		openSerialNumberPopover: function () {
			var serialModel = this.getView().getModel("serialNum");
			serialModel.updateBindings(true);
			var oPopover = this.getSerialNumberPopover();
			this.updateSerialNumInput(ValueState.None, "", "");

			jQuery.sap.delayedCall(500, this, function () {
				var oElement = this.byId(serialNumberIconId);
				oPopover.openBy(oElement);
			}.bind(this));

			var sTitle = this.getSerialNumPopoverTitle();
			oPopover.setTitle(sTitle);
		},

		getSerialNumPopoverTitle: function () {
			var sFirstPosition = PickCartLayout.getUnprocessedPositions()[0];
			var destHU = ProcessWarehouseTasks.getDestHUFromTasksByPosition(sFirstPosition);

			return this.getI18nText("serialNum", [destHU]);
		},

		closeSerialNumberPopover: function () {
			this.getSerialNumberPopover().close();
		},

		onSerialNumChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("newValue"));
			sInput = sInput.toUpperCase();

			var oVerifyPromise;
			oVerifyPromise = this.getSerialNumberVerifyPromise(sInput);
			oVerifyPromise
				.then(function (oSuccess) {
					this.addSerialNumber(sInput, true);
					this.updateSerialNumInput(ValueState.None, "", "");
					if (this.isAllSerialNumberFinished()) {
						this.closeSerialNumberPopover();
						this.focusTo(destHUId);
					}
				}.bind(this))
				.catch(function (sError) {
					this.updateSerialNumInput(ValueState.Error, sError, "");
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		onSerialNumForLowQtyCheckChange: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("newValue"));
			sInput = sInput.toUpperCase();

			if (Util.isEmpty(sInput)) {
				this.updateInputWithDefault(serialNumberForLowQtyCheckInputId, "");
				this.focusTo(serialNumberForLowQtyCheckInputId);
				return;
			}

			var oVerifyPromise;
			oVerifyPromise = this.getSerialNumberVerifyPromise(sInput, false);
			oVerifyPromise
				.then(function (oSuccess) {
					this.addSerialNumber(sInput, false);
					this.updateInputWithDefault(serialNumberForLowQtyCheckInputId, "");
					this.focusTo(serialNumberForLowQtyCheckInputId);
					ProcessWarehouseTasks.updateExceptionPickedUoM(SerialNumber.getSerialNumberCount(false), false);
					ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.VALID);
				}.bind(this))
				.catch(function (sError) {
					this.updateInputWithError(serialNumberForLowQtyCheckInputId, sError);
					this.focusTo(serialNumberForLowQtyCheckInputId);
					this.playAudio(Const.ERROR);
				}.bind(this));
		},

		getSerialNumberVerifyPromise: function (sInput, bForTaskPicking) {
			var sProduct = ProcessWarehouseTasks.getProductOfCurrentGroup();
			var sErrorMsg = this.getI18nText("duplicateSNMsg");
			var oVerifyPromise;
			if (SerialNumber.hasSerialNumber(sInput, bForTaskPicking)) {
				oVerifyPromise = new Promise(function (resolve, reject) {
					reject(sErrorMsg);
				});
			} else {
				oVerifyPromise = ODataHelper.verifySerialNumber(sProduct, sInput);
			}
			return oVerifyPromise;
		},

		onPressSerialNum: function () {
			this.openSerialNumberPopover();
		},

		resetSerialNumber: function () {
			SerialNumber.clearData();
			this.disableSerialNumberIcon();
		},

		onSerialNumberDeleteForTasksPicking: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			var sSerialNum = oItem.getTitle();
			SerialNumber.removeSerialNumber(sSerialNum);
			jQuery.sap.delayedCall(1, this, function () {
				this.updateSerialNumInput(ValueState.None, "", "");
			}.bind(this));

			ProcessWarehouseTasks.enableException();
			ProcessWarehouseTasks.updateExceptionPickedUoM(SerialNumber.getSerialNumberCount());
			if (SerialNumber.getSerialNumberCount() === 0) {
				ProcessWarehouseTasks.setFullDenialEnable(true);
			}
			this.onSerialNumberDelete(sSerialNum);

			jQuery.sap.delayedCall(1, this, function () {
				this.updateSerialNumInput(ValueState.None, "", "");
			}.bind(this));

			ProcessWarehouseTasks.enableException();
			if (SerialNumber.getSerialNumberCount() === 0) {
				ProcessWarehouseTasks.setFullDenialEnable(true);
			}
		},

		onSerialNumberDeleteForLowQtyCheck: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			var sSerialNum = oItem.getTitle();
			this.onSerialNumberDelete(sSerialNum, false);
			if (SerialNumber.getSerialNumberCount(false) === 0) {
				ProcessWarehouseTasks.setLowQuantityCheckState(Const.CONTROL_STATUS.EMPTY);
			}
		},

		onSerialNumberDelete: function (sSerialNum, bForTaskPicking) {
			SerialNumber.removeSerialNumber(sSerialNum, bForTaskPicking);
			ProcessWarehouseTasks.updateExceptionPickedUoM(SerialNumber.getSerialNumberCount(bForTaskPicking), bForTaskPicking);
		},

		onSerialNumClear: function () {
			SerialNumber.clearData();
			this.updateSerialNumInput(ValueState.None, "", "");
			ProcessWarehouseTasks.enableException();
			ProcessWarehouseTasks.setFullDenialEnable(true);
		},

		isAllSerialNumberFinished: function () {
			if (!ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup()) {
				return this.getUnConfirmQtyOfCurrentTasksForSerialManaged() <= SerialNumber.getSerialNumberCount();
			} else {
				return ProcessWarehouseTasks.getCurrentPickQuantity() * ProcessWarehouseTasks.getAlternativeUOMRatio() <= SerialNumber.getSerialNumberCount();
			}
		},

		getUnConfirmQtyOfCurrentTasksForSerialManaged: function () {
			var totalQty = 0;
			var oCurrentTaskGroup = ProcessWarehouseTasks.getCurrentTaskGroup();
			var aTasks = oCurrentTaskGroup.tasks || [];
			var aLogicalPositions = ProcessWarehouseTasks.getAllPositionsFromUnConfirmTasks(aTasks);
			var sFirstPosition = PickCartLayout.getFirstPositionForSerialManaged(aLogicalPositions);
			aTasks.forEach(function (oTask) {
				if (oTask.confirm === false && oTask.logicalPosition === sFirstPosition) {
					totalQty += oTask.baseQty;
				}
			});
			return totalQty;
		},
		updateSerialNumInput: function (sValueState, sValueStateText, sValue) {
			this.oSNInput.setValueState(sValueState);
			this.oSNInput.setValueStateText(sValueStateText);
			if (sValue !== undefined) {
				this.oSNInput.setValue(sValue);
			}
			this.oSNInput.focus();
		},

		updateSerialNumForLowQtyCheckInput: function (sValueState, sValueStateText, sValue) {
			var oSNInput = sap.ui.core.Fragment.byId("lowQty_check", serialNumberForLowQtyCheckInputId);
			oSNInput.setValueState(sValueState);
			oSNInput.setValueStateText(sValueStateText);
			if (sValue !== undefined) {
				oSNInput.setValue(sValue);
			}
			oSNInput.focus();
		},
		getTotalQuantityForSerialNum: function () {
			if (ProcessWarehouseTasks.isMultiSourceHUOfCurrentGroup()) {
				var fRatio = ProcessWarehouseTasks.getAlternativeUOMRatio();
				return fRatio * ProcessWarehouseTasks.getCurrentPickQuantity();
			} else {
				return this.getUnConfirmQtyOfCurrentTasksForSerialManaged();
			}
		},
		formatSerialNumInputVisible: function (aSerialNums) {
			var totalQuantity = this.getTotalQuantityForSerialNum();
			var serialNumCount = aSerialNums.length;

			return serialNumCount < totalQuantity;
		},
		formatSerialNumQtyDisplay: function (aSerialNums, sBaseUnit) {
			var totalQuantity = this.getTotalQuantityForSerialNum();
			var serialNumCount = aSerialNums.length;
			return serialNumCount + "/" + totalQuantity + " " + sBaseUnit;
		},
		formatExceptionUomVisible: function (bSerialNumberEnable, fBaseQuantity, fTotalAlternativeQuantity) {
			if (bSerialNumberEnable && fBaseQuantity / fTotalAlternativeQuantity !== 1) {
				return true;
			}
			return false;
		}
	});
});