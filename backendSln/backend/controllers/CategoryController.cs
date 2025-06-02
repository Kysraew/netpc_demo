using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers
{

  [Route("api/[controller]")]
  public class CategoryController : ControllerBase
  {
    private NetpcDbContext _netpcDbContext;

    public CategoryController(NetpcDbContext netpcDbContext)
    {
      _netpcDbContext = netpcDbContext;
    }

    [HttpGet]
    public IAsyncEnumerable<Category> GetAllCategories()
    {
      return _netpcDbContext.Categories.AsAsyncEnumerable();
    }

    [HttpGet("{id}")]
    public async Task<Category?> GetCategory(long id)
    {
      return await _netpcDbContext.Categories.FindAsync(id);
    }

    [HttpPost]
    public async Task SaveCategory([FromBody] Category contactInfo)
    {
      await _netpcDbContext.Categories.AddAsync(contactInfo);
      await _netpcDbContext.SaveChangesAsync();
    }

    [HttpPut]
    public async Task UpdateCategory([FromBody] Category contactInfo)
    {
      _netpcDbContext.Update(contactInfo);
      await _netpcDbContext.SaveChangesAsync();
    }

    [HttpDelete("{id}")]
    public async Task DeleteCategory(long id)
    {
      _netpcDbContext.Categories.Remove(new Category()
      {
        Id = id,
      });
      await _netpcDbContext.SaveChangesAsync();
    }
  }
}