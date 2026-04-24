using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Medico> Medicos { get; set; }
        public DbSet<Paciente> Pacientes { get; set; }
        public DbSet<Consulta> Consultas { get; set; }
        public DbSet<Prontuario> Prontuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔒 CPF único
            modelBuilder.Entity<Paciente>()
                .HasIndex(p => p.CPF)
                .IsUnique();

            // 🔒 CRM único
            modelBuilder.Entity<Medico>()
                .HasIndex(m => m.CRM)
                .IsUnique();

            // 🔗 RELACIONAMENTO: Consulta -> Médico
            modelBuilder.Entity<Consulta>()
                .HasOne(c => c.Medico)
                .WithMany(m => m.Consultas)
                .HasForeignKey(c => c.MedicoId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔗 RELACIONAMENTO: Consulta -> Paciente
            modelBuilder.Entity<Consulta>()
                .HasOne(c => c.Paciente)
                .WithMany(p => p.Consultas)
                .HasForeignKey(c => c.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔗 RELACIONAMENTO: Consulta -> Prontuário (1:1)
            modelBuilder.Entity<Consulta>()
                .HasOne(c => c.Prontuario)
                .WithOne(p => p.Consulta)
                .HasForeignKey<Prontuario>(p => p.ConsultaId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔒 Garante 1 prontuário por consulta
            modelBuilder.Entity<Prontuario>()
                .HasIndex(p => p.ConsultaId)
                .IsUnique();

            // 📅 Tipo correto de data
            modelBuilder.Entity<Consulta>()
                .Property(c => c.DataConsulta)
                .HasColumnType("timestamp with time zone");

            // 🚫 BLOQUEIO DE CONFLITO (MÉDICO)
            modelBuilder.Entity<Consulta>()
                .HasIndex(c => new { c.MedicoId, c.DataConsulta })
                .IsUnique();

            // 🚫 BLOQUEIO DE CONFLITO (PACIENTE)
            modelBuilder.Entity<Consulta>()
                .HasIndex(c => new { c.PacienteId, c.DataConsulta })
                .IsUnique();
        }
    }
}