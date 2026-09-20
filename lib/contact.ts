export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
export type ContactResult = {
  sent: boolean;
  message: string;
};
// Helsinki contact adapter. Connect a server endpoint here when one is available.
// Never return a successful delivery until a backend confirms it.
export async function submitContact(
  payload: ContactPayload,
): Promise<ContactResult> {
  if (
    !payload.name.trim() ||
    !payload.email.trim() ||
    !payload.message.trim()
  ) {
    return {
      sent: false,
      message: "Please complete your name, email, and message.",
    };
  }
  return {
    sent: false,
    message:
      "Message not sent: delivery is not connected yet. Your draft remains here so you can copy it.",
  };
}
