/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"zscm/ewm/pickcarts1/utils/Util"
], function(JSONModel, Util) {
	"use strict";
	var _oModel;
	return {
		init: function() {
			if (_oModel === undefined) {
				_oModel = new JSONModel({
					forTasksPicking: [],
					forLowQtyCheck: []
				});

			}
			return _oModel;
		},
		destroy: function() {
			_oModel = undefined;
		},
		getSerialNumbers: function(bForTaskPicking) {
			if (bForTaskPicking === false) {
				return _oModel.getProperty("/forLowQtyCheck");
			} else {
				return _oModel.getProperty("/forTasksPicking");
			}
		},
		setSerialNumbers: function(aSerialNumber, bForTaskPicking) {
			if (bForTaskPicking === false) {
				_oModel.setProperty("/forLowQtyCheck", aSerialNumber);
			} else {
				_oModel.setProperty("/forTasksPicking", aSerialNumber);
			}
		},
		hasSerialNumber: function(sSerialNumber, bForTaskPicking) {
			var aSerials = this.getSerialNumbers(bForTaskPicking);
			var bHasSerial = false;
			Util.find(aSerials, function(sSerial) {
				if (sSerial === sSerialNumber) {
					bHasSerial = true;
					return true;
				}
				return false;
			});
			return bHasSerial;
		},
		verifySerialNumberDuplicated: function(sSerialNumber) {
			var promise = new Promise(function(resolve, reject) {
				if (!this.hasSerialNumber(sSerialNumber)) {
					resolve();
				} else {
					reject();
				}
			}.bind(this));
			return promise;
		},
		removeSerialNumber: function(sSerialNumber, bForTaskPicking) {
			var aSerials = this.getSerialNumbers(bForTaskPicking);
			var iIndex = aSerials.indexOf(sSerialNumber);
			if (iIndex > -1) {
				aSerials.splice(iIndex, 1);
			}
			this.setSerialNumbers(aSerials, bForTaskPicking);
			_oModel.updateBindings(true);

			return this;
		},
		clearData: function(bForTaskPicking) {
			if(bForTaskPicking === false)
			{
				_oModel.setProperty("/forLowQtyCheck", []);
			}
			else
			{
			_oModel.setProperty("/forTasksPicking", []);
			}
			_oModel.updateBindings(true);
		},
		addSerialNumber: function(sSerialNumber, bForTaskPicking) {
			var aSerialNumber = this.getSerialNumbers(bForTaskPicking);
			aSerialNumber.splice(0, 0, sSerialNumber);
			this.setSerialNumbers(aSerialNumber, bForTaskPicking);
			_oModel.updateBindings(true);
			return this;
		},
		getSerialNumberCount: function(bForTaskPicking) {
			return this.getSerialNumbers(bForTaskPicking).length;
		}
	};
});
