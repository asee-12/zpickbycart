/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/tl/ewm/lib/reuses1/components/base/Component",
	"sap/ui/Device",
	"scm/ewm/pickcarts1/model/Models"
], function (UIComponent, BaseComponent, Device, Models) {
	"use strict";
	var connectionViewId = "---connection-view--";
	var pickingViewId = "---processtasks-view--";
	var droppingViewId = "---drop-view--";
	var tableCellTemplateId = "column-cell-button";
	return BaseComponent.extend("scm.ewm.pickcarts1.Component", {

		metadata: {
			manifest: "json"
		},
		initialPage: "Main",

		_hasDirtyPage: function () {
			return false;
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// set the device model
			this.setModel(Models.createDeviceModel(), "device");
			Models.init(this.getModel(), this.getModel("i18n"));
			// call the base component's init function
			BaseComponent.prototype.init.apply(this, arguments);
			//this.getRouter().initialize();
		},
		destroy: function () {
			BaseComponent.prototype.destroy.apply(this, arguments);
			this.destroyTableCells();
		},
		destroyTableCells: function () {
			var sComponentId = this.getId();
			var aViewIds = [connectionViewId, pickingViewId, droppingViewId];
			var oElement;
			aViewIds.forEach(function (sViewId) {
				oElement = this.byId(sComponentId + sViewId + tableCellTemplateId);
				if (oElement) {
					oElement.destroy();
				}
			}.bind(this));
		},
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});