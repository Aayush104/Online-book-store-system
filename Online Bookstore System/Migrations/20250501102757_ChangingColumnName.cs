using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class ChangingColumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Otps",
                newName: "ExpiresAt");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "b4c8988a-0fff-4324-ad15-83c62f1068fc", "AQAAAAIAAYagAAAAEALxcELFCniGmFrFzvfPCK25ozMpw6TDn5I+SKrmHyC5Pj9Ug++8KCBuEuYh9c0D1A==", "d15e4f03-9a7a-4e09-a953-deae51f58ce6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ExpiresAt",
                table: "Otps",
                newName: "CreatedAt");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "d8af08c4-def6-4b8a-9b6b-cf4424eea968", "AQAAAAIAAYagAAAAEJLzbRAkoeuW0A2ckYyAK+GKSUeQ4+QKHxeRCcuzXqQayHAB60Jvk/ZJZgQn5WNMeg==", "0df5dbc0-f1c9-4085-acc1-80e211c31f74" });
        }
    }
}
