using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class AddedBookModel2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Books",
                newName: "BookId");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c101fc62-e38c-41a0-9296-5ab7204dc734", "AQAAAAIAAYagAAAAEIsptt/us8IEQv5hoTZ55ne4AtEtbsE0sB8aKbIEByefBFbFI2L8jlDgZtyhQGG4tw==", "a2d8315a-ed55-4aed-be7d-559985a64ee9" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BookId",
                table: "Books",
                newName: "Id");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "463f039d-ea76-436e-8a8a-89c46943b55f", "AQAAAAIAAYagAAAAELK06Q+BbFbWt95luUUflyXafu+c9jmlkWbMOMAuHHiiJJTxUOlhQujxcH+Pp/Xqwg==", "d86d62f0-4a29-412b-a058-779ff81881e9" });
        }
    }
}
