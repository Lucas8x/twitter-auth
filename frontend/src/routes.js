import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Home } from "./pages/Home/App";

export const Routes = ({children}) => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={Home} />
    </Switch>
  </BrowserRouter>
)