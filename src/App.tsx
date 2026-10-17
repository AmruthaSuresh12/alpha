import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteShell } from "./layout/SiteShell";
import { HomePage } from "./pages/HomePage";
import { JoinPage } from "./pages/JoinPage";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}
