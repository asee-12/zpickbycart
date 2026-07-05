/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "zscm/ewm/pickcarts1/model/Global",
    "zscm/ewm/pickcarts1/model/OData",
    "zscm/ewm/pickcarts1/model/PickCartConnection",
    "zscm/ewm/pickcarts1/model/ProcessWarehouseTasks",
    "zscm/ewm/pickcarts1/model/Drop",
    "zscm/ewm/pickcarts1/model/PickCartLayout",
    "zscm/ewm/pickcarts1/model/LogonResource",
  ],
  function (e, s, c, o, t, i, r, a, m) {
    "use strict";
    return {
      createDeviceModel: function () {
        var c = new e(s);
        c.setDefaultBindingMode("OneWay");
        return c;
      },
      init: function (e, s) {
        o.destroy();
        c.destroy();
        t.destroy();
        i.destroy();
        r.destroy();
        a.destroy();
        m.destroy();
        c.init(s);
        o.init(e);
      },
    };
  },
);
//# sourceMappingURL=Models.js.map
