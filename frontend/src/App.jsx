import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashbaord";
import SearchPage from "./components/search";
import Navbar from "./components/navbar";

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
