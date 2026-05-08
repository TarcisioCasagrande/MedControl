using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Medico> Medicos { get; set; }
        public DbSet<Paciente> Pacientes { get; set; }
        public DbSet<Agendamento> Agendamentos { get; set; }
        public DbSet<Prontuario> Prontuarios { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }
        public DbSet<Procedimento> Procedimentos { get; set; }
        public DbSet<DisponibilidadeMedico> DisponibilidadesMedico { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Paciente>().HasIndex(p => p.CPF).IsUnique();
            modelBuilder.Entity<Medico>().HasIndex(m => m.CRM).IsUnique();
            modelBuilder.Entity<Procedimento>().HasIndex(p => p.Codigo).IsUnique().HasFilter("\"Codigo\" IS NOT NULL");

            modelBuilder.Entity<Medico>()
                .HasOne(m => m.Usuario)
                .WithOne()
                .HasForeignKey<Medico>(m => m.UsuarioId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Paciente>()
                .HasOne(p => p.Usuario)
                .WithOne()
                .HasForeignKey<Paciente>(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Agendamento>()
                .HasOne(a => a.Medico)
                .WithMany(m => m.Agendamentos)
                .HasForeignKey(a => a.MedicoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Agendamento>()
                .HasOne(a => a.Paciente)
                .WithMany(p => p.Agendamentos)
                .HasForeignKey(a => a.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Agendamento>()
                .HasOne(a => a.Procedimento)
                .WithMany(p => p.Agendamentos)
                .HasForeignKey(a => a.ProcedimentoId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Agendamento>()
                .HasOne(a => a.Prontuario)
                .WithOne(p => p.Agendamento)
                .HasForeignKey<Prontuario>(p => p.AgendamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Agendamento>()
                .HasOne(a => a.Pagamento)
                .WithOne(p => p.Agendamento)
                .HasForeignKey<Pagamento>(p => p.AgendamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Agendamento>()
                .HasOne(a => a.CriadoPorUsuario)
                .WithMany()
                .HasForeignKey(a => a.CriadoPorUsuarioId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<DisponibilidadeMedico>()
                .HasOne(d => d.Medico)
                .WithMany()
                .HasForeignKey(d => d.MedicoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Pagamento>().HasIndex(p => p.AgendamentoId).IsUnique();
            modelBuilder.Entity<Prontuario>().HasIndex(p => p.AgendamentoId).IsUnique();
            modelBuilder.Entity<Agendamento>().HasIndex(a => new { a.MedicoId, a.DataAgendamento }).IsUnique();
            modelBuilder.Entity<Agendamento>().HasIndex(a => new { a.PacienteId, a.DataAgendamento }).IsUnique();
            modelBuilder.Entity<DisponibilidadeMedico>().HasIndex(d => new { d.MedicoId, d.DataInicio, d.HoraInicio, d.HoraFim });

            modelBuilder.Entity<Pagamento>().Property(p => p.Valor).HasColumnType("numeric(10,2)");
            modelBuilder.Entity<Agendamento>().Property(a => a.ValorCobrado).HasColumnType("numeric(10,2)");
            modelBuilder.Entity<Procedimento>().Property(p => p.Valor).HasColumnType("numeric(10,2)");

            modelBuilder.Entity<Agendamento>().Property(a => a.DataAgendamento).HasColumnType("timestamp with time zone");
            modelBuilder.Entity<Agendamento>().Property(a => a.DataInicioAtendimento).HasColumnType("timestamp with time zone");
            modelBuilder.Entity<Agendamento>().Property(a => a.DataFimAtendimento).HasColumnType("timestamp with time zone");
            modelBuilder.Entity<Pagamento>().Property(p => p.DataPagamento).HasColumnType("timestamp with time zone");
            modelBuilder.Entity<Prontuario>().Property(p => p.DataRegistro).HasColumnType("timestamp with time zone");
            modelBuilder.Entity<DisponibilidadeMedico>().Property(d => d.DataInicio).HasColumnType("date");
            modelBuilder.Entity<DisponibilidadeMedico>().Property(d => d.DataFim).HasColumnType("date");
            modelBuilder.Entity<DisponibilidadeMedico>().Property(d => d.HoraInicio).HasColumnType("time without time zone");
            modelBuilder.Entity<DisponibilidadeMedico>().Property(d => d.HoraFim).HasColumnType("time without time zone");
        }
    }
}
