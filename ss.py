import smtplib
from email.message import EmailMessage
import logging

# ========= SMTP CONFIG =========
SMTP_HOST = "smtp-relay.brevo.com"
SMTP_PORT = 587
SMTP_USER = "9576f5001@smtp-brevo.com"
SMTP_PASS = "nV9KItQO8sBHvTD4"

FROM_EMAIL = "ccsuggest@gmail.com"
FROM_NAME = "CCSuggest"

# ========= RECIPIENTS (user1 to user100) =========
recipients = [f"user{i}@gmail.com" for i in range(1, 1222)]

# ========= LOGGING SETUP =========
logging.basicConfig(
    filename="email_log.txt",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def log_success(to_email):
    msg = f"SUCCESS sending to {to_email}"
    print(msg)
    logging.info(msg)

def log_failure(to_email, error):
    msg = f"FAILED sending to {to_email} - Error: {error}"
    print(msg)
    logging.error(msg)

def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

def send_bulk_emails():
    subject = "Hello from CCSuggest"
    body_template = """Hi,

This is a test email from CCSuggest automation.

Best regards,
CCSuggest
"""

    total = len(recipients)
    success_count = 0
    fail_count = 0

    print(f"Starting bulk send to {total} recipients...")
    logging.info(f"Starting bulk send to {total} recipients")

    for i, recipient in enumerate(recipients, start=1):
        try:
            print(f"[{i}/{total}] Sending to {recipient}...")
            send_email(recipient, subject, body_template)
            log_success(recipient)
            success_count += 1
        except Exception as e:
            log_failure(recipient, e)
            fail_count += 1

    summary = f"Done. Success: {success_count}, Failed: {fail_count}"
    print(summary)
    logging.info(summary)

if __name__ == "__main__":
    send_bulk_emails()
