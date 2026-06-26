/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device", "scm/ewm/pickcarts1/model/Global", "scm/ewm/pickcarts1/model/OData", "scm/ewm/pickcarts1/model/PickCartConnection", "scm/ewm/pickcarts1/model/ProcessWarehouseTasks", "scm/ewm/pickcarts1/model/Drop", "scm/ewm/pickcarts1/model/PickCartLayout", "scm/ewm/pickcarts1/model/LogonResource"], function (e, s, c, o, t, i, r, a, m) {
    "use strict";
    return {
        createDeviceModel: function () {
            var c = new e(s);
            c.setDefaultBindingMode("OneWay");
            return c
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
            o.init(e)
        }
    }
});
//# sourceMappingURL=Models.js.map