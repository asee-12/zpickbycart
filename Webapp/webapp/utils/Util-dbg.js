/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/ValueState",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/utils/Const",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/NumberFormat"
], function (ValueState, Global, Const, DateFormat, NumberFormat) {
	"use strict";
	return {
		isEmpty: function (sValue) {
			var bEmpty = false;
			if (sValue === undefined || sValue === null || sValue === "") {
				bEmpty = true;
			}
			return bEmpty;
		},
		isString: function (obj) {
			return (typeof obj) === "string";
		},
		trim: function (sValue) {
			return $.trim(sValue);
		},

		/**
		 * get page navigation params by warehouse order status
		 * 
		 * @param {Enum} sWarehouseOrderStatus the status of the warehouse order(Const.WHO_STATUS)
		 * @param {Object} oData The response from logon resource service
		 * @param {bool} bRestore true if just restore the local status; otherwise should load data from server
		 * @return {Object} route and parameters
		 */
		getNavParamsByStatus: function (sWarehouseOrderStatus, oData, bRestore) {
			var sRoute;
			var iProgress;
			var WHO_STATUS = Const.WHO_STATUS;
			var oParam = {
				bRestore: !!bRestore
			};
			switch (sWarehouseOrderStatus) {
			case WHO_STATUS.INITIAL:
				sRoute = "connection";
				iProgress = 2;
				oParam.warehouseOrder = oData.EWMWarehouseOrder;
				break;
			case WHO_STATUS.PICKING:
				sRoute = "processTasks";
				iProgress = 3;
				oParam.warehouseOrder = oData.EWMWarehouseOrder;
				break;
			case WHO_STATUS.DROPPING:
				sRoute = "dropHandlingUnit";
				iProgress = 4;
				oParam.warehouseOrder = oData.EWMWarehouseOrder;
				oParam.warehouseNumber = oData.EWMWarehouse;
				break;
			}
			return {
				route: sRoute,
				param: oParam,
				progress: iProgress
			};
		},

		removeLeadingZeroinNumeric: function (sValue) {
			if (isNaN(sValue)) //does contain non-numic letters
			{
				return sValue;
			}

			return parseInt(sValue, 10).toString();
		},
		/**
		 * find the index of the item in an array element. please refer Array.prototype.findIndex
		 * 
		 * @param {array} aItems The array 
		 * @param {function} fnCallback Function to execute on each value in the array, taking three arguments.
		 * @return {int} iRet The index of the item, if not find return -1;
		 */
		findIndex: function (aItems, fnCallbck) {
			var inx = 0;
			var iCount = aItems.length;
			var iRet = -1;

			for (; inx < iCount; inx++) {
				if (fnCallbck(aItems[inx], inx, aItems)) {
					iRet = inx;
					break;
				}
			}
			return iRet;
		},
		/**
		 * returns the value of the first element in the array that satisfies the provided testing function. 
		 * Otherwise undefined is returned. please refer Array.prototype.find
		 * 
		 * @param {array} aItems The array 
		 * @param {function} fnCallback Function to execute on each value in the array, taking three arguments.
		 * @return {object} oRet The array item 
		 */
		find: function (aItems, fnCallback) {
			var oRet;
			var iCount = aItems.length;
			for (var inx = 0; inx < iCount; inx++) {
				if (fnCallback(aItems[inx], inx, aItems)) {
					oRet = aItems[inx];
					break;
				}
			}
			return oRet;
		},
		/**
		 * determines whether an array includes a certain element, returning true or false as appropriate.
		 * 
		 * @param {array} aItems The array need need search from
		 * @param {object} oSearchItem The item need search
		 * @returns {bool} bInclud true if find, otherwise return false
		 */
		includes: function (aItems, oSearchItem) {
			var bInclud = false;
			var iCount = aItems.length;
			for (var inx = 0; inx < iCount; inx++) {
				if (aItems[inx] === oSearchItem) {
					bInclud = true;
					break;
				}
			}
			return bInclud;
		},

		isInteger: (function () {
			if (Number.isInteger) {
				return Number.isInteger;
			} else {
				return function (iValue) {
					return typeof iValue === "number" &&
						isFinite(iValue) && Math.floor(iValue) === iValue;
				};
			}
		})(),

		convertDateTime: function (sDateTime) {
			if (this.isEmpty(sDateTime)) {
				return null;
			}
			var aDateTime = sDateTime.split(" ");

			var aDate = aDateTime[0].split(".");
			var dd = aDate[0];
			var mm = aDate[1] - 1;
			var yyyy = aDate[2];

			var aTime = aDateTime[1].split(":");
			var h = aTime[0];
			var m = aTime[1];
			var s = parseInt(aTime[2]); //get rid of that 00.0;

			return new Date(yyyy, mm, dd, h, m, s);
		},

		formatDateTime: function (oDate, sTimeZone) {
			if (this.isEmpty(oDate)) {
				return "";
			}
			var oDateTimeWithTimeZoneInstance = DateFormat.getDateTimeWithTimezoneInstance();
			return oDateTimeWithTimeZoneInstance.format(oDate, sTimeZone);
		},

		parseNumber: function (sValue, bRoundup) {
			var oFloatFormat = NumberFormat.getFloatInstance();
			var oFormatOptions = oFloatFormat.oFormatOptions;
			oFormatOptions.parseAsString = true;
			return oFloatFormat.parse(sValue, oFormatOptions);
		},

		formatNumber: function (vValue, iDigitsLength) {
			var oFloatFormat;
			var oFormatOptions;
			if (this.isEmpty(iDigitsLength)) {
				oFormatOptions = {
					minFractionDigits: Const.MaxDecimalDigits,
					parseAsString: true
				};
				oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
			} else {
				oFormatOptions = {
					minFractionDigits: 0,
					maxFractionDigits: iDigitsLength,
					parseAsString: true
				};
				oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
			}
			return oFloatFormat.format(vValue);
		},

		formatInteger: function (iInt) {
			if (isNaN(iInt)) {
				return "";
			}
			var oFormatOptions = {
				parseAsString: true,
				minFractionDigits: 0,
				maxFractionDigits: 0
			};
			var oIntInstance = NumberFormat.getFloatInstance(oFormatOptions);
			return oIntInstance.format(iInt);
		},
		playAudio: function (oController, sMsgType) {
			if	(oController.getOwnerComponent() === undefined) {return;}
			var sComponentId = oController.getOwnerComponent().getId();
			var oAudio = sap.ui.getCore().byId(sComponentId + "---main--audio-player");
			if (!this.isEmpty(oAudio)) {
				oAudio.play(sMsgType);
			}
		},
		isJsonString: function (str) {
			try {
				if (typeof JSON.parse(str) == "object") {
					return true;
				}
			} catch (e) {

			}
			return false;
		}
	};
});