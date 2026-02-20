using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using TaskManager.API.Services;


namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BusinessPartnerController : ControllerBase
    {
        private readonly TaskDbContext _context;
        private readonly EmailService _emailService;

        public BusinessPartnerController(TaskDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ==================== REGISTRATION ====================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] BusinessPartnerDto dto)
        {
            if (dto == null) return BadRequest("Invalid data");

            var partner = new BusinessPartner
            {
                Country = dto.Country,
                OrgNumber = dto.OrgNumber,
                CrNumber = dto.CrNumber,
                CompanyName = dto.CompanyName,
                RegistrationDate = dto.RegistrationDate,
                FoundationDate = dto.FoundationDate,
                Employees = dto.Employees,
                Bankruptcy = dto.Bankruptcy,
                GeneralManager = dto.GeneralManager,
                CompanyPhone = dto.CompanyPhone,
                Email = dto.Email,
                ContactPerson = dto.ContactPerson,
                ContactPhone = dto.ContactPhone,
                ContactEmail = dto.ContactEmail,
                Industry = dto.Industry,
                ParentCustomer = dto.ParentCustomer,
                Accountant = dto.Accountant,
                Department = dto.Department,
                LineOfBusiness = dto.LineOfBusiness,
                TurnoverCurrency = dto.TurnoverCurrency,
                TurnoverAmount = dto.TurnoverAmount,
                MajorCustomers = dto.MajorCustomers,
                BusinessAddressJson = dto.BusinessAddressJson,
                PostalAddressJson = dto.PostalAddressJson,
                Role = dto.Role,
                Status = "Pending"
            };

            _context.BusinessPartners.Add(partner);
            await _context.SaveChangesAsync();

            // Send email to contact person
            if (!string.IsNullOrEmpty(partner.ContactEmail))
            {
                string subject = "Business Partner Registration Submitted";
                string body = $@"
                    <h2>Registration Received</h2>
                    <p>Dear {partner.ContactPerson},</p>
                    <p>Your registration for <b>{partner.CompanyName}</b> (Org: {partner.OrgNumber}) has been submitted successfully.</p>
                    <p>Current Status: <b>Pending</b></p>
                    <p>You will be notified once an administrator reviews and approves your registration.</p>
                ";

                try 
                {
                    _emailService.SendEmail(partner.ContactEmail, subject, body);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send email: {ex.Message}");
                }
            }

            return Ok(new { message = "Registration submitted successfully", partnerId = partner.Id });
        }

        // ==================== GET ALL ====================
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var partners = await _context.BusinessPartners
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            return Ok(partners);
        }

        // ==================== GET PENDING ONLY ====================
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var partners = await _context.BusinessPartners
                .Where(p => p.Status == "Pending")
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            return Ok(partners);
        }

        // ==================== STATS FOR DASHBOARD ====================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _context.BusinessPartners.CountAsync();
            var pending = await _context.BusinessPartners.CountAsync(p => p.Status == "Pending");
            var approved = await _context.BusinessPartners.CountAsync(p => p.Status == "Approved");
            var rejected = await _context.BusinessPartners.CountAsync(p => p.Status == "Rejected");

            return Ok(new { total, pending, approved, rejected });
        }

        // ==================== APPROVE ====================
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var partner = await _context.BusinessPartners.FindAsync(id);
            if (partner == null) return NotFound();

            partner.Status = "Approved";
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(partner.ContactEmail))
            {
                string subject = "Business Partner Registration Approved";
                string body = $@"
                    <h2>Registration Approved</h2>
                    <p>Dear {partner.ContactPerson},</p>
                    <p>We are pleased to inform you that the registration for <b>{partner.CompanyName}</b> has been <b>Approved</b>.</p>
                    <p>You can now access the platform as a {partner.Role}.</p>
                ";
                try { _emailService.SendEmail(partner.ContactEmail, subject, body); }
                catch (Exception ex) { Console.WriteLine($"Email error: {ex.Message}"); }
            }

            return Ok(new { message = "Registration approved" });
        }

        // ==================== REJECT ====================
        [HttpPost("reject/{id}")]
        public async Task<IActionResult> Reject(int id)
        {
            var partner = await _context.BusinessPartners.FindAsync(id);
            if (partner == null) return NotFound();

            partner.Status = "Rejected";
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(partner.ContactEmail))
            {
                string subject = "Business Partner Registration Rejected";
                string body = $@"
                    <h2>Registration Rejected</h2>
                    <p>Dear {partner.ContactPerson},</p>
                    <p>We regret to inform you that the registration for <b>{partner.CompanyName}</b> has been <b>Rejected</b>.</p>
                    <p>Please contact our support team for more details.</p>
                ";
                try { _emailService.SendEmail(partner.ContactEmail, subject, body); }
                catch (Exception ex) { Console.WriteLine($"Email error: {ex.Message}"); }
            }

            return Ok(new { message = "Registration rejected" });
        }
    }
}
