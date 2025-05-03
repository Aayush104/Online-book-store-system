namespace Online_Bookstore_System.IService
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string path);
    }
}
