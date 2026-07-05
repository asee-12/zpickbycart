/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"scm/ewm/pickcarts1/model/Global",
	"scm/ewm/pickcarts1/utils/Util"
], function(JSONModel, Global, Util) {
	"use strict";
	var _oModel;
	var iDebundHandlingUnitIndex;
	return {
		init: function() {
			if (_oModel === undefined) {
				_oModel = new JSONModel({
					handlingUnits: [],
					errors: [],
					currentHandlingUnit: {},
					progress: 0,
					debundleHUId: "",
					debundlePosition: "",
					statusOfHU: []
				});
			}
			return _oModel;
		},
		
		destroy: function() {
			_oModel = undefined;
			iDebundHandlingUnitIndex = null;
		},
		
		clearData: function() {
			_oModel.setProperty("/progress", 0);
			_oModel.setProperty("/errors", []);
			iDebundHandlingUnitIndex = null;
		},
		
		
		setErrors: function(aError) {
			_oModel.setProperty("/errors", aError);
		},
		/**
		 * Clear handling unit and current handling unit for handle no handling units for warehouse order
		 *
		 */	
		clearHandlingUnits: function() {
			_oModel.setProperty("/handlingUnits", []);
			_oModel.setProperty("/currentHandlingUnit", {});
		},
		
		setHandlingUnitId: function(sHUId) {
			_oModel.setProperty("/debundleHUId", sHUId);
		},
		setDebundlePosition: function(sPosition) {
			_oModel.setProperty("/debundlePosition", sPosition);
		},
		getDebundldPosition: function() {
			return _oModel.getProperty("/debundlePosition");	
		},
		
		/**
		 * update the connection progress base on the indicator
		 *
		 * @param {bIncrease} bIncrease forward the progress if true, otherwise to the last progress
		 */
		updateConnectionProgress: function(bIncrease) {
			var iProgress = this.getConnectionProgress();
			var aHandlingUnits =  this.getHandlingUnits();
			this.setStatusOfHUIndex();
			if (bIncrease) {
				if (iProgress < aHandlingUnits.length) {
					iProgress++;
				}
			} else {
				if (iProgress > 0) {
					iProgress--;
				}
			}
			_oModel.setProperty("/progress", iProgress);
		},
		resetAllHandlingUnits: function() {
			var aHandlingUnit = this.getHandlingUnits();
			iDebundHandlingUnitIndex = null;
			aHandlingUnit.forEach(function(mItem) {
				mItem.HandlingUnitNumber = "";
				mItem.HandlingUnitLogicalPosition = "";
			});
			_oModel.setProperty("/currentHandlingUnit", aHandlingUnit[0]);
			_oModel.setProperty("/progress", 0);
			_oModel.setProperty("/statusOfHU", []);
			
		},
		updatePositionId: function(sPosition){
			_oModel.getProperty("/currentHandlingUnit").HandlingUnitLogicalPosition = sPosition;
		},
		prepareHandlingUnit: function() {
			var iHandingUnitIndex;
			var aHandlingUnit = this.getHandlingUnits();
			if(Util.isEmpty(iDebundHandlingUnitIndex)) {
				iHandingUnitIndex = this.checkProgress();
			} else {
				iHandingUnitIndex = iDebundHandlingUnitIndex;
				var mHandlingUnit = _oModel.getProperty("/currentHandlingUnit");
				if(mHandlingUnit) {
					this.clearHandlingUnit(mHandlingUnit);
				}
				iDebundHandlingUnitIndex = null;
			}
			_oModel.setProperty("/currentHandlingUnit", aHandlingUnit[iHandingUnitIndex]);
		},
		getAllLogicalPositions: function() {
			var aHandlingUnit = this.getHandlingUnits();
			var aPosition = [];
			aHandlingUnit.forEach(function(mHandlingUnit) {
				if(!Util.isEmpty(mHandlingUnit.HandlingUnitLogicalPosition)) {
					aPosition.push(mHandlingUnit.HandlingUnitLogicalPosition);
				}
			});
			return aPosition;
		},
		getStatusOfHU: function() {
			return _oModel.getProperty("/statusOfHU");
		},
		
		checkProgress: function() {
			var iIndex;
			var statusOfHUIndex = this.getStatusOfHU();
			statusOfHUIndex.forEach(function(oStatus, iIdx){
				if(!iIndex && !oStatus.status) {
					iIndex = iIdx;
				}
			});
			return iIndex;
		},
		
		/**
		 * determine if all handling units are connected
		 *
		 * @return {bool} true if ready, otherwise false
		 */
		isHandlingUnitsReady: function() {
			var iProgress = this.getConnectionProgress();
			var aHandlingUnits = this.getHandlingUnits();
			return iProgress === aHandlingUnits.length;
		},
		
		getHandlingUnits: function() {
			return _oModel.getProperty("/handlingUnits");
		},
		
		getConnectionProgress: function() {
			return _oModel.getProperty("/progress");
		},
		
		/**
		 * set handlingUnits & set currentHandlingUnit as the first item in handlingUnits
		 * 
		 * @param {Array} aHandlingUnits The handling unit set
		 */	
		setHandlingUnit: function(aHandlingUnits) {
			var aPrepared = [];
			var aUnprepared = [];
			aHandlingUnits.forEach(function(mHandlingUnit) {
				if(this._hasPrepared(mHandlingUnit)) {
					aPrepared.push(mHandlingUnit);
				} else {
					mHandlingUnit.HandlingUnitNumber = "";
					mHandlingUnit.HandlingUnitLogicalPosition = "";
					aUnprepared.push(mHandlingUnit);
				}
			}.bind(this));
			var aHandlingUnit = aPrepared.concat(aUnprepared);
			_oModel.setProperty("/handlingUnits", aHandlingUnit);
			_oModel.setProperty("/currentHandlingUnit", aUnprepared[0]);
			_oModel.setProperty("/progress", aPrepared.length);
		},
		
		_hasPrepared: function(mHandlingUnit) {
			var bPrepared = true;
			if(Util.isEmpty(mHandlingUnit.HandlingUnitLogicalPosition) || Util.isEmpty(mHandlingUnit.HandlingUnitNumber)) {
				bPrepared = false;
			}
			return bPrepared;
		},
		getConnectedPositions: function() {
			var aHandlingUnits = _oModel.getProperty("/handlingUnits");
			var aConnected = [];
			aHandlingUnits.forEach(function(mHandlingUnit) {
				if(!Util.isEmpty(mHandlingUnit.HandlingUnitLogicalPosition)) {
					aConnected.push(mHandlingUnit.HandlingUnitLogicalPosition);
				}
			});
			return aConnected;
		},
		
		setStatusOfHUIndex: function() {
			var aHandlingUnits = this.getHandlingUnits();
			var statusOfHUIndex = this.getStatusOfHU();
			if(!statusOfHUIndex || statusOfHUIndex.length === 0) {
				aHandlingUnits.forEach(function(oHandlingUnit, iIdx) {
					var statusIndex = {index: iIdx, status: ""};
					if(oHandlingUnit.HandlingUnitNumber !== "" && oHandlingUnit.HandlingUnitLogicalPosition !== "") {
						statusIndex.status = true;
					} else {
						statusIndex.status = false;
					}
					statusOfHUIndex.push(statusIndex);
				}, this);
			} else {
				aHandlingUnits.forEach(function(oHandlingUnit, iIdx) {
					var statusIndex = {index: iIdx, status: ""};
					if(oHandlingUnit.HandlingUnitNumber !== "" && oHandlingUnit.HandlingUnitLogicalPosition !== "") {
						statusIndex.status = true;
					} else {
						statusIndex.status = false;
					}
					statusOfHUIndex[iIdx] = statusIndex;
				}, this);
			}
			_oModel.setProperty("/statusOfHU", statusOfHUIndex);
		},
		debundPreparation: function(sLogicalPosition, sLogicalPositionLabel) {
			var aHandlingUnit = this.getHandlingUnits();
			var mHandlingUnit = Util.find(aHandlingUnit, function(mCurrent, iIndex) {
				if(mCurrent.HandlingUnitLogicalPosition === sLogicalPosition) {
					iDebundHandlingUnitIndex = iIndex;
					return true;
				}
				return false;
			});
			if(mHandlingUnit) {
				this.setHandlingUnitId(mHandlingUnit.HandlingUnitNumber);
				this.setDebundlePosition(sLogicalPositionLabel);
			}
		},
		debundFinished: function() {
			this.setHandlingUnitId("");
			this.setDebundlePosition("");
			iDebundHandlingUnitIndex = null;
		},
		restoreHandlingUnit: function(mHandlingUnit, sHandlingUnit, sPositionId) {
			mHandlingUnit.HandlingUnitNumber = sHandlingUnit;
			mHandlingUnit.HandlingUnitLogicalPosition = sPositionId;
		},
		clearHandlingUnit: function(mHandlingUnit) {
			mHandlingUnit.HandlingUnitNumber = "";
			mHandlingUnit.HandlingUnitLogicalPosition = "";	
		},
		
		getDebundleHandlingUnit: function() {
			var aHandlingUnits = this.getHandlingUnits();
			return aHandlingUnits[iDebundHandlingUnitIndex];
		},
		
		getCurrentHandlingUnit: function() {
			return _oModel.getProperty("/currentHandlingUnit");
		},
		
		getCurrentHandlingUnitLogicalPosition: function() {
			return _oModel.getProperty("/currentHandlingUnit/HandlingUnitLogicalPosition");
		},

		/**
		 * check if the handling unit is reserved
		 * 
		 * @param {string} sHandlingUnit The ID of Handling Unit. should not be empty
		 * @return {bool} bReserved Return true if the handling unit has reserved on local, otherwise return false
		 */
		isHandlingUnitReserved: function(sHandlingUnit) {
			var aHandlingUnits = _oModel.getProperty("/handlingUnits");
			var oWorkingItem = _oModel.getProperty("/currentHandlingUnit");
			var bReserved = false;
			for(var iIndex = 0; iIndex < aHandlingUnits.length; iIndex++) {
				if(aHandlingUnits[iIndex] !== oWorkingItem && aHandlingUnits[iIndex].HandlingUnitNumber === sHandlingUnit) {
					bReserved = true;
				}
			}
			return bReserved;
		},
		
		/**
		 * check if the position is reserved
		 * 
		 * @param {string} sLogicalPosition The ID of LogicalPosition. should not be empty
		 * @return {bool} bReserved Return true if the LogicalPosition has reserved on local, otherwise return false
		 */
		isLogicalPositionReserved: function(sLogicalPosition) {
			var aHandlingUnits = _oModel.getProperty("/handlingUnits");
			var oWorkingItem = _oModel.getProperty("/currentHandlingUnit");
			var bReserved = false;
			for(var iIndex = 0; iIndex < aHandlingUnits.length; iIndex++) {
				if(aHandlingUnits[iIndex] !== oWorkingItem && aHandlingUnits[iIndex].HandlingUnitLogicalPosition === sLogicalPosition) {
					bReserved = true;
				}
			}
			return bReserved;
		},
		
		/**
		 * check if the handling unit input contains special characters
		 * 
		 * @param {string} sInput The value of handling unit. should not be empty
		 * @return {bool} Return true if the handling unit has special characters input, otherwise return false
		 */
		isContainsSpecialCharacter: function(sInput) {
			var oPattern = "$*+";
			for(var i=0; i<sInput.length; i++) {
				if(oPattern.indexOf(sInput.charAt(i)) !== -1) {
					return true;
				}
			}
		}
	};
});