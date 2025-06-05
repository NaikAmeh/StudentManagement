using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;
using System;

namespace StudentMgmt.Infrastructure.Migrations
{
    public partial class AddStudentStatusTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create StudentStatus table
            migrationBuilder.CreateTable(
                name: "StudentStatus",
                columns: table => new
                {
                    StudentStatusID = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    StatusName = table.Column<string>(maxLength: 50, nullable: false),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentStatus", x => x.StudentStatusID);
                });

            // Add StudentStatusID to Students table
            migrationBuilder.AddColumn<int>(
                name: "StudentStatusID",
                table: "Students",
                nullable: false,
                defaultValue: 1); // Default to Active status ID

            // Add Foreign Key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_Students_StudentStatus_StudentStatusID",
                table: "Students",
                column: "StudentStatusID",
                principalTable: "StudentStatus",
                principalColumn: "StudentStatusID",
                onDelete: ReferentialAction.Restrict);

            // Create index
            migrationBuilder.CreateIndex(
                name: "IX_Students_StudentStatusID",
                table: "Students",
                column: "StudentStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_StudentStatus_StatusName",
                table: "StudentStatus",
                column: "StatusName",
                unique: true);

            // Seed common student statuses
            migrationBuilder.InsertData(
                table: "StudentStatus",
                columns: new[] { "StatusName", "Description" },
                values: new object[,]
                {
                    { "Active", "Currently active student" },
                    { "InActive", "Temporarily inactive student" },
                    { "Left", "Left the school" },
                    { "Dropped", "Dropped from the school" },
                    { "Removed", "Removed from the school" }
                });

            // Map existing IsActive=true to Active, and IsActive=false to InActive
            migrationBuilder.Sql(@"
                UPDATE Students SET StudentStatusID = 1 WHERE IsActive = 1;
                UPDATE Students SET StudentStatusID = 2 WHERE IsActive = 0;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove foreign key
            migrationBuilder.DropForeignKey(
                name: "FK_Students_StudentStatus_StudentStatusID",
                table: "Students");

            // Drop column from Students table
            migrationBuilder.DropColumn(
                name: "StudentStatusID",
                table: "Students");

            // Drop table
            migrationBuilder.DropTable(
                name: "StudentStatus");
        }
    }
}