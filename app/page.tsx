import { redirect } from "next/navigation";

export default function Home() {
  // Sesuai IA: "/" -> redirect ke login atau dashboard tergantung session
  redirect("/login");
}
