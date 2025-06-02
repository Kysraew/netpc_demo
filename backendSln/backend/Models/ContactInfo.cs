using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
  public class ContactInfo
  {
    public long Id { get; set; }
    public string? Name { get; set; }
    public string? SureName { get; set; }

    [Required]
    public string email { get; set; } = null!;
    public string? phoneNumber { get; set; }
    public DateOnly? BirthDate { get; set; }

    public long CategoryId { get; set; }
    public virtual Category Category { get; set; } = null!;

  }
}