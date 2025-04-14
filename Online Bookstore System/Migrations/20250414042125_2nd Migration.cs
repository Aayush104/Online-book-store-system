using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class _2ndMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "b3e23d8c-905f-4bcf-9ef6-27c6b4a235fa", "754ea22b-c181-4069-9f95-be2ea98f24e8" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "dc8f7fc4-0e0b-4637-a69f-dea6a82cad25", "AQAAAAIAAYagAAAAEPOVJVuvdpJILF3a7ddvbUzvjX0DH9cP4P9gbJwKEqiSH+wlJYsVkxcoTaPkLcCZmg==", "f88eb60f-6260-4859-bebe-f1896bbd47d6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "b3e23d8c-905f-4bcf-9ef6-27c6b4a235fa", "754ea22b-c181-4069-9f95-be2ea98f24e8" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ca1857ca-376f-43ca-a09e-ab2bc9a88407", "AQAAAAIAAYagAAAAEN59AiaBiiOqjKa7L8o1tLoQerJ2iDuv5JIvSABA5qT7XytdWDJxXNvP/u3f6AIqfA==", "b10a85ff-4ab0-4c4e-bea2-e7be8d5285d9" });
        }
    }
}
