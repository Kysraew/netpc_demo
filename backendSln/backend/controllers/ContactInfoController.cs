using Microsoft.AspNetCore.Mvc;
using backend.Models;

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
    public async Task<ContactInfo?> GetContactInfos(long id)
    {
      return await _netpcDbContext.ContactInfos.FindAsync(id);
    }

  }
}