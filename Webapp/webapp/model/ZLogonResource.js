/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/core/ValueState"],
  function (e, t) {
    "use strict";
    var o;
    return {
      init: function (n) {
        if (o === undefined) {
          o = new e({
            valueState: t.None,
            toolTip: "",
            editable: true,
            modeEditable: true,
          });
        }
        return o;
      },
      destroy: function () {
        o = undefined;
      },
      setError: function () {
        o.setProperty("/valueState", t.Error);
      },
      setNone: function () {
        o.setProperty("/valueState", t.None);
        o.setProperty("/toolTip", "");
      },
      setEditable: function (e) {
        o.setProperty("/editable", e);
      },
      setModeEditable: function (e) {
        o.setProperty("/modeEditable", e);
      },
    };
  },
);
//# sourceMappingURL=LogonResource.js.map
