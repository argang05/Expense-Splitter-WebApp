import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoutes from "./utils/PrivateRoutes";
import MainContainer from "./MainContainer";

const App = () => {

  return (
    <div className="App">
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path='*' element={<MainContainer/>} exact/>
        </Route>
          <Route path="/login" element={<LoginPage />} exact/>
        </Routes>
    </div>
  );
};

export default App;
