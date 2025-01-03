import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

const App = () => {

  return (
    <div>
      <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} exact/>
        </Routes>
    </div>
  );
};

export default App;
