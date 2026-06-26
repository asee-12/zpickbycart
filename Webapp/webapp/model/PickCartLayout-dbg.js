/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"scm/ewm/pickcarts1/utils/Const"
], function(JSONModel, Const) {
	"use strict";
	var _oModel;
	var _mLayoutIndexByLabel; // hash object to store layout info with the label field as the key
	var _mLayoutIndexById; // hash object to store layout info with the HandlingUnitLogicalPosition field as the key
	var _aLayoutChangeCallback = [];
	return {
		init: function() {
			if (!_oModel) {
				_oModel = new JSONModel({
					layout: []
				});
			}
			return _oModel;
		},
		destroy: function() {
			_oModel = undefined;
			_mLayoutIndexById = undefined;
			_mLayoutIndexById = undefined;
			_aLayoutChangeCallback = [];
		},
		/**
		 * Transfrom the data from Pickcart layout odata service to row[col] array, and set the data to aLayout property
		 *
		 * @param {array} aLayout the pickcar layout data from service. structure(not list all but key properties): [{"HandlingUnitLogicalPosition":"0","Lab":"1 -1 -1", "RowInd": "01","ColInd":"01","DepthInd":"01"}]
		 */
		setData: function(aLayout) {
			var aLayoutModelData = [],
				oPositionInfo, iRow, iCol, iDeps;
			_mLayoutIndexByLabel = {};
			_mLayoutIndexById = {};
			if (aLayout.length > 0) {
				for (var iIndex = 0; iIndex < aLayout.length; iIndex++) {
					oPositionInfo = aLayout[iIndex];
					iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
					iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
					iDeps = parseFloat(oPositionInfo.DepthInd, 10) - 1;
					// if (iDeps === 0) { //only handle the 2 dimension case
					if (aLayoutModelData[iRow] === undefined) {
						aLayoutModelData[iRow] = {
							cells: []
						};
					}
					oPositionInfo.connection = {
						status: -1
					};
					oPositionInfo.picking = {
						status: Const.HU_STATUS_PICK.INVALID,
						expected: "",
						actual: "",
						split: false
					};
					oPositionInfo.dropping = {
						status: Const.HU_STATUS_DROP.INVALID
					};
					aLayoutModelData[iRow].cells[iCol] = oPositionInfo;
					_mLayoutIndexByLabel[oPositionInfo.Lab] = oPositionInfo;
					_mLayoutIndexById[oPositionInfo.HandlingUnitLogicalPosition] = oPositionInfo;
					// }
				}
			}
			_oModel.setProperty("/layout", aLayoutModelData);
			this.invokeLayoutChangeCallback();
		},

		/**
		 * clear the pickcart layout data.
		 */
		clearData: function() {
			_mLayoutIndexByLabel = {};
			_mLayoutIndexById = {};
			_oModel.setProoerty("/layout", []);
			_aLayoutChangeCallback = [];
		},

		invokeLayoutChangeCallback: function() {
			var aColumns = _oModel.getProperty("/layout/0/cells");
			var iColumns = 0;
			if (aColumns) {
				iColumns = aColumns.length;
			}
			for (var iIndex = 0; iIndex < _aLayoutChangeCallback.length; iIndex++) {
				_aLayoutChangeCallback[iIndex](iColumns);
			}
		},
		/**
		 * regist layout changed callback function. should only call this function on controller's onInit function
		 *
		 * @param {function} fnCallback The create pickcart call back function on Controller
		 */
		registLayoutChangeCallback: function(fnCallback) {
			_aLayoutChangeCallback.push(fnCallback);
		},
		/**
		 * get the unprocessed positions for current task group for picking(exception related)
		 *
		 * @return {array} aPositions The unprocessed positions
		 */
		getUnprocessedPositions: function() {
			var aPositions = [];
			var aLayoutData = _oModel.getProperty("/layout");
			aLayoutData.forEach(function(oRow) {
				oRow.cells.forEach(function(oItem) {
					if (oItem.picking.status === Const.HU_STATUS_PICK.NEED_MATERIAL) {
						aPositions.push(oItem.HandlingUnitLogicalPosition);
					}
				});
			});
			return aPositions;
		},

		/**
		 * get the positions with exception status for picking(exception related)
		 *
		 * @return {array} aPositions The positions with exception status
		 */
		getPositionsWithPickingException: function() {
			var aPositions = [];
			var aLayoutData = _oModel.getProperty("/layout");
			aLayoutData.forEach(function(oRow) {
				oRow.cells.forEach(function(oItem) {
					if (oItem.picking.status === Const.HU_STATUS_PICK.COMPLETED_WITH_EXCEPTION) {
						aPositions.push(oItem.HandlingUnitLogicalPosition);
					}
				});
			});
			return aPositions;
		},
		/**
		 * get the invalid positions for current task group for picking
		 *
		 * @return {array} aPositions The positions with wrong HU
		 */
		getInvalidPickingPositions: function() {
			var aPositions = [];
			var aLayoutData = _oModel.getProperty("/layout");
			aLayoutData.forEach(function(oRow) {
				oRow.cells.forEach(function(oItem) {
					if (oItem.picking.status !== Const.HU_STATUS_PICK.NEED_MATERIAL && oItem.picking.status !== Const.HU_STATUS_PICK.INVALID) {
						aPositions.push(oItem.HandlingUnitLogicalPosition);
					}
				});
			});
			return aPositions;
		},
		/**
		 * get the wrong positions for current task group for picking
		 *
		 * @return {array} aPositions The positions with wrong HU
		 */
		getWrongPickingPositions: function() {
			var aPositions = [];
			var aLayoutData = _oModel.getProperty("/layout");
			aLayoutData.forEach(function(oRow) {
				oRow.cells.forEach(function(oItem) {
					if (oItem.picking.status === Const.HU_STATUS_PICK.WRONG) {
						aPositions.push(oItem.HandlingUnitLogicalPosition);
					}
				});
			});
			return aPositions;
		},
		/**
		 * get the empty positions for current layout
		 *
		 * @return {array} aPositions The positions without HU
		 */
		getEmptyPositions: function() {
			var aPositions = [];
			var aLayoutData = _oModel.getProperty("/layout");
			aLayoutData.forEach(function(oRow) {
				oRow.cells.forEach(function(oItem) {
					if (oItem.picking.status === Const.HU_STATUS_PICK.INVALID) {
						aPositions.push(oItem.HandlingUnitLogicalPosition);
					}
				});
			});
			return aPositions;
		},
		/**
		 * Get the position info by position label(Lab)
		 *
		 * @param {string} sLable The lable of the Position
		 * @return {object} The Position info
		 */
		getPositionInfoByLable: function(sLable) {
			var oPostion;
			if (_mLayoutIndexByLabel) {
				oPostion = _mLayoutIndexByLabel[sLable];
			}
			return oPostion;
		},
		/**
		 * Get the position info by position id(HandlingUnitLogicalPosition)
		 *
		 * @param {string} sPositionId The id(HandlingUnitLogicalPosition) of the Position
		 * @return {object} The Position info
		 */
		getPositionInfoById: function(sPositionId) {
			var oPosition;
			if (_mLayoutIndexById) {
				oPosition = _mLayoutIndexById[sPositionId];
			}
			return oPosition;
		},

		getPickingStatusById: function(sPositionId) {
			var oPosition;
			if (_mLayoutIndexById) {
				oPosition = _mLayoutIndexById[sPositionId];
			}
			return oPosition.picking.status;
		},

		getPickingQuantityById: function(sPositionId) {
			var oPosition;
			if (_mLayoutIndexById) {
				oPosition = _mLayoutIndexById[sPositionId];
			}
			return oPosition.picking.actual;
		},

		getPickingSplitFlagById: function(sPositionId) {
			var oPosition;
			if (_mLayoutIndexById) {
				oPosition = _mLayoutIndexById[sPositionId];
			}
			return oPosition.picking.split;
		},

		getDropingStatusById: function(sPositionId) {
			var oPosition;
			if (_mLayoutIndexById) {
				oPosition = _mLayoutIndexById[sPositionId];
			}
			return oPosition.dropping.status;
		},

		getPositionByLable: function(sLable) {
			var oPostion;
			if (_mLayoutIndexByLabel) {
				oPostion = _mLayoutIndexByLabel[sLable];
			}
			if (oPostion) {
				return oPostion.HandlingUnitLogicalPosition;
			}
		},
		updatePositionStatus: function(oPositionInfo, iStatus) {
			var iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
			var iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
			_oModel.setProperty("/layout/" + iRow + "/cells/" + iCol + "/connection/status", iStatus);
		},
		setStatusForPreparationByIds: function(aId, iStatus) {
			aId.forEach(function(sId) {
				if (sId !== "") {
					var oPositionInfo = this.getPositionInfoById(sId);
					this.updatePositionStatus(oPositionInfo, iStatus);
				}
			}.bind(this));
		},
		setStatusForPickingByLable: function(sLable, iStatus) {
			var oPositionInfo = this.getPositionInfoByLable(sLable);
			this._setStatusForPicking(oPositionInfo, iStatus);
		},
		setStatusForPickingById: function(sId, iStatus) {
			if (sId !== "") { //splitting exception would remove hu from logical position
				var oPositionInfo = this.getPositionInfoById(sId);
				this._setStatusForPicking(oPositionInfo, iStatus);
			}
		},
		setStatusForPickingByIds: function(aId, iStatus) {
			aId.forEach(function(sId) {
				if (sId !== "") {
					var oPositionInfo = this.getPositionInfoById(sId);
					this._setStatusForPicking(oPositionInfo, iStatus);
				}
			}.bind(this));
		},
		_setStatusForPicking: function(oPositionInfo, iStatus) {
			var iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
			var iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
			_oModel.setProperty("/layout/" + iRow + "/cells/" + iCol + "/picking/status", iStatus);
		},
		setNumbersForPickingById: function(sId, iNumber) {
			if (sId !== "") {
				var oPositionInfo = this.getPositionInfoById(sId);
				this._setNumbersForPicking(oPositionInfo, iNumber);
			}
		},
		setNumbersForPickingByIds: function(aId, iNumber) {
			aId.forEach(function(sId) {
				if (sId !== "") {
					var oPositionInfo = this.getPositionInfoById(sId);
					this._setNumbersForPicking(oPositionInfo, iNumber);
				}
			}.bind(this));
		},
		_setNumbersForPicking: function(oPositionInfo, iNumber) {
			var iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
			var iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
			_oModel.setProperty("/layout/" + iRow + "/cells/" + iCol + "/picking/actual", iNumber);
		},
		setSplitForPickingById: function(sId, bSplit) {
			if (sId !== "") {
				var oPositionInfo = this.getPositionInfoById(sId);
				this._setSplitForPicking(oPositionInfo, bSplit);
			}
		},
		_setSplitForPicking: function(oPositionInfo, bSplit) {
			var iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
			var iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
			_oModel.setProperty("/layout/" + iRow + "/cells/" + iCol + "/picking/split", bSplit);
		},
		setStatusForDroppingByIds: function(aId, iStatus) {
			aId.forEach(function(sId) {
				if (sId !== "") {
					var oPositionInfo = this.getPositionInfoById(sId);
					this._setStatusForDroping(oPositionInfo, iStatus);
				}
			}.bind(this));
		},
		_setStatusForDroping: function(oPositionInfo, iStatus) {
			var iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
			var iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
			_oModel.setProperty("/layout/" + iRow + "/cells/" + iCol + "/dropping/status", iStatus);
		},
		/**
		 * Get the first logical position for serial managed
		 *
		 * @param {array} aLogicalPositions The id(HandlingUnitLogicalPosition) array
		 * @return {object} _oPosition The first logical position under some rule
		 * (current basic rule: from the bottom to up, from the left to right)
		 */
		getFirstPositionForSerialManaged: function(aLogicalPositions) {
			var _oPosition = undefined;
			var _iRow = undefined;
			var _iCol = undefined;
			aLogicalPositions.forEach(function(sPosition) {
				var oPositionInfo = this.getPositionInfoById(sPosition);
				var iRow = parseInt(oPositionInfo.RowInd, 10) - 1;
				var iCol = parseInt(oPositionInfo.ColInd, 10) - 1;
				if (_iRow === undefined) {
					_oPosition = sPosition;
					_iCol = iCol;
					_iRow = iRow;
				} else {
					if ((iRow > _iRow) || (iRow === _iRow && iCol < _iCol)) {
						_oPosition = sPosition;
						_iCol = iCol;
						_iRow = iRow;
					}
				}
			}.bind(this));
			return _oPosition;
		}
	};
});
