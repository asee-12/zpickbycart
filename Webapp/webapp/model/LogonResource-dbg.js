/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library"
], function(JSONModel, ValueState) {
	"use strict";
	var _oModel;
	return {
		init: function(i18n) {
			if (_oModel === undefined) {
				_oModel = new JSONModel({
					valueState: ValueState.None, //for resource input
					toolTip: "",
					editable: true,
					modeEditable: true
				});
			}
			return _oModel;
		},
		destroy: function() {
			_oModel = undefined;	
		},
		setError: function() {
			_oModel.setProperty("/valueState", ValueState.Error);
		},
		setNone: function() {
			_oModel.setProperty("/valueState", ValueState.None);
			_oModel.setProperty("/toolTip", "");
		},
		setEditable: function(bEditable) {
			_oModel.setProperty("/editable", bEditable);
		},
		setModeEditable: function(bEditable) {
			_oModel.setProperty("/modeEditable", bEditable);
		}
	};
});