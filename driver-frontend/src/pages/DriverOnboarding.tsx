import { Routes, Route, Navigate } from "react-router-dom";
import Basic from "./Basic";
import Vehicle from "./Vehicle";
import Documents from "./Documents";
import Pending from "./Pending";

export default function DriverOnboarding() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="basic" />} />
      <Route path="basic" element={<Basic />} />
      <Route path="vehicle" element={<Vehicle />} />
      <Route path="documents" element={<Documents />} />
      <Route path="pending" element={<Pending />} />
    </Routes>
  );
}
