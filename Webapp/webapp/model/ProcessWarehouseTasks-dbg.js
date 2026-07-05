/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/utils/Const",
	"zscm/ewm/pickcarts1/utils/Util",
	"sap/ui/core/format/NumberFormat"
], function(JSONModel, Global, Const, Util, NumberFormat) {
	"use strict";
	var _oModel;
	return {
		init: function() {
			if (_oModel === undefined) {
				_oModel = new JSONModel({
					enableException: false,
					enableFullDenial: true,
					errors: [],
					sourceBinState: Const.CONTROL_STATUS.EMPTY,
					sourceHUState: Const.CONTROL_STATUS.EMPTY,
					destHUState: Const.CONTROL_STATUS.EMPTY,
					productState: Const.CONTROL_STATUS.EMPTY,
					batchState: Const.CONTROL_STATUS.EMPTY,
					taskGroupProgress: 0,
					warehouseTaskGroups: [{
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
						lowQuantity: 0, //for low stock
						lowQuantityState: Const.CONTROL_STATUS.EMPTY,
						quantityAdjustState: Const.CONTROL_STATUS.EMPTY,
						currentPickQty: 0, //for multiple source hu
						productImg: "",
						EAN: "",
						isSerialNumberEnabled: false,
						tasks: [{
							quantity: 0, //qty in alternative uom
							baseQty: 0, //qty in base uom
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
							confirm: false
						}],
						progress: 0,
						stock: [{
							sourceHU: "",
							batchNo: "",
							quantity: 0
						}]
					}],
					currentWarehouseTaskGroup: {},
					exceptions: [],
					exceptionInfo: {
						"destHU": "",
						"pickedQuantity": "",
						"destHUState": Const.CONTROL_STATUS.EMPTY,
						"pickedQuantityState": Const.CONTROL_STATUS.EMPTY,
						"pickingHU": "",
						"pickingHUState": Const.CONTROL_STATUS.EMPTY,
						"positionLabel": "",
						"logicalPosition": "",
						"logicalPositionState": Const.CONTROL_STATUS.EMPTY,
						"exceptionCode": "",
						"packageMaterial": "",
						"pickedUoM": "0",
						"lowQtyCheckUom": "0"
					}
				});
			}
			return _oModel;
		},
		destroy: function() {
			_oModel = undefined;
		},
		setErrors: function(aError) {
			_oModel.setProperty("/errors", aError);
		},
		clearData: function() {
			_oModel.setProperty("/taskGroupProgress", 0);
			_oModel.setProperty("/warehouseTaskGroups", []);
			_oModel.setProperty("/currentWarehouseTaskGroup", {});
			_oModel.setProperty("/enableException", false);
			_oModel.setProperty("/errors", []);
		},

		/**
		 * update current stock after consume iQunantiy stock
		 *
		 * @param {int} iQuantity The consumed quantity in current source hu
		 * @return {int} the quantity left in the current source hu with specified batch no
		 */
		updateCurrentStock: function(iQuantity) {
			var aStocks = this.getStockOfCurrentGroup();
			var sSourceHU = this.getSourceHUOfCurrentGroup();
			var sBatch = this.getBatchNo();
			var oResult = Util.find(aStocks, function(oStock) {
				if (oStock.sourceHU === sSourceHU && oStock.batchNo === sBatch) {
					return true;
				}
				return false;
			});
			if (oResult) {
				oResult.quantity -= iQuantity;
				return this.roundQuantity(oResult.quantity);
			}
		},

		getCurrentNeedQuantity: function() {
			var oCurrentGroup = this.getCurrentTaskGroup();
			var iNeedQuantity = oCurrentGroup.totalAlternativeQty - oCurrentGroup.actualQuantity;
			return this.roundQuantity(iNeedQuantity);
		},

		getConfirmDataForMultipleSourceHU: function(sDestHU) {
			var oCurrentGroup = this.getCurrentTaskGroup();
			var aCurrentTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
			var sPickedQuantity = this.getCurrentPickQuantity().toString();
			var aSeparateTasks = this.separateTasksFromException(aCurrentTasks, sPickedQuantity, "");
			var sConfirmMode = Const.CONF_MODE.NO_NEED_CHECK;
			if (this.isFinishedPickingOfTask()) {
				sConfirmMode = Const.CONF_MODE.NEED_CHECK;
			}
			var aTasks = [];
			aSeparateTasks[0].forEach(function(oTask) {
				aTasks.push({
					TANUM: oTask.taskNumber,
					VLENR: oCurrentGroup.sourceHU,
					BATCH: oCurrentGroup.batchNo,
					NISTA: oTask.quantity.toString(),
					EXC: "",
					NLPLA: "",
					RESTA: ""
				});
			});
			if (aSeparateTasks[1].length > 0 && aSeparateTasks[1][0].quantity !== 0) {
				aTasks.push({
					TANUM: aSeparateTasks[1][0].taskNumber,
					VLENR: oCurrentGroup.sourceHU,
					BATCH: oCurrentGroup.batchNo,
					NISTA: aSeparateTasks[1][0].quantity.toString(),
					EXC: "",
					NLPLA: "",
					RESTA: ""
				});
			}
			return [aTasks, sConfirmMode, aSeparateTasks[1][0]];
		},

		/**
		 * determin if the all the required quantity of the product are picked - only for the case of multi source hu
		 *
		 * @return {bool} bFinished true, do not need pick again
		 */
		isFinishedPickingOfTask: function() {
			var bFinished = false;
			var oCurrentTaskGroup = this.getCurrentTaskGroup();
			var needQty = oCurrentTaskGroup.totalAlternativeQty - oCurrentTaskGroup.actualQuantity - oCurrentTaskGroup.currentPickQty;
			if (this.roundQuantity(needQty) === 0) {
				bFinished = true;
			}
			return bFinished;
		},
		/**
		 * determin if all pikcking group are finished
		 *
		 * @return {bool} true, if all task group are finished. otherwise false
		 */
		isAllGroupFinished: function() {
			return this.getTaskGroupProgress() < this.getTaskGroups().length;
		},

		isSourceHandlingUnitMandatory: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/sourceHUMandatory");
		},
		setSourceHandlingUnitMandatory: function(sValue) {
			_oModel.setProperty("/currentWarehouseTaskGroup/sourceHUMandatory", sValue);
		},

		/**
		 * get confirm data from tasks
		 * @param {string} sDestHU The destHU input throught the header field or exception dialog
		 * @param {array} aSeparateTasks The task items to confirm, only used for split exception
		 * @return {array} aTasks The confirm data for submitTask
		 */
		getConfirmData: function(sDestHU, aSeparateTasks) {
			var oCurrentGroup = this.getCurrentTaskGroup();
			var aTasks = [];
			var aCurrentTasks = [];
			var aUnprocessedTasks = [];
			var aRestTasks = [];
			var aCurrentSeparateTasks = [];
			var sPickedQuantity = this.getExceptionPickedQuantity();
			var sExternalCode = this.getExceptionCode();
			var sInternalCode = this.getInternalExceptionCode(sExternalCode);
			var oExceptionType = Const.EXCEPTION_TYPE;
			var sConfirmMode = Const.CONF_MODE.NO_NEED_CHECK;
			if (sExternalCode === "") {
				aCurrentTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
				if (oCurrentGroup.progress === (oCurrentGroup.tasks.length - aCurrentTasks.length)) {
					for (var i = 0; i < aCurrentTasks.length - 1; i++) {
						aTasks.push({
							TANUM: aCurrentTasks[i].taskNumber,
							VLENR: oCurrentGroup.sourceHU,
							BATCH: oCurrentGroup.batchNo,
							NISTA: aCurrentTasks[i].quantity.toString(),
							EXC: "",
							NLPLA: "",
							RESTA: ""
						});
					}
					aTasks.push({
						TANUM: aCurrentTasks[i].taskNumber,
						VLENR: oCurrentGroup.sourceHU,
						BATCH: oCurrentGroup.batchNo,
						NISTA: aCurrentTasks[i].quantity.toString(),
						EXC: "",
						NLPLA: "",
						RESTA: ""
					});
					sConfirmMode = Const.CONF_MODE.NEED_CHECK;
				} else {
					aCurrentTasks.forEach(function(oTask) {
						aTasks.push({
							TANUM: oTask.taskNumber,
							VLENR: oCurrentGroup.sourceHU,
							BATCH: oCurrentGroup.batchNo,
							NISTA: oTask.quantity.toString(),
							EXC: "",
							NLPLA: "",
							RESTA: ""
						});
					});
				}
			} else {
				switch (sInternalCode) {
					case oExceptionType.BIDF:
						aUnprocessedTasks = this.getCurrentUnconfirmTasks();
						aUnprocessedTasks.forEach(function(oTask) {
							aTasks.push({
								TANUM: oTask.taskNumber,
								VLENR: oCurrentGroup.sourceHU,
								BATCH: oCurrentGroup.batchNo,
								NISTA: "0",
								EXC: sExternalCode,
								NLPLA: "",
								RESTA: ""
							});
						});
						break;
					case oExceptionType.BIDP:
					case oExceptionType.DIFF:
						aCurrentTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
						aCurrentSeparateTasks = this.separateTasksFromException(aCurrentTasks, sPickedQuantity, sExternalCode);
						aRestTasks = this.getUnconfirmTasksExcludeExceptionHU(sDestHU);
						aCurrentSeparateTasks[0].forEach(function(oTask) {
							aTasks.push({
								TANUM: oTask.taskNumber,
								VLENR: oCurrentGroup.sourceHU,
								BATCH: oCurrentGroup.batchNo,
								NISTA: oTask.quantity.toString(),
								EXC: "",
								NLPLA: "",
								RESTA: ""
							});
						});
						aCurrentSeparateTasks[1].forEach(function(oTask) {
							aTasks.push({
								TANUM: oTask.taskNumber,
								VLENR: oCurrentGroup.sourceHU,
								BATCH: oCurrentGroup.batchNo,
								NISTA: oTask.quantity.toString(),
								EXC: sExternalCode,
								NLPLA: "",
								RESTA: ""
							});
						});
						aRestTasks.forEach(function(oTask) {
							aTasks.push({
								TANUM: oTask.taskNumber,
								VLENR: oCurrentGroup.sourceHU,
								BATCH: oCurrentGroup.batchNo,
								NISTA: "0",
								EXC: sExternalCode,
								NLPLA: "",
								RESTA: ""
							});
						});
						break;
					case oExceptionType.SPLT:
						aSeparateTasks[0].forEach(function(oTask) {
							aTasks.push({
								TANUM: oTask.taskNumber,
								VLENR: oCurrentGroup.sourceHU,
								BATCH: oCurrentGroup.batchNo,
								NISTA: oTask.quantity.toString(),
								EXC: "",
								NLPLA: "",
								RESTA: ""
							});
						});
						if (aSeparateTasks[1][0].quantity !== 0) {
							aTasks.push({
								TANUM: aSeparateTasks[1][0].taskNumber,
								VLENR: oCurrentGroup.sourceHU,
								BATCH: oCurrentGroup.batchNo,
								NISTA: aSeparateTasks[1][0].quantity.toString(),
								EXC: sExternalCode,
								NLPLA: "",
								RESTA: ""
							});
						}
						break;
				}
			}
			return [aTasks, sConfirmMode];
		},
		getConfirmTasksWithSerialNumber: function(aTasks, aSerialNumbers) {
			var fRatio = this.getAlternativeUOMRatio();
			var aSerialTasks = [];
			var sSerialNumber;
			var i;
			var j = 0;
			aTasks.forEach(function(oTask) {
				for (i = Number(oTask.NISTA) * fRatio; i > 0;) {
					sSerialNumber = aSerialNumbers[j];
					j++;
					aSerialTasks.push({
						TANUM: oTask.TANUM,
						SERID: sSerialNumber
					});
					i = this.roundQuantity(i - 1);
				}
			}.bind(this));
			return aSerialTasks;
		},

		getConfirmTasksWithSerialNumberForLowQtyCheck: function(aTasks, aSerialNumbers) {
			var aSerialTasks = [];
			var sSerialNumber;
			var mLastTask = aTasks[aTasks.length - 1];

			for (var i = 0; i < aSerialNumbers.length; i++) {
				sSerialNumber = aSerialNumbers[i];
				aSerialTasks.push({
					TANUM: mLastTask.TANUM,
					SERID: sSerialNumber
				});
			}

			return aSerialTasks;
		},

		/**
		 * get confirm data for low stock check
		 *
		 * @param {int} iQuantity The actual quantity for low stock confirmation
		 * @return {array} aTasks The confirm data for submitTask
		 */
		getConfirmDataForLowStock: function(iQuantity, sDestHU) {
			var oCurrentGroup = _oModel.getProperty("/currentWarehouseTaskGroup");
			var sConfMode = Const.CONF_MODE.REJECT_CHECK;
			var aTasks = [];
			if (this.getLowQuantityCheckState() === Const.CONTROL_STATUS.VALID) {
				sConfMode = Const.CONF_MODE.CHECK_WITH_LOW_QTY;
			}

			var aCurrentOpenTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
			aCurrentOpenTasks.forEach(function(oTask) {
				aTasks.push({
					TANUM: oTask.taskNumber,
					VLENR: oCurrentGroup.sourceHU,
					BATCH: oCurrentGroup.batchNo,
					NISTA: oTask.quantity,
					EXC: "",
					NLPLA: "",
					RESTA: iQuantity
				});
			});
			return [aTasks, sConfMode];
		},

		/**
		 * wether need to popup dialog for low stock check
		 *
		 * @param {array} aResults The confirm results
		 * @return {boolean} true If low quantity check is needed
		 */
		needLowQuantityCheck: function(aResults) {
			var oResult = Util.find(aResults, function(oItem) {
				if (oItem.PopLowqtyCheck === "X") {
					return true;
				}
				return false;
			});
			if (oResult) {
				return true;
			}
			return false;
		},

		/**
		 * sort tasks according to quantity ascending
		 * @param {array} aTasks The tasks to be sorted
		 * @return {array} aTasks The sorted tasks
		 */
		sortTasksByQuantity: function(aTasks) {
			aTasks.sort(function(task1, task2) {
				return task1.quantity - task2.quantity;
			});
			return aTasks;
		},

		/**
		 * get the task numbers from given tasks
		 * @param {array} aTasks The tasks to get task number from
		 * @return {array} aTaskNumber The task number list
		 */
		getTaskNumbers: function(aTasks) {
			var aTaskNumber = [];
			aTasks.forEach(function(oTask) {
				aTaskNumber.push(oTask.taskNumber);
			});
			return aTaskNumber;
		},

		/**
		 * get the task numbers from given tasks and match the position
		 * @param {array} aTasks The tasks to get task number from
		 * @param {sPosition} sPosition The logicalposition positons to get task number from
		 * @return {array} aTaskNumber The task number list
		 */
		getTaskNumbersByPosition: function(aTasks, sPosition) {
			var aTaskNumber = [];
			aTasks.forEach(function(oTask) {
				if (oTask.logicalPosition === sPosition) {
					aTaskNumber.push(oTask.taskNumber);
				}
			});
			return aTaskNumber;
		},

		/**
		 * joint the task numbers for auto confirm 		 *
		 * @param {array} aTasks The tasks to get task number and joint
		 * @return {string} sJointTasksNumber The task numbers joint with "_"
		 */
		jointTasksNumbers: function(aTasks) {
			var sJointTasksNumber = "";
			var aTaskNumbers = this.getTaskNumbers(aTasks);
			if (aTaskNumbers.length !== 0) {
				sJointTasksNumber = aTaskNumbers[0];
			}
			aTaskNumbers.slice(1).forEach(function(sTaskNumber) {
				sJointTasksNumber += "_" + sTaskNumber;
			});
			return sJointTasksNumber;
		},

		/**
		 * check if all tasks confirm successfully in one position 		 *
		 * @param {string} sPosition The logical position
		 * @return {boolean} true If all tasks successed
		 */
		isAllTasksSuccessedInPosition: function(sPosition) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oResult = Util.find(aTasks, function(oTask) {
				if (oTask.logicalPosition === sPosition && oTask.confirm === false) {
					return true;
				}
				return false;
			});
			if (oResult) {
				return false;
			}
			return true;
		},

		/**
		 * check if all tasks confirm successfully 		 *
		 * @param {array} aResult The confirm results
		 * @return {boolean} true If all tasks successed
		 */
		isAllConfirmSuccess: function(aResult) {
			var oResult = Util.find(aResult, function(oItem) {
				if (oItem.Failed === "X") {
					return true;
				}
				return false;
			});
			if (oResult) {
				return false;
			}
			return true;
		},

		/**
		 * get the task by task numbers
		 * @param {string} sTaskNumber The task number
		 * @return {object} oTask The task with required task number
		 */
		getTaskByTaskNumber: function(sTaskNumber) {
			var oTask = {};
			var aTasks = this.getCurrentTaskGroup().tasks;
			aTasks.forEach(function(oItem) {
				if (oItem.taskNumber === sTaskNumber) {
					oTask = oItem;
				}
			});
			return oTask;
		},

		/**
		 * get as many normal tasks as possible when exception happen
		 * @param {array} aSortTasks The tasks that have been sorted ascending according to quantity
		 * @param {integer} iPickedQuantity The picked quantity of current exception
		 * @return {array} [aNormalTasks, iIndex, iSumQuantity] aNormalTasks The tasks that should be normal confirm,
		 * iIndex The number of tasks that can normal confirm
		 * iSumQuantity The total quantity in aNormalTasks
		 */
		getMostNormalTasks: function(aSortTasks, iPickedQuantity) {
			var i = 0;
			var iSumQuantity = 0;
			var aNormalTasks = [];
			while (i < aSortTasks.length) {
				iSumQuantity += aSortTasks[i].quantity;
				if (this.roundQuantity(iSumQuantity) > iPickedQuantity) {
					iSumQuantity -= aSortTasks[i].quantity;
					break;
				}
				aNormalTasks.push(aSortTasks[i]);
				i++;
			}
			return [aNormalTasks, this.roundQuantity(iSumQuantity)];
		},

		/**
		 * optimize the total quantity of normal confirm task when exception happen
		 * @param {array} aSortTasks The tasks that have been sorted ascending according to quantity
		 * @param {array} aNormalTasks The tasks that should be normal confirm before optimization
		 * @param {integer} iPickedQuantity The picked quantity of current exception
		 * @param {integer} iSumQuantity The total quantity of normal confirm tasks before optimization		 *
		 * @return {array} [aNormalTasks, iNewSumQuantity] aNormalTasks The tasks that should be normal confirm,
		 * iNewSumQuantity The total quantity of normal confirm tasks after optimization
		 */
		optimizeConfirmQuantity: function(aSortTasks, aNormalTasks, iPickedQuantity, iSumQuantity) {
			var iIndex = aNormalTasks.length - 1;
			var j = iIndex;
			var m = aSortTasks.length - 1;
			var tempQuantity = 0;
			var tempIndex = 0;
			var oTask = {};
			var iNewSumQuantity = 0;
			while (m > iIndex && iPickedQuantity < this.roundQuantity(iSumQuantity + aSortTasks[m].quantity - aNormalTasks[j].quantity)) {
				m--;
			}
			if (m > iIndex) {
				for (; m > iIndex; m--) {
					while (j >= 0 && iPickedQuantity >= this.roundQuantity(iSumQuantity + aSortTasks[m].quantity - aNormalTasks[j].quantity)) {
						j--;
					}
					if (aSortTasks[m].quantity !== aNormalTasks[j + 1].quantity && tempQuantity < this.roundQuantity(aSortTasks[m].quantity -
							aNormalTasks[j + 1].quantity)) {
						oTask = aSortTasks[m];
						tempIndex = j + 1;
						tempQuantity = this.roundQuantity(aSortTasks[m].quantity - aNormalTasks[j + 1].quantity);
						j = iIndex;
					}
				}
				if (oTask.quantity !== undefined) {
					iNewSumQuantity = iSumQuantity - aNormalTasks[tempIndex].quantity + oTask.quantity;
					aNormalTasks[tempIndex] = oTask;
				}
			}
			return [aNormalTasks, this.roundQuantity(iNewSumQuantity)];
		},

		/**
		 * separate tasks when there are multiple tasks in one destHU
		 *
		 * @param {array} aTasks The tasks to be separated
		 * @param {string} sPickedQuantity The picked quantity of current exception
		 * @param {string} sException The external code of current exception
		 * @return {array} [aNormalTasks, aExceptionTasks] aNormalTasks The tasks that should be normal confirm,
		 * aExceptionTasks The tasks that should be confirm with exception
		 */
		separateTasksFromException: function(aTasks, sPickedQuantity, sException) {
			var aSortTasks = [];
			var aNormalTasks = [];
			var aExceptionTasks = [];
			var aTaskNumbers = [];
			var iPickedQuantity = parseFloat(sPickedQuantity, 10);

			var iSumQuantity;
			var iIndex;
			var aOriginalResult = [];
			var aOptimizeResult = [];

			this.sortTasksByQuantity(aTasks).forEach(function(oTask) {
				var oNewOtask = JSON.parse(JSON.stringify(oTask));
				aSortTasks.push(oNewOtask);
			});
			aOriginalResult = this.getMostNormalTasks(aSortTasks, iPickedQuantity);
			aNormalTasks = aOriginalResult[0];
			iIndex = aNormalTasks.length - 1;
			iSumQuantity = aOriginalResult[1];
			if (iIndex < aSortTasks.length - 1 && iIndex >= 0) {
				aOptimizeResult = this.optimizeConfirmQuantity(aSortTasks, aNormalTasks, iPickedQuantity, iSumQuantity, iIndex);
				if (aOptimizeResult[1] > iSumQuantity) {
					aNormalTasks = aOptimizeResult[0];
					iSumQuantity = aOptimizeResult[1];
				}
			}
			aTaskNumbers = this.getTaskNumbers(aNormalTasks);
			aSortTasks.forEach(function(oItem) {
				if (!Util.includes(aTaskNumbers, oItem.taskNumber)) {
					oItem.quantity = 0;
					oItem.exception = sException;
					aExceptionTasks.push(oItem);
				}
			});
			if (aExceptionTasks.length > 0) {
				aExceptionTasks[0].quantity = this.roundQuantity(iPickedQuantity - iSumQuantity);
			}
			return [aNormalTasks, aExceptionTasks];
		},

		/**
		 * get the logical positions from the input task list		 *
		 * @param {array} aTasks The tasks list to get positions from
		 * @return {array} aLogicalPositions The logical positions set of the tasks
		 */
		getAllPositionsFromTasks: function(aTasks) {
			var aLogicalPositions = [];
			aTasks.forEach(function(oTask) {
				if (aLogicalPositions.length === 0) {
					aLogicalPositions.push(oTask.logicalPosition);
				} else {
					if (!Util.includes(aLogicalPositions, oTask.logicalPosition)) {
						aLogicalPositions.push(oTask.logicalPosition);
					}
				}
			});
			return aLogicalPositions;
		},

		/**
		 * get the logical positions from the input task list		 *
		 * @param {array} aTasks The tasks list to get positions from
		 * @return {array} aLogicalPositions The logical positions set of the tasks
		 */
		getAllPositionsFromUnConfirmTasks: function(aTasks) {
			var aLogicalPositions = [];
			aTasks.forEach(function(oTask) {
				if (oTask.confirm === false) {
					if (aLogicalPositions.length === 0) {
						aLogicalPositions.push(oTask.logicalPosition);
					} else {
						if (!Util.includes(aLogicalPositions, oTask.logicalPosition)) {
							aLogicalPositions.push(oTask.logicalPosition);
						}
					}
				}
			});
			return aLogicalPositions;
		},

		/**
		 * get the package material from current task group by destHU		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} sPackageMaterial The package material that match the dest HU
		 */
		getPackageMaterialByDestHU: function(sDestHU) {
			var sPackageMaterial;
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oResult = Util.find(aTasks, function(oTask) {
				if (oTask.destHU === sDestHU) {
					return true;
				}
				return false;
			});
			if (oResult) {
				sPackageMaterial = oResult.packageMaterial;
			}
			return sPackageMaterial;
		},

		/**
		 * get the package material from current task group by destHU		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} sPackageMaterial The package material that match the dest HU
		 */
		getLineNumberByDestHU: function(sDestHU) {
			var sLineNumber;
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oResult = Util.find(aTasks, function(oTask) {
				if (oTask.destHU === sDestHU) {
					return true;
				}
				return false;
			});
			if (oResult) {
				sLineNumber = oResult.lineNumber;
			}
			return sLineNumber;
		},

		/**
		 * get the task numbers from current task group by LogicalPosition		 *
		 * @param {string} sLogicalPosition The logical position in pick cart
		 * @return {array} aTaskNumber The task number list
		 */
		getTaskNumbersByLogicalPosition: function(sLogicalPosition) {
			var aTaskNumber;
			var aTasks = this.getCurrentTaskGroup().tasks;
			aTasks.forEach(function(oTask) {
				if (oTask.logicalPosition === sLogicalPosition) {
					aTaskNumber.push(oTask.taskNumber);
				}
			});
			return aTaskNumber;
		},
		/**
		 * update the task quantity and exception info by task id
		 *
		 * @param {array} aTaskIds The task number list
		 * @param {int} iQuantity The picked quantity
		 * @param {string} sException The exception code
		 */
		updateTasksWithExceptionByTaskIds: function(sTaskNumber, iQuantity, sException) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oTask = Util.find(aTasks, function(oItem) {
				if (oItem.taskNumber === sTaskNumber) {
					return true;
				}
				return false;
			});
			if (oTask) {
				oTask.quantity = iQuantity;
				oTask.exception = sException;
			}
			// _oModel.setProperty("/currentWarehouseTaskGroup/tasks", aTasks);
		},

		/**
		 * update the task quantity and exception info by task id
		 *
		 * @param {array} aTaskItems The task item list
		 * @param {int} iQuantity The picked quantity
		 * @param {string} sException The exception code
		 */
		updateTaskByTaskItem: function(oTaskItem) {
			if (oTaskItem !== undefined) {
				var aTasks = this.getCurrentTaskGroup().tasks;

				var oResult = Util.find(aTasks, function(oTask) {
					if (oTaskItem.taskNumber === oTask.taskNumber) {
						return true;
					}
					return false;
				});
				if (oResult) {
					oResult.quantity = oResult.quantity - oTaskItem.quantity;
					oResult.baseQty = this.roundQuantity(oResult.quantity * this.getAlternativeUOMRatio());
					oResult.quantity = this.roundQuantity(oResult.quantity);
				}
			}
		},

		//exception begin
		setExceptions: function(aException) {
			_oModel.setProperty("/exceptions", aException);
		},
		getExceptions: function() {
			return _oModel.getProperty("/exceptions");
		},
		getInternalExceptionCode: function(sExternalExceptionCode) {
			var aExceptions = this.getExceptions();
			var oResult = Util.find(aExceptions, function(oException) {
				if (oException.WarehouseTaskExceptionCode === sExternalExceptionCode) {
					return true;
				}
				return false;
			});
			if (oResult) {
				return oResult.InternalProcessCode;
			}
		},
		getExternalExceptionCode: function(sExceptionDescription) {
			var aExceptions = this.getExceptions();
			var oResult = Util.find(aExceptions, function(oException) {
				if (oException.ExceptionCodeName === sExceptionDescription) {
					return true;
				}
				return false;
			});
			if (oResult) {
				// return oResult.InternalProcessCode;
				return oResult.WarehouseTaskExceptionCode;
			}
		},
		/**
		 * set external exception code
		 *
		 * @param {string} sCode The external exception code
		 */
		setExceptionCode: function(sCode) {
			_oModel.setProperty("/exceptionInfo/exceptionCode", sCode);
		},

		clearExceptionInfo: function() {
			_oModel.setProperty("/exceptionInfo", {
				"destHU": "",
				"pickedQuantity": "",
				"destHUState": Const.CONTROL_STATUS.EMPTY,
				"pickedQuantityState": Const.CONTROL_STATUS.EMPTY,
				"pickingHU": "",
				"pickingHUState": Const.CONTROL_STATUS.EMPTY,
				"positionLabel": "",
				"logicalPosition": "",
				"logicalPositionState": Const.CONTROL_STATUS.EMPTY,
				"exceptionCode": ""
			});
		},
		getExceptionDestHU: function() {
			return _oModel.getProperty("/exceptionInfo/destHU");
		},

		setExceptionDestHU: function(sDestHU) {
			_oModel.setProperty("/exceptionInfo/destHU", sDestHU);
		},

		getExceptionPickedQuantity: function() {
			return _oModel.getProperty("/exceptionInfo/pickedQuantity");
		},

		getExceptionCode: function() {
			return _oModel.getProperty("/exceptionInfo/exceptionCode");
		},
		getExceptionLogicalPosition: function() {
			return _oModel.getProperty("/exceptionInfo/logicalPosition");
		},

		setExceptionLogicalPosition: function(sLogicalPosition) {
			_oModel.setProperty("/exceptionInfo/logicalPosition", sLogicalPosition);
		},

		getExceptionPickingHU: function() {
			return _oModel.getProperty("/exceptionInfo/pickingHU");
		},
		setExceptionPickingHU: function(sPickingHU) {
			_oModel.setProperty("/exceptionInfo/pickingHU", sPickingHU);
		},
		setExceptionPickingHUState: function(sPickingHUState) {
			_oModel.setProperty("/exceptionInfo/pickingHUState", sPickingHUState);
		},
		getExceptionPickingHUState: function() {
			return _oModel.getProperty("/exceptionInfo/pickingHUState");
		},
		getExceptionDestHUState: function() {
			return _oModel.getProperty("/exceptionInfo/destHUState");
		},
		setExceptionDestHUState: function(sState) {
			_oModel.setProperty("/exceptionInfo/destHUState", sState);
		},
		setExceptionPickedQuantity: function(sQuantity) {
			_oModel.setProperty("/exceptionInfo/pickedQuantity", sQuantity);
		},
		setExceptionPickedQuantityState: function(sState) {
			_oModel.setProperty("/exceptionInfo/pickedQuantityState", sState);
		},
		getExceptionPickedQuantityState: function() {
			return _oModel.getProperty("/exceptionInfo/pickedQuantityState");
		},
		setExceptionLogicalPositionState: function(sLogicalPosition) {
			_oModel.setProperty("/exceptionInfo/logicalPositionState", sLogicalPosition);
		},
		getExceptionLogicalPositionState: function() {
			return _oModel.getProperty("/exceptionInfo/logicalPositionState");
		},
		setExceptionPackageMaterial: function(sPackageMaterial) {
			_oModel.setProperty("/exceptionInfo/packageMaterial", sPackageMaterial);
		},

		getExceptionPickedUoM: function() {
			return _oModel.getProperty("/exceptionInfo/pickedUoM");
		},

		setLowQtyCheckUoM: function(sValue) {
			_oModel.setProperty("/exceptionInfo/lowQtyCheckUom", sValue);
		},

		getLowQtyCheckUoM: function(sValue) {
			return _oModel.getProperty("/exceptionInfo/lowQtyCheckUom");
		},

		//exception end
		/**
		 * get tasks from current group by handling unit		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} aCurrentTasks The tasks in current group with sDestHU
		 */
		getCurrentTasksByDestHU: function(sDestHU) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var aCurrentTasks = [];
			aTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU) {
					aCurrentTasks.push(oTask);
				}
			});
			return aCurrentTasks;
		},

		/**
		 * get unconfirm tasks from current group by destHU		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} aCurrentTasks The tasks in current group with sDestHU
		 */
		getCurrentUnconfirmTasksByDestHU: function(sDestHU) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var aCurrentTasks = [];
			aTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU && oTask.confirm === false) {
					aCurrentTasks.push(oTask);
				}
			});
			return aCurrentTasks;
		},

		/**
		 * get unconfirm tasks from current group by destHU		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} aCurrentTasks The tasks in current group with sDestHU
		 */
		getCurrentUnconfirmTasksByPosition: function(sPosition) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var aCurrentTasks = [];
			aTasks.forEach(function(oTask) {
				if (oTask.logicalPosition === sPosition && oTask.confirm === false) {
					aCurrentTasks.push(oTask);
				}
			});
			return aCurrentTasks;
		},
		/**
		 * get unconfirm tasks from current group 		 *
		 * @return {array} aCurrentTasks The tasks in current group with sDestHU
		 */
		getCurrentUnconfirmTasks: function() {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var aUnconfirmTasks = [];
			aTasks.forEach(function(oTask) {
				if (oTask.confirm === false) {
					aUnconfirmTasks.push(oTask);
				}
			});
			return aUnconfirmTasks;
		},

		/**
		 * get unconfirm tasks from current group by destHU		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} aCurrentTasks The tasks in current group with sDestHU
		 */
		getUnconfirmTasksExcludeExceptionHU: function(sDestHU) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var aUnconfirmTasks = [];
			aTasks.forEach(function(oTask) {
				if (oTask.destHU !== sDestHU && oTask.confirm === false) {
					aUnconfirmTasks.push(oTask);
				}
			});
			return aUnconfirmTasks;
		},

		/**
		 * get unconfirm tasks from warehouse order by destHU		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {array} aUnconfirmTasks The tasks in current group with sDestHU
		 */
		getAllUnconfirmTasksByDestHU: function(sDestHU) {
			var aTasks = this.getAllTasks();
			var aUnconfirmTasks = [];
			aTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU && oTask.confirm === false) {
					aUnconfirmTasks.push(oTask);
				}
			});
			return aUnconfirmTasks;
		},
		/**
		 * get the position id from current warehouse task group by handling unit
		 *
		 * @param {string} sHandlingUnit The dest handling unit
		 * @return {string} sId The logical position
		 */
		getLogicalPositionByHU: function(sHandlingUnit) {
			var sId;
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oTask = Util.find(aTasks, function(oItem) {
				if (oItem.destHU === sHandlingUnit) {
					return true;
				}
				return false;
			});
			if (oTask) {
				sId = oTask.logicalPosition;
			}
			return sId;
		},

		/**
		 * get the destHU from current warehouse task group by logical position
		 *
		 * @param {string} sLogicalPosition The logical position
		 * @return {string} sDestHU The destination HU
		 */
		getDestHUByPosition: function(sLogicalPosition) {
			var sDestHU = "";
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oTask = Util.find(aTasks, function(oItem) {
				if (oItem.logicalPosition === sLogicalPosition) {
					return true;
				}
				return false;
			});
			if (oTask) {
				sDestHU = oTask.destHU;
			}
			return sDestHU;
		},

		/**
		 * get the task confirm status from current task group by logical position
		 *
		 * @param {string} sLogicalPosition The logical position
		 * @return {string} bConfirm The confirm status
		 */
		getTaskConfirmStatusByPosition: function(sLogicalPosition) {
			var bConfirm;
			var aTasks = this.getCurrentTaskGroup().tasks;
			var oTask = Util.find(aTasks, function(oItem) {
				if (oItem.logicalPosition === sLogicalPosition) {
					return true;
				}
				return false;
			});
			if (oTask) {
				bConfirm = oTask.confirm;
			}
			return bConfirm;
		},

		/**
		 * get the destHUs from all warehouse task
		 *
		 * @param {string} sLogicalPosition The logical position
		 * @return {string} sDestHU The destination HU
		 */
		getAllDestHUsFromTasks: function() {
			var aDestHU = [];
			var aTasks = this.getAllTasks();
			aTasks.forEach(function(oTask) {
				if (aDestHU.length === 0) {
					aDestHU.push(oTask.destHU);
				} else {
					if (!Util.includes(aDestHU, oTask.destHU)) {
						aDestHU.push(oTask.destHU);
					}
				}
			});
			return aDestHU;
		},

		/**
		 * get the position id from all warehouse task by handling unit
		 *
		 * @param {string} sHandlingUnit The dest handling unit
		 * @return {string} sId The logical position
		 */
		getPositionFromTasksByHU: function(sHandlingUnit) {
			var sId;
			var aTasks = this.getAllTasks();
			var oTask = Util.find(aTasks, function(oItem) {
				if (oItem.destHU === sHandlingUnit) {
					return true;
				}
				return false;
			});
			if (oTask) {
				sId = oTask.logicalPosition;
			}
			return sId;
		},

		/**
		 * get the destHU from warehouse tasks by logical position
		 *
		 * @param {string} sLogicalPosition The logical position
		 * @return {string} sDestHU The destination HU
		 */
		getDestHUFromTasksByPosition: function(sLogicalPosition) {
			var sDestHU = "";
			var aTasks = this.getAllTasks();
			var oTask = Util.find(aTasks, function(oItem) {
				if (oItem.logicalPosition === sLogicalPosition && oItem.confirm === false) {
					return true;
				}
				return false;
			});
			if (!oTask) {
				oTask = Util.find(aTasks, function(oItem) {
					if (oItem.logicalPosition === sLogicalPosition) {
						return true;
					}
					return false;
				});
			}
			if (oTask) {
				sDestHU = oTask.destHU;
			}
			return sDestHU;
		},

		/**
		 * get the task quantity from current warehouse task group by handling unit		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {integer} iQuantity The quantity of the task
		 */
		getTaskQuantityByDestHU: function(sDestHU) {
			var iQuantity = 0;
			var aTasks = this.getCurrentTaskGroup().tasks;
			aTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU) {
					iQuantity += oTask.quantity;
				}
			});
			return this.roundQuantity(iQuantity);
		},

		/**
		 * get the task quantity of all unconfirm tasks from current warehouse task group by handling unit		 *
		 * @param {string} sDestHU The dest handling unit
		 * @return {integer} iQuantity The quantity of the task
		 */
		getUnconfirmTaskQuantityByDestHU: function(sDestHU) {
			var iQuantity = 0;
			var aTasks = this.getCurrentTaskGroup().tasks;
			aTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU && oTask.confirm === false) {
					iQuantity += oTask.quantity;
				}
			});
			return iQuantity;
		},

		/**
		 * get the task quantity from current warehouse task group by logical position
		 *
		 * @param {string} sLogicalPosition The logical position of the task
		 * @return {integer} iQuantity The quantity of the task
		 */
		getTasksQuantityByPosition: function(sLogicalPosition) {
			var iQuantity = 0;
			var aTasks = this.getCurrentTaskGroup().tasks;
			aTasks.forEach(function(oTask) {
				if (oTask.logicalPosition === sLogicalPosition) {
					iQuantity += oTask.quantity;
				}
			});
			return this.roundQuantity(iQuantity);
		},

		/**
		 * get the task quantity in base uom from current warehouse task group by logical position
		 *
		 * @param {string} sLogicalPosition The logical position of the task
		 * @return {integer} iQuantity The quantity of the task
		 */
		getTasksBaseQuantityByPosition: function(sLogicalPosition) {
			var fQty = 0;
			var aTasks = this.getCurrentTaskGroup().tasks;
			aTasks.forEach(function(oTask) {
				if (oTask.confirm === false && oTask.logicalPosition === sLogicalPosition) {
					fQty += oTask.baseQty;
				}
			});
			return this.roundQuantity(fQty);
		},

		/**
		 * get the destHUs from current unprocessed warehouse task group by logical positions
		 *
		 * @param {array} aUnProcessedPostions The logical positions
		 * @return {array} aDestHU The destHUs
		 */
		getUnprocessedDestHU: function(aUnProcessedPostions) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			var aDestHU = [];
			aUnProcessedPostions.forEach(function(sPosition) {
				aTasks.forEach(function(oTask) {
					if (oTask.logicalPosition === sPosition) {
						aDestHU.push(oTask.destHU);
					}
				});
			});
			return aDestHU;
		},

		/**
		 * update the task quantity and exception info by handling unit
		 *
		 * @param {array} aHandlingUnit The handling unit list
		 * @param {int} iQuantity The picked quantity
		 * @param {string} sException The exception code
		 */
		updateTasksWithExceptionByHandlingUnit: function(aHandlingUnit, iQuantity, sException) {
			var aTasks = this.getCurrentTaskGroup().tasks;
			aHandlingUnit.forEach(function(sHandlingUnit) {
				var oTask = Util.find(aTasks, function(oItem) {
					if (oItem.destHU === sHandlingUnit) {
						return true;
					}
					return false;
				});
				if (oTask) {
					oTask.quantity = iQuantity;
					oTask.exception = sException;
				}
			});
			_oModel.setProperty("/currentWarehouseTaskGroup/tasks", aTasks);
		},

		/**
		 * update the task quantity and exception info by destHU
		 *
		 * @param {array} aHandlingUnit The handling unit list
		 * @param {int} iQuantity The picked quantity
		 * @param {string} sException The exception code
		 */
		// updateTasksWithExceptionByDestHU: function(sDestHU, sPickedQuantity, sExceptionCode) {
		// 	var aCurrentTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
		// 	var aSeparateTasks = this.separateTasksFromException(aCurrentTasks, sPickedQuantity, sExceptionCode);
		// 	var aExceptionTasks = aSeparateTasks[1];
		// 	aExceptionTasks.forEach(function(oTask) {
		// 		var oResult = aCurrentTasks.find(function(oItem) {
		// 			if (oItem.taskNumber === oTask.taskNumber) {
		// 				return true;
		// 			}
		// 			return false;
		// 		});
		// 		if (oResult) {
		// 			oResult.quantity = oTask.quantity;
		// 			oResult.exception = oTask.exception;
		// 			// oResult.confirm = true;
		// 		}
		// 	});
		// },

		/**
		 * update the task confirm status
		 * @param {string} sDestHU The destHU
		 */
		updateTasksConfirmStatusByHU: function(sDestHU) {
			var aCurrentTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
			aCurrentTasks.forEach(function(oTask) {
				oTask.confirm = true;
			});
		},

		updateTasksConfirmStatus: function(aTasks) {
			var aCurrentTasks = this.getCurrentUnconfirmTasks();
			var oResult;
			aTasks.forEach(function(oTask) {
				oResult = Util.find(aCurrentTasks, function(oItem) {
					if (oItem.taskNumber === oTask.taskNumber || oItem.taskNumber === oTask.EWMWarehouseTask) {
						return true;
					}
					return false;
				});
				if (oResult) {
					oResult.confirm = true;
				}
			});
		},

		/**
		 * update the task quantity and exception info by logical position
		 *
		 * @param {array} aPositionIds The logical position list
		 * @param {int} iQuantity The picked quantity
		 * @param {string} sException The exception code
		 */
		// updateTasksWithExceptionByPositionIds: function(aPositionIds, iQuantity, sException) {
		// 	var aTasks = this.getCurrentTaskGroup().tasks;
		// 	aPositionIds.forEach(function(sId) {
		// 		aTasks.forEach(function(oTask) {
		// 			if (oTask.logicalPosition === sId) {
		// 				oTask.quantity = iQuantity;
		// 				oTask.exception = sException;
		// 			}
		// 		});
		// 	});
		// 	_oModel.setProperty("/currentWarehouseTaskGroup/tasks", aTasks);
		// },

		/**
		 * update the picking progress, update property taskGroupProgress
		 *
		 */
		updatePickingTaskGroupProgress: function() {
			var iProgress = this.getTaskGroupProgress();
			var aWarehouseTaskGroups = this.getTaskGroups();
			if (iProgress < aWarehouseTaskGroups.length) {
				iProgress++;
			}
			_oModel.setProperty("/taskGroupProgress", iProgress);
		},

		updateCurrentTaskGroup: function() {
			var iProgress = this.getTaskGroupProgress();
			var aWarehouseTaskGroups = this.getTaskGroups();
			if (aWarehouseTaskGroups[iProgress]) {
				_oModel.setProperty("/currentWarehouseTaskGroup", aWarehouseTaskGroups[iProgress]);
			}
		},

		updatePickingTaskProgress: function(sHandlingUnit) {
			var currentTaskGroup = this.getCurrentTaskGroup();
			var aTasks = currentTaskGroup.tasks;
			var iProgress = currentTaskGroup.progress;
			var iQuantity = currentTaskGroup.actualQuantity;
			if (sHandlingUnit) {
				iQuantity += this.getTaskQuantityByDestHU(sHandlingUnit);
				iProgress += this.getCurrentTasksByDestHU(sHandlingUnit).length;
			} else {
				//full denial won't have pickQuantity
				if (this.getExceptionPickedQuantity() !== "") {
					iQuantity += parseFloat(this.getExceptionPickedQuantity(), 10);
				}
				iProgress = aTasks.length;
			}
			_oModel.setProperty("/currentWarehouseTaskGroup/progress", iProgress);
			_oModel.setProperty("/currentWarehouseTaskGroup/actualQuantity", this.roundQuantity(iQuantity));
		},

		updatePickingTaskProgressForMulti: function(aConfirmTasks) {
			var iProgress = this.getCurrentTaskGroup().progress;
			iProgress += aConfirmTasks.length;
			_oModel.setProperty("/currentWarehouseTaskGroup/progress", iProgress);
		},

		increasePickingTaskProgress: function() {
			var currentTaskGroup = this.getCurrentTaskGroup();
			var iProgress = currentTaskGroup.progress;
			iProgress++;
			_oModel.setProperty("/currentWarehouseTaskGroup/progress", iProgress);

		},

		//for splitting exception
		updateTasksAfterSplittingConfirm: function(aCurrentTasks, aSeparateTasks) {
			var iProgress = this.getCurrentGroupProgress();
			var aNormalTasks = aSeparateTasks[0];
			var aExceptionTasks = aSeparateTasks[1];
			aNormalTasks.forEach(function(oTask) {
				var oResult = Util.find(aCurrentTasks, function(oItem) {
					if (oItem.taskNumber === oTask.taskNumber) {
						return true;
					}
					return false;
				});
				if (oResult) {
					oResult.confirm = true;
				}
			});
			aExceptionTasks.forEach(function(oTask) {
				var oResult = Util.find(aCurrentTasks, function(oItem) {
					if (oItem.taskNumber === oTask.taskNumber) {
						return true;
					}
					return false;
				});
				if (oResult) {
					oResult.quantity = this.roundQuantity(oResult.quantity - oTask.quantity);
					var fRatio = this.getAlternativeUOMRatio();
					oResult.baseQty = this.roundQuantity(oResult.quantity * fRatio);
				}
			}.bind(this));
			iProgress += aNormalTasks.length;
			this.setCurrentGroupProgress(iProgress);
		},

		isSourceBinPickable: function() {
			return this.isSourceHuPickable("");
		},

		isSourceHuPickable: function(newValue) {
			var stock = this.getStockOfCurrentGroup();
			var batchInit = this.getBatchInitValue();
			var oResult = Util.find(stock, function(oStock) {
				if (newValue === oStock.sourceHU && oStock.quantity !== 0) {
					if ((batchInit !== "" && batchInit === oStock.batchNo) || (batchInit === "")) {
						return true;
					}
				}
			});

			if (oResult) {
				return true;
			}

			return false;
		},

		IsBatchWithStock: function(sourceHU, batch) {
			var oCurrentTaskGroup = this.getCurrentTaskGroup();
			var stocks = oCurrentTaskGroup.stock;

			var oResult = Util.find(stocks, function(oStock) {
				if (sourceHU === oStock.sourceHU && batch === oStock.batchNo && oStock.quantity !== 0) {
					return true;
				}
				return false;
			});

			if (oResult) {
				return true;
			}

			return false;
		},

		updateTaskPositionForSplitting: function(sDestHU) {
			var aTasks = this.getAllTasks();
			aTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU) {
					oTask.logicalPosition = "";
				}
			});

		},

		/**
		 * update the tasks after the partial confirm of splitting exception
		 * with new picking HU and new logical position
		 * @param {string} sDestHU The dest HU of current exception
		 * @param {string} sPickingHU The new picking HU
		 * @param {string} sLogicalPosition The new logical position for picking HU
		 */
		updateCurrentTasksForSplitting: function(sDestHU, sPickingHU, sLogicalPosition) {
			var aCurrentTasks = this.getCurrentUnconfirmTasksByDestHU(sDestHU);
			aCurrentTasks.forEach(function(oTask) {
				oTask.destHU = sPickingHU;
				oTask.logicalPosition = sLogicalPosition;
				oTask.exception = ""; //reset task to normal
			});
		},

		/**
		 * update the tasks in other groups after the partial confirm of splitting exception
		 * with new picking HU and new logical position
		 * @param {string} sDestHU The dest HU of current exception
		 * @param {string} sPickingHU The new picking HU
		 * @param {string} sLogicalPosition The new logical position for picking HU
		 */
		updateRemainTasksForSplitting: function(sDestHU, sPickingHU, sLogicalPosition) {
			//only update remaining tasks with new destHU ?
			var aAllTasks = this.getAllTasks();
			aAllTasks.forEach(function(oTask) {
				if (oTask.destHU === sDestHU && oTask.confirm === false) {
					oTask.destHU = sPickingHU;
					oTask.logicalPosition = sLogicalPosition;
					oTask.exception = "";
				}
			});
		},

		/**
		 * determine if all warehouse tasks in current task group are picked
		 *
		 * @return {bool} true if ready, otherwise false
		 */
		isAllWarehouseTasksReadyInOneGroup: function() {
			var currentTaskGroup = this.getCurrentTaskGroup();
			var iProgress = currentTaskGroup.progress;
			var aTasks = currentTaskGroup.tasks;
			return iProgress === aTasks.length;
		},

		/**
		 * determine if all warehouse task groups are picked
		 *
		 * @return {bool} true if ready, otherwise false
		 */
		isAllWarehouseTaskGroupsReady: function() {
			var iProgress = this.getTaskGroupProgress();
			var aTaskGroups = this.getTaskGroups();
			return iProgress === aTaskGroups.length;
		},

		//set warehouseTaskGroups & set currentWarehouseTaskGroup as the first item in warehouseTaskGroups
		setTaskGroups: function(aWarehouseTaskGroups, aWarehouseTasks) {
			var tempWarehouseTaskGroups = [];
			var oWarehouseTaskGroup;
			var oWarehouseTask = {};

			for (var i = 0; i < aWarehouseTaskGroups.length; i++) {
				oWarehouseTaskGroup = this.transformGroupData(aWarehouseTaskGroups[i]);
				for (var j = 0; j < aWarehouseTasks.length; j++) {
					if (aWarehouseTaskGroups[i].WtgrpId === aWarehouseTasks[j].WtgrpId) {
						oWarehouseTask = this.transformTaskData(aWarehouseTasks[j]);
						oWarehouseTaskGroup.tasks.push(oWarehouseTask);
					}
				}
				tempWarehouseTaskGroups.push(oWarehouseTaskGroup);
			}
			_oModel.setProperty("/warehouseTaskGroups", tempWarehouseTaskGroups);
			_oModel.setProperty("/currentWarehouseTaskGroup", tempWarehouseTaskGroups[0]);
		},

		getTaskGroups: function() {
			return _oModel.getProperty("/warehouseTaskGroups");
		},
		/**
		 * set the stock info of the current group. note the stock info only used in multisource handling unit case
		 *
		 * @param {array} aStockInfo The stock information
		 */
		setStocksOfCurrentGroup: function(aStockInfo) {
			var aStock = [];
			var sUom = this.getUomOfCurrentGroup().trim().toUpperCase();
			aStockInfo.forEach(function(oStock) {
				var iQuantity = 0;
				if (oStock.Quan !== "") {
					if(oStock.BaseUnit.trim().toUpperCase() === sUom ){
						iQuantity = parseFloat(oStock.Quan, 10);
					}
					else if(oStock.StockKeepingAlternativeUoM.trim().toUpperCase() === sUom ){// iQuantity = parseInt(oStock.Quan, 10);
						iQuantity = parseFloat(oStock.PackedQuantityInAltvUnit, 10);
					}
				}
				aStock.push({
					sourceHU: oStock.HandlingUnitNumber,
					batchNo: oStock.Batch,
					quantity: iQuantity
				});
			});

			_oModel.setProperty("/currentWarehouseTaskGroup/stock", aStock);
		},
		/**
		 * insert/merge the new tasks to the task groups.
		 *
		 * @param {array} aTasks The new task list
		 */
		updateTaskGroups: function(aTasks) {
			var iProgress = this.getTaskGroupProgress();
			var aNewTasks = aTasks.filter(function(oTask) {
				var bNewTask = false;
				if (oTask.WtgrpKey) {
					bNewTask = true;
				}
				return bNewTask;
			});
			aNewTasks.forEach(function(oTask) {
				var aTaskGroups = this.getTaskGroups();
				var oTransformedTask;
				// determine if the task can merge into the new group
				var oGroup = Util.find(aTaskGroups, function(oItem, index) {
					var bMatched = false;
					if (oItem.key === oTask.WtgrpKey && iProgress < index) {
						bMatched = true;
					}
					return bMatched;
				});
				if (oGroup) { // can merge into an existing group
					oTransformedTask = this.transformTaskData(oTask);
					oGroup.tasks.push(oTransformedTask);
					oGroup.totalAlternativeQty = this.roundQuantity(oGroup.totalAlternativeQty + oTransformedTask.quantity);
					oGroup.totalBaseQty = this.roundQuantity(oGroup.totalBaseQty + oTransformedTask.baseQty);
				} else { // this is a new group
					oGroup = this.transformGroupData(oTask);
					oGroup.tasks = [this.transformTaskData(oTask)];
					var iPosition = Util.findIndex(aTaskGroups, function(oItem, index) {
						if (oItem.pathSequence > oGroup.pathSequence && iProgress < index) {
							return true;
						}
						return false;
					});
					if (iPosition === -1) {
						iPosition = aTaskGroups.length;
					}
					aTaskGroups.splice(iPosition, 0, oGroup);
				}
				_oModel.setProperty("/warehouseTaskGroups", aTaskGroups);

			}.bind(this));
		},
		/**
		 * transform group data from group api or the new generated task
		 *
		 * @param {object} oData The new task generated by the confirm task with exception or the group/task data
		 * @return {object} oGroup The group object
		 */
		transformGroupData: function(oData) {
			var oGroup = {
				tasks: []
			};
			oGroup.key = oData.WtgrpKey;
			oGroup.pathSequence = oData.WhseTaskSortingSequence;
			oGroup.productDesc = oData.Maktx;
			oGroup.sourceBin = oData.SourceStorageBin;
			oGroup.sourceHU = oData.SourceHandlingUnit;
			oGroup.sourceHUDisplay = oData.VlenrAllowed === Const.ABAP_TRUE ? true : false;
			oGroup.sourceHUMandatory = oData.VlenrObligatory === Const.ABAP_TRUE ? true : false;
			oGroup.sourceHUInit = oData.SourceHandlingUnit;
			oGroup.productImg = oData.PicURL;

			oGroup.sourceHUMultiple = false;
			if (oGroup.sourceHUDisplay === true && oGroup.sourceHUInit === "") {
				oGroup.sourceHUMultiple = true;
			}

			oGroup.product = oData.ProductName;
			oGroup.EAN = oData.Ean;
			oGroup.isSerialNumberEnabled = oData.SnReq;

			oGroup.batchDisplay = oData.BatchReq === Const.ABAP_TRUE ? true : false;
			oGroup.batchNo = oData.Batchno;
			oGroup.batchNoInit = oData.Batchno;

			oGroup.alternativeUom = oData.AlternativeUnit;
			oGroup.baseUom = oData.BaseUnit;
			oGroup.totalAlternativeQty = parseFloat(oData.TargetQuantityInAltvUnit, 10);
			oGroup.totalBaseQty = parseFloat(oData.TargetQuantityInBaseUnit, 10);

			oGroup.actualQuantity = 0;
			oGroup.progress = 0;
			oGroup.stock = [];

			oGroup.sourceBinVerifyRequired = (oData.VlplaVrf === Const.ABAP_TRUE) ? true : false;
			oGroup.sourceHUVerifyRequired = (oData.VlenrVrf === Const.ABAP_TRUE) ? true : false;
			oGroup.batchNoVerifyRequired = (oData.BatchnoVrf === Const.ABAP_TRUE) ? true : false;
			oGroup.productVerifyRequired = (oData.MatnrVrf === Const.ABAP_TRUE) ? true : false;
			return oGroup;
		},
		/**
		 * transform task data from task api or the new generated task
		 *
		 * @param {object} oData The new task generated by the confirm task with exception or the group/task data
		 * @return {object} oGroup The group object
		 */
		transformTaskData: function(oData) {
			var oTask = {
				taskNumber: oData.EWMWarehouseTask,
				quantity: parseFloat(oData.TargetQuantityInAltvUnit, 10),
				baseQty: parseFloat(oData.TargetQuantityInBaseUnit, 10),
				logicalPosition: oData.HandlingUnitLogicalPosition,
				destHU: oData.DestinationHandlingUnit,
				sourceHU: oData.SourceHandlingUnit,
				sourceBin: oData.SourceStorageBin,
				batchNo: oData.Batchno,
				exception: "",
				packageMaterial: oData.Pmat,
				lineNumber: oData.HndlgUnitNumberInWhseOrder,
				confirm: false
			};
			return oTask;
		},

		getAllTasks: function() {
			var aTaskGroups = this.getTaskGroups();
			var aTasks = [];
			aTaskGroups.forEach(function(oTaskGroup) {
				oTaskGroup.tasks.forEach(function(oTask) {
					aTasks.push(oTask);
				});
			});
			return aTasks;
		},
		getAllTasksFromCurrentGroup: function() {
			return this.getCurrentTaskGroup().tasks;
		},
		getCurrentTaskGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup");
		},
		getStockOfCurrentGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/stock");
		},
		getSourceBinOfCurrentGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/sourceBin");
		},
		getProductOfCurrentGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/product");
		},
		getUomOfCurrentGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/alternativeUom");
		},
		getSourceHUOfCurrentGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/sourceHU");
		},
		getSourceHUInitValue: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/sourceHUInit");
		},
		getBatchInitValue: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/batchNoInit");
		},
		isMultiSourceHUOfCurrentGroup: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/sourceHUMultiple");
		},

		getTaskGroupProgress: function() {
			return _oModel.getProperty("/taskGroupProgress");
		},

		setTaskGroupProgress: function(iProgress) {
			_oModel.setProperty("/taskGroupProgress", iProgress);
		},

		getCurrentGroupProgress: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/progress");
		},

		setCurrentGroupProgress: function(iProgress) {
			_oModel.setProperty("/currentWarehouseTaskGroup/progress", iProgress);
		},

		getCurrentTaskGroupTotalQuantity: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/totalAlternativeQty");
		},
		getCurrentTaskGroupTotalBaseQuantity: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/totalBaseQty");
		},

		getCurrentTaskGroupAcutalQuantity: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/actualQuantity");
		},
		setCurrentTaskGroupTotalQuantity: function(iQuantity) {
			_oModel.setProperty("/currentWarehouseTaskGroup/totalAlternativeQty", iQuantity);
		},
		setCurrentTaskGroupTotalBaseQuantity: function(iQuantity) {
			_oModel.setProperty("/currentWarehouseTaskGroup/totalBaseQty", iQuantity);
		},

		getEnableException: function() {
			return _oModel.getProperty("/enableException");
		},
		disableException: function() {
			_oModel.setProperty("/enableException", false);
		},

		enableException: function() {
			_oModel.setProperty("/enableException", true);
		},

		setFullDenialEnable: function(bEnabled) {
			_oModel.setProperty("/enableFullDenial", bEnabled);
		},

		getSourceBinState: function() {
			return _oModel.getProperty("/sourceBinState");
		},

		setSourceBinState: function(sState) {
			_oModel.setProperty("/sourceBinState", sState);
		},

		getSourceHUState: function() {
			return _oModel.getProperty("/sourceHUState");
		},

		setSourceHUState: function(sState) {
			_oModel.setProperty("/sourceHUState", sState);
		},

		getDestHUState: function() {
			return _oModel.getProperty("/destHUState");
		},

		setDestHUState: function(sState) {
			_oModel.setProperty("/destHUState", sState);
		},

		getProductState: function() {
			return _oModel.getProperty("/productState");
		},

		setProductState: function(sState) {
			_oModel.setProperty("/productState", sState);
		},

		getBatchState: function() {
			return _oModel.getProperty("/batchState");
		},
		setBatchNo: function(sBatchNo) {
			_oModel.setProperty("/currentWarehouseTaskGroup/batchNo", sBatchNo);
		},
		getBatchNo: function(sBatchNo) {
			return _oModel.getProperty("/currentWarehouseTaskGroup/batchNo");
		},
		setSourceHU: function(sSourceHU) {
			_oModel.setProperty("/currentWarehouseTaskGroup/sourceHU", sSourceHU);
		},
		setBatchState: function(sState) {
			_oModel.setProperty("/batchState", sState);
		},

		setLowQuantity: function(iQuantity) {
			return _oModel.setProperty("/currentWarehouseTaskGroup/lowQuantity", iQuantity);
		},

		getLowQuantity: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/lowQuantity");
		},

		setLowQuantityCheckState: function(sState) {
			return _oModel.setProperty("/currentWarehouseTaskGroup/lowQuantityState", sState);
		},

		getLowQuantityCheckState: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/lowQuantityState");
		},
		updataCurrentActualQuantity: function(iQuantity) {
			var iActualQuantity = _oModel.getProperty("/currentWarehouseTaskGroup/actualQuantity");
			var iNewQuantity = iActualQuantity + iQuantity;
			_oModel.setProperty("/currentWarehouseTaskGroup/actualQuantity", this.roundQuantity(iNewQuantity));
		},
		setCurrentPickQuantity: function(iQuantity) {
			_oModel.setProperty("/currentWarehouseTaskGroup/currentPickQty", iQuantity);
		},
		getCurrentPickQuantity: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/currentPickQty");
		},
		setQuantityAdjustmentState: function(sState) {
			_oModel.setProperty("/currentWarehouseTaskGroup/quantityAdjustState", sState);
		},
		getQuantityAdjustmentState: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/quantityAdjustState");
		},
		getCurrentDestHUForMulti: function() {
			var oCurrentGroup = this.getCurrentTaskGroup();
			return oCurrentGroup.tasks[0].destHU;
		},
		/**
		 * check if the handling unit input contains special characters
		 *
		 * @param {string} sInput The value of handling unit. should not be empty
		 * @return {bool} Return true if the handling unit has special characters input, otherwise return false
		 */
		isContainsSpecialCharacter: function(sInput) {
			var oPattern = "$*+";
			for (var i = 0; i < sInput.length; i++) {
				if (oPattern.indexOf(sInput.charAt(i)) !== -1) {
					return true;
				}
			}
		},

		roundQuantity: function(iQuantity, iLength) {
			if (Util.isEmpty(iLength)) {
				iLength = 3;
			}
			if (!Util.isInteger(iQuantity)) {
				var oFormat = NumberFormat.getFloatInstance({
					decimals: iLength
				});
				return oFormat.parse(oFormat.format(iQuantity));
			}
			return iQuantity;
		},
		isSerialNumberEnabled: function() {
			return _oModel.getProperty("/currentWarehouseTaskGroup/isSerialNumberEnabled");
		},

		isAlternativeUomIdenticalToBase: function() {
			var fRatio = this.getAlternativeUOMRatio();
			return fRatio === 1;
		},

		getAlternativeUOMRatio: function() {
			var fAlternativeQty = this.getCurrentTaskGroupTotalQuantity();
			var fBaseQty = this.getCurrentTaskGroupTotalBaseQuantity();
			return this.roundQuantity(fBaseQty / fAlternativeQty);
		},

		updateExceptionPickedUoM: function(iSerialCount, bForTaskPicking) {
			var iExchangeRatio = this.getAlternativeUOMRatio();
			var sUoM = this.roundQuantity(iSerialCount / iExchangeRatio, 2).toString();
			if (bForTaskPicking === false) {
				this.setLowQtyCheckUoM(sUoM);
			} else {
				_oModel.setProperty("/exceptionInfo/pickedUoM", sUoM);
			}
		}
	};
});