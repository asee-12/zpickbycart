/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/ValueState"
], function (ValueState) {
	"use strict";

	return {
		CONTROL_STATUS: {
			EMPTY: "EMPTY",
			PENDING: "PENDING",
			VALID: "VALID",
			INVALID: "INVALID",
			WARNING: "WARNING"
		},
		HU_STATUS_PICK: {
			"INVALID": 1,
			"VALID": 2,
			"NEED_MATERIAL": 3,
			"COMPLETED": 4,
			"COMPLETED_WITH_EXCEPTION": 5,
			"WRONG": 6,
			"NEED_MATERIAL_HOLDING": 7
		},
		HU_STATUS_DROP: {
			"INVALID": 1,
			"VALID": 2,
			"NEED_DROP": 3,
			"DROPPED": 4, //todo:: reomve
			"WRONG": 5
		},
		EXCEPTION_TYPE: {
			BIDP: "BIDP",
			BIDF: "BIDF",
			DIFF: "DIFF",
			SPLT: "SPLT"
		},
		WHO_STATUS: {
			EMPTY: "",
			INITIAL: "I",
			PICKING: "P",
			DROPPING: "D",
			COMPLETE: "C"
		},
		CONF_MODE: {
			NO_NEED_CHECK: "0", //no need for low qty check
			CHECK_WITH_LOW_QTY: "1", //confirm with low qty check executed
			REJECT_CHECK: "2", // reject confirm
			NEED_CHECK: "3" // need low qty check
		},
		ROUT_NAME: {
			LOGON: "logon",
			CONNECTION: "connection",
			PROCESS_TASKS: "processTasks",
			DROP_HU: "dropHandlingUnit",
			WO_LIST: "warehouseOrderList"
		},
		ABAP_TRUE: "X",
		REGEX_NONNEGATIVE: /^\+?(:?(:?\d+\.\d+)|(:?\d+))$/,
		ERR_INTERNET_DISCONNECTED: 0,
		TASK_STATUS: {
			CONFIRMED: "CONFIRMED",
			CONFIRMING: "CONFIRMING",
			INITIAL: "INITIAL",
			FAILED: "FAILED"
		},
		MaxIntegerDigits: 17,
		MaxDecimalDigits: 3,
		ERROR: "E",
		INFO: "I",
		WARNING: "W"
	};
});