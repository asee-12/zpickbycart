/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState",
	"zscm/ewm/pickcarts1/model/PickCartLayout",
	"zscm/ewm/pickcarts1/model/LogonResource",
	"zscm/ewm/pickcarts1/model/OData",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/utils/Const",
	"zscm/ewm/pickcarts1/utils/Util",
	"sap/m/MessagePopover",
	"sap/m/MessageItem"
], function (Controller, ValueState, PickCartLayout, LogonResource, OData, Global, Const, Util, MessagePopover, MessageItem) {
	"use strict";
	var dummyId = "dummy-input";
	return Controller.extend("zscm.ewm.pickcarts1.controller.Base", {
		onInit: function () {
			if (this.createPickcart) {
				PickCartLayout.registLayoutChangeCallback(this.createPickcart.bind(this));
			}
			this.getRouter().attachRouteMatched(function (oEvent) {
				var oParameters = oEvent.getParameters();
				if (oParameters.name === this.sRouteName) {
					if (!Global.getWONumber()) {
						this.getRouter().navTo(Const.ROUT_NAME.LOGON, true);
					} else if (oParameters.arguments.bRestore !== "true") {
						this.setBusy(true);
						this.clearPageState();
						this.onRouteMatched(oParameters.arguments);
					}
				}
			}.bind(this), this);

			this.setModel(PickCartLayout.init(), "cart");

			OData
				.getUserSetting()
				.then(function (oResult) {
					this
						.byId("PickcartTitle")
						.bindProperty("text", OData.getResourcePath());
				}.bind(this));
			this.init();
		},
		init: function () {},
		sRoutName: "",
		onRouteMatched: function (oEvent) {},

		/********************group header operation begin*******************/
		/**
		 * manual input fields in group header and the order should follow the order on the screen. 
		 * the item format should like: {id:'input id', bOptinal....}
		 */
		aManualInput: [],

		/**
		 * regenreate the group input header(aManualInput) based on model information.
		 * 
		 * @public virtual
		 */
		buildGroupHeaderInputConfig: function () {

		},

		/**
		 * clear the page state for this order, otherwise these value will be displayed when process next order 
		 */
		clearPageState: function () {
			this.aManualInput.forEach(function (oInput) {
				this.updateInputWithDefault(oInput.id, "");
			}.bind(this));
		},
		//********************group header operation end*********************
		/**
		 * focus to the next field when current field is ready or if sCurrentFieldId is not passed, focus the first focuable field
		 * 
		 * @param {string/undefined} sCurrentFieldId The input id of current field
		 * @return {bool} bFocused true, one input get the focus; otherwise, no one get the focus.
		 */
		moveFocus: function (sCurrentFieldId) {
			var oInput = this.byId(sCurrentFieldId);
			if (oInput && oInput.getValueState() === ValueState.Warning) {
				oInput.focus(); //set focus on warning input
				return true;
			}

			var oInputNeedFocus, bFocused, bIgnoreOptional;
			var iPosition = 0;
			if (sCurrentFieldId) {
				bIgnoreOptional = true;
				iPosition = Util.findIndex(this.aManualInput, function (oCurrent) {
					return oCurrent.id === sCurrentFieldId;
				});
			} else {
				bIgnoreOptional = false;
				iPosition = this.aManualInput.length;
			}

			//update optional element status before current field
			if (bIgnoreOptional) {
				this._updateOptionalFieldsStateByRange(0, iPosition);
			}

			//check if the above input not ready, move focus to the first unready input
			oInputNeedFocus = this._findFocusFieldByRange(0, iPosition, bIgnoreOptional);
			if (bIgnoreOptional && !oInputNeedFocus) {
				oInputNeedFocus = this._findFocusFieldByRange(iPosition + 1, this.aManualInput.length, false);
			}

			if (oInputNeedFocus) {
				jQuery.sap.delayedCall(0, this, function () {
					this.byId(oInputNeedFocus.id).focus();
				});
				bFocused = true;
			}
			var iIndex = Util.findIndex(this.aManualInput, function (oInput) {
				if (oInput === oInputNeedFocus) {
					return true;
				}
				return false;
			});

			if (iIndex === this.aManualInput.length - 1) { // the last field
				this.enableCartInteraction();
			}
			return bFocused;
		},
		/**
		 * find the first focusable input field from the aMaunalInput
		 * 
		 * @param {int} iStart The begin index of aMaunalInput
		 * @param {int} iEnd The end index of aMaunalInput
		 * @param {bool} bIgnoreOptional ignore the optional input or not
		 * 
		 * @return {object} oReturn Input config if find one, otherwise return undefined
		 */
		_findFocusFieldByRange: function (iStart, iEnd, bIgnoreOptional) {
			var oReturn, oInput, iIndex;
			for (iIndex = iStart; iIndex < iEnd; iIndex++) {
				oInput = this.aManualInput[iIndex];
				if (!this.isInputValid(oInput) && this.isInputFocusable(oInput, bIgnoreOptional)) {
					oReturn = oInput;
					break;
				}
			}
			return oReturn;
		},

		/**
		 * update all optional fields state from the aMaunalInput
		 * 
		 * @param {int} iStart The begin index of aMaunalInput
		 * @param {int} iEnd The end index of aMaunalInput
		 * 
		 * 
		 */
		_updateOptionalFieldsStateByRange: function (iStart, iEnd) {
			var oInput, iIndex;
			for (iIndex = iStart; iIndex < iEnd; iIndex++) {
				oInput = this.aManualInput[iIndex];
				if (oInput.bOptional === true && this.byId(oInput.id).getValueState() === ValueState.Error) {
					this.updateInputWithDefault(oInput.id, "");
				}
			}
		},
		/**
		 * enable cart interaction mode when group header information scanned correctly. e.g highlight cart position..
		 * 
		 * @public interface
		 */
		enableCartInteraction: function () {

		},
		/**
		 * disable cart interaction
		 * 
		 * @public interface
		 */
		disableCartInteraction: function () {

		},
		/**
		 * clear the following fields value of group header. if not the last one should also disable cart interaction
		 * 
		 * @param {string} sCurrentField The current input field
		 */
		clearFollowingFields: function (sCurrentField) {
			var iLength = this.aManualInput.length;
			var iPosition = Util.findIndex(this.aManualInput, function (oInput) {
				if (oInput.id === sCurrentField) {
					return true;
				}
			});
			if (iPosition < iLength - 1) {
				for (iPosition = iPosition + 1; iPosition < iLength; iPosition++) {
					this.updateInputWithDefault(this.aManualInput[iPosition].id, "");
				}
				//this.disableCartInteraction();
			}
		},
		/**
		 * determine if all the tasks in the current group is done or not
		 * 
		 * @public interface
		 * @return {bool} bFinished true, if all tasks of the current group is done. otherwise false.
		 */
		isAllGroupFinished: function () {
			var bFinished = false;
			return bFinished;
		},
		/**
		 * determine if all the tasks in the current group is done or not
		 * 
		 * @public interface
		 * @return {bool} bFinished true, if all tasks of the current group is done. otherwise false.
		 */
		isAllTaskOfGroupFinished: function () {
			var bFinished = true;
			return bFinished;
		},
		/**
		 * go to next group.
		 * 
		 * @public interface
		 */
		goToNextGroup: function () {

		},
		/**
		 * go to next task 
		 * 
		 * @public interface
		 */
		goToNextTask: function () {

		},
		/**
		 * go to next stage. the stages includes: connection, picking, dropping, or warehouse order list page
		 * 
		 * @public interface
		 */
		goToNextStage: function () {

		},
		/**
		 * handle input submit event for group header, if the value is empty should update the input with error state. 
		 * if the ValueState is success(this value not changed), should move focus to next field. 
		 * 
		 * @param {sap.base.Event} oEvent The input enter key event
		 */
		onSubmit: function (oEvent) {
			var sInput = Util.trim(oEvent.getParameter("value"));
			var oInput = oEvent.getSource();
			var sId;
			if (Util.isEmpty(sInput)) {
				oInput.setValueState(ValueState.Error);
				oInput.focus();
			} else if (oInput.getValueState() === ValueState.Success) {
				// get the id of the control which setted in view, e.g. "__xmlview3--source-bin-input" to source-bin-input
				sId = oInput.getId();
				sId = sId.split("--")[1];

				this.moveFocus(sId);
			}
		},
		/**
		 *  verify group header fields
		 * 
		 * @param {Promise} oVerifyPromise The Promise Object of verify function
		 * @param {string} sInputId The input id
		 * @param {function} fnVerifySuccess The success callback when passed verification
		 * @param {function} fnVerifyError The fail callback when failed verification
		 */
		verify: function (oVerifyPromise, sInputId, fnVerifySuccess, fnVerifyError) {
			this.updateInputWithDefault(sInputId);
			this.focusDummyElement();
			oVerifyPromise
				.then(function (oSuccess) {
					this.updateInputWithSuccess(sInputId);
					if (fnVerifySuccess) {
						fnVerifySuccess(oSuccess);
					}
					if (this.isAllFieldsValid()) {
						this.confirmTask();
					}
					this.moveFocus(sInputId);
				}.bind(this))
				.catch(function (oError) {
					var sErrorMessage;
					if (Util.isString(oError)) {
						sErrorMessage = oError;
					}
					this.updateInputWithError(sInputId, sErrorMessage);
					if (fnVerifyError) {
						fnVerifyError(oError);
					}
					this.byId(sInputId).focus();
					this.playAudio(Const.ERROR);
					//TODO:: dehight cart status
					//this.clearFollowingFields(sInputId);
				}.bind(this));
		},
		transformErrors: function () {

		},
		/**
		 * move focus to dummy element, to avoid scan multi vaulues continuesly
		 */
		focusDummyElement: function () {
			this.updateInputWithDefault(dummyId, "");
			this.focusTo(dummyId);
		},
		/**
		 * determine if the input field are filled correctly in group header
		 * 
		 * @return {bool} bValid true if all fields are valid. otherwise false. 
		 */
		isAllFieldsValid: function () {
			var iIndex = 0;
			var iCount = this.aManualInput.length;
			var oInput;
			var bValid = true;
			for (; iIndex < iCount; iIndex++) {
				oInput = this.aManualInput[iIndex];
				if (this.isInputFocusable(oInput, true)) {
					bValid = false;
					break;
				}
			}
			return bValid;
		},
		/**
		 * The template method of confirm task.(bind hu when connection; confirm picking/drop task with/without exceptions)when confirm the task
		 * 
		 * @param {Promise} oPromise optional The confirm promise
		 * @param {function} fnConfirmSuccess optional The callback function 
		 * @param {function} fnConfirmError optional The callback function 
		 */
		confirmTask: function (oPromise, fnConfirmSuccess, fnConfirmError) {
			this.setBusy(true);
			var oConfirmPromise;
			if (oPromise) {
				oConfirmPromise = oPromise;
			} else {
				oConfirmPromise = this.getConfirmPromise();
			}

			oConfirmPromise
				.then(function (oResult) {
					var sId = this.aManualInput[this.aManualInput.length - 1].id;
					this.updateInputWithDefault(sId, "");
					if (fnConfirmSuccess) {
						fnConfirmSuccess(oResult);
					}
					this.onConfirmSuccess(oResult);
					this.setBusy(false);
				}.bind(this))
				.catch(function (oError) {
					if (fnConfirmError) {
						fnConfirmError(oError);
					}
					this.onConfirmFail(oError);
					this.setBusy(false);
				}.bind(this));
		},
		/**
		 * get the confirm request promise
		 * 
		 * @protected interface
		 * @return {Promise} The confirm promise object
		 */
		getConfirmPromise: function () {
			return new Promise(function (resolve, reject) {
				reject();
			});
		},
		/**
		 * do something when the confirm action failed
		 */
		onConfirmFail: function () {},
		/**
		 * do something when the confirm action success-
		 * 1. if the current group has remainning task, go to next task
		 * 2. if the group has finished and there are remaing groups, go to next group
		 * 3. if all group finished, go to next stage. e.g from picking -> dropping
		 */
		onConfirmSuccess: function () {
			if (this.isAllTaskOfGroupFinished()) {
				if (this.isAllGroupFinished()) {
					this.goToNextStage();
				} else {
					this.goToNextGroup();
					this.buildGroupHeaderInputConfig();
					this.clearPageState();
					this.moveFocus();
				}
			} else {
				this.goToNextTask();
			}
		},

		getDummyPromise: function (bSuccess) {
			return new Promise(function (resolve, reject) {
				if (bSuccess) {
					resolve();
				} else {
					reject();
				}
			});
		},

		getModel: function (sModelName) {
			return this.getOwnerComponent().getModel(sModelName);
		},
		setModel: function (oModel, sModelName) {
			this.getView().setModel(oModel, sModelName);
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		navTo: function (sPath, oParameter) {
			oParameter.bRestore = false;
			this.getRouter().navTo(sPath, oParameter, true);
		},
		setBusy: function (bBusy) {
			this.getView().setBusy(!!bBusy);
		},
		createPickcart: function (iColumns) {
			var oPickCartTable = this.byId("PickCartTable");
			oPickCartTable.destroyColumns();
			for (var inx = 0; inx < iColumns; inx++) {
				oPickCartTable.addColumn(new sap.m.Column());
			}
		},
		//========termination begin======================
		_oTerminationDialog: null,
		/**
		 * triggred by click the terminate button, open the dialog
		 */

		onTerminate: function () {
			if (OData.canTerminate()) {
				this.setBusy(true);
				var sWarehouseNumber = Global.getWONumber();
				OData
					.getWarehouseOrderStatus(sWarehouseNumber)
					.then(function (oResult) {
						if (oResult.EWMWarehouseOrderStatus === Const.WHO_STATUS.INITIAL || oResult.EWMWarehouseOrderStatus === Const.WHO_STATUS.EMPTY) {
							this.terminateOrder(false, true);
						} else if (oResult.EWMWarehouseOrderStatus === Const.WHO_STATUS.PICKING) {
						this.setBusy(false);
							var oDialog = this.getBringHUToDestinationDialog();
							oDialog.open();
						}
						else if (oResult.EWMWarehouseOrderStatus === Const.WHO_STATUS.DROPPING) {
							this.setBusy(false);
							var oDialog = this.getTerminationDialog();
							oDialog.open();
						} else {
							this.terminateOrder(false, true);
						}
					}.bind(this))
					.catch(function (oError) {
						this.setBusy(false);
					}.bind(this));
			}
		},
		/**
		 * when user want to send the rest of the work to the pool, handled by others
		 */
		onTerminateBySplit: function () {
			this.terminateOrder(true, false);
		},
		/**
		 * when user want to take a break, split the task, but the user still own the order
		 */
		onTerminateByBreak: function () {
			this.terminateOrder(false, false);
		},
		/**
		 * get the termination dialog 
		 * 
		 * @return {sap.m.Dialog} oDialog The termination dialog
		 */
		removeDuplicatedId: function () {
			var aIds = ["terminationDialog--terminationdialog-frag-def-text", "terminationDialog--terminationdialog-frag-def-btn-split",
				"terminationDialog--terminationdialog-frag-def-btn-break", "terminationDialog--terminationdialog-frag-def-btn-close",
				"terminationDialog--terminationdialog-frag-def-dialog"
			];
			var oElement;
			aIds.forEach(function (sId) {
				oElement = sap.ui.getCore().byId(sId);
				if (oElement) {
					oElement.destroy();
				}
			});
		},

		getTerminationDialog: function () {
			var sDialogId = "terminationDialog";
			var oView = this.getView();
			if (!this._oTerminationDialog) {
				this.removeDuplicatedId();
				this._oTerminationDialog = sap.ui.xmlfragment(sDialogId, "zscm.ewm.pickcarts1.view.dialog.TerminationDialog", this);
				oView.addDependent(this._oTerminationDialog);
			}
			return this._oTerminationDialog;
		},
		/**
		 * set the busy indicator for termination dialogue based on parameters
		 * 
		 * @param {bool} bBusy The flag of busy indicator
		 */
		setBusyForTermination: function (bBusy) {
			if (this._oTerminationDialog) {
				this._oTerminationDialog.setBusy(!!bBusy);
			}
		},
		/**
		 * terminate current order, nav to logon page if terminate success. 
		 * should make sure no other order is in the progress terminating; 
		 * 
		 * @param {bool} bSplit true, send the order to the pool, may handled by other user later; false, the user still owns the order
		 */
		terminateOrder: function (bSplit, bModeEditable) {
			var sWarehouseNumber = Global.getWONumber();
			this.setBusyForTermination(true);
			OData
				.submitTerminate(sWarehouseNumber, bSplit)
				.then(function () {
					this.closeTerminationDialog();
					Global.setAppProgress(0);
					//clear the wo 	
					Global.setWONumber("");
					Global.setWoQueue("");
					LogonResource.setModeEditable(bModeEditable);
					this.navTo("logon", {}, true);
					this.setBusyForTermination(false);
					this.setBusy(false);
				}.bind(this))
				.catch(function (oError) {
					this.setBusyForTermination(false);
					this.setBusy(false);
				}.bind(this));
		},
		/**
		 * close termination dialog
		 */
		closeTerminationDialog: function () {
			if (!this._oTerminationDialog || !this._oTerminationDialog.isOpen()) {
				return;
			}
			this._oTerminationDialog.close();
		},
		//========termination end======================
		
		//========bringHutoDest start====================
		getBringHUToDestinationDialog: function () {
			var sDialogId = "BringHUToDestinationDialog";
			var oView = this.getView();
			if (!this._oBringHUToDestinationDialog) {
				this.removeDuplicatedId();
				this._oBringHUToDestinationDialog = sap.ui.xmlfragment(sDialogId, "zscm.ewm.pickcarts1.view.dialog.BringHUToDestinationDialog", this);
				oView.addDependent(this._oBringHUToDestinationDialog);
			}
			return this._oBringHUToDestinationDialog;
		},

        // close Bring HU to destination dialog
		closeBringHUToDestinationDialog: function () {
			if (!this._oBringHUToDestinationDialog || !this._oBringHUToDestinationDialog.isOpen()) {
				return;
			}
			this._oBringHUToDestinationDialog.close();
		},

		//========bringHutoDest end======================
		
		/**
		 * get the i18n text based on the parameters
		 * 
		 * @param {string} sText The property from i18n
		 * @param {array} aParameter The parameters used by i18n format
		 * 
		 * @return {string} the formatted i18n text
		 */
		getI18nText: function (sText, aParameter) {
			var i18n = this.getModel("i18n");
			return i18n.getResourceBundle().getText(sText, aParameter);
		},
		/**
		 * format the tilte of WO number
		 * 
		 * @param {string} sWarehouseOrder The warehouse order number
		 * @return {string} The formatted warehouse order number
		 */
		getTitle: function (sWarehouseOrder) {
			return this.getI18nText("warehouseOrderNumber", [sWarehouseOrder]);
		},
		getLogicalPositionByHU: function () {

		},
		getDestHUByPosition: function () {

		},
		getValidPositionAndDestHUByInput: function (sInput, sRoutName) {
			var sLogicalPosition = "";
			var sDestHU = "";
			var sHUStatus = "";
			if (sRoutName === Const.ROUT_NAME.PROCESS_TASKS) {
				sHUStatus = Const.HU_STATUS_PICK.NEED_MATERIAL;
			} else {
				sHUStatus = Const.HU_STATUS_PICK.NEED_DROP;
			}
			if (sInput !== "") {
				sLogicalPosition = this.getLogicalPositionByHU(sInput);
				if (sLogicalPosition !== undefined && sLogicalPosition !== "" && PickCartLayout.getPickingStatusById(sLogicalPosition) ===
					sHUStatus) {
					sDestHU = sInput;
					return [sDestHU, sLogicalPosition];
				} else {
					sLogicalPosition = PickCartLayout.getPositionByLable(sInput);
					if (sLogicalPosition !== undefined && sLogicalPosition !== "" && PickCartLayout.getPickingStatusById(sLogicalPosition) ===
						sHUStatus) {
						sDestHU = this.getDestHUByPosition(sLogicalPosition);
						return [sDestHU, sLogicalPosition];
					}
				}
			}
		},

		//************************Input control helper method begin*******************************
		getInputValue: function (sInputId) {
			var sValue = this.byId(sInputId).getValue();
			return Util.trim(sValue);
		},
		/**
		 * set the value state to success and set the value state text to ""
		 * 
		 * @param {string} sId The id of the Input control
		 * @param {string} sValue The value of the Input control
		 */
		updateInputWithSuccess: function (sId, sValue) {
			this._updateInput(sId, ValueState.Success, "", sValue);
		},
		/**
		 * set the input control to error with error text
		 * 
		 * @param {string} sId The id of input control
		 * @param {string} sErrorText The error message
		 */
		updateInputWithError: function (sId, sErrorText) {
			var sError = "";
			if (sErrorText === undefined) {
				sError = "";
			} else {
				sError = sErrorText;
			}
			this._updateInput(sId, ValueState.Error, sError, "");
		},
		/**
		 * set the input control to None, and clear all error message. if sVaule is undefined, then keep the current value
		 * 
		 * @param {string} sId The id of input control
		 * @param {string} sValue The value which want to set to the input. if undefied, keep the current value.
		 */
		updateInputWithDefault: function (sId, sValue) {
			this._updateInput(sId, ValueState.None, "", sValue);
		},
		updateInputWithWarning: function (sId, sWarningMsg, sValue) {
			this._updateInput(sId, ValueState.Warning, sWarningMsg, sValue);
		},
		/**
		 * determine if the value of the input control is valid or not.
		 * 
		 * @param {Object} oInputConfig The Input config object. the item of aManualInput.
		 * @return {bool} bValid True, if the value is passed verification or the the field is optional and the value is empty, otherwise failed or in the process of verifing.
		 */
		isInputValid: function (oInputConfig) {
			var bValid = false;
			var oInput = this.byId(oInputConfig.id);
			if (oInput.getVisible() && oInput.getEnabled()) {
				//Add Warning state for scan logcial position instead of Pick-HU in Pick hu input field
				if (oInput.getValueState() === ValueState.Success || oInput.getValueState() === ValueState.Warning) {
					bValid = true;
				}
			} else {
				bValid = true;
			}
			return bValid;
		},
		/**
		 * determine if input can get focus or not
		 * 
		 * @param {object} oInput The input config object. refer aManualInput field
		 * @param {bool} bIgnoreOptional The indicator of whether ignore the optional field
		 * @return {bool} bFocusable true, the input can get focus, otherwise should not focus on it
		 */
		isInputFocusable: function (oInput, bIgnoreOptional) {
			var bFocusable = false;
			var oInputControl = this.byId(oInput.id);
			if (oInputControl.getVisible() && oInputControl.getEnabled()) {
				if (oInputControl.getValueState() === ValueState.Error) {
					bFocusable = true;
				} else if (oInputControl.getValueState() === ValueState.None) {
					if (oInput.bOptional) {
						if (!bIgnoreOptional) {
							bFocusable = true;
						}
					} else {
						bFocusable = true;
					}
				}
			}
			return bFocusable;
		},

		updateInputOptional: function (sCurrentField, bOptional) {
			var iPosition = Util.findIndex(this.aManualInput, function (oInput) {
				if (oInput.id === sCurrentField) {
					return true;
				}
			});
			if (iPosition >= 0) {
				this.aManualInput[iPosition].bOptional = bOptional;
			}
		},

		_updateInput: function (sInputId, sValueState, sValueStateText, sValue) {
			var oInput = this.byId(sInputId);
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			if (sValue !== undefined) {
				oInput.setValue(sValue);
			}
		},
		//************************Input control helper method end*******************************
		onPressLegend: function () {
			var oGrid = this.byId("legend-grid");
			var bVisible = oGrid.getVisible();
			oGrid.setVisible(!bVisible);
		},
		/**
		 * set the failed error messages from the confirm result
		 * 
		 * @param {array} aResult The confirm result
		 * @param {Object} modelHelper The model helper
		 */
		setErrorsFromConfirmResult: function (aResult, modelHelper) {
			var aError = [];
			if (aResult && aResult.length) {
				aResult.forEach(function (oItem) {
					var oFailedResult;
					if (oItem.Failed === "X" && oItem.FailedMsgJson.length > 0) {
						oFailedResult = JSON.parse(oItem.FailedMsgJson);
						if (!Util.isEmpty(oFailedResult.ITAB)) {
							oFailedResult.ITAB.TYPE = "Error";
						}
						aError = aError.concat(oFailedResult.ITAB);
					}
				});
			}
			modelHelper.setErrors(aError);
			if (aError.length > 0) {
				this.onOpenMessagePopover();
			}
		},

		displayWarningInPopover: function (sStr, modelHelper) {
			var aData = this.getErrorMessagePopover().getModel().getData();
			var oObject = {
				MESSAGE: sStr,
				TYPE: "Warning"
			};
			aData.errors.push(oObject);
			this.getErrorMessagePopover().getModel().setData(aData);
			this.getErrorMessagePopover().getModel().updateBindings(true);
			this.onOpenMessagePopover();
		},

		displayErrorInPopover: function (sStr, modelHelper) {
			var aData = this.getErrorMessagePopover().getModel().getData();
			var oObject = {
				MESSAGE: sStr,
				TYPE: "Error"
			};
			aData.errors.push(oObject);
			this.getErrorMessagePopover().getModel().setData(aData);
			this.getErrorMessagePopover().getModel().updateBindings(true);
			//modelHelper.setErrors(aError);
			this.onOpenMessagePopover();
		},

		onOpenMessagePopover: function () {
			var oButton = this.byId("errorMessagePopoverBtn");
			var oPopover = this.getErrorMessagePopover();
			oButton.addDependent(oPopover);
			jQuery.sap.delayedCall(100, this, function () {
				oPopover.openBy(oButton);
			});
		},

		getErrorMessagePopover: function () {
			var oMessageTemplate;
			var oErrors;
			if (!this._oErrorMessagePopover) {
				oMessageTemplate = new MessageItem({
					type: "{TYPE}",
					title: "{MESSAGE}"
				});
				this._oErrorMessagePopover = new MessagePopover({
					items: {
						path: "/errors",
						template: oMessageTemplate
					}
				});
			}else {
				this._oErrorMessagePopover.destroyItems();
				oErrors = this._oErrorMessagePopover.getModel().getData().errors;
				for(var i = 0; i < oErrors.length; i++){
					var oItem = new MessageItem();
					oItem.setType(Global.getMessageType(oErrors[i].TYPE));
					oItem.setTitle(oErrors[i].MESSAGE);
					this._oErrorMessagePopover.addItem(oItem);
				}
			}
			return this._oErrorMessagePopover;
		},

		focusTo: function (sFocusId) {
			this.byId(sFocusId).focus();
		},

		setInputValue: function (sInputId, sInputValue) {
			this.byId(sInputId).setValue(sInputValue);
		},

		formatNumber: function (sValue) {
			return Util.formatNumber(parseFloat(sValue), Const.MaxDecimalDigits);
		},

		isValidNumberInput: function (sNumberInput) {
			var iQuantity = Util.parseNumber(sNumberInput);
			var sQuantity = Util.formatNumber(iQuantity);
			return Util.isEmpty(sQuantity) ? false : true;
		},

		playAudio: function (sMsgType) {
			Util.playAudio(this, sMsgType);
		}
	});
});