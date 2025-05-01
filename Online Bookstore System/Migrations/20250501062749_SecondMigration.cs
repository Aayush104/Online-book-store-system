using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class SecondMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "Address", "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { null, "fb183224-5ac8-4308-a9e3-2c0402db5c17", "AQAAAAIAAYagAAAAECQiV07EZGyK5M/nGhOEB2tsdma/q9vbkgCoKaFwj4t78s0ufjPKLz5sepwYif1L6Q==", "748713e4-c66f-4a29-bd2f-c3ca2d55bc90" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "dc8f7fc4-0e0b-4637-a69f-dea6a82cad25", "AQAAAAIAAYagAAAAEPOVJVuvdpJILF3a7ddvbUzvjX0DH9cP4P9gbJwKEqiSH+wlJYsVkxcoTaPkLcCZmg==", "f88eb60f-6260-4859-bebe-f1896bbd47d6" });
        }
    }
}
