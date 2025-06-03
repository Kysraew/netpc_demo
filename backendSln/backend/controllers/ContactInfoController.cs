using Microsoft.AspNetCore.Mvc;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{

  [Route("api/[controller]")]
  public class ContactInfoController : ControllerBase
  {
    private NetpcDbContext _netpcDbContext;

    public ContactInfoController(NetpcDbContext netpcDbContext)
    {
      _netpcDbContext = netpcDbContext;
    }

    [HttpGet]
    public IAsyncEnumerable<ContactInfo> GetAllContactInfos()
    {
      return _netpcDbContext.ContactInfos.AsAsyncEnumerable();
    }

    [HttpGet("{id}")]
    public async Task<ContactInfo?> GetContactInfo(long id)
    {
      return await _netpcDbContext.ContactInfos.FindAsync(id);
    }

    [HttpPost]
    [Authorize]

    public async Task SaveContactInfo([FromBody] ContactInfo contactInfo)
    {
      await _netpcDbContext.ContactInfos.AddAsync(contactInfo);
      await _netpcDbContext.SaveChangesAsync();
    }

    [HttpPut]
    [Authorize]

    public async Task UpdateContactInfo([FromBody] ContactInfo contactInfo)
    {
      _netpcDbContext.Update(contactInfo);
      await _netpcDbContext.SaveChangesAsync();
    }

    [HttpDelete("{id}")]
    [Authorize]

    public async Task DeleteProduct(long id)
    {
      _netpcDbContext.ContactInfos.Remove(new ContactInfo()
      {
        Id = id,
      });
      await _netpcDbContext.SaveChangesAsync();
    }
  }
}