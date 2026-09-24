import { ContactManager } from "@/components/admin/contact/ContactManager";
import { readAdminContact } from "@/services/contactAdminService";

export const metadata = { title: "Contact | Admin | HELSINKI" };

export default async function ContactAdminPage() {
  const contact = await readAdminContact();
  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // CONTACT ]</p>
      <h1>Contact</h1>
      <ContactManager initialData={contact} />
    </section>
  );
}
