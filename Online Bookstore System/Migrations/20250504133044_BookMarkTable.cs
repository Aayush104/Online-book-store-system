using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class BookMarkTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookMarks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    BookId = table.Column<long>(type: "bigint", nullable: false),
                    BookmarkedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookMarks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookMarks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookMarks_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "BookId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "48395391-b5d8-45db-a7f3-e8e14488258a", "AQAAAAIAAYagAAAAEITXz6MI0JPla0CU6Dt+pl6/9mFmmzstgHqxXp4OMWJRfZTefhKbDqiu97EtDWLG+g==", "df09f920-8605-4d06-871c-c0883d07c589" });

            migrationBuilder.CreateIndex(
                name: "IX_BookMarks_BookId",
                table: "BookMarks",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookMarks_UserId",
                table: "BookMarks",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookMarks");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "754ea22b-c181-4069-9f95-be2ea98f24e8",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ccbec44c-4023-4b27-bc68-7ade176c015a", "AQAAAAIAAYagAAAAEGDdGS0BvYO24xpOF0WojLS8sHkB9tKhrrRIHqtYZTfU9i+K0bxP49PVnYGZVO9eog==", "7c6f035e-8ffd-41d1-a8f1-9e4ee40fae1b" });
        }
    }
}
