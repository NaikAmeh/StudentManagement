using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;
using System;

namespace StudentMgmt.Infrastructure.Migrations
{
    public partial class AddStudentExtendedFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create BloodGroups table
            migrationBuilder.CreateTable(
                name: "BloodGroups",
                columns: table => new
                {
                    BloodGroupId = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(maxLength: 20, nullable: false),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloodGroups", x => x.BloodGroupId);
                });

            // Create Houses table
            migrationBuilder.CreateTable(
                name: "Houses",
                columns: table => new
                {
                    HouseId = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(maxLength: 100, nullable: false),
                    Color = table.Column<string>(maxLength: 50, nullable: true),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    SchoolId = table.Column<int>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Houses", x => x.HouseId);
                    table.ForeignKey(
                        name: "FK_Houses_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "SchoolId",
                        onDelete: ReferentialAction.Cascade);
                });

            // Add new columns to Students table
            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactNo",
                table: "Students",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BloodGroupId",
                table: "Students",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HouseId",
                table: "Students",
                nullable: true);

            // Add Foreign Key constraints
            migrationBuilder.AddForeignKey(
                name: "FK_Students_BloodGroups_BloodGroupId",
                table: "Students",
                column: "BloodGroupId",
                principalTable: "BloodGroups",
                principalColumn: "BloodGroupId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Houses_HouseId",
                table: "Students",
                column: "HouseId",
                principalTable: "Houses",
                principalColumn: "HouseId",
                onDelete: ReferentialAction.SetNull);

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_Students_BloodGroupId",
                table: "Students",
                column: "BloodGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_HouseId",
                table: "Students",
                column: "HouseId");

            migrationBuilder.CreateIndex(
                name: "IX_BloodGroups_Name",
                table: "BloodGroups",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Houses_SchoolId_Name",
                table: "Houses",
                columns: new[] { "SchoolId", "Name" },
                unique: true);

            // Seed common blood groups
            migrationBuilder.InsertData(
                table: "BloodGroups",
                columns: new[] { "Name", "Description", "IsActive" },
                values: new object[,]
                {
                    { "A+", "A positive blood group", true },
                    { "A-", "A negative blood group", true },
                    { "B+", "B positive blood group", true },
                    { "B-", "B negative blood group", true },
                    { "AB+", "AB positive blood group", true },
                    { "AB-", "AB negative blood group", true },
                    { "O+", "O positive blood group", true },
                    { "O-", "O negative blood group", true }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_Students_BloodGroups_BloodGroupId",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_Houses_HouseId",
                table: "Students");

            // Drop columns from Students table
            migrationBuilder.DropColumn(
                name: "EmergencyContactNo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "BloodGroupId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "HouseId",
                table: "Students");

            // Drop tables
            migrationBuilder.DropTable(
                name: "BloodGroups");

            migrationBuilder.DropTable(
                name: "Houses");
        }
    }
}