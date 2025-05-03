using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class AddedBookModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    ISBN = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Author = table.Column<string>(type: "text", nullable: false),
                    Genre = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    Format = table.Column<string>(type: "text", nullable: false),
                    Publisher = table.Column<string>(type: "text", nullable: false),
                    PublicationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Stock = table.Column<int>(type: "integer", nullable: false),
                    IsAvailableInLibrary = table.Column<bool>(type: "boolean", nullable: false),
                    OnSale = table.Column<bool>(type: "boolean", nullable: false),
                    DiscountPercentage = table.Column<int>(type: "integer", nullable: true),
                    DiscountStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DiscountEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExclusiveEdition = table.Column<string>(type: "text", nullable: true),
                    AddedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "463f039d-ea76-436e-8a8a-89c46943b55f", "AQAAAAIAAYagAAAAELK06Q+BbFbWt95luUUflyXafu+c9jmlkWbMOMAuHHiiJJTxUOlhQujxcH+Pp/Xqwg==", "d86d62f0-4a29-412b-a058-779ff81881e9" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Books");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "b4c8988a-0fff-4324-ad15-83c62f1068fc", "AQAAAAIAAYagAAAAEALxcELFCniGmFrFzvfPCK25ozMpw6TDn5I+SKrmHyC5Pj9Ug++8KCBuEuYh9c0D1A==", "d15e4f03-9a7a-4e09-a953-deae51f58ce6" });
        }
    }
}
