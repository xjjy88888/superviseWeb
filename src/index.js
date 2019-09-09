import dva from "dva";
import "./index.css";

// 1. Initialize
const app = dva({});

// 2. Plugins
// app.use({});

// 3. Model
app.model(require("./models/user").default);
app.model(require("./models/mapdata").default);
app.model(require("./models/project").default);
app.model(require("./models/point").default);
app.model(require("./models/spot").default);
app.model(require("./models/redLine").default);
app.model(require("./models/annex").default);
app.model(require("./models/dict").default);
app.model(require("./models/district").default);
app.model(require("./models/company").default);
app.model(require("./models/inspect").default);
app.model(require("./models/problemPoint").default);
app.model(require("./models/role").default);
app.model(require("./models/departs").default);

// 4. Router
app.router(require("./router").default);

// 5. Start
app.start("#root");
