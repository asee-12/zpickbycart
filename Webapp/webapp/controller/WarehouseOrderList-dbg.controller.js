/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"scm/ewm/pickcarts1/model/OData",
	"scm/ewm/pickcarts1/model/Global",
	"scm/ewm/pickcarts1/utils/Const",
	"scm/ewm/pickcarts1/utils/Util",
	"sap/ui/core/ValueState",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator"
], function (Controller, OData, Global, Const, Util, ValueState, Filter, Sorter, JSONModel, FilterOperator) {
	"use strict";
	return Controller.extend("scm.ewm.pickcarts1.controller.WarehouseOrderList", {
		onInit: function () {
			this.table = this.getTable();
			this.oPersonalizationService = sap.ushell.Container.getService("Personalization");
			this.oTableTemplate = this.table.getItems()[0].clone();
			this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function (oParam) {
			var oArguments = oParam.getParameters("arguments");
			if (oArguments.name === "warehouseOrderList") {
				this.clearSearchAndSort();
				this.initTable();
			}
		},
		initTable: function () {
			var promise = OData.getWarehouseOrders();
			promise.then(function (aResult) {
				this.bindingItems(aResult);
			}.bind(this));

		},
		clearSearchAndSort: function () {
			var sSearchField = this.byId("searchField");
			sSearchField.setValue("");
			if (this._oDialog) {
				this._oDialog.setSelectedSortItem("WhseOrderLatestStartDateTime");
				this._oDialog.setSortDescending(false);
			}
		},
		getTable: function () {
			return this.byId("warehouseOrderList");
		},
		bindingItems: function (oData) {
			this.setTableTitle(oData.length);
			var sWarehouseNumber = OData.getWarehouseNumber();
			var sResourceNumber = OData.getResourceNumber();
			var sQueue = Global.getQueue();
			var oResourceNumberFilter = new Filter("EWMResource", FilterOperator.EQ, sResourceNumber);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oQueueFilter = new Filter("Queue", FilterOperator.EQ, sQueue);
			var aFilters;
			if (Util.isEmpty(sQueue)) {
				aFilters = [oResourceNumberFilter, oWarehouseNumberFilter];
			} else {
				aFilters = [oResourceNumberFilter, oWarehouseNumberFilter, oQueueFilter];
			}
			this.oPersonalizationService.getContainer("scm.ewm.pickcarts1")
				.fail(function () {
					this.oContainer = this.oPersonalizationService.createEmptyContainer("scm.ewm.pickcarts1");
					this.getTable().bindItems({
						path: "/WarehouseOrderSet",
						template: this.oTableTemplate,
						filters: aFilters,
						sorter: new sap.ui.model.Sorter("WhseOrderLatestStartDateTime")
					});
				}.bind(this))
				.done(function (oContainer) {
					this.oContainer = oContainer;
					var aSorter = [];
					var oSortKey = oContainer.getItemValue("sortKey");
					var oSortValue = oContainer.getItemValue("bDesc");
					if (oSortKey) {
						aSorter.push(new Sorter(oSortKey, oSortValue));
					} else {
						aSorter.push(new Sorter("WhseOrderLatestStartDateTime", false));
					}
					this.getTable().bindItems({
						path: "/WarehouseOrderSet",
						template: this.oTableTemplate,
						filters: aFilters,
						sorter: aSorter
					});
				}.bind(this));
		},
		setTableTitle: function (iCount) {
			var oView = this.getView();
			var i18nModel = oView.getModel("i18n");
			var sWarehosueOrderTitle = i18nModel.getProperty("warehouseOrdersTitle");
			var titleText = i18nModel.getResourceBundle().getText(sWarehosueOrderTitle, [iCount]);
			var oTitle = oView.byId("tableTitle");
			oTitle.setText(titleText);
		},
		handleSortingDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("scm.ewm.pickcarts1.view.dialog.SortWarehouseOrder", this);
			}
			this.getView().addDependent(this._oDialog);
			if (this.oContainer.getItemValue("sortKey")) {
				this._oDialog.setSelectedSortItem(this.oContainer.getItemValue("sortKey"));
				this._oDialog.setSortDescending(this.oContainer.getItemValue("bDesc"));
			}

			this._oDialog.open();
		},
		handleConfirm: function (oEvent) {
			var oTable = this.getTable();
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
			// apply sorter to binding
			var aSorters = [];
			if (mParams.sortItem) {
				var sPath = mParams.sortItem.getKey();
				var bDescending = mParams.sortDescending;
				this.oContainer.setItemValue("sortKey", mParams.sortItem.getKey());
				this.oContainer.setItemValue("bDesc", mParams.sortDescending);
				this.oContainer.save();

				aSorters.push(new Sorter(sPath, bDescending));
			}
			oBinding.sort(aSorters);
		},
		handleItemPress: function (oEvent) {
			var sWarehouseOrderNumber = oEvent.getParameter("listItem").getBindingContext().getProperty("EWMWarehouseOrder");
			OData
				.getWhoByMaulaSelection(sWarehouseOrderNumber)
				.then(function (data) {
					Global.setWONumber(sWarehouseOrderNumber);
					//todo remove when delivery
					var oNavParamsObj = Util.getNavParamsByStatus(data.PickcartWhoStatus, data, false);
					if (oNavParamsObj.route) {
						Global.setAppProgress(oNavParamsObj.progress);
						this.navTo(oNavParamsObj.route, oNavParamsObj.param);
					}
				}.bind(this))
				.catch(function (oError) {
					Util.playAudio(this, Const.ERROR);
					Global.showErrorMessage(oError);
				}.bind(this));
		},

		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			var table = this.getTable();
			var binding = table.getBinding("items");
			// update Table binding
			if (sQuery && sQuery.length > 0) {
				var filterWho = new Filter("EWMWarehouseOrder", FilterOperator.Contains, sQuery);
				aFilters.push(filterWho);
				var oFilter = new sap.ui.model.Filter(aFilters, true);
				binding.filter(oFilter);
			} else {
				binding.filter([]);
			}
			binding.attachDataReceived(function () {
				this.setTableTitle(binding.getLength());
			}, this);
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		navTo: function (sRoute, oParam) {
			this
				.getOwnerComponent()
				.getRouter()
				.navTo(sRoute, oParam, true);
		},
		formatDateTime: function (sDateTime, sTimeZone) {
			return Util.formatDateTime(Util.convertDateTime(sDateTime), sTimeZone);
		},
		formatInteger: function (sValue) {
			return Util.formatInteger(parseInt(sValue));
		},
		formatNumber: function (sValue) {
			return Util.formatNumber(parseFloat(sValue), Const.MaxDecimalDigits);
		}
	});
});