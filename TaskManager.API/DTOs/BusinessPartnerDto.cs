namespace TaskManager.API.DTOs
{
    public class BusinessPartnerDto
    {
        public string? Country { get; set; }
        public string? OrgNumber { get; set; }
        public string? CrNumber { get; set; }
        public string? CompanyName { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? FoundationDate { get; set; }
        public int? Employees { get; set; }
        public string? Bankruptcy { get; set; }
        public string? GeneralManager { get; set; }
        public string? CompanyPhone { get; set; }
        public string? Email { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? Industry { get; set; }
        public string? ParentCustomer { get; set; }
        public string? Accountant { get; set; }
        public string? Department { get; set; }
        public string? LineOfBusiness { get; set; }
        public string? TurnoverCurrency { get; set; }
        public decimal? TurnoverAmount { get; set; }
        public string? MajorCustomers { get; set; }
        public string? BusinessAddressJson { get; set; }
        public string? PostalAddressJson { get; set; }
        public string? Role { get; set; }
    }
}
