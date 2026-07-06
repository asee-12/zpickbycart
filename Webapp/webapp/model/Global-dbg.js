/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"zscm/ewm/pickcarts1/utils/Const",
	"sap/m/MessageBox"
], function (JSONModel, BindingMode, Const, MessageBox) {
	"use strict";
	var _oModel;
	var _systemMode = "System-Guided";
	var _manualMode = "Manual";
	return {
		i18nModel: {},
		init: function (i18n) {
			if (_oModel === undefined) {
				this.i18nModel = i18n;
				_oModel = new JSONModel({
					enableNext: false,
					woNumber: "",
					userName: "",
					appProgress: 0, //0:LogonResource, 1:WO list, 2: Pick cart connection, 3: Process Warehouse Order, 4: Drop Warehouse Order
					selectedMode: _systemMode,
					pickModes: [{
						"Name": _systemMode,
						"Text": i18n.getObject("systemGuided")
					}, {
						"Name": _manualMode,
						"Text": i18n.getObject("manualSelection")
					},
				//20260706 - add mode MLMU
				{
					"Name": _customMLMU,
					"Text": i18n.getObject("customMLMU")
				}
				]
				});
				_oModel.setDefaultBindingMode(BindingMode.TwoWay);
			}
			return _oModel;
		},
		destroy: function () {
			_oModel = undefined;
		},
		setQueue: function (sQueue) {
			_oModel.setProperty("/queue", sQueue);
		},
		getQueue: function (sQueue) {
			return _oModel.getProperty("/queue");
		},
		setWoQueue: function (sQueue) {
			_oModel.setProperty("/woQueue", sQueue);
		},
		getWoQueue: function () {
			return _oModel.getProperty("/woQueue");
		},
		// getResource: function () {
		// 	return _oModel.getProperty("/resource");
		// },
		// setResource: function (sResource) {
		// 	_oModel.setProperty("/resource", sResource);
		// },

		disableNext: function () {
			_oModel.setProperty("/enableNext", false);
		},

		enableNext: function () {
			_oModel.setProperty("/enableNext", true);
		},
		setWONumber: function (sWarehouseOrderNumber) {
			_oModel.setProperty("/woNumber", sWarehouseOrderNumber);
		},

		getWONumber: function () {
			return _oModel.getProperty("/woNumber");
		},
		/**
		 * set up the progress of the work.
		 *
		 * @param {Int} appProgressNum The number of the progress 0: logon; 1: wo list; 2: connection; 3: pick product; 4: drop
		 */
		setAppProgress: function (appProgressNum) {
			_oModel.setProperty("/appProgress", appProgressNum);
		},
		getAppProgress: function () {
			return _oModel.getProperty("/appProgress");
		},
		isSystemMode: function () {
			return _oModel.getProperty("/selectedMode") === _systemMode;
		},
		
		
		setToLeaveAfterDrop: function (bValue) { 
            _oModel.setProperty("/bToLeaveAfterDrop", bValue); 
		}, 

        getToLeaveAfterDrop: function () { 
        	return _oModel.getProperty("/bToLeaveAfterDrop"); 
        },
		
		/**
		 * error message pop up if internet is disconnected.
		 * 
		 * @param {Enum} statusCode The status code of http response
		 */
		showErrorMsgIfInternetDisconnected: function (statusCode) {
			if (statusCode === Const.ERR_INTERNET_DISCONNECTED) {
				var errorMsg = this.i18nModel.getResourceBundle().getText("internetDisconnectedMsg");
				MessageBox.error(errorMsg);
			}
		},
	
		/**
		 * error message pop up if error occurs during selection
		 * 
		 */		
		showErrorMessage: function(oError){
			if (oError.statusCode === Const.ERR_INTERNET_DISCONNECTED ) {
				this.showErrorMsgIfInternetDisconnected(oError.statusCode);
			}else{
				try{
						var oParse = JSON.parse(oError.responseText);
						MessageBox.error(oParse.error.message.value);
					}catch(error){
						//Display Error
					}
			}
		},
		
		/**
		 * convert message types to sap.ui.core.MessageType
		 * 
		 */	
		getMessageType: function(sType){
			var messageType;
			switch (sType) {
				case "E":
					messageType = "Error";
					break;
				case "S":
					messageType = "Success";
					break;
				case "W":
					messageType = "Warning";
					break;	
				case "I":
					messageType = "Information";
					break;
				case "A":
					messageType = "Error";
					break;
				case "X":
					messageType = "Error";
					break;	
				default:
					messageType = "None";
					break;
			}

			return messageType;
		}
	};
});