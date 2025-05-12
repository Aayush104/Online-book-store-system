using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Online_Bookstore_System.Migrations
{
    /// <inheritdoc />
    public partial class ForMigrtion1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsMarked",
                table: "Announces",
                newName: "Expired");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Expired",
                table: "Announces",
                newName: "IsMarked");
        }
    }
}
