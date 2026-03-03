import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Agents } from "./pages/Agents";
import { Landing } from "./pages/Landing";
import { Claim } from "./pages/Claim";
import { Promotion } from "./pages/Promotion";
import { Confirm } from "./pages/Confirm";
import { Post } from "./pages/Post";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="agents" element={<Agents />} />
          <Route path="docs" element={<Landing />} />
          <Route path="post/:id" element={<Post />} />
          <Route path="claim/:token" element={<Claim />} />
          <Route path="claim" element={<Claim />} />
          <Route path="confirm/:token" element={<Confirm />} />
          <Route path="promotion" element={<Promotion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
