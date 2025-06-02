using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Resources;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
  public class Category
  {
    public long Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    public long? ParentCategoryId;
    public Category? ParentCategory;
  }
}