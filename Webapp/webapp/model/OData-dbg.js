/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"scm/ewm/pickcarts1/model/PickCartLayout",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"scm/ewm/pickcarts1/utils/Util",
	"scm/ewm/pickcarts1/model/Global"
], function (PickCartLayout, Filter, FilterOperator, Util, Global) {
	"use strict";
	// odata model helper
	var _oModel;
	var _sUserName;
	var _oPickcartLayoutPromise;
	var _ABAB_TRUE_CONST = "X";
	var _bTerminating = false; // flag of if the app in the termination process.
	var _bTaskConfirming = false; // flag of if there are tasks are in cofirming process
	return {
		init: function (oDataModel) {
			if (Util.isEmpty(_oModel)) {
				_oModel = oDataModel;
			}

			return _oModel;
		},
		destroy: function () {
			_oModel = null;
			_sUserName = null;
			_oPickcartLayoutPromise = null;
			_bTerminating = false;
			_bTaskConfirming = false;
		},
		/**
		 * determin if can execute termination. only one termination request is allowed to process at the same time.
		 *
		 * @return {bool} true, can execut the termination request as no requests are pending. otherwise false.
		 */
		canTerminate: function () {
			return !_bTerminating;
		},
		/**
		 * determin if can confirm tasks. only one group of confirming request are allowed to process at the same time.
		 *
		 * @return {bool} true, can execute the termination request as no requests are pending. otherwise false.
		 */
		canConfirmTasks: function () {
			return !_bTaskConfirming;
		},
		/**
		 * get the OData path of UserSetting. if _sUserName not exsits, return undefined
		 *
		 * @return {String} sPath The user setting path if _sUserName has value, otherwise undefined
		 */
		getUserSettingPath: function () {
			var sPath;
			if (!Util.isEmpty(_sUserName)) {
				sPath = "/UserSet(UserDataEntry='',IntralogisticsOperationsUser='" + _sUserName + "')";
			}
			return sPath;
		},

		getResourcePath: function () {
			var sPath;
			if (!Util.isEmpty(_sUserName)) {
				sPath = this.getUserSettingPath() + "/EWMResource";
			}
			return sPath;
		},

		getWarehouseNumberPath: function () {
			var sPath;
			if (_sUserName !== undefined) {
				sPath = this.getUserSettingPath() + "/EWMWarehouse";
			}
			return sPath;
		},
		/**
		 * get the user setting info, e.g username; default resource/warehouse number
		 *
		 * @return {Promise} promsie An promise object of user setting
		 */
		getUserSetting: function () {
			var promise;
			if (!Util.isEmpty(_sUserName)) {
				var oUserSetting = _oModel.getObject(this.getUserSettingPath());
				promise = new Promise(function (resolve, reject) {
					resolve(oUserSetting);
				});
			} else {
				promise = new Promise(function (resolve, reject) {
					_oModel.read("/UserSet(UserDataEntry='',IntralogisticsOperationsUser='')", {
						success: function (oResult) {
							_sUserName = oResult.IntralogisticsOperationsUser;
							// _sDefaultResource = oResult.EWMResource;
							resolve(oResult);
						},
						error: function (oResult) {
							Global.showErrorMsgIfInternetDisconnected(oResult.statusCode);
							reject(oResult);
						}
					});
				});
			}
			return promise;
		},
		getWarehouseNumber: function () {
			return _oModel.getObject(this.getUserSettingPath()).EWMWarehouse;
		},
		getResourceNumber: function () {
			return _oModel.getObject(this.getUserSettingPath()).EWMResource;
		},
		setResourceNumber: function (sResource) {
			var sUserSettingPath = this.getUserSettingPath();
			_oModel.setProperty(sUserSettingPath + "/EWMResource", sResource);
		},
		/**
		 * logon resource will be called when click logon resource button on logon page
		 *
		 * @param {bool} bManual true if it is manual selection mode
		 * @return {Promise} A Promise object
		 */
		logonResource: function (bManual) {
			var sQueue = Global.getQueue();
			return new Promise(function (resolve, reject) {
				_oModel.read("/LogonRSRC", {
					urlParameters: {
						EWMWarehouse: "'" + this.getWarehouseNumber() + "'",
						EWMResource: "'" + this.getResourceNumber() + "'",
						ManualSel: !!bManual,
						Queue: "'" + sQueue + "'"
					},
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			}.bind(this));
		},
		/**
		 * logon resource will be called when click logon resource button on logon page
		 *
		 * @return {Promise} A Promise object
		 */
		getWhoByMaulaSelection: function (sWarehouseOrderNumber) {
			return new Promise(function (resolve, reject) {
				_oModel.read("/GetWHOBySelection", {
					urlParameters: {
						EWMWarehouse: "'" + this.getWarehouseNumber() + "'",
						EWMResource: "'" + this.getResourceNumber() + "'",
						EWMWarehouseOrder: "'" + sWarehouseOrderNumber + "'"
					},
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * logon resource will be called when click logon resource button on logon page
		 *
		 * @return {Promise} A Promise object
		 */
		logoffResource: function () {
			return new Promise(function (resolve, reject) {
				_oModel.read("/LogoffRSRC", {
					urlParameters: {
						EWMWarehouse: "'" + this.getWarehouseNumber() + "'",
						EWMResource: "'" + this.getResourceNumber() + "'"
					},
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * verify the resource and warhouse nubmer, called by logon page
		 *
		 * @return {Promise} A Promise object
		 */
		verifyResourceAndWarhouseNumber: function (sEWMResource) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var sResource = sEWMResource;
			return new Promise(function (resolve, reject) {
				_oModel.read("/VerifyRSRC", {
					urlParameters: {
						EWMWarehouse: "'" + sWarehouseNumber + "'",
						EWMResource: "'" + sResource + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === "X") {
							reject(oResult.Msg);
						} else {
							resolve();
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},
		resetPickcartConfig: function () {
			_oPickcartLayoutPromise = null;
		},
		/**
		 * get the pickcart layout config infomatione
		 *
		 * @return {Promise} promsie An promise object of pickcar config
		 */
		getPickcartConfig: function () {
			var sWarehouseNumber = this.getWarehouseNumber();
			var sResourceNumber = this.getResourceNumber();
			if (!_oPickcartLayoutPromise) {
				_oPickcartLayoutPromise = new Promise(function (resolve, reject) {
					if (sWarehouseNumber && sResourceNumber) {
						var sLayoutPath = "/PickCartSet(EWMWarehouse='" + sWarehouseNumber + "',EWMResource='" + sResourceNumber + "')/Layouts";
						_oModel.read(sLayoutPath, {
							success: function (oResult) {
								resolve(oResult.results);
							},
							error: function (oError) {
								Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
								reject(oError);
							}
						});
					} else {
						reject();
					}
				});
			}
			return _oPickcartLayoutPromise;
		},

		/**
		 * Get the data for Connection, including - layout data, handling units
		 *
		 * @param {string} sWarehouseOrder The warehouse order
		 * @param {string} sWarehouseNumber The warehouse number
		 *
		 * @return {Promise} Promise object contains layout/handling units data
		 */
		getPickcartConnectionData: function (sWarehouseOrder) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var oPromiseLayoutData = this.getPickcartConfig();

			var oPromiseForHandlingUnits = new Promise((function (resolve, reject) {
				if (sWarehouseNumber && sWarehouseOrder) {
					var sHandlingUnitsPath = "/WarehouseOrderSet(EWMWarehouse='" + sWarehouseNumber + "',EWMWarehouseOrder='" + sWarehouseOrder +
						"')/HUs";
					var aHandlingUnits = _oModel.getObject(sHandlingUnitsPath);
					if (aHandlingUnits) {
						resolve(aHandlingUnits);
					} else {
						_oModel.read(sHandlingUnitsPath, {
							success: function (oResult) {
								resolve(oResult.results);
							},
							error: function (oError) {
								Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
								reject(oError);
							}
						});
					}
				} else {
					reject();
				}
			}));
			return Promise.all([oPromiseLayoutData, oPromiseForHandlingUnits]);
		},

		/**
		 * get warehouse order list by manual selection
		 *
		 * @return {Promise} promsie An promise object of warehouse orders
		 */
		getWarehouseOrders: function () {
			var sWarehouseNumber = this.getWarehouseNumber();
			var sResourceNumber = this.getResourceNumber();
			var sQueue;
			var oQueueFilter;

			var oResourceNumberFilter = new Filter("EWMResource", FilterOperator.EQ, sResourceNumber);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var aFilters;
			if (!Util.isEmpty(Global.getQueue())) {
				sQueue = Global.getQueue();
				oQueueFilter = new Filter("Queue", FilterOperator.EQ, sQueue);
				aFilters = [oResourceNumberFilter, oWarehouseNumberFilter, oQueueFilter];
			} else {
				aFilters = [oResourceNumberFilter, oWarehouseNumberFilter];
			}

			var oPromiseForWarehouseOrdersSet = new Promise(function (resolve, reject) {
				_oModel.read("/WarehouseOrderSet", {
					filters: aFilters,
					success: function (oResult) {
						resolve(oResult.results);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
			return oPromiseForWarehouseOrdersSet;
		},

		getWarehouseOrderStatus: function (sWarehouseOrder) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var oPromiseForWarehouseOrdersStatus = new Promise(function (resolve, reject) {
				var sPath = "/CheckWHOStatus";
				_oModel.read(sPath, {
					urlParameters: {
						EWMWarehouse: "'" + sWarehouseNumber + "'",
						EWMWarehouseOrder: "'" + sWarehouseOrder + "'"
					},
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
			return oPromiseForWarehouseOrdersStatus;
		},

		validateHandlingUnit: function (sWarehouseOrder, sHULinenumber, sHandlingUnitId) {
			var that = this;
			return new Promise(function (resolve, reject) {
				_oModel.read("/BindHU", {
					urlParameters: {
						EWMWarehouse: "'" + that.getWarehouseNumber() + "'",
						EWMWarehouseOrder: "'" + sWarehouseOrder + "'",
						EWMResource: "''",
						Pmat: "''",
						HandlingUnitLogicalPosition: "''",
						HndlgUnitNumberInWhseOrder: "'" + sHULinenumber + "'",
						HandlingUnitNumber: "'" + sHandlingUnitId + "'",
						Checkonly: true
					},
					success: function (oResult) {
						if (oResult.Failed === "X") {
							reject(oResult.Msg);
						} else {
							resolve();
						}

					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},
		resetConnectionData: function () {
			var sOrder = Global.getWONumber();
			var sWarehouse = this.getWarehouseNumber();
			var sResource = this.getResourceNumber();
			var sPath = "/RsrcHuAssignmentSet(EWMWarehouse='" + sWarehouse + "',EWMResource='" + sResource + "',EWMWarehouseOrder='" + sOrder +
				"',HndlgUnitNumberInWhseOrder='')";
			return new Promise(function (resolve, reject) {
				_oModel.remove(sPath, {
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},
		/**
		 * submit the hus info to backend
		 *
		 * @param {object} mHandlingUnit The Handling unit task to bind
		 * @return {Promise} promsie An promise object of update handling units
		 */
		submitConnectiondData: function (mHandlingUnit) {
			return new Promise(function (resolve, reject) {
				var sPath = "/HUSet(EWMWarehouse='" + mHandlingUnit.EWMWarehouse + "',EWMWarehouseOrder='" + mHandlingUnit.EWMWarehouseOrder +
					"',HndlgUnitNumberInWhseOrder='" + mHandlingUnit.HndlgUnitNumberInWhseOrder + "')";
				//var oHandlingUnit = _oModel.getObject(sPath);
				_oModel.update(sPath, mHandlingUnit, {
					success: function () {
						resolve();
					},
					error: function (oError) {
						Global.showErrorMessage(oError);
						reject(oError);
					}
				});
			});
		},
		/**
		 * terminate the order
		 *
		 * @param {string} sWarehouseOrder The warehouse order
		 * @param {bool} bSplit if true, the user will not own the order; otherwise the user still own the order
		 * @return {Promise} The Promise object which represents termination request.
		 */
		submitTerminate: function (sWarehouseOrder, bSplit) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var sResourceNumber = this.getResourceNumber();
			var sSplit = "";
			if (bSplit) {
				sSplit = _ABAB_TRUE_CONST;
			}
			if (!_bTerminating) {
				_bTerminating = true;
				return new Promise(function (resolve, reject) {
					var sPath = "/LeaveTrans";
					_oModel.create(sPath, {}, {
						urlParameters: {
							"EWMWarehouse": "'" + sWarehouseNumber + "'",
							"EWMResource": "'" + sResourceNumber + "'",
							"EWMWarehouseOrder": "'" + sWarehouseOrder + "'",
							"Split": "'" + sSplit + "'"
						},
						success: function (oResult) {
							_bTerminating = false;
							resolve(oResult);
						},
						error: function (oError) {
							Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
							_bTerminating = false;
							reject(oError);
						}
					});
				});
			}

		},

		/**
		 * get exception list
		 *
		 * @return {Promise} The promise object which represent the exception list
		 */
		getExceptions: function () {
			var sWarehouseNumber = this.getWarehouseNumber();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			return new Promise(function (resolve, reject) {
				if (sWarehouseNumber) {
					_oModel.read("/ExceptionSet", {
						filters: [oWarehouseNumberFilter],
						success: function (oResult) {
							resolve(oResult.results);
						},
						error: function (oResult) {
							Global.showErrorMsgIfInternetDisconnected(oResult.statusCode);
							reject(oResult);
						}
					});
				} else {
					reject();
				}
			});
		},
		getWarehouseTaskGroup: function (sWareHouseOrder) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var oWarehouseOrderFilter = new Filter("EWMWarehouseOrder", FilterOperator.EQ, sWareHouseOrder);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			return new Promise(function (resolve, reject) {
				if (sWarehouseNumber && sWareHouseOrder) {
					_oModel.read("/WarehouseTaskGrpSet", {
						filters: [oWarehouseOrderFilter, oWarehouseNumberFilter],
						success: function (oResult) {
							resolve(oResult.results);
						},
						error: function (oResult) {
							Global.showErrorMsgIfInternetDisconnected(oResult.statusCode);
							reject(oResult);
						}
					});
				} else {
					reject();
				}
			});
		},

		getWarehouseTask: function (sWarehouseOrder) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var oWarehouseOrderFilter = new Filter("EWMWarehouseOrder", FilterOperator.EQ, sWarehouseOrder);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oIsDropFilter = new Filter("IsHandlingUnitWarehouseTask", FilterOperator.EQ, false);
			return new Promise(function (resolve, reject) {
				if (sWarehouseNumber && sWarehouseOrder) {
					_oModel.read("/WarehouseTaskSet", {
						filters: [oWarehouseOrderFilter, oWarehouseNumberFilter, oIsDropFilter],
						success: function (oResult) {
							resolve(oResult.results);
						},
						error: function (oResult) {
							Global.showErrorMsgIfInternetDisconnected(oResult.statusCode);
							reject(oResult);
						}
					});
				} else {
					reject();
				}
			});
		},

		/**
		 * Get the data for picking, including - layout data, group list, task list
		 *
		 * @param {string} sWarehouseOrder The warehouse order
		 * @param {string} sWarehouseNumber The warehouse number
		 *
		 * @return {Promise} Promise object contains layout/group/task data
		 */
		getPickingData: function (sWarehouseOrder, sWarehouseNumber) {
			var oWarehouseOrderFilter = new Filter("EWMWarehouseOrder", FilterOperator.EQ, sWarehouseOrder);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oIsDropFilter = new Filter("IsHandlingUnitWarehouseTask", FilterOperator.EQ, false);
			var oPromiseLayoutData = this.getPickcartConfig();
			var oPromiseTaskGroupSet = new Promise(function (resolve, reject) {
				_oModel.read("/WarehouseTaskGrpSet", {
					filters: [oWarehouseOrderFilter, oWarehouseNumberFilter],
					success: function (oResult) {
						resolve(oResult.results);
					},
					error: function (oResult) {
						Global.showErrorMsgIfInternetDisconnected(oResult.statusCode);
						reject(oResult);
					}
				});
			});
			var oPromiseForWarehouseTasks = new Promise(function (resolve, reject) {
				_oModel.read("/WarehouseTaskSet", {
					filters: [oWarehouseOrderFilter, oWarehouseNumberFilter, oIsDropFilter],
					success: function (oResult) {
						resolve(oResult.results);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});

			return Promise.all([oPromiseLayoutData, oPromiseTaskGroupSet, oPromiseForWarehouseTasks]);
		},

		/**
		 * verify the source bin, called by process warehouse order page for no multi source handling unit case.
		 *
		 * @param {string} sSourceBin The source bin from the server
		 * @param {string} sInputSourceBin The source bin which scanned by user
		 * @return {Promise} A Promise object
		 */
		verifySourceBin: function (sSourceBin, sInputSourceBin) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.create("/VerifyBin", {}, {
					urlParameters: {
						"EWMStorageBin": "'" + sSourceBin + "'",
						"EWMWarehouse": "'" + sWarehouseNumber + "'",
						"Verif": "'" + sInputSourceBin + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === _ABAB_TRUE_CONST) {
							reject(oResult.Msg);
						} else {
							resolve(oResult);
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		/**
		 * verify the source bin info when the case of multi source handling unit task.
		 *
		 * @param {string} sSourceBin The source bin from the server
		 * @param {string} sInputSourceBin The source bin which scanned by user
		 * @param {string} sProduct The product info from the server
		 *
		 * @return {Promise} A Promise object
		 */
		verifySourceBinWithStock: function (sSourceBin, sProduct) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.read("/VerifyBinWithStock", {
					urlParameters: {
						"EWMStorageBin": "'" + sSourceBin + "'",
						"EWMWarehouse": "'" + sWarehouseNumber + "'",
						"Verif": "''",
						"ProductName": "'" + sProduct + "'"
					},
					success: function (oResult) {
						if (oResult.results.length === 0) {
							reject();
						} else {
							resolve(oResult.results);
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		/**
		 * verify the source HU, called by process warehouse order page
		 *
		 * @return {Promise} A Promise object
		 */
		verifySourceHU: function (sSourceHU, sInputSourceHU) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.create("/VerifyHU", {}, {
					urlParameters: {
						"VlenrVerif": "'" + sInputSourceHU + "'",
						"SourceHandlingUnit": "'" + sSourceHU + "'",
						"EWMWarehouse": "'" + sWarehouseNumber + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === _ABAB_TRUE_CONST) {
							reject(oResult.Msg);
						} else {
							resolve();
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		verifyBatch: function (sBatch, sInputBatch, sProduct, sSourceBin) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.create("/VerifyBatch", {}, {
					urlParameters: {
						"BatchVerif": "'" + sInputBatch + "'",
						"Batch": "'" + sBatch + "'",
						"EWMWarehouse": "'" + sWarehouseNumber + "'",
						"ProductName": "'" + sProduct + "'",
						"EWMStorageBin": "'" + sSourceBin + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === _ABAB_TRUE_CONST) {
							reject(oResult.Msg);
						} else {
							resolve();
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		/**
		 * verify the product, called by process warehouse order page
		 *
		 * @return {Promise} A Promise object
		 */
		verifyProduct: function (sProduct, sInputProduct) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.create("/VerifyProduct", {}, {
					urlParameters: {
						"ProductName": "'" + sProduct + "'",
						"Ean": "'" + sInputProduct + "'",
						"EWMWarehouse": "'" + sWarehouseNumber + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === "X") {
							reject(oResult.Msg);
						} else {
							resolve();
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		/**
		 * verify the serial number, called by process warehouse order page for serial number case.
		 *
		 * @param {string} sProduct The product from the server
		 * @param {string} sSerialNum The serial number scanned by user
		 * @return {Promise} A Promise object
		 */
		verifySerialNumber: function (sProduct, sSerialNum) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.create("/VerifySN", {}, {
					urlParameters: {
						"ProductName": "'" + sProduct + "'",
						"EWMWarehouse": "'" + sWarehouseNumber + "'",
						"Sernr": "'" + sSerialNum + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === _ABAB_TRUE_CONST) {
							reject(oResult.Msg);
						} else {
							resolve(oResult);
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		getQueueSet: function (sResource) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.read("/GetQueueSet", {
					urlParameters: {
						"EWMWarehouse": "'" + sWarehouseNumber + "'",
						"EWMResource": "'" + sResource + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === _ABAB_TRUE_CONST) {
							reject(oResult.Msg);
						} else {
							resolve(oResult);
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		},

		/**
		 * Get the data for picking, includ - layout data, group list, task list
		 *
		 * @param {string} sWarehouseOrder The warehouse order
		 *
		 * @return {Promise} Promise object contains layout/group/task data
		 */
		getPickData: function (sWarehouseOrder) {
			var oPromiseLayoutData = this.getPickcartConfig();
			var oPromiseForGroupSet = this.getWarehouseTaskGroup(sWarehouseOrder);
			var oPromiseForWarehouseTasks = this.getWarehouseTask(sWarehouseOrder);
			return Promise.all([oPromiseLayoutData, oPromiseForGroupSet, oPromiseForWarehouseTasks]);
		},

		/**
		 * Get the data for dropping, including - layout data, group list, task list
		 *
		 * @param {string} sWarehouseOrder The warehouse order
		 * @param {string} sWarehouseNumber The warehouse number
		 *
		 * @return {Promise} Promise object contains layout/group/task data
		 */
		getDropData: function (sWarehouseOrder, sWarehouseNumber) {
			var oWarehouseOrderFilter = new Filter("EWMWarehouseOrder", FilterOperator.EQ, sWarehouseOrder);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oIsDropFilter = new Filter("IsHandlingUnitWarehouseTask", FilterOperator.EQ, true);
			var oPromiseLayoutData = this.getPickcartConfig();
			var oPromiseForGroupSet = new Promise(function (resolve, reject) {
				_oModel.read("/DropGrpSet", {
					filters: [oWarehouseOrderFilter, oWarehouseNumberFilter],
					success: function (oResult) {
						resolve(oResult.results);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
			var oPromiseForWarehouseTasks = new Promise(function (resolve, reject) {
				_oModel.read("/WarehouseTaskSet", {
					filters: [oWarehouseOrderFilter, oWarehouseNumberFilter, oIsDropFilter],
					success: function (oResult) {
						resolve(oResult.results);
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
			//todo:: may rewrite, need check
			return Promise.all([oPromiseLayoutData, oPromiseForGroupSet, oPromiseForWarehouseTasks]);
		},

		bindNewHU: function (aTasks, sWarehouseOrder) {
			var aPromise = [];
			var that = this;
			aTasks.forEach(function (oTask, index) {
				aPromise.push(new Promise(function (resolve, reject) {
					_oModel.create("/BindNewHU", {}, {
						changeSetId: "" + index + "",
						urlParameters: {
							EWMWarehouse: "'" + that.getWarehouseNumber() + "'", //Warehouse Number
							HandlingUnitNumber: oTask.destHU === undefined ? "''" : "'" + oTask.destHU + "'", //dest hu
							HandlingUnitLogicalPosition: oTask.logicalPosition === undefined ? "''" : "'" + oTask.logicalPosition + "'",
							Pmat: oTask.packageMaterial === undefined ? "''" : "'" + oTask.packageMaterial + "'",
							EWMWarehouseOrder: "'" + sWarehouseOrder + "'",
							EWMWarehouseTask: oTask.taskNumber === undefined ? "''" : "'" + oTask.taskNumber + "'", //taskNum
						},
						success: function (oResult) {
							if (oResult.Failed === "X") {
								reject(oResult.VerifyHU.Msg);
							} else {
								resolve();
							}
						},
						error: function (oError) {
							Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
							reject();
						}
					});
				}));
			});
			return Promise.all(aPromise);
		},

		submitTasks: function (aTask) {
			var aPromise = [];
			var that = this;
			if (!_bTaskConfirming) {
				_bTaskConfirming = true;
				aTask.forEach(function (oTask, index) {
					aPromise.push(new Promise(function (resolve, reject) {
						_oModel.read("/Confirm", {
							groupId: "" + index + "",
							urlParameters: {
								EWMWarehouse: "'" + that.getWarehouseNumber() + "'", //Warehouse Num
								EWMWarehouseTask: oTask.taskNumber === undefined ? "''" : "'" + oTask.taskNumber + "'", //taskNum
								Ndifa: "''", //differentiation quantity  todo: refactor after exception determined
								ActualQuantityInAltvUnit: oTask.quantity === undefined ? "''" : "'" + oTask.quantity + "'", //Actual Quantity
								DestinationHandlingUnit: oTask.destHU === undefined ? "''" : "'" + oTask.destHU + "'", //dest hu
								DestinationStorageBin: oTask.destBin === undefined ? "''" : "'" + oTask.destBin + "'", // dest stor bin - only for drop
								SourceHandlingUnit: oTask.sourceHU === undefined ? "''" : "'" + oTask.sourceHU + "'", //soure hu
								Resta: oTask.lowQuantity === undefined ? "''" : "'" + oTask.lowQuantity + "'", //for low stock
								Batch: oTask.batchNo === undefined ? "''" : "'" + oTask.batchNo + "'", //batch no
								Exc: oTask.Exc === undefined ? "''" : "'" + oTask.Exc + "'", //Excpetion code list,
								ConfMode: oTask.ConfMode === undefined ? "'0'" : "'" + oTask.ConfMode + "'" //confirm mode
							},
							success: function (oResult) {
								resolve(oResult.results);
							},
							error: function (oError) {
								Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
								reject();
							}
						});
					}));
				});
			}
			return Promise
				.all(aPromise)
				.then(function (aResults) {
					_bTaskConfirming = false;
					return aResults;
				})
				.catch(function (aErrors) {
					_bTaskConfirming = false;
					return aErrors;
				});
		},

		autoSubmitTasks: function (oTask) {
			var sWarehouseNumber = this.getWarehouseNumber();
			if (!_bTaskConfirming) {
				_bTaskConfirming = true;
				return new Promise(function (resolve, reject) {
					_oModel.read("/ConfirmAuto", {
						urlParameters: {
							"EWMWarehouse": "'" + sWarehouseNumber + "'",
							"ActualQuantityInAltvUnit": oTask.pickedQuantity === undefined ? "''" : "'" + oTask.pickedQuantity + "'",
							"SourceHandlingUnit": oTask.sourceHU === undefined ? "''" : "'" + oTask.sourceHU + "'",
							"EWMWarehouseTask": oTask.taskNumber === undefined ? "''" : "'" + oTask.taskNumber + "'",
							"Batch": oTask.batchNo === undefined ? "''" : "'" + oTask.batchNo + "'",
							"Exc": oTask.Exc === undefined ? "''" : "'" + oTask.Exc + "'",
							"RestWt": oTask.restWT === undefined ? "''" : "'" + oTask.restWT + "'"
						},
						success: function (oResult) {
							_bTaskConfirming = false;
							resolve(oResult.results);
						},
						error: function (oError) {
							Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
							_bTaskConfirming = false;
							reject();
						}
					});
				});
			}
		},
		submitTasksInBatch: function (aTasks, sConfirmMode, aSerialTasks, aLowQuantityTasks) {
			var sWarehouseNumber = this.getWarehouseNumber();
			var sTasks = JSON.stringify({
				DATA: aTasks
			});
			var sSerialTasks = JSON.stringify({
				DATA: aSerialTasks
			});
			var sLowQuantityTasks = JSON.stringify({
				DATA: aLowQuantityTasks
			});

			if (!_bTaskConfirming) {
				_bTaskConfirming = true;
				return new Promise(function (resolve, reject) {
					_oModel.read("/ConfirmMulti", {
						urlParameters: {
							"EWMWarehouse": "'" + sWarehouseNumber + "'",
							"ConfMode": sConfirmMode === undefined ? "'0'" : "'" + sConfirmMode + "'",
							"Combined": true,
							"WTJson": "'" + sTasks + "'",
							"SERNRJson": "'" + sSerialTasks + "'",
							"LCSERNRJson": "'" + sLowQuantityTasks + "'"
						},
						success: function (oResult) {
							_bTaskConfirming = false;
							resolve(oResult.results);
						},
						error: function (oError) {
							Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
							_bTaskConfirming = false;
							reject();
						}
					});
				});
			}
		},
		
		convertHUID: function (sHandlingUnit) {
			var sWarehouseNumber = this.getWarehouseNumber();
			return new Promise(function (resolve, reject) {
				_oModel.read("/ConvertHUID", {
					urlParameters: {
						"EWMWarehouse": "'" + sWarehouseNumber + "'",
						"HandlingUnitNumber": "'" + sHandlingUnit + "'"
					},
					success: function (oResult) {
						if (oResult.Failed === _ABAB_TRUE_CONST) {
							reject(oResult.Msg);
						} else {
							resolve(oResult);
						}
					},
					error: function (oError) {
						Global.showErrorMsgIfInternetDisconnected(oError.statusCode);
						reject(oError);
					}
				});
			});
		}
	};
});