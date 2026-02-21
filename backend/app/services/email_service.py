import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'localhost')
        self.smtp_port = int(os.getenv('SMTP_PORT', 1025))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.sender_email = os.getenv('SENDER_EMAIL', 'justice@nyaysetu.gov.in')

    def send_law_impact_email(self, user_email, user_name, law_title, impact_rationale, role='citizen'):
        """
        Sends an XAI-driven judicial impact alert with role-specific technical depth.
        """
        prefix = "⚖️ LEGAL SYNTHESIS" if role == 'lawyer' else "⚖️ NYAYSETU ALERT"
        subject = f"{prefix}: New Impact for {law_title}"
        
        perspective_intro = (
            "Our Technical XAI engine has identified a statutory alignment that requires your professional review."
            if role == 'lawyer' else
            "Our Explainable AI has detected a new law that may affect your legal rights and protections."
        )

        body = f"""
        Dear {user_name},
        
        {perspective_intro}
        
        ACT: {law_title}
        
        { "TECHNICAL STATUTORY RATIONALE:" if role == 'lawyer' else "HOW THIS AFFECTS YOU:" }
        {impact_rationale}
        
        Please log in to the NyaySetu dashboard to view the full impact analysis and specific case linkages.
        
        ---
        This is an automated judicial alert from NyaySetu.
        Transparency in Justice.
        """
        
        self._send(user_email, subject, body)

    def _send(self, recipient, subject, body):
        print(f"📧 [EMAIL SERVICE] Dispatching to: {recipient} | Subject: {subject}")
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.smtp_user and self.smtp_password:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            print(f"✅ Email successfully dispatched to {recipient}")
        except Exception as e:
            print(f"❌ Email Delivery Failed: {e}")
