using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class AddedColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BookPhoto",
                table: "Books",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ccbec44c-4023-4b27-bc68-7ade176c015a", "AQAAAAIAAYagAAAAEGDdGS0BvYO24xpOF0WojLS8sHkB9tKhrrRIHqtYZTfU9i+K0bxP49PVnYGZVO9eog==", "7c6f035e-8ffd-41d1-a8f1-9e4ee40fae1b" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BookPhoto",
                table: "Books");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c101fc62-e38c-41a0-9296-5ab7204dc734", "AQAAAAIAAYagAAAAEIsptt/us8IEQv5hoTZ55ne4AtEtbsE0sB8aKbIEByefBFbFI2L8jlDgZtyhQGG4tw==", "a2d8315a-ed55-4aed-be7d-559985a64ee9" });
        }
    }
}
