using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
  public class NetpcDbContext : DbContext
  {

    public NetpcDbContext(DbContextOptions<NetpcDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Category>().HasData(
      new Category { Id = 1, Name = "Bussiness", ParentCategory = null, ParentCategoryId = null },
      new Category { Id = 2, Name = "Private", ParentCategory = null, ParentCategoryId = null },
      new Category { Id = 3, Name = "Other", ParentCategory = null, ParentCategoryId = null },
      new Category { Id = 4, Name = "School", ParentCategory = null, ParentCategoryId = 3 },
      new Category { Id = 5, Name = "Boss", ParentCategory = null, ParentCategoryId = 1 },
      new Category { Id = 6, Name = "Employee", ParentCategory = null, ParentCategoryId = 1 }
      );

      modelBuilder.Entity<ContactInfo>().HasData(
      new ContactInfo { Id = 1, Name = "Amadeusz", SureName = "Eusz", email = "amadeusz.eusz@company.com", phoneNumber = "+48717292111", BirthDate = new DateOnly(2000, 1, 1), CategoryId = 1 },
      new ContactInfo { Id = 2, Name = "Benedykt", SureName = "Edykt", email = "Bene@gmail.com", phoneNumber = "+48717292222", BirthDate = new DateOnly(2005, 2, 2), CategoryId = 4 },
      new ContactInfo { Id = 3, Name = "Cyceron", SureName = "Ron", email = "Cyceron@pg.com", phoneNumber = "+48717292333", BirthDate = new DateOnly(1995, 3, 3), CategoryId = 2 }
      );
    }

    public DbSet<ContactInfo> ContactInfos => Set<ContactInfo>();
    public DbSet<Category> Categories => Set<Category>();
  }
}