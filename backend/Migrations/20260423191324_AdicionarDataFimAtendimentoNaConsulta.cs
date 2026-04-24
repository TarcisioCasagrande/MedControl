using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MeuCrud.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDataFimAtendimentoNaConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataFimAtendimento",
                table: "Consultas",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataFimAtendimento",
                table: "Consultas");
        }
    }
}
