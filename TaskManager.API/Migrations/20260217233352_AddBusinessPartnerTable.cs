using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessPartnerTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BusinessPartners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrgNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CrNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FoundationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Employees = table.Column<int>(type: "int", nullable: true),
                    Bankruptcy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeneralManager = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyPhone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParentCustomer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Accountant = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LineOfBusiness = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TurnoverCurrency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TurnoverAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MajorCustomers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BusinessAddressJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PostalAddressJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessPartners", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BusinessPartners");
        }
    }
}
