using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace TaskManager.API.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public void SendEmail(string toEmail, string subject, string body)
        {
            var emailMsg = new MimeMessage();
            emailMsg.From.Add(MailboxAddress.Parse(_config["Email:From"]));
            emailMsg.To.Add(MailboxAddress.Parse(toEmail));
            emailMsg.Subject = subject;
            emailMsg.Body = new TextPart(MimeKit.Text.TextFormat.Html) // diverse content
            {
                Text = body
            };

            using var smtp = new SmtpClient();
            smtp.Connect(_config["Email:SmtpHost"], int.Parse(_config["Email:SmtpPort"] ?? "465"), true);
            smtp.Authenticate(_config["Email:Username"], _config["Email:Password"]);
            smtp.Send(emailMsg);
            smtp.Disconnect(true);
        }

        public void SendVerificationEmail(string toEmail, string code)
        {
            SendEmail(toEmail, "Email Verification Code", $"Your verification code is: {code}");
        }
    }
}
