using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IAnnouncementReposoitory
    {
        Task DoAnnounceAsync(Announce announce);
    }
}
