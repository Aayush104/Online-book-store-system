namespace Online_Bookstore_System.Dto.BookDto
{
    public class BookmarkDto
    {
        public int Id { get; set; }
        public string BookId { get; set; }
        public DateTime BookmarkedOn { get; set; }
        public string BookTitle { get; set; }
        public string BookAuthor { get; set; }
        public string ISBN { get; set; }
        public string BookPhoto { get; set; }
        public string Description { get; set; }
        public string Genre { get; set; }
        public string Language { get; set; }
        public DateTime? PublicationDate { get; set; }
        public decimal? Price { get; set; }
        public int? Stock { get; set; }
    }

}
