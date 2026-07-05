/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ValueState",
	"zscm/ewm/pickcarts1/utils/Const",
	"zscm/ewm/pickcarts1/utils/Util"
], function (JSONModel, ValueState, Const, Util) {
	"use strict";
	var _oModel;
	var _oTasksIndexByHandlingUnit = {};
	var _oTasksIndexByPositionId = {};
	var _aAllLogicalPositions = [];
	var _aAllHandlingUnits = [];
	return {
		init: function (i18n) {
			if (_oModel === undefined) {
				_oModel = new JSONModel({
					destBinValueState: ValueState.None,
					destHUValueState: ValueState.None,
					errors: [],
					taskGroups: [],
					currentGroup: {
						progress: 0,
						group: "",
						expectedBin: "",
						actualBin: "",
						isDropAll: false,
						destBinVerifyRequrired: true,
						tasksWithEmptyPosition: [{
							handlingUnit: "",
							logicalPosition: "",
							EWMWarehouseTask: ""
						}],
						tasks: [{
							handlingUnit: "",
							logicalPosition: "",
							EWMWarehouseTask: "",
							confirmStatus: Const.TASK_STATUS.INITIAL
						}]
					},
					progress: 0
				});
			}
			return _oModel;
		},
		destroy: function () {
			_oModel = undefined;
			_oTasksIndexByHandlingUnit = {};
			_oTasksIndexByPositionId = {};
			_aAllLogicalPositions = [];
			_aAllHandlingUnits = [];
		},
		setErrors: function (aError) {
			_oModel.setProperty("/errors", aError);
		},
		getConfirmData: function () {
			var oCurrentGroup = _oModel.getProperty("/currentGroup");
			var aTasks = [];
			oCurrentGroup.tasks.forEach(function (oTask) {
				if (oTask.confirmStatus === Const.TASK_STATUS.INITIAL) {
					oTask.confirmStatus = Const.TASK_STATUS.CONFIRMING;
					aTasks.push({
						TANUM: oTask.EWMWarehouseTask,
						VLENR: "",
						BATCH: "",
						NISTA: "",
						EXC: "",
						NLPLA: oCurrentGroup.actualBin,
						RESTA: ""
					});
				}
			});
			var aTasksWithEmptyPosition = this.getConfirmDataForEmptyPosition();
			aTasks = aTasks.concat(aTasksWithEmptyPosition);
			return [aTasks, Const.CONF_MODE.NO_NEED_CHECK];
		},
		getConfirmDataByHU: function (sHandlingUnit) {
			var oConfirmData;
			var oCurrentGroup = _oModel.getProperty("/currentGroup");
			var oTask = Util.find(oCurrentGroup.tasks, function (oItem) {
				return sHandlingUnit === oItem.handlingUnit && oItem.confirmStatus === Const.TASK_STATUS.INITIAL;
			});
			if (oTask) {
				oTask.confirmStatus = Const.TASK_STATUS.CONFIRMING;
				oConfirmData = {
					TANUM: oTask.EWMWarehouseTask,
					VLENR: "",
					BATCH: "",
					NISTA: "",
					EXC: "",
					NLPLA: oCurrentGroup.actualBin,
					RESTA: ""
				};
			}
			return [
				[oConfirmData], Const.CONF_MODE.NO_NEED_CHECK
			];
		},
		getTaskByPosition: function (sLogicalPosition) {
			var aCurrentTasks = _oModel.getProperty("/currentGroup").tasks;
			var oResult = Util.find(aCurrentTasks, function (oTask) {
				return sLogicalPosition === oTask.logicalPosition;
			});
			if (oResult) {
				return oResult;
			}
		},
		updateTaskConfirmStatusByPosition: function (sLogicalPosition, sConfirmStatus) {
			var oTask = this.getTaskByPosition(sLogicalPosition);
			if (!Util.isEmpty(oTask)) {
				oTask.confirmStatus = sConfirmStatus;
			}
		},
		getConfirmDataForEmptyPosition: function () {
			var aConfirmData = [];
			var oCurrentGroup = _oModel.getProperty("/currentGroup");
			oCurrentGroup.tasksWithEmptyPosition.forEach(function (oTask) {
				aConfirmData.push({
					TANUM: oTask.EWMWarehouseTask,
					VLENR: "",
					BATCH: "",
					NISTA: "",
					EXC: "",
					NLPLA: oCurrentGroup.actualBin,
					RESTA: ""
				});
			});
			return aConfirmData;
		},
		clearData: function () {
			_oModel.setProperty("/progress", 0);
			_oModel.setProperty("/errors", []);
			_oTasksIndexByHandlingUnit = {};
			_oTasksIndexByPositionId = {};
			_aAllLogicalPositions = [];
			_aAllHandlingUnits = [];
		},
		setData: function (aGroup, aTask) {
			var aGroupForModel = [];
			//index tasks by handling unit
			aTask.forEach(function (oTask) {
				var sHandlingUnit = oTask.DestinationHandlingUnit;
				if (oTask.HandlingUnitLogicalPosition !== "") {
					_aAllLogicalPositions.push(oTask.HandlingUnitLogicalPosition);
				}
				_aAllHandlingUnits.push(sHandlingUnit);
				if (!_oTasksIndexByHandlingUnit[sHandlingUnit]) {
					_oTasksIndexByHandlingUnit[sHandlingUnit] = {
						logicalPosition: oTask.HandlingUnitLogicalPosition,
						group: oTask.WtgrpId
					};
				}
				if (!_oTasksIndexByPositionId[oTask.HandlingUnitLogicalPosition]) {
					_oTasksIndexByPositionId[oTask.HandlingUnitLogicalPosition] = {
						handlingUnit: sHandlingUnit,
						group: oTask.WtgrpId
					};
				}
			});
			// transfrom odata formate to model format
			aGroup.forEach(function (oGroup) {
				var bDropAll = false;
				if (oGroup.ConfirmMethod === "B") {
					bDropAll = true;
				}
				var oGroupForModel = {
					progress: 0,
					expectedBin: oGroup.DestinationStorageBin,
					actualBin: "",
					destBinVerifyRequrired: oGroup.NlplaVrf === Const.ABAP_TRUE ? true : false,
					group: oGroup.WtgrpId,
					isDropAll: bDropAll,
					tasksWithEmptyPosition: [],
					tasks: []
				};
				aTask.forEach(function (oTask) {
					if (oTask.WtgrpId === oGroup.WtgrpId) {
						if (Util.isEmpty(oTask.HandlingUnitLogicalPosition)) {
							oGroupForModel.tasksWithEmptyPosition.push({
								handlingUnit: oTask.DestinationHandlingUnit,
								logicalPosition: oTask.HandlingUnitLogicalPosition,
								EWMWarehouseTask: oTask.EWMWarehouseTask
							});
						} else {
							oGroupForModel.tasks.push({
								handlingUnit: oTask.DestinationHandlingUnit,
								logicalPosition: oTask.HandlingUnitLogicalPosition,
								EWMWarehouseTask: oTask.EWMWarehouseTask,
								confirmStatus: Const.TASK_STATUS.INITIAL
							});
						}
					}
				});
				aGroupForModel.push(oGroupForModel);
			});

			_oModel.setProperty("/taskGroups", aGroupForModel);
			_oModel.setProperty("/currentGroup", aGroupForModel[0]);
		},
		getCurrentExpectedBin: function () {
			return _oModel.getProperty("/currentGroup/expectedBin");
		},
		getAllPositions: function () {
			return _aAllLogicalPositions;
		},
		getAllDestHUs: function () {
			return _aAllHandlingUnits;
		},
		getPositionsOfCurrentGroup: function () {
			var aRet = [];
			var aTasks = _oModel.getProperty("/currentGroup/tasks");
			aTasks.forEach(function (oTask) {
				aRet.push(oTask.logicalPosition);
			});
			return aRet;
		},
		getPositionIdByHU: function (sHandlingUnit) {
			var oResult = _oTasksIndexByHandlingUnit[sHandlingUnit];
			return oResult && oResult.logicalPosition;
		},
		getCurrentTaskGroup: function () {
			return _oModel.getProperty("/currentGroup");
		},
		getDestHUByPositionId: function (sPositionId) {
			var oResult = _oTasksIndexByPositionId[sPositionId];
			return oResult && oResult.handlingUnit;
		},
		isValideHandlingUnit: function (sHandlingUnit) {
			var bValide = false;
			var oTaskInfo = _oTasksIndexByHandlingUnit[sHandlingUnit];
			if (oTaskInfo !== undefined && oTaskInfo.group === _oModel.getProperty("/currentGroup/group")) {
				bValide = true;
			}
			return bValide;
		},
		isReadyToNextGroup: function () {
			var bReady = false;
			var iProgress = _oModel.getProperty("/currentGroup/progress");
			var aTasks = _oModel.getProperty("/currentGroup/tasks");

			if (iProgress + 1 >= aTasks.length) {
				bReady = true;
			}
			return bReady;
		},
		/**
		 * update the progress of the current group
		 */
		updateTaskProgress: function () {
			var iProgress = _oModel.getProperty("/currentGroup/progress");
			_oModel.setProperty("/currentGroup/progress", ++iProgress);
		},
		/**
		 * set the task progress to the count of task number, which indicats all task of group has finished
		 */
		finishCurrentGroup: function () {
			var aTasks = _oModel.getProperty("/currentGroup/tasks");
			_oModel.setProperty("/currentGroup/progress", aTasks.length);
		},
		/**
		 * detect if it is the last group, the 'progress' should less than group length, as the progress is 0 based
		 * 
		 * @return {bool} bLast return true, if it is the last group, otherwise return false
		 */
		isLastGroup: function () {
			var iProgress = _oModel.getProperty("/progress");
			var aGroup = _oModel.getProperty("/taskGroups");
			var bLast = false;
			if (iProgress >= aGroup.length - 1) {
				bLast = true;
			}
			return bLast;
		},
		goToNextGroup: function () {
			var iProgress = _oModel.getProperty("/progress");
			var aGroup = _oModel.getProperty("/taskGroups");
			iProgress += 1;
			_oModel.setProperty("/progress", iProgress);
			if (iProgress < aGroup.length) {
				_oModel.setProperty("/currentGroup", aGroup[iProgress]);
			}
		},
		getHandlingUnitsWithSplitting: function () {
			var oCurrentDropGroup = _oModel.getProperty("/currentGroup");
			var aTasksWithEmptyPosition = oCurrentDropGroup.tasksWithEmptyPosition;
			var aSplittingHUs = [];
			aTasksWithEmptyPosition.forEach(function (oTask) {
				aSplittingHUs.push(oTask.handlingUnit);
			});
			return aSplittingHUs.join();
		}
	};
});