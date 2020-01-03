import dva from "dva";
import { createBrowserHistory as createHistory } from "history";
import "./index.css";

// 1. Initialize
const app = dva({
  // history: createHistory()
});

// 2. Plugins
// app.use({});

// 3. Models
require("./models").default.forEach(key => {
  app.model(key.default);
});

// 4. Router
app.router(require("./router").default);
// app.router(props => <App {...props} />);

// 5. Start
app.start("#root");
