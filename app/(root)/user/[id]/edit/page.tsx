import { redirect } from "next/navigation";

export default function UserEditRedirectPage() {
  redirect("/settings");
}