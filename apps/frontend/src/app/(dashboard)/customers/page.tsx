import type { Metadata } from "next";
import CustomersPageClient from "./customers-page";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
