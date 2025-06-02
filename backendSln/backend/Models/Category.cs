using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

    [ForeignKey("ParentCategoryId")]
    public virtual Category? ParentCategory { get; set; }
    //public virtual ICollection<Category> ChildCategories { get; set; } = null!;

  }
}