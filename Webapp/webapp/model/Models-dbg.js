/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"zscm/ewm/pickcarts1/model/Global",
	"zscm/ewm/pickcarts1/model/OData",
	"zscm/ewm/pickcarts1/model/PickCartConnection",
	"zscm/ewm/pickcarts1/model/ProcessWarehouseTasks",
	"zscm/ewm/pickcarts1/model/Drop",
	"zscm/ewm/pickcarts1/model/PickCartLayout",
	"zscm/ewm/pickcarts1/model/LogonResource"
	
], function(JSONModel, Device, Global, OData, PickCartConnection, ProcessWarehouseTasks, Drop, PickcartLayout, LogonResource) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		init: function(oDataModel, oI18nModel) {
			//should clear the clouser var first,as when user enter more than once, the data not cleaned
			OData.destroy();
			Global.destroy();
			PickCartConnection.destroy();
			ProcessWarehouseTasks.destroy();
			Drop.destroy();
			PickcartLayout.destroy();
			LogonResource.destroy();
			
			Global.init(oI18nModel);
			OData.init(oDataModel);
		}
	};
});